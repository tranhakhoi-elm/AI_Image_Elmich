# ARCHITECTURE.MD — TÀI LIỆU THIẾT KẾ KIẾN TRÚC ELMICH AI STUDIO

> **Phiên bản:** 2.6  
> **Cập nhật:** 2026-09-10  
> **Tài liệu liên quan:** [HANDBOOK.md](HANDBOOK.md), [SKILLS.md](SKILLS.md), [GEMINI.md](GEMINI.md), [AGENTS.md](AGENTS.md)

---

## 1. TỔNG QUAN KIẾN TRÚC HỆ THỐNG

Elmich AI Design Studio được tổ chức theo mô hình Single-Page Application (SPA) kết hợp Node.js Express server:
- **Client (Frontend):** React 19 + TypeScript + Vite + Tailwind CSS v4 + Motion. Gọi trực tiếp Gemini Multimodal API thông qua `@google/genai` bằng khóa cấu hình từ môi trường.
- **Server (Backend):** Node.js Express (`server.ts` cổng 3000 khi tự host, hoặc serverless functions trong `api/` khi deploy Vercel). Đảm nhiệm ghi log chi phí (Google Sheets, Lark Suite) và lưu trữ lịch sử dùng chung (Google Cloud Firestore & Cloud Storage).

---

## 2. STATE MANAGEMENT & ĐIỀU HƯỚNG

- **`App.tsx`:** Bộ điều phối trạng thái trung tâm (`AppState`, `GenerationSettings`, `activeImage`, `gallery`, `viewMode`).
- **`viewMode`:**
  - `'studio'`: 15 Workflow thiết kế đồ họa & kiểm duyệt bao bì.
  - `'chat'`: Trợ lý Chat AI đối thoại đa phương thức.
  - `'history'`: Lịch sử dùng chung xem lại ảnh đã tạo và các phiên chat của toàn đội ngũ.

---

## 3. MÔ HÌNH VÀ DỊCH VỤ GEMINI (`services/geminiService.ts`)

| Tác vụ | Mô hình | Phương thức |
|---|---|---|
| Sinh ảnh sản phẩm theo concept | `gemini-3.1-flash-image` | `ai.models.generateImages` |
| Sửa ảnh & Dịch bao bì | `gemini-3.1-flash-image` | `editProductImage` (image-to-image) |
| Phân tích OCR & Kiểm tra bao bì | `gemini-2.5-flash` | `ai.models.generateContent` |
| Trợ lý Chat tư vấn thiết kế | `gemini-2.5-pro` | Chat session đa vòng |

---

## 4. BỘ ĐIỀU HƯỚNG VÀ ENDPOINT API (`server.ts`)

1. **Ghi log chi phí Google Sheets:** `POST /api/sheets/report`
2. **Ghi log Lark Base (Dự phòng):** `POST /api/lark/report`
3. **Lịch sử dùng chung (Firestore & Cloud Storage):**
   - `POST /api/history/upload-url`: Tạo Signed URL để upload trực tiếp lên Cloud Storage.
   - `POST /api/history/images`: Lưu bản ghi ảnh đã tạo.
   - `GET /api/history/images`: Liệt kê danh sách ảnh trong lịch sử.
   - `POST /api/history/chats`: Lưu phiên hội thoại chat.
   - `GET /api/history/chats`: Liệt kê lịch sử hội thoại.

---

## 5. BẢO MẬT & QUY TẮC API KEY

- `GOOGLE_SERVICE_ACCOUNT_JSON`, `GOOGLE_SHEET_ID`, `LARK_APP_ID`, `LARK_APP_SECRET`: Tuyệt đối bảo mật phía máy chủ qua `process.env`.
- `GEMINI_API_KEY`: Được nạp qua biến môi trường để client khởi tạo GoogleGenAI SDK.

---

## 6. LƯU TRỮ CỤC BỘ & CACHE TRÊN CLIENT

- **LocalForage (IndexedDB):** Lưu trữ bộ sưu tập ảnh phiên hiện tại (`gallery`) và danh sách phiên chat cục bộ (`chatSessions`), tránh tràn hạn ngạch 5MB của `localStorage`.
- **LocalStorage:** Chỉ lưu trữ các cờ cài đặt nhẹ: mã PIN màn hình khóa (`elmich_ai_pin_unlocked`), tên/mã sản phẩm gần nhất.

---

## 7. NỢ KỸ THUẬT (KNOWN TECHNICAL DEBT)

1. **`App.tsx` kích thước lớn:** Phần lớn JSX của các workflow (Concept, Tech Effects, White BG...) nằm trong `App.tsx`. Khi mở rộng cần tiếp tục tách thành các workflow components riêng như `PackagingCheckWorkflow` và `TranslatePackagingWorkflow`.
2. **Backend dự phòng song song:** `server.ts` (Express) và thư mục `api/` (Vercel Serverless) chia sẻ cùng logic xử lý. Khi cập nhật cần đồng bộ cả hai môi trường.

---

## 8. CẤU HÌNH LỊCH SỬ DÙNG CHUNG (FIRESTORE & CLOUD STORAGE)

### 8.1. Các bước kích hoạt trên Google Cloud Console:
1. Sử dụng Google Cloud Project hiện có (cùng Project với Service Account của Google Sheets).
2. Kích hoạt **Firestore** (ở chế độ Native Mode).
3. Tạo **Cloud Storage Bucket** (ví dụ: `elmich-ai-studio-storage`).
4. Cấp quyền cho Service Account:
   - `roles/datastore.user` (Cloud Datastore User / Firestore)
   - `roles/storage.objectAdmin` (Storage Object Admin)
5. Cập nhật biến môi trường:
   ```env
   GCS_BUCKET_NAME=elmich-ai-studio-storage
   ```
6. Nếu chưa cấu hình Cloud Storage/Firestore, hệ thống tự động lưu vào bộ nhớ tạm in-memory để đảm bảo ứng dụng luôn phản hồi trơn tru và không bị gián đoạn.
