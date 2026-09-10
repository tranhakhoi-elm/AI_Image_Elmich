# GEMINI.MD — HƯỚNG DẪN MÔ HÌNH GEMINI & KỸ THUẬT PROMPT ELMICH

Tài liệu này cung cấp các tiêu chuẩn mô hình và kỹ thuật prompt dành riêng cho hệ thống Elmich AI Studio.

---

## 1. LỰA CHỌN MÔ HÌNH GEMINI (MODEL SELECTION MATRIX)

| Nhiệm vụ | Model khuyến nghị | Lý do kỹ thuật |
|---|---|---|
| **Tạo ảnh sản phẩm chất lượng cao** | `gemini-3.1-flash-image` hoặc `imagen-3.0-generate-002` | Tái hiện vật liệu kim loại Inox 304, thủy tinh, bóng phản chiếu studio sắc nét |
| **Dịch bao bì tự động (Translate)** | `gemini-3.1-flash-image` (Image-to-Image recreation) | Giữ nguyên 100% kết cấu bế dieline, thay chữ tiếng Anh thành tiếng Việt chuẩn |
| **Phân tích OCR & Kiểm tra bao bì** | `gemini-3.1-flash-image` / `gemini-2.5-flash` | Nhận diện chữ tiếng Việt có dấu, đọc được cả font chữ nhỏ trên tem phụ |
| **Gợi ý Concept & Đạo cụ Lifestyle** | `gemini-2.5-flash` | Tốc độ phân tích dưới 2 giây, tư duy bối cảnh sống và bố cục chụp ảnh thẩm mỹ |
| **Trợ lý Chat tư vấn thiết kế** | `gemini-2.5-flash` hoặc `gemini-2.5-pro` | Đối thoại tự nhiên, hiểu sâu về đồ gia dụng và thuật ngữ thiết kế đồ họa |

---

## 2. KỸ THUẬT PROMPT CHO TỪNG LOẠI VẬT LIỆU GIA DỤNG

### 2.1. Kim loại Inox (Nồi, Chảo, Ấm đun, Dao thớt)
```text
Professional commercial studio photograph of Elmich stainless steel product.
Material: Food-grade 304 stainless steel with ultra-fine brushed satin texture, crisp longitudinal specular highlights along curved surfaces, subtle metallic sheen, authentic subtle reflection. No distorted reflections.
Lighting: High-end catalog 3-point softbox studio lighting, rim lighting defining product edges sharply against pristine clean backdrop.
Camera: 50mm or 85mm prime lens, f/8 aperture, razor-sharp focus throughout, ISO 100.
```

### 2.2. Lớp Chống Dính (Chảo, Lòng nồi cơm, Khay nướng)
```text
Inner surface features premium non-stick ceramic / granite coating with subtle matte micro-texture, deep charcoal black or speckled dark granite finish. Seamless transition between metallic rim and non-stick coating.
```

### 2.3. Thủy Tinh Cao Cấp (Bình giữ nhiệt, Nắp nồi, Cối xay sinh tố)
```text
Ultra-clear high-borosilicate heat-resistant glass, pristine transparent surface showing gentle light refraction, realistic caustics, and subtle soft rim reflections around the edges.
```

---

## 3. PROMPT CHUYỂN NGỮ BAO BÌ TIẾNG ANH ➔ TIẾNG VIỆT
```text
Recreate this exact packaging design perfectly.
Strict constraints:
1. Keep the exact same dieline (cut lines, fold creases, flap positions), dimensions, aspect ratio, and structural blueprint.
2. Keep the identical graphic layout, background colors, brand palettes, product illustration style, and logo placement.
3. Translate all English text, headings, feature badges, specifications, and descriptions into professional, natural Vietnamese terminology.
4. Render high-resolution typography with crisp fonts and zero visual blur. Output in clean 1K resolution.
```
