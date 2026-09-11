import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import {
  createUploadUrl,
  saveImageRecord,
  listImageRecords,
  deleteImageRecord,
  saveChatSession,
  listChatSessions,
  deleteChatSession,
} from "./lib/historyStore.ts";

dotenv.config();

const app = express();
const PORT = 3000;

// Set high limits for file upload data URLs (images)
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Google Sheets integration API using Service Account
import { google } from "googleapis";

app.post("/api/sheets/report", async (req: any, res: any) => {
  const { values } = req.body;
  
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) {
    return res.status(200).json({ success: false, error: "GOOGLE_SHEET_ID is missing in environment variables." });
  }

  let auth: any;

  try {
    // PREFERRED WAY: Read the entire JSON file content from a single env variable
    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    
    if (serviceAccountJson) {
      let credentials;
      try {
        credentials = JSON.parse(serviceAccountJson);
      } catch (parseError: any) {
        return res.status(200).json({
          success: false,
          error: "GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON. Vercel sometimes breaks formatting. Try removing newlines before pasting, or check for missing quotes. Detail: " + parseError.message
        });
      }
      
      auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
    } else {
      // FALLBACK WAY: Parse from separate email and private_key variables
      const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
      let privateKey = process.env.GOOGLE_PRIVATE_KEY || '';
      
      if (!clientEmail || !privateKey) {
         return res.status(200).json({ 
           success: false, 
           error: "Google Sheets credentials (GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_CLIENT_EMAIL + GOOGLE_PRIVATE_KEY) are missing." 
         });
      }

      // Cleanup fallback key (in case of copy-paste formatting issues)
      if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
        privateKey = privateKey.replace(/^"|"$/g, '');
      }
      privateKey = privateKey.replace(/\\n/g, '\n');

      auth = new google.auth.JWT({
        email: clientEmail,
        key: privateKey,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
    }

    const sheets = google.sheets({ version: 'v4', auth });
    
    // Dynamically fetch the name of the first sheet to avoid "Unable to parse range: Sheet1" errors
    // (e.g. if the user's Google Sheets is in Vietnamese, it defaults to "Trang tính1")
    let targetRange = 'Sheet1!A:A';
    try {
      const meta = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
      if (meta.data.sheets && meta.data.sheets.length > 0) {
        const sheetTitle = meta.data.sheets[0].properties?.title || 'Sheet1';
        targetRange = `${sheetTitle}!A:A`;
      }
    } catch (metaError: any) {
      console.warn("Could not fetch spreadsheet metadata. Using default 'Sheet1'.", metaError.message);
    }
    
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: targetRange,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: values
      }
    });

    res.json({ success: true, data: response.data });
  } catch (error: any) {
    console.error("Error reporting to Google Sheets:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Lark Bitable integration API
app.post("/api/lark/report", async (req: any, res: any) => {
  const { appToken, tableId: requestedTableId, fields } = req.body || {};
  const appId = process.env.LARK_APP_ID;
  const appSecret = process.env.LARK_APP_SECRET;

  if (!appId || !appSecret) {
    return res.status(200).json({ 
      success: false, 
      error: "Lark credentials (LARK_APP_ID/LARK_APP_SECRET) are missing." 
    });
  }

  try {
    const tokenRes = await fetch("https://open.larksuite.com/open-apis/auth/v3/tenant_access_token/internal", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ app_id: appId, app_secret: appSecret }),
    });
    
    const tokenData: any = await tokenRes.json();
    if (tokenData.code !== 0) {
      throw new Error(`Failed to get Lark access token: ${tokenData.msg}`);
    }
    const token = tokenData.tenant_access_token;

    let tableId = requestedTableId;

    if (!tableId) {
      const tablesRes = await fetch(`https://open.larksuite.com/open-apis/bitable/v1/apps/${appToken}/tables`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const tablesData: any = await tablesRes.json();
      if (tablesData.code !== 0 || !tablesData.data?.items || tablesData.data.items.length === 0) {
        throw new Error(`Failed to list Lark tables: ${tablesData.msg || "Unknown error"}`);
      }
      tableId = tablesData.data.items[0].table_id;
    }

    const recordRes = await fetch(`https://open.larksuite.com/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({ fields })
    });
    
    const recordData: any = await recordRes.json();
    if (recordData.code !== 0) {
      throw new Error(`Failed to insert Lark record: ${recordData.msg || "Unknown error"}`);
    }

    return res.status(200).json({ success: true, tableId, record: recordData.data?.record });
  } catch (error: any) {
    console.error("Error reporting to Lark Base:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Lịch sử dùng chung (ảnh đã tạo & chat) — lưu qua Firestore + Cloud Storage,
// dùng chung Service Account với tích hợp Google Sheets ở trên.
// Xem lib/historyStore.ts và ARCHITECTURE.md để biết chi tiết thiết kế.
app.post("/api/history/upload-url", async (req: any, res: any) => {
  try {
    const { folder, contentType } = req.body || {};
    if (folder !== "images" && folder !== "chat") {
      return res.status(400).json({ success: false, error: "folder phải là 'images' hoặc 'chat'." });
    }
    const result = await createUploadUrl({ folder, contentType: contentType || "image/png" });
    res.json({ success: true, ...result });
  } catch (error: any) {
    console.error("Error creating history upload URL:", error.message);
    res.status(200).json({ success: false, error: error.message });
  }
});

app.post("/api/history/images", async (req: any, res: any) => {
  try {
    const record = await saveImageRecord(req.body || {});
    res.json({ success: true, record });
  } catch (error: any) {
    console.error("Error saving image history record:", error.message);
    res.status(200).json({ success: false, error: error.message });
  }
});

app.get("/api/history/images", async (req: any, res: any) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string, 10) || 30, 100);
    const cursor = (req.query.cursor as string) || undefined;
    const result = await listImageRecords({ limit, cursor });
    res.json({ success: true, ...result });
  } catch (error: any) {
    console.error("Error listing image history:", error.message);
    res.status(200).json({ success: false, error: error.message, items: [] });
  }
});

app.post("/api/history/chats", async (req: any, res: any) => {
  try {
    const result = await saveChatSession(req.body || {});
    res.json({ success: true, ...result });
  } catch (error: any) {
    console.error("Error saving chat history:", error.message);
    res.status(200).json({ success: false, error: error.message });
  }
});

app.get("/api/history/chats", async (req: any, res: any) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string, 10) || 30, 100);
    const cursor = (req.query.cursor as string) || undefined;
    const result = await listChatSessions({ limit, cursor });
    res.json({ success: true, ...result });
  } catch (error: any) {
    console.error("Error listing chat history:", error.message);
    res.status(200).json({ success: false, error: error.message, items: [] });
  }
});

app.delete("/api/history/chats/:id", async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const result = await deleteChatSession(id);
    res.json({ success: true, ...result });
  } catch (error: any) {
    console.error("Error deleting chat session:", error.message);
    res.status(200).json({ success: false, error: error.message });
  }
});

app.delete("/api/history/images/:id", async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const result = await deleteImageRecord(id);
    res.json({ success: true, ...result });
  } catch (error: any) {
    console.error("Error deleting image record:", error.message);
    res.status(200).json({ success: false, error: error.message });
  }
});

// Vite middleware for development or serving built static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: any, res: any) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
