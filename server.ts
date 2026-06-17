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

// Lark Bitable integration API
app.post("/api/lark/report", async (req: any, res: any) => {
  const { appToken, tableId: requestedTableId, fields } = req.body;
  const appId = process.env.LARK_APP_ID;
  const appSecret = process.env.LARK_APP_SECRET;

  if (!appId || !appSecret) {
    console.warn("Lark credentials not set in environment variables");
    return res.status(200).json({ 
      success: false, 
      error: "Lark credentials (LARK_APP_ID/LARK_APP_SECRET) local configuration is missing." 
    });
  }

  try {
    // 1. Get tenant token
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
      // 2. Get first table ID of the Base
      const tablesRes = await fetch(`https://open.larksuite.com/open-apis/bitable/v1/apps/${appToken}/tables`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const tablesData: any = await tablesRes.json();
      if (tablesData.code !== 0 || !tablesData.data?.items || tablesData.data.items.length === 0) {
        const errorMsg = tablesData.msg || "Unknown error";
        if (errorMsg.includes("Access denied") || errorMsg.includes("scope") || errorMsg.includes("permission") || tablesData.code === 99991663 || tablesData.code === 99991661) {
          throw new Error(`Cấp quyền Bitable bị từ chối (${errorMsg}). Vui lòng vào Lark Developer Console -> Permissions & Scopes -> tìm kiếm và Bật các quyền: 'bitable:app' và 'bitable:app:readonly'. Sau đó, tạo và phát hành phiên bản mới (Version Management & Release) để áp dụng quyền.`);
        }
        throw new Error(`Failed to list Lark tables: ${errorMsg}`);
      }
      tableId = tablesData.data.items[0].table_id;
    }

    // 3. Post the record to the Bitable table
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
      const errorMsg = recordData.msg || "Unknown error";
      if (errorMsg.includes("Access denied") || errorMsg.includes("scope") || errorMsg.includes("permission") || recordData.code === 99991663 || recordData.code === 99991661) {
        throw new Error(`Cấp quyền ghi Bitable bị từ chối (${errorMsg}). Vui lòng bật quyền 'bitable:app' trong Permissions & Scopes của Lark App và phát hành phiên bản mới.`);
      }
      
      if (errorMsg.includes("FieldNameNotFound")) {
        // Query fields API to see what fields actually exist
        try {
          const fieldsRes = await fetch(`https://open.larksuite.com/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/fields`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
          });
          const fieldsData: any = await fieldsRes.json();
          if (fieldsData.code === 0 && fieldsData.data?.items) {
            const actualFields = fieldsData.data.items.map((item: any) => `"${item.field_name}" (${item.type})`).join(", ");
            throw new Error(`Bảng hiện tại không có các cột được yêu cầu. Các cột hiện có trên Bitable của bạn là: [ ${actualFields} ]. Vui lòng tạo đúng các cột: "Mã sản phẩm" (Văn bản), "Tên sản phẩm" (Văn bản), "Số lượng Token" (Con số), "Chi phí" (Con số) hoặc cập nhật cấu trúc bảng.`);
          }
        } catch (fieldsErr: any) {
          console.error("Failed to query fields mapping:", fieldsErr.message);
        }
      }

      throw new Error(`Failed to insert Lark record: ${errorMsg}`);
    }

    res.json({ success: true, tableId, record: recordData.data?.record });
  } catch (error: any) {
    console.error("Error reporting to Lark Base:", error.message);
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
