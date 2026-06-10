# Quy chuẩn Chụp Studio Sáng Tạo (Studio Creative Style Guide)

Tài liệu này quy định chi tiết cách thiết lập bối cảnh, hệ thống ánh sáng đa điểm phức tạp, đổ bóng và bố trí đạo cụ mỹ thuật dành riêng cho chế độ **Chụp Studio Sáng Tạo (Studio Creative Mode)** trên hệ thống AI Elmich.

---

## 1. Triết Lý Thiết Kế Studio Sáng Tạo
Chế độ Studio Sáng tạo biến những bức ảnh thô của sản phẩm thành những tác phẩm nhiếp ảnh quảng cáo thương mại đỉnh cao, kết hợp giữa sự tối giản hiện đại và bố cục vững vàng nghệ thuật.
- **Mức độ chân thực:** Đảm bảo sản phẩm chính là lõi của bối cảnh, sắc nét tối đa từ chi tiết cơ học đến nhãn dán, không bị lu mờ bởi đạo cụ xung quanh. Yêu cầu **tuyệt đối chính xác về tỷ lệ, màu sắc, chất liệu của sản phẩm gốc và logo thương hiệu**.
- **Màu sắc chủ đạo & Phông nền:** Bối cảnh luôn luôn sử dụng **phông nền giấy liền mạch (seamless paper background)**. Màu sắc của phông nền giấy và không gian tổng thể phải **luôn luôn theo tone màu của sản phẩm** (tone-sur-tone) hoặc là tone màu hài hòa, tôn vinh sản phẩm chính.
- **Tỷ lệ hợp lý:** Đảm bảo chính xác tỷ lệ tương quan giữa sản phẩm và các đạo cụ xung quanh để tránh trường hợp người xem thấy tỷ lệ vô lý (ví dụ: hạt cà phê quá khổ, lát trái cây to bằng cái nồi).

---

## 2. Phân Tích & Hệ Thống Ánh Sáng Đa Điểm Chuyên Sâu (Advanced Multi-Point Lighting)
Trong bất kỳ concept studio nào được sinh ra từ prompt, hệ thống ánh sáng cần được cấu hình dưới dạng đa điểm chuyên nghiệp để làm nổi bật khối và kết cấu vật liệu, tùy biến theo từng concept:

- **1 Main Light (Ánh Sáng Chính):** Nguồn sáng mạnh nhất, quyết định hướng bóng đổ chính và khối của sản phẩm, thường đặt chéo 45 độ. (Với concept "Tươi sáng", Main Light phủ tản sáng lớn; với concept "Dramatic/Dark", Main Light hẹp và gắt hơn).
- **1 Top Light (Ánh Sáng Đỉnh):** Đánh từ phía trên cao (overhead) xuống để làm nổi bật rõ nét diện mạo nắp, núm tay cầm, và miệng bình, giúp tạo chiều sâu theo phương thẳng đứng.
- **1 Fill Light (Ánh Sáng Phụ):** Dùng tản sáng mềm hoặt hắt sáng bên góc đối diện Main Light để làm dịu vùng bóng râm, đảm bảo lấy lại 100% chi tiết chất liệu trong vùng tối.
- **2 Rim Lights (Ánh Sáng Rìa/Ven):** Đặt tạt ngang từ phía sau lưng ở hai bên thân sản phẩm để khắc họa "hai dải viền sáng sắc nét" ôm theo sườn (cực kỳ quan trọng với khối trụ, ấm chảo kim loại), giúp tách biệt hoàn toàn khối sản phẩm ra khỏi phông giấy liền mạch.
- **Ánh Sáng Nền (Optional Backlight):** Đánh hắt nhẹ vào phông giấy phía sau ở chính tâm sản phẩm để tạo hiệu ứng Gradient tản sáng rực rỡ, giúp phông nền giấy không bị phẳng lì mà mang lại chiều sâu không gian (Halo effect).

---

## 3. Cấu Trúc Khối Bóng Đổ Đa Tầng (Multi-tier Shadow Structure)
Tuyệt đối loại bỏ bóng đổ phẳng lì hình tròn mờ bệt. Một bức ảnh studio đẳng cấp đòi hỏi 3 tầng bóng đổ rõ nét:
1. **Bóng Tiếp Xúc (Contact Occlusion Shadow):**
   - Nằm sát rạt chân đế hoặc bề mặt tiếp giáp của đáy nồi/bình với mặt giấy nền. Có tính chất đen đậm đặc, sắc cạnh.
2. **Bóng Đổ Chính (Key Shadow Gradient):**
   - Đổ tạt theo hướng đối xứng của Main Light, có độ mờ mịn lan tỏa xa dần (gradient falloff).
3. **Bóng Chi Tiết Nhô / Tay Cầm (Extrusion & Handle Shadow):**
   - Bóng từ tay cầm dài của chảo hoặc quai của ấm đun sụp bóng rõ nét, cong mềm mại nương theo thân sản phẩm, với biên đổ biên rìa được mài mịn (`feathered edges`).

---

## 4. Quy Luật Bố Trí Đạo Cụ Thương Mại (Studio Props Integration)
Khi người dùng chọn thêm các đạo cụ (thớt, lát chanh, lá bạc hà, đá viên, hạt cà phê, kệ đá), prompt của AI cần định vị tọa độ logic:
- **Đồng bộ tỷ lệ:** Đảm bảo tỷ lệ 1:1 siêu chính xác; không bao giờ được phóng to đạo cụ phụ làm lu mờ thiết bị trung tâm.
- **Góc đặt và xoay (Rotation & Form):**
  - Đặt nghiêng tự nhiên (`tilted layout`), hoặc dàn trải chuẩn mực (`flatlay`). Đạo cụ ở tiền cảnh (Foreground) có thể chịu hiệu ứng mờ ngoài tiêu cự (`blur out of focus`) để nhấn mạnh sản phẩm chính.
- **Đồng bộ hóa đổ bóng:** Toàn bộ đạo cụ và sản phẩm phải dùng chung một hướng nguồn sáng phân tích ở phần 2.

---

## 5. Những Điểm Cấm Kỵ Cần Tránh (Negative Guidelines)
- **Sai lệch sản phẩm gốc:** Cấm tuyệt đối việc làm biến dạng kích thước, làm sai đổi chất liệu gốc, hoặc bóp méo hình thái logo thương hiệu Elmich.
- **Nền lộn xộn:** Yêu cầu sử dụng nền giấy trơn (seamless paper roll), tuyệt đối không chèn các bối cảnh rác rưởi, mây trời hay ngoại cảnh vào bên trong chế độ Studio Sáng Tạo.
- **Bóng mâu thuẫn (Conflicting shadows):** Xuất hiện bóng đổ đổ mọi hướng vô lý làm phá vỡ logic hệ thống ánh sáng đa điểm ngặt nghèo.
- **Unrealistic gloss:** Ánh sáng phản chiếu lung tung lấp kín vật liệu làm che khuất các chi tiết tinh xảo hay kết cấu sơn thật của sản phẩm.
- **No "Beauty-shot distortion" (Biến dạng hình học):** Không làm biến dạng hình dáng vật lý của sản phẩm (ví dụ: nồi không bị méo hình dáng nguyên bản, quai cầm không bị dính liền vào thân).
- **No "Blurry Edges" (Khuyết biên mờ nhòe):** Không được để các cạnh sắc nét của sản phẩm (hard edges) bị mờ (trừ khi cố tình tạo độ sâu trường ảnh - depth of field ở vùng background xa out-of-focus).
- **No "Generic Noise" (Nhiễu hạt kỹ thuật số):** Loại bỏ triệt để các hạt nhiễu kỹ thuật số (digital grain/artifacts) không cần thiết làm suy giảm độ mịn màng, cao cấp của bề mặt sản phẩm.
