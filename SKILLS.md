# SKILLS.MD — HỆ THỐNG SKILL FILE CHUẨN HÓA PROMPT ELMICH

Tài liệu này giải thích cơ chế, danh sách và quy trình quản lý các file kỹ năng (Skill Files) định hình phong cách đồ họa chuẩn Elmich.

---

## 1. DANH SÁCH SKILL FILE THEO WORKFLOW

Mỗi file Markdown dưới đây định nghĩa cấu trúc chi tiết, từ vựng kỹ thuật (vật liệu, ánh sáng, góc chụp camera) được nhúng trực tiếp vào prompt khi gọi Gemini:

| Skill File | Workflow áp dụng | Mô tả ngắn |
|---|---|---|
| `Design_Lifestyle_Concept.md` | `CONCEPT`, `SCENE_STAGING` | Bối cảnh gian bếp cao cấp, ánh sáng tự nhiên, bố cục sống động |
| `Design_Studio_Creative.md` | `STUDIO` | Chụp sản phẩm trên bục bệ nghệ thuật (podium), ánh sáng kịch tính |
| `Design_Tech_Effects.md` | `TECH_PS`, `TECH_EFFECTS` | Mô tả các hiệu ứng công nghệ: đáy từ 5 lớp, luồng nhiệt đối lưu, áp suất hơi nước |
| `Design_Color_Editing.md` | `COLOR_CHANGE` | Thay đổi màu sắc theo mã Pantone và ảnh tham chiếu màu |
| `Design_Packaging_Mockup.md` | `PACKAGING_MOCKUP` | Phối cảnh dựng hộp bao bì 3D từ các mặt thiết kế phẳng |
| `Design_WhiteBG_Retouch.md` | `WHITE_BG_RETOUCH` | Tách nền trắng chuẩn TMĐT, xử lý viền phản chiếu Inox và thủy tinh |
| `Design_Line_Art.md` | `LINE_ART` | Sơ đồ bóc tách linh kiện (exploded view) dạng nét kỹ thuật |
| `3DRender_To_Photo.md` | `3D_TO_REAL_WHITE_BG` | Chuyển đổi bản vẽ CAD/3D thô thành ảnh chụp studio chân thực |

---

## 2. NGUYÊN TẮC CHỈNH SỬA & ĐÓNG GÓI

- Các file skill được đọc trong thời gian biên dịch (thông qua `import raw from './Design_*.md?raw'`).
- Do đó, sau khi cập nhật nội dung văn bản trong các file Markdown này, cần thực hiện build lại hệ thống (`npm run build`) để áp dụng vào luồng sinh ảnh.
