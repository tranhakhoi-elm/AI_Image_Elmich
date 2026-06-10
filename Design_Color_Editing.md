# Quy chuẩn Đổi Màu Sản Phẩm (Color Editing Style Guide)

Tài liệu này quy định chi tiết cách thiết lập bối cảnh, ánh sáng, xử lý phản xạ bề mặt và giữ vững kết cấu khi thực hiện tác vụ **Đổi Màu Sản Phẩm (Color Editing / Recoloring)** bằng AI trên hệ thống Elmich.

---

## 1. Yêu Cầu Tiên Quyết: Đọc Quy Chuẩn Trước Khi Tạo Ảnh

- **Bắt buộc đọc trước:** Mỗi khi hệ thống AI nhận được yêu cầu tạo ảnh hoặc tối ưu hóa prompt cho tác vụ Đổi Màu Sản Phẩm (Color Editing), AI **bắt buộc phải đọc toàn bộ file `/Design_Color_Editing.md` đầu tiên** trước khi viết prompt hay gọi API thực hiện inpainting/recoloring. Điều này đảm bảo AI hiểu sâu sắc các nguyên tắc bảo toàn hình học, luma và kỹ thuật masking để tránh nhòe lem màu sắc.

---

## 2. Triết Lý Đổi Màu Thực Tế (High-Fidelity Recoloring Philosophy)
Khi thay đổi màu sắc của một bộ phận linh kiện cụ thể trên sản phẩm (Ví dụ: thay đổi vỏ từ màu hồng nhạt sang màu xanh lá cây đậm hoặc màu vàng đồng lấp lánh):
- **Bảo toàn hình học:** Khớp nối, ốc vít, các vết khắc chìm, nếp gấp biên dạng phải được giữ chuẩn xác đúng tỷ lệ 1:1, không được mờ đi hay biến dạng.
- **Bảo toàn bề mặt:** Vùng mạ kim loại sáng bóng thì khi đổi màu vẫn phải duy trì tính ánh kim (metallic sheen). Vùng nhựa nhám matte khi đổi màu vẫn phải nguyên thớ thô xù mịn màng, không được đột ngột bóng lộn lên.

---

## 2. Kỹ Thuật "Khoanh Vùng" (Inpainting / Vary Region)
Hiện tại, việc đổi màu sản phẩm trên AI hiếm khi thành công 100% nếu chỉ dùng Text Prompt từ đầu. Yêu cầu bắt buộc người dùng (hoặc AI agent) phải sử dụng tính năng **Inpainting** (như Vary (Region) trên Midjourney).
- **Quy tắc Masking:** Khoanh vùng chính xác bộ phận cần đổi màu.
- **Chống lẹm màu:** Tuyệt đối không khoanh lẹm sang logo, tem nhãn (như chữ "Elmich") hay các khớp nối kim loại để tránh lỗi "thấm màu" (Color leakage).

---

## 3. Giao Thức Bảo Toàn Ánh Sáng & Độ Sáng (Luma & Specular Preservation)
Mô tả chi tiết trong prompt của AI để tránh việc đổi màu dìm chết kết cấu tạo khối:
- **Giữ Nguyên Vệt Sáng (Specular Highlight Retention):**
  - *Nguyên lý:* Khi đổi chất liệu bề mặt sang màu sẫm (Ví dụ: Thân bếp màu Trắng sứ chuyển sang Đen nhám), các vệt bóng trắng phản xạ từ đèn Softbox ở studio rọi vào sản phẩm vẫn phải có màu trắng hoặc xám sáng, chứ không bị sẫm đen hóa theo lớp màu nền mới.
  - *Prompt:* `"Keep the exact spatial coordinates of all specular highlights and light reflections from the original image. Only modify the diffuse color of the material while retaining pure white light reflections."`
- **Ánh Sáng Màu (Reflected Tint Highlight):**
  - *Nguyên lý:* Nếu bề mặt sản phẩm là màu xanh lá cây bóng sang trọng, vệt sáng phản chiếu xiên nhẹ ở rìa sản phẩm phải mang sắc hơi pha lục tinh tế (tinted reflections), tạo cảm giác sơn phủ bóng của công nghệ gia công hiện đại.

---

## 4. Bộ Từ Khóa Kiểm Soát Vật Liệu (Texture Lock Keywords)
Để giải quyết triệt để lỗi "Biến đổi vật liệu gốc", cần cung cấp sẵn các cụm từ khóa (modifiers) để dán vào prompt tùy theo chất liệu:
- **Nếu đổi màu nhựa nhám:** Thêm `matte finish, micro-textured surface, diffuse light reflection, non-glossy`.
- **Nếu đổi màu kim loại xước:** Thêm `brushed metal texture, anisotropic reflections, metallic sheen, stainless steel core`.
- **Nếu đổi màu sơn bóng:** Thêm `high-gloss car paint finish, sharp specular highlights, clear coat reflections`.

---

## 5. Hiệu Ứng Loang Sáng Phản Chiếu (Color Bleed / Global Illumination)
- **Sự Lan Tỏa Màu Sắc:**
  - *Nguyên lý:* Khi một mảng diện tích lớn trên sản phẩm thay đổi sang màu nổi bật (Ví dụ: Đỏ mận, Cam san hô, Vàng hoàng kim), các bộ phận inox bên cạnh hoặc nền thớt gỗ trắng nằm ngay bên dưới sản phẩm phải tiếp nhận một dải màu mờ hắt nhẹ xuống (Color bleed/Bounce light).
  - *Prompt:* `"Ensure soft indirect color bleeding (bounce lighting) from the newly colored surfaces onto adjacent metal trims or grounding surfaces for physical integration."`
  - *Ý nghĩa:* Sự xuất hiện của dải màu hắt nhẹ này là chiếc khóa định hình giúp ảnh ghép trông thật 100% về mặt nhãn quan vật lý học.

---

## 6. Công Thức Prompt Mẫu (Inpainting Prompt Blueprint)
Công thức rõ ràng khi thực hiện tác vụ Inpainting đổi màu:
`[Hành động] + [Màu sắc mới mã Hex/Pantone hoặc mô tả] + [Vật liệu & Kết cấu bề mặt] + [Yêu cầu giữ nguyên ánh sáng gốc] + [Negative Prompt]`

*Ví dụ:* `"Change the selected area to deep forest green, maintaining the original matte plastic texture. Keep the exact spatial coordinates of all specular highlights and light reflections. Ensure soft indirect bounce lighting. --no glossy, reflections shifting, flat color bucket."*

---

## 7. Những Điểm Cấm Kỵ Cần Tránh (Negative Guidelines)
- **Hiện tượng bệt màu (Flat paint-bucket fill):** Trông mảng đổi màu như bị đổ sơn phẳng một cục trong Photoshop, làm mất sạch chiều sâu 3D, bóng đổ và các thớ vân mịn bề mặt.
- **Thấm màu sang chi tiết khác (Color leakage/bleeding on non-target parts):** Tem thương hiệu "Elmich", nút nguồn bằng cao su đen hay tay nối kim loại bị dính luồng màu dịch chuyển lem nhem sang.
- **Biến đổi vật liệu gốc (Material mutation):** Một bộ phận bằng nhựa ban đầu biến thành inox bóng loáng sau khi đổi màu, hoặc ngược lại.
- **Mất cân bằng trắng (White balance tilt):** Đổi màu một bộ phận làm toàn bộ tông màu bối cảnh (background) bị thay đổi sắc độ ấm/lạnh theo một cách bất ổn.
