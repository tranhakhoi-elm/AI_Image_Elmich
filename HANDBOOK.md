# ELMICH AI DESIGN STUDIO — SỔ TAY HƯỚNG DẪN & KỸ NĂNG (HANDBOOK & SKILLS)

> **Phiên bản:** 2.5 Pro Suite  
> **Đơn vị phát triển:** Elmich Vietnam — Bộ phận Thiết kế Đồ họa & Công nghệ Sáng tạo  
> **Nền tảng:** React 19 + Vite + Express + Google Gemini Multimodal SDK (`@google/genai`)

---

## MỤC LỤC

1. [TỔNG QUAN HỆ THỐNG & SỨ MỆNH](#1-tổng-quan-hệ-thống--sứ-mệnh)
2. [KIẾN TRÚC KỸ THUẬT (SYSTEM ARCHITECTURE)](#2-kiến-trúc-kỹ-thuật-system-architecture)
3. [15 WORKFLOW CHUYÊN BIỆT CỦA STUDIO](#3-15-workflow-chuyên-biệt-của-studio)
4. [KỸ NĂNG CHUYÊN SÂU: DỊCH BAO BÌ TỰ ĐỘNG CHO CONTENT](#4-kỹ-năng-chuyên-sâu-dịch-bao-bì-tự-động-cho-content)
5. [KỸ NĂNG CHUYÊN SÂU: KIỂM DUYỆT BAO BÌ ĐỐI CHIẾU EXCEL](#5-kỹ-năng-chuyên-sâu-kiểm-duyệt-bao-bì-đối-chiếu-excel)
6. [HỆ THỐNG PROMPT ENGINEERING CHUẨN ELMICH (SKILL RULES)](#6-hệ-thống-prompt-engineering-chuẩn-elmich-skill-rules)
7. [DỰ TOÁN CHI PHÍ & TÍNH TOÁN TOKEN (ANALYTICS)](#7-dự-toán-chi-phí--tính-toán-token-analytics)
8. [TÍCH HỢP DOANH NGHIỆP: GOOGLE SHEETS & LARK SUITE](#8-tích-hợp-doanh-nghiệp-google-sheets--lark-suite)
9. [HƯỚNG DẪN VẬN HÀNH & BẢO TRÌ (OPERATIONS)](#9-hướng-dẫn-vận-hành--bảo-trì-operations)

---

## 1. TỔNG QUAN HỆ THỐNG & SỨ MỆNH

**Elmich AI Design Studio** là nền tảng trí tuệ nhân tạo chuyên biệt được xây dựng riêng cho hệ sinh thái gia dụng, đồ bếp và thiết bị nhà thông minh của thương hiệu Elmich.

### Mục tiêu cốt lõi:
- **Tối ưu tốc độ sản xuất:** Rút ngắn thời gian từ khâu lên ý tưởng thiết kế sản phẩm đến khi có hình ảnh truyền thông và bao bì từ hàng tuần xuống còn vài phút.
- **Chuẩn hóa chất lượng hình ảnh:** Tái hiện chính xác các vật liệu đặc thù của đồ gia dụng cao cấp: Inox 304 xước mờ, sơn tĩnh điện, men gốm chịu nhiệt, thủy tinh borosilicate cao cấp và lớp phủ chống dính Teflon/gốm sinh học.
- **Trao quyền cho đội ngũ Content & Marketing:** Cho phép nhân viên nội dung không chuyên về Photoshop/Illustrator có thể dịch bao bì tiếng Anh sang tiếng Việt, tạo mockup 3D, dựng bối cảnh gian bếp đẹp như tạp chí.
- **Tự động hóa QC/QA Bao bì:** Loại bỏ 100% lỗi sai chính tả, sai thông số kỹ thuật (công suất, dung tích, kích thước, xuất xứ) giữa bản thiết kế đồ họa và file dữ liệu Excel của phòng R&D.

---

## 2. KIẾN TRÚC KỸ THUẬT (SYSTEM ARCHITECTURE)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           TRÌNH DUYỆT (CLIENT)                          │
├─────────────────────────────────────────────────────────────────────────┤
│  React 19 + Tailwind CSS + Motion Layout Animations                      │
│                                                                         │
│  ┌───────────────────────┐ ┌───────────────────┐ ┌───────────────────┐  │
│  │ 15 Studio Workflows   │ │ Trợ lý Chat AI    │ │ Quản lý Bộ sưu tập│  │
│  │ (Concept, Retouch...) │ │ (Gemini Chat/Img) │ │ (IndexedDB Cache) │  │
│  └───────────────────────┘ └───────────────────┘ └───────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ Tiện ích: JsBarcode, qrcode-svg, jsQR, XLSX Processor, ImageUtils │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────▲────────────────────────────────────┘
                                     │ (HTTP / JSON / Base64)
┌────────────────────────────────────▼────────────────────────────────────┐
│                    NODE.JS EXPRESS SERVER (server.ts)                   │
├─────────────────────────────────────────────────────────────────────────┤
│  - Cổng dịch vụ: 3000 (0.0.0.0)                                         │
│  - Middleware: Vite dev middleware / Express static dist                │
│  - API Routes:                                                          │
│    * POST /api/sheets/report (Google Sheets Service Account sync)       │
│    * POST /api/lark/report   (Lark Suite Bitable Tenant sync)           │
│    * POST /api/generate-image / AI Services                             │
└────────────────────────────────────▲────────────────────────────────────┘
                                     │ (REST API & OAuth2)
┌────────────────────────────────────▼────────────────────────────────────┐
│                     CÁC DỊCH VỤ ĐÁM MÂY BÊN NGOÀI                       │
├─────────────────────────────────────────────────────────────────────────┤
│  • Google Gemini Models: gemini-3.1-flash-image, gemini-2.5-flash, pro   │
│  • Google Cloud Service Account (Google Sheets Reporting)               │
│  • Lark Suite Open APIs (Lark Base Automation)                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. 15 WORKFLOW CHUYÊN BIỆT CỦA STUDIO

Hệ thống được tổ chức thành 15 phân hệ chuyên sâu tương ứng với các nhu cầu thực tế:

| STT | Mã phân hệ | Tên tiếng Việt | Mục đích & Ứng dụng |
|---|---|---|---|
| **1** | `CONCEPT` | Concept Lifestyle | Phối cảnh sản phẩm trong không gian sống (bếp hiện đại, bàn ăn sáng, phòng khách). Tùy biến ống kính camera và đạo cụ. |
| **2** | `SCENE_STAGING` | Phối cảnh Thực tế | Đưa ảnh chụp sản phẩm thực tế vào một ảnh bối cảnh kiến trúc có sẵn, hòa trộn ánh sáng và đổ bóng vật lý chuẩn xác. |
| **3** | `TECH_PS` | Điểm mạnh Kỹ thuật | Làm nổi bật công nghệ độc quyền (đáy từ 5 lớp, mâm nhiệt kép, quạt tản nhiệt, van xả áp kép) bằng hiệu ứng đồ họa cao cấp. |
| **4** | `COLOR_CHANGE` | Đổi màu theo Pantone | Thử nghiệm các phiên bản màu sắc mới theo mã màu Pantone hoặc ảnh tham chiếu màu sắc thực tế trước khi đặt hàng sản xuất. |
| **5** | `PACKAGING_MOCKUP`| Mockup Bao bì 3D | Giả lập hộp sản phẩm dạng 3D từ các mặt thiết kế phẳng (Front, Back, Left, Right, Top) trên phông trắng hoặc quầy kệ. |
| **6** | `TECH_EFFECTS` | Hiệu ứng Công nghệ | Tạo các luồng nhiệt, đối lưu không khí, hơi nước áp suất cao, bọt khí khử khuẩn cho máy ép, nồi chiên không dầu, ấm siêu tốc. |
| **7** | `WHITE_BG_RETOUCH`| Retouch Phông trắng TMĐT| Tách nền trắng tinh khiết chuẩn Shopee/Lazada/Tiki (#FFFFFF), tối ưu tương phản mép kim loại và độ trong suốt thủy tinh. |
| **8** | `3D_TO_REAL_WHITE_BG`| Render 3D sang Ảnh Thật| Biến bản vẽ phối cảnh 3D CAD/SolidWorks/3ds Max thô thành ảnh chụp studio chân thật với độ chân thực bề mặt cao. |
| **9** | `TRACING_ASSISTANT`| Trợ lý Đồ lại nét | Hướng dẫn và tạo đường bao nét (contour outline) hỗ trợ thiết kế vector trong Illustrator/Corel. |
| **10**| `LINE_ART` | Bản vẽ Kỹ thuật & Bóc tách| Tạo sơ đồ cấu tạo linh kiện (exploded view diagram) phục vụ sách hướng dẫn sử dụng và kiểm định chất lượng. |
| **11**| `STUDIO` | Chụp Studio Nghệ thuật | Bố trí sản phẩm trên các bục bệ hình học (podium), ánh sáng kịch tính, phong cách tối giản châu Âu phục vụ banner quảng cáo. |
| **12**| `TRACK_SOCKET_STAGING`| Ray Ổ Cắm Đa Năng | Ghép thanh ray trượt và cắm đồng thời các thiết bị Elmich trên bề mặt bếp cao cấp. |
| **13**| `BARCODE_QR_GENERATOR`| Tạo Mã vạch & QR Code | Sinh mã vạch chuẩn quốc tế Code 128, EAN-13 (tính check-digit tự động) và mã QR dẫn về link sản phẩm Elmich xuất file SVG in ấn. |
| **14**| `TRANSLATE_PACKAGING`| Dịch Bao bì Tự động | Dịch bao bì tiếng Anh sang tiếng Việt trong 1 chạm cho Content team, giữ nguyên dieline, xuất ảnh 1K tức thì. |
| **15**| `PACKAGING_CHECK` | Kiểm duyệt Bao bì & Excel| Soi lỗi sai lệch thông tin trên các file thiết kế bao bì dựa trên bảng tiêu chuẩn Excel của phòng R&D. Xuất báo cáo ĐẠT/KHÔNG ĐẠT. |

---

## 4. KỸ NĂNG CHUYÊN SÂU: DỊCH BAO BÌ TỰ ĐỘNG CHO CONTENT

### Bối cảnh bài toán:
Các sản phẩm Elmich nhập khẩu hoặc OEM quốc tế thường có file thiết kế bao bì gốc hoàn toàn bằng tiếng Anh. Đội ngũ làm nội dung (Content, Marketing, E-commerce) không có bằng cấp đồ họa hay máy tính cài đặt Adobe Illustrator/Photoshop, nhưng cần ngay hình ảnh bao bì tiếng Việt để đăng tải bài viết, làm tài liệu giới thiệu sản phẩm và trình duyệt kinh doanh.

### Giải pháp kỹ thuật:
- Sử dụng mô hình `editProductImage` (kết hợp khả năng nhận diện hình ảnh và tái sinh đồ họa của Gemini 3.1 Flash Image).
- Prompt định hướng chuyên biệt:
  > *"Recreate this exact packaging design perfectly. Keep the exact same dieline (cut lines), background graphics, and colors. However, translate all the English text on the packaging into Vietnamese."*
- Giữ 100% đường bế cấn, vị trí logo Elmich và tông màu thương hiệu.
- Đầu ra mặc định là file ảnh chất lượng cao **1K (1024x1024 trở lên)**, sẵn sàng tải về trong 1 click.

---

## 5. KỸ NĂNG CHUYÊN SÂU: KIỂM DUYỆT BAO BÌ ĐỐI CHIẾU EXCEL

### Quy trình 3 bước tự động:
1. **Bước 1: Nạp dữ liệu tiêu chuẩn (R&D Data):**
   - Tải file Excel (`.xlsx`) hoặc dán trực tiếp bảng thông số kỹ thuật.
   - AI tự động trích xuất các trường thông tin trọng yếu:
     - Tên sản phẩm, Mã sản phẩm (SKU)
     - Công suất (W), Điện áp (V/Hz), Dung tích (L)
     - Kích thước sản phẩm, Trọng lượng, Định lượng
     - Chất liệu cối xay/thân nồi/lòng nồi
     - Xuất xứ, Năm sản xuất, Đơn vị sản xuất, Địa chỉ
     - Mã vạch EAN-13, Mã Code 128, Mã QR Elmich
2. **Bước 2: Tải lên các file thiết kế bao bì:**
   - Hỗ trợ tải nhiều file đồng thời: Hộp màu chính (Color Box), Hộp carton vận chuyển (Master Carton), Tem nhãn phụ tiếng Việt (Label).
3. **Bước 3: AI Quét OCR & Đối chiếu chéo:**
   - Phân tích văn bản trên ảnh thiết kế và quét mã QR/Barcode.
   - Lập bảng ma trận kết quả: Hiển thị giá trị Chuẩn vs Giá trị thực tế trên từng file.
   - Đánh dấu trạng thái: **ĐẠT** (xanh) hoặc **KHÔNG ĐẠT** (đỏ) kèm cảnh báo lỗi chi tiết.
   - Xuất file báo cáo Excel hoàn chỉnh (`BaoCao_KiemTraBaoBi_YYYY-MM-DD.xlsx`).

---

## 6. HỆ THỐNG PROMPT ENGINEERING CHUẨN ELMICH (SKILL RULES)

Để đảm bảo kết quả hình ảnh luôn mang đẳng cấp thương hiệu Elmich Châu Âu, các quy tắc sau được áp dụng nghiêm ngặt:

### Quy tắc 1: Bảo toàn Nhận diện Vật liệu
- **Inox 304:** Cần mô tả `"high-grade 304 food-contact stainless steel, seamless brushed satin finish with sharp, authentic specular highlight strips along the curvature"`.
- **Thủy tinh Borosilicate:** `"Crystal-clear high-borosilicate glass with light refraction, sharp caustics and subtle rim highlights"`.
- **Lớp chống dính:** `"Ultra-durable micro-granite non-stick textured surface, matte dark graphite tone"`.
- **Vân gỗ tay cầm:** `"Natural European beech wood handle with fine organic grain and warm matte varnish"`.

### Quy tắc 2: Thiết lập Ánh sáng & Quang học Studio
- Tránh ánh sáng quá phẳng hoặc bóng mờ nhạt.
- Ưu tiên hệ thống đèn 3 điểm: Key light góc 45 độ, Fill light mềm qua softbox tản sáng, Rim light viền sắc cạnh từ phía sau để tách sản phẩm khỏi nền.

### Quy tắc 3: Kiểm soát Không gian Trống (Negative Space)
- Trong các chế độ phục vụ quảng cáo và banner (`STUDIO`, `CONCEPT`), hệ thống cung cấp tùy chọn vị trí để trống (`TOP`, `BOTTOM`, `LEFT`, `RIGHT`) để đội ngũ Marketing dễ dàng chèn tiêu đề, thông điệp truyền thông hoặc giá bán mà không bị đè lên sản phẩm.

---

## 7. DỰ TOÁN CHI PHÍ & TÍNH TOÁN TOKEN (ANALYTICS)

Mỗi thao tác tạo ảnh đều được hệ thống tính toán chi phí minh bạch theo bảng giá API Google Cloud thực tế:

| Tác vụ | Mô hình sử dụng | Chi phí ước tính |
|---|---|---|
| Phân tích bối cảnh & gợi ý Concept | `gemini-2.5-flash` | ~$0.002 |
| Phân tích kiểm duyệt bao bì (OCR + Check) | `gemini-3.1-flash-image` | ~$0.005 - $0.015 / lần check |
| Tạo ảnh chuẩn 1K (1024x1024) | `gemini-3.1-flash-image` | ~$0.067 |
| Tạo ảnh sắc nét 2K (2048x2048) | `gemini-3.1-flash-image` | ~$0.101 |
| Tạo ảnh siêu nét 4K (4096x4096) | `gemini-3.1-flash-image` | ~$0.151 |

---

## 8. TÍCH HỢP DOANH NGHIỆP: GOOGLE SHEETS & LARK SUITE

Để ban lãnh đạo và phòng ban dễ dàng theo dõi số lượng hình ảnh tạo ra và chi phí vận hành:
1. **Google Sheets Integration (`/api/sheets/report`):**
   - Sử dụng Google Service Account xác thực tự động.
   - Ghi nhận: Thời gian, Tên sản phẩm, Chế độ tạo, Model AI, Kích thước, Chi phí ($).
2. **Lark Suite Bitable Integration (`/api/lark/report`):**
   - Tự động tạo bản ghi mới vào cơ sở dữ liệu Base của Lark Suite nội bộ Elmich.
   - Cho phép phân quyền theo dõi tiến độ sản xuất hình ảnh giữa các phòng ban: R&D, Trade Marketing, Brand Marketing và Thiết kế.

---

## 9. HƯỚNG DẪN VẬN HÀNH & BẢO TRÌ (OPERATIONS)

### Biến môi trường cần thiết (`.env`):
```env
# Gemini API Key (Bắt buộc)
GEMINI_API_KEY=your_gemini_api_key_here

# Tích hợp Google Sheets (Tùy chọn)
GOOGLE_SHEET_ID=your_spreadsheet_id
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}

# Tích hợp Lark Suite (Tùy chọn)
LARK_APP_ID=cli_xxxxxxxxxxxx
LARK_APP_SECRET=xxxxxxxxxxxxxxxxxxxx
```

### Lệnh chạy và đóng gói hệ thống:
```bash
# Cài đặt thư viện phụ thuộc
npm install

# Khởi động máy chủ phát triển (Cổng 3000)
npm run dev

# Kiểm tra chất lượng mã nguồn
npm run lint

# Đóng gói sản phẩm xuất xưởng
npm run build

# Chạy bản build sản xuất
npm start
```

---
*Tài liệu được biên soạn và cập nhật bởi Elmich AI Studio Core Team.*
