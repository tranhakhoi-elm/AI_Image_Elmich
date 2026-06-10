# Quy chuẩn Thiết Kế Mockup Bao Bì (Packaging Mockup Style Guide)

Tài liệu này quy định chi tiết các đặc tả kỹ thuật ghép phủ hình ảnh phẳng lên khối hộp 3D, xử lý nếp dán giấy, nếp gấp cơ học và bóng rìa hộp dành riêng cho tác vụ **Thiết Kế Mockup Bao Bì (Packaging Mockup)** trên hệ thống AI Elmich.

---

## 1. Triết Lý Tạo Thể 3D Tự Nhiên (Precision Wrapping Philosophy)
Mục tiêu cốt lõi của Mockup bao bì là biến đổi các bản thiết kế 2D phẳng (flat layout) của hộp vỏ sản phẩm thành một hộp quà tặng hoặc hộp carton 3D thực tế, chắc chắn và chuẩn định hình thương mại:
- **Tương tác ghép ảnh:** Toàn bộ mặt chữ viết thông số kỹ thuật, tem phụ, chứng chỉ, barcode và hình vẽ minh họa sản phẩm từ ảnh 2D gốc phải được uốn cong xiên theo luật thấu kính và ánh sáng góc để áp chặt lên các mặt phẳng của khối hộp 3D.
- **Không chữ rác (No gibberish text):** AI phải bảo toàn vẹn nguyên mọi chữ cái, nét font nguyên bản. Tuyệt đối không biến đổi chữ tiếng Việt thiết kế gốc thành chữ tượng hình kỳ dị.

---

## 2. Giao Thức Gấp Nếp & Tạo Đường Khớp 3D (Seam & Flap Mechanics)
Để tránh khối hộp trông giống như một khối đa diện dựng sọc vi tính thiếu tự nhiên:
- **Mơ tả thớ mép và nếp gấp (Folded Crease Highlights):**
  - *Nguyên lý:* Các mép cạnh gập của hộp giấy cứng luôn có độ dày mỏng của tệp giấy (khoảng `1-1.5mm`). Điểm nhô ra của mép giấy này sẽ bẫy một vệt phản chiếu ánh sáng trắng xước rất mỏng (rim crease highlight) giúp định dáng khối vững vàng.
  - *Prompt:* `"Model natural paper crease lines with a tiny paper edge thickness of approximately 1mm. Edges must capture soft, realistic studio highlight reflections."`
- **Mép dán và Khóa tai gập (Mechanical Flaps):**
  - Các điểm hở nhỏ ở nắp gập hay đường keo dán chồng bìa carton mặt sau phải xuất hiện bóng tự nhiên (slight shadow seam gap), khẳng định đây là một chiếc hộp xếp đời thực chứ không phải khối phẳng đơn lẻ.

---

## 3. Chất Liệu Toàn Diện Thùng Hộp (Advanced Box Texture)
- **Hộp Quà Màu (Premium Color Cardboard - Color Box):**
  - Vỏ bóng mịn (semi-gloss satin finish), phản chiếu dịu nhẹ ánh đèn softbox của phòng trưng bày.
  - Sắc độ màu in tươi, tệp thớ dệt từ giấy mịn không vỡ hạt mực.
- **Thùng Carton Thô (Kraft/Corrugated Cardboard):**
  - *Prompt:* `"Apply realistic brown kraft paper micro-fibers and corrugated cardboard core texturing to ensure organic material fidelity."`
  - *Ý nghĩa:* Tái lập xơ giấy sần, vân sọc gấp khúc nhẹ bên trong lõi thùng carton xám nâu mộc mạc chuyên dụng làm hàng vận chuyển.

---

## 4. Những Điểm Cấm Kỵ Cần Tránh (Negative Guidelines)
- **Bóp méo góc dẹt (Perspective warp mismatch):** Góc nghiêng của chữ in và đường biên hộp không đồng quy về cùng các điểm tụ (vanishing points) của phối cảnh căn phòng.
- **Góc cạnh cong uốn (Skewed corners):** Góc hộp bị bo góc tròn uốn éo như thạch, mất đi cạnh vuông vức, thẳng thớm của quy chuẩn gia mộc bao bì cứng.
- **Loang ướt chữ (Blurry branding):** Logo Elmich hay mẩu chữ nhỏ đằng sau hộp bị lem màu, mờ nhòe, không đọc được hoặc mất nét gạch nằm ngang.
- **Lồi lõm mặt phẳng hộp (Unstable planes):** Các mặt hộp không phẳng tuyệt đối mà lồi lõm gấp khúc kỳ lạ như có lực đè bẹp từ bên trong.
