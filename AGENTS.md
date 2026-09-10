# AGENTS.MD — HƯỚNG DẪN DÀNH CHO AI AGENT TRÊN DỰ ÁN ELMICH AI STUDIO

Tài liệu này xác định các quy tắc, nguyên tắc kiến trúc và tiêu chuẩn mã nguồn bắt buộc cho bất kỳ AI Coding Agent nào làm việc trên kho mã này.

---

## 1. TỔNG QUAN DỰ ÁN & VAI TRÒ
- **Tên dự án:** Ai Image Elmich (Elmich AI Design Studio & Packaging Suite)
- **Mục tiêu:** Hệ thống thiết kế đồ họa sản phẩm gia dụng Elmich, hỗ trợ tạo ảnh quảng cáo, bóc tách kỹ thuật, mockup bao bì 3D, dịch bao bì tự động và kiểm duyệt bao bì đối chiếu Excel.
- **Công nghệ chính:** React 19, Vite, Tailwind CSS, Motion (`motion/react`), Express server (`server.ts`), Google Gen AI SDK (`@google/genai`), LocalForage, XLSX, JsBarcode, qrcode-svg, jsQR.

---

## 2. NGUYÊN TẮC KIẾN TRÚC MÃ NGUỒN (MODULARITY RULES)
1. **Không nhồi nhét code vào App.tsx:**
   - Mọi workflow chuyên biệt, modal hoặc tiện ích độc lập phải được tách thành component con trong thư mục `src/components/`.
   - Các workflow chính:
     - `PackagingCheckWorkflow.tsx`: Kiểm tra đối chiếu bao bì và xuất Excel.
     - `TranslatePackagingWorkflow.tsx`: Dịch bao bì tự động tiếng Anh sang tiếng Việt.
     - `BarcodeGenerator.tsx`: Tạo mã vạch Code 128, EAN-13, QR Code.
     - `ChatView.tsx`: Trợ lý hội thoại và tạo ảnh từ chat.
   - Các component dùng chung:
     - `Header.tsx`: Thanh điều hướng chính và chuyển đổi chế độ Studio / Chat / Handbook.
     - `HandbookModal.tsx`: Hướng dẫn vận hành và tra cứu kỹ năng trực tiếp trên UI.
     - `GalleryRail.tsx`: Thanh hiển thị bộ sưu tập ảnh đã tạo trong phiên.
     - `LockScreen.tsx`: Màn hình bảo mật mã PIN nội bộ (`15012026`).
     - `LoadingModal.tsx`: Lớp phủ thông báo trạng thái xử lý AI toàn màn hình.

2. **Quy tắc Xử lý Dữ liệu & Storage:**
   - Sử dụng **LocalForage (IndexedDB)** thay cho `localStorage` khi lưu trữ dữ liệu lớn (ảnh Base64, lịch sử chat nhiều tin nhắn) để tránh lỗi tràn hạn mức bộ nhớ (`QUOTA_EXCEEDED_ERR`).
   - Tối ưu kích thước ảnh trước khi gửi sang API Gemini bằng hàm `resizeImage` trong `src/utils/imageUtils.ts` (mặc định giới hạn kích thước phân tích tối đa 1024 - 1536px).

3. **Backend & Bảo mật API Key:**
   - Khởi tạo cổng máy chủ duy nhất là **3000** trên host **0.0.0.0**.
   - Mọi khóa bí mật (Gemini API key, Google Service Account, Lark credentials) được quản lý qua biến môi trường server-side (`process.env.*`), không đưa khóa vào client bundle.

---

## 3. NGUYÊN TẮC THIẾT KẾ GIAO DIỆN (UI/UX PRINCIPLES)
- **Tông màu chủ đạo:** Tông tối hiện đại cao cấp (`#18191A`, `#242526`, viền `#3E4042`), điểm nhấn màu xanh Elmich (`#1877F2`) và màu phụ trợ thương hiệu.
- **Trải nghiệm thao tác (UX):**
  - Luôn có feedback loading rõ ràng khi AI đang xử lý (không để nút bấm câm lặng).
  - Sử dụng modal chặn toàn màn hình khi đang tạo ảnh để người dùng không bấm trùng lặp tác vụ.
  - Hỗ trợ xem trước ảnh ở độ phân giải cao và nút tải về rõ ràng.

---

## 4. QUY CHUẨN PROMPT CHO SẢN PHẨM GIA DỤNG ELMICH
- Mọi prompt sinh ảnh sản phẩm Elmich phải luôn mô tả chính xác:
  - **Inox 304:** Cần có vân xước satin mờ (`brushed satin finish`) và vệt sáng phản quang chân thực.
  - **Lớp chống dính:** Bề mặt vi hạt mờ (`micro-granite non-stick texture`).
  - **Thủy tinh:** Trong suốt chịu nhiệt borosilicate có khúc xạ ánh sáng sắc sảo.
  - **Logo thương hiệu:** Luôn giữ nguyên logo Elmich ở vị trí tự nhiên trên sản phẩm.
