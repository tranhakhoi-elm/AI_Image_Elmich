# Quy chuẩn Tạo Ảnh Nền Trắng (White BG Retouch Style Guide)

Tài liệu này quy định chi tiết cách thiết lập bối cảnh, ánh sáng, vật liệu và chống méo hình học dành riêng cho tác vụ **Làm Ảnh Nền Trắng (White BG Retouch)** trên hệ thống AI Elmich.

---

## 1. Triết Lý Thiết Kế Nền Trắng (White BG Philosophy)
Mục tiêu tối thượng của làm sạch ảnh nền trắng thương mại là **bảo toàn 100% hình thể sản phẩm thực tế** (Original shape, contour, logo, text) và chỉ ứng dụng AI để **tái lập ánh sáng và bóng đổ vật lý tinh xảo** nhằm nâng tầm cao cấp của sản phẩm:
- **Phong nền:** Trắng tinh khiết chuẩn studio (`#FFFFFF`), không hạt nhiễu, không vết loang hay bị nhiễm màu.
- **Bắt góc:** Sử dụng tiêu cự dài (Focal length từ `70mm đến 105mm`) để khử hoàn toàn méo phối cảnh (perspective distortion-free).
- **Độ nét:** Khẩu độ hẹp (`f/8 - f/11`) đảm bảo sản phẩm nét căng từ trước ra sau (infinite/deep depth of field).

---

## 2. Giao Thức Khống Chế Hình Học (Geometry Control Protocol)
Nhằm triệt tiêu xu hướng tự ý bóp méo, bo viền cong không chuẩn xác của AI đối với đồ gia dụng hình trụ (ấm siêu tốc, bình giữ nhiệt, nồi liêu):
- **Căn Trục (Axis Alignment):** 
  - *Prompt:* `"Maintain absolute verticality for all cylindrical products. Ensure the base and lid are perfectly parallel to the horizon."`
  - *Ý nghĩa:* Sản phẩm đứng thẳng vuông góc, nắp và đáy luôn song song với đường chân trời.
- **Bảo Toàn Logo (Logo Integrity):**
  - *Prompt:* `"Apply logo as a precise vector-based decal. No warping or distortion on curved surfaces. Strictly adhere to the brand placement."`
  - *Ý nghĩa:* Giữ nguyên dạng vector của chữ "Elmich", không bẻ cong uốn lượn biến dạng trên bề mặt cong.
- **Tỷ Lệ Thực Tế (Scale Reference):**
  - *Prompt:* `"Ensure handle-to-body proportion follows exact product design standards, avoiding unnatural scaling or floating artifacts."`

---

## 3. Cấu Cụ Thể Từng Loại Vật Liệu (Material Specifics)

### 3.1. Nhóm Kim Loại (Inox xước, Thép bóng, Nhôm)
- **Ánh Sáng & Phản Xạ:**
  - Áp dụng hiệu ứng **Fresnel**: Phản xạ phản chiếu cực mạnh ở viền cong sườn hẹp, phản xạ dịu đi ở chính diện bề mặt nhìn thẳng.
  - Vệt Sáng (Specular Highlights): Định dáng theo hình khối. Sản phẩm hình trụ cần có các vệt dọc dài mảnh (`sharp longitudinal highlights`) để định vị chiều cong 3D.
  - Phản Xạ Dị Hướng (Anisotropic Reflection): Tạo thớ xước inox mờ sang trọng với thông số mài mờ: 
    - *Prompt:* `"Use Anisotropic reflection with a blurriness factor of 0.05. Highlights must trace the contour of the object, not bloom uncontrollably."`
- **Bóng Đổ (Shadows):** Rất đậm và cô đọng sát mép đáy (Contact shadow), loang dịu dần theo một hướng duy nhất (Soft ground shadow).

### 3.2. Nhóm Nhựa & Polymer (Matte, Glossy, ABS)
- **Tán Xạ Dưới Bề Mặt (Subsurface Scattering):** Tránh làm nhựa mờ trông bệt màu như giấy màu dán. Ánh sáng studio xuyên thấu một biên độ cực nhỏ (<0.2mm) tạo chiều sâu chất liệu polymer.
- **Nhựa Nhám/Nhựa Chịu Nhiệt (Matte Polymer):**
  - *Prompt:* `"Apply Micro-bump texture at 5% intensity to mimic high-grade food-safe plastic. Subtle Fresnel effect at the edges to show material thickness."`
- **Nhựa Bóng (Glossy Polymer):** Giữ rõ viền phản chiếu của hộp sáng (Softbox highlights), phản xạ không bị nhòe mờ.

### 3.3. Nhóm Thủy Tinh & Trong Suốt (Glass & Acrylics)
- **Khúc Xạ & Tiêu Điểm Sáng (IOR & Caustics):**
  - *Prompt:* `"Set Refraction Index (IOR) to 1.5 for borosilicate glass. Ensure the internal walls of the container are visible through the glass, with slight chromatic aberration at the edges to simulate professional camera optics."`
- **Tách Biệt Khỏi Nền Trắng (Rim Isolation):** 
  - *Prompt:* `"Employ subtle dark-field studio lighting setup with black flags to frame the transparent glass silhouette with pristine dark rim edges."`
  - *Ý nghĩa:* Dùng dải đen định hình mỏng dọc thành bình thủy tinh để sản phẩm không bị hòa lẫn vào nền trắng tinh `#FFFFFF`.

### 3.4. Nhóm Gốm Sứ & Lớp Phủ Chống Dính (Ceramics & Coatings)
- **Vân Đá & Rỗ Siêu Nhỏ (Micro-displacement):**
  - *Prompt:* `"Utilize grazing 45-degree studio companion light to reveal subtle speckled non-stick textures or ceramic glaze pores under micro-contrast lens properties."`
- **Hai Lớp Phản Xạ (Double-layer Glaze):** Lớp sơn lót thô ráp chìm bên dưới, lớp men bóng gương phủ ngoài cùng tạo độ phản chiếu sâu thẳm sang trọng.

---

## 4. Tái Tạo & Phục Hồi Bề Mặt Vật Liệu (Material Surface Reconstruction)
Nhằm khắc phục tình trạng ảnh đầu vào chụp bằng điện thoại, thiếu sáng, bị nhiễu hạt (noise), hoặc phai màu, AI cần được cấu hình để tái tạo lại bề mặt chuẩn mực như chụp bằng máy ảnh độ phân giải cao:
- **Khử Nhiễu & Tái Lập Chi Tiết (Denoise & Clarity Enhancement):**
  - *Prompt:* `"Intelligently reconstruct the material surface to remove mobile-phone noise, color blocking, and low-light artifacts. Elevate the material quality to 8K commercial product photography standard, ensuring pristine, grain-free, and hyper-detailed textures."`
- **Làm Sạch Bóng Loang (Clean Specular Blooming):** Loại bỏ các đốm sáng bóng mỡ nhòe nhẹt lộn xộn do đèn flash điện thoại gây ra, trả lại một bề mặt tản sáng mượt mà, đồng đều hoặc vệt cắt sáng sắc nét chuẩn Softbox studio.

---

## 5. Thiết Lập Ánh Sáng & Bóng Đổ Studio (Lighting & Shadows)
- **Góc Ánh Sáng:** Sử dụng hệ thống tạt sáng mềm (`overhead softbox`), kết hợp vệt sáng hắt ven rìa để nâng khối.
- **Bóng Tiếp Xúc (Contact Shadow):** Bắt buộc phải có một dải sẫm mịn sụp xuống ngay điểm tiếp sàn của đáy sản phẩm để sản phẩm "nặng", cố định chân thực trên mặt phẳng nằm ngang, thay vì lơ lửng vô lý.
- **Bóng Đổ Mặt Đất (Ground Shadow):** Nhẹ, loang tản xa mềm mại, đồng bộ hướng đổ bóng một chiều duy nhất.
