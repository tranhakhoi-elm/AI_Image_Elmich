import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

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
      const credentials = JSON.parse(serviceAccountJson);
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
