# Tài Liệu Định Hình Phong Cách Hình Ảnh (Design/Prompt Guidelines)

Tài liệu này đóng vai trò là "Bộ quy chuẩn nhiếp ảnh kỹ thuật số" (Digital Photography Rulebook) cho các hình ảnh tạo ra trên Ai Image Elmich. Tài liệu đi sâu vào các thông số vật lý của ánh sáng, cấu trúc vật liệu và thiết lập camera để đảm bảo AI tạo ra kết quả đạt chuẩn thương mại cao cấp (High-end Commercial Photography).

## 1. Triết Lý & Nguyên Tắc Cốt Lõi (Core Principles)

- **Bảo Toàn Hình Học Tuyệt Đối (Strict Geometry Preservation):** AI không được tự ý "sáng tạo" hay nội suy thêm các chi tiết cấu tạo của sản phẩm. Đường cong, khớp nối, logo, núm vặn phải được giữ nguyên kích thước và vị trí.
- **Mô Phỏng Vật Lý Chân Thực (PBR - Physically Based Rendering):** Hình ảnh phải tuân thủ các định luật vật lý về ánh sáng (Phản xạ, Khúc xạ, Tán xạ). Không sử dụng các hiệu ứng ánh sáng phi thực tế hoặc "ảo giác 3D glow".
- **Thông Số Camera Tiêu Chuẩn (Default Camera Specs):** 
  - **Studio White Background:** Tiêu cự (Focal Length) từ `70mm đến 105mm` để chống méo góc (distortion-free). Khẩu độ nhỏ `f/8 - f/11` để sản phẩm nét từ trước ra sau (deep depth of field).
  - **Lifestyle/Contextual:** Tiêu cự `50mm` hoặc `85mm`. Khẩu độ lớn `f/2.8 - f/4` tạo hiệu ứng xóa phông (bokeh/shallow depth of field) làm nổi bật chủ thể nhưng bối cảnh vẫn có thể nhận diện.

### 1.1. Giao Thức Kiểm Soát Hình Học (Geometry Control Protocol)
Nhằm kiểm soát chặt chẽ khuynh hướng méo mó vật thể hình tròn hoặc hình trụ thường gặp ở các mô hình AI:
- **Căn Trục (Axis Alignment):** "Maintain absolute verticality for all cylindrical products. Ensure the base and lid are perfectly parallel to the horizon." -> Toàn bộ sản phẩm dạng bình giữ nhiệt, ấm, nồi phải thẳng đứng vuông góc, đáy và nắp song song tuyệt đối với đường chân trời.
- **Bảo Toàn Logo (Logo Integrity):** "Apply logo as a precise vector-based decal. No warping or distortion on curved surfaces. Strictly adhere to the [Logo_Elmich_Master] placement coordinates: [Specify height/centered]." -> Đảm bảo thương hiệu không bị biến dạng theo mặt cong.
- **Tham Chiếu Tỷ Lệ (Scale Reference):** "Reference object: 1:1 scale relative to a standard kitchen environment. Ensure handle-to-body proportion follows engineering CAD standards." -> Đảm bảo tỷ lệ các tay cầm, núm vặn cân đối với thân máy đúng thực tế.

## 2. Tiêu Chuẩn Xử Lý Vật Liệu Chuyên Sâu (Advanced Material Guide)

### 2.1. Kim Loại (Inox, Hợp kim, Nhôm mạ)
- **Ánh Sáng & Phản Xạ:**
  - Áp dụng hiệu ứng **Fresnel**: Phản xạ mạnh hơn ở các viền cong góc hẹp so với phần diện tích nhìn thẳng.
  - Vệt sáng (Highlights): Phải tuân theo hình khối sản phẩm. Ví dụ: Chảo tròn/nồi trụ cần có "sharp longitudinal highlights" (vệt sáng dọc kéo dài) để định hình độ cong.
  - Phản xạ dị hướng (Anisotropy): Thường dùng cho Inox xước (Brushed Stainless Steel), ánh sáng bị nhòe theo chiều ngang của các thớ xước với quy chuẩn: `"Use Anisotropic reflection with a blurriness factor of 0.05. Highlights must trace the contour of the object, not bloom uncontrollably."`
- **Bóng (Shadows):** Rất sắc nét ở điểm tiếp xúc (Contact shadow) và nhạt dần về phía xa (Soft unsharp masking).

### 2.2. Vật Liệu Nhựa (Matte, Glossy, ABS & Nhựa nhiệt dẻo)
- **Tán Xạ Kém Thấu Kính (Subsurface Scattering - SSS):** Đối với nhựa màu sáng hoặc nhựa silicone, ánh sáng phải hơi xuyên thấu nhẹ qua lớp bề mặt tạo cảm giác mềm mại chân thực, tránh làm vật liệu trông như bìa cứng sơn màu.
- **Glossy (Nhựa bóng):** Vệt sáng phản chiếu phải sắc và rõ hình dạng nguồn sáng (ví dụ: thấy rõ hình chữ nhật của Softbox).
- **Matte / Heat-Resistant Plastic (Nhựa nhám / Nhựa chịu nhiệt):** Áp dụng kết cấu nhám siêu vi: `"Apply Micro-bump texture at 5% intensity to mimic high-grade food-safe plastic. Subtle Fresnel effect at the edges to show material thickness."` Vệt sáng khuếch tán rộng mềm mại, độ nhám hấp thụ ánh sáng dịu nhẹ.

### 2.3. Thủy Tinh & Pha Lê (Glass/Crystal)
- **Khúc Xạ & Tán Xạ (Caustics):** Đây là yếu tố then chốt. Ánh sáng đi qua thủy tinh hoặc nước bên trong phải tạo ra các luồng sáng hội tụ (caustic patterns) đọng dưới đáy sản phẩm và in lên mặt sàn.
- **Chiết Suất & Độ Dày (Refraction & Optics):** `"Set Refraction Index (IOR) to 1.5 for borosilicate glass. Ensure the internal walls of the container are visible through the glass, with slight chromatic aberration at the edges to simulate professional lens optics."`
- **Dark-field / Bright-field Lighting:** 
  - Cần sử dụng tấm phản quang đen (Black flags) đặt hai bên cạnh để tạo đường viền đen sẫm (Dark rim) dọc theo chu vi khối thủy tinh. Điều này tách bạch rõ ràng thủy tinh trong suốt khởi nền trắng.
- **Độ Dày Thành (Thickness):** Thể hiện rõ khối lượng thông qua độ dày thành thủy tinh tại miệng và đáy cốc/bình.

### 2.4. Gốm, Men Sứ & Đá (Ceramics & Stone)
- **Micro-displacement (Độ dập nổi bề mặt):** Chiếu sáng tạt góc hẹp (Grazing light / 45-degree angle) để làm nổi rõ các vết rỗ siêu nhỏ (pores) hoặc vân đá tự nhiên.
- **Lớp Men Bóng (Glaze):** Bề mặt cần độ phản xạ kép. Lớp men thì phản xạ y hệt kính/nhựa bóng, nhưng kết cấu bên dưới lớp men thì thô ráp và hấp thụ ánh sáng.

## 3. Quy Chuẩn Bóng Đổ & Môi Trường Studio (Shadow & Environment)

### 3.1. Hệ Thống Ánh Sáng 3 Điểm (3-Point Lighting System)
AI cần hiểu môi trường giả lập luôn bao gồm:
- **Key Light (Sáng chính):** Nguồn sáng mạnh nhất, quyết định hình khối và hướng đổ bóng. Thường lấy từ trái qua, chết dần từ trên xuống.
- **Fill Light (Sáng phụ):** Cường độ bằng 30-40% sáng chính, dùng để nâng sáng vùng tối (shadows), đảm bảo không có mảng đen nào bị mất hoàn toàn chi tiết (no pure black clippings).
- **Rim Light / Back Light (Sáng viền):** Chiếu từ phía sau sản phẩm dọc ven rìa để bóc tách sản phẩm khỏi phông nền. Đặc biệt quan trọng với phông nền tối màu.

### 3.2. Cấu Trúc Bóng Đổ (Shadow Structure)
Không bao giờ dùng một cục bóng đen kịt. Bóng đổ phải có 3 phần:
1. **Contact Shadow (Bóng tiếp xúc):** Nằm chính xác dưới đáy sản phẩm (viền tiếp xúc mặt bàn), màu đen rất gắt và đậm đặc, mô phỏng Ambient Occlusion (Tắc nghẽn ánh sáng xung quanh).
2. **Key Shadow (Bóng thân):** Hình dáng phụ thuộc vào chiều nguồn sáng chính chiếu tới, nhạt dần (gradient) khi ra xa.
3. **Handle/Extrusion Shadow (Bóng chi tiết thừa):** Các chi tiết như quai xách, tay cầm sẽ phóng bóng xuống thân nồi hoặc xuống sàn tùy theo góc độ, đường viền bóng mờ dần (feathered edges).

## 4. Xử Lý Khi Đổi Màu Sản Phẩm (Color Editing)

- **Luma Preservation (Giữ nguyên độ sáng):** Khi đổi từ màu sáng sang màu tối (ví dụ Trắng sang Đen), AI không được biến hình ảnh thành một cục đen tuyền. Nó phải bảo toàn được các vệt phản chiếu ánh sáng (specular highlights) màu trắng. Ngược lại từ tối sang sáng không được làm mất các vùng bóng hốc.
- **Color Bleed (Loang màu):** Sự giao thoa màu sắc. Nếu thân nồi màu Đỏ mận, một chút ánh sáng đỏ nhạt sẽ phản chiếu nhẹ hắt xuống phần chân đế inox.

## 5. Quy Tắc Bố Cục Riêng Cho Concept Đời Sống (Lifestyle Framing)

- **Không Gian Âm (Negative Space):** Luôn chừa ra một khoảng trống (vùng nền ít chi tiết, như mặt bàn trống hoặc bức tường nhạt màu) để đội ngũ thiết kế có chỗ chèn Text (Giá, Tên chương trình khuyến mãi...).
- **Quy Tắc 1/3 (Rule of Thirds):** Chếch sản phẩm sang điểm giao cắt 1/3 của khung hình, không luôn luôn đặt ở chính giữa (center-aligned).
- **Bảng Màu Xuyên Suốt (Color Palette Harmony):** Chấm dứt việc phối màu rực rỡ, lộn xộn. Sử dụng các tone màu thanh lịch (Analogous) hoặc màu tương phản nhẹ nhàng (Soft Complementary) để tạo cảm giác "Premium". Tone nền chủ đạo nên là: Tự nhiên (Mộc/Gỗ/Đá), Trung tính (Xám/Kem/Đen), hoặc Phong cách Bắc Âu (Scandinavian).

## 6. Những Lỗi Thường Gặp & Điều Cấm Kỵ Cần Tránh (Negative Guidelines)
Để đảm bảo chất lượng nhiếp ảnh đầu ra tuyệt hảo, bộ tạo prompt cần loại bỏ tối đa các đặc tính phi mỹ thuật sau:

- **Lỗi Hình Học & Biến Dạng (Geometry Warp):** Tránh mọi biến dạng méo mó ở logo thương hiệu (distorted logos), tay cầm không khớp hay xiêu vẹo (skewed geometry, non-functional hinges) hoặc các bộ phận lơ lửng không tiếp đất (floating parts).
- **Bất Đồng Chất Liệu (Material Clashing):** Tránh hiện tượng kim loại trông bệt bẩn như nhựa sơn (plastic-looking metal), phần nhựa bóng quá đà gây chói hoặc vệt phản chiếu bị nhòe nhòa mất nét (blurry reflections). Tránh màu sắc bão hòa lòe loẹt quá mức (over-saturated colors, unrealistic bloom).
- **Bóng Đổ Sai Hướng (Incorrect Shadows):** Tránh bóng đổ loang lổ nhiều hướng xung đột nhau do bố trí ánh sáng sai lệch (inconsistent shadow direction, conflicting shadows), hoặc mất bóng tiếp đất khiến sản phẩm trông tách rời bối cảnh.
- **Độ Phân Giải Thấp (Low-Fidelity):** Tránh vỡ hạt ở các chi tiết chữ, tem decal, thông số dung tích hay hoa văn in nổi trên sản phẩm (low-resolution textures, pixelated edges on text/branding).
