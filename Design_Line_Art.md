# Quy chuẩn Vẽ Nét Kỹ Thuật (Line Art Style Guide)

Tài liệu này quy định chi tiết các thông số kỹ thuật, cấp độ phân mảnh nét vẽ và luật hiển thị tối giản dành riêng cho chế độ **Vẽ Nét Kỹ Thuật (Line Art Mode)** trên hệ thống AI Elmich.

---

## 1. Triết Lý Thiết Kế Vẽ Nét Kỹ Thuật
Chế độ Vẽ Nét Kỹ Thuật biến đổi sản phẩm màu thực thành các bản vẽ thiết kế vector phẳng, thanh mảnh, chính xác, phục vụ trực tiếp cho việc in ấn hướng dẫn sử dụng (User Manual), đăng ký bản quyền sáng chế (Patent drawings) hoặc đưa vào danh mục catalog sấy khô:
- **Độ sạch của bối cảnh:** Nền trắng phau tuyệt đối (`#FFFFFF`), không đổ bóng xám (no shadows), không có vân kết cấu nền gỗ hay đá, không có bất kỳ sắc xi-măng hay bối cảnh đời thực nào bám tụ xung quanh.
- **Tính chuẩn xác hình khối:** Giữ nguyên từng đường cong mượt mà, quai xách kéo dài, núm bếp bo gọn, các nấc chỉ số nhỏ li ti của núm cơ vặn đúng nguyên mẫu 1:1.

---

## 2. Quy Chuẩn Độ Dày Nét Vẽ & Thứ Bậc (Line Weight Hierarchy)
- **Đường Viền Chính (Primary Outer Contour):**
  - Viền chu vi bao quanh sản phẩm có nét vẽ dày nhất (Dày khoảng `1.5pt`), sắc sảo, liên tục, không có hiện tượng nứt đứt nét hay nét răng cưa rời rạc.
- **Đường Cạnh Cơ Học & Khớp Nối (Secondary Structural Lines):**
  - Các đường ráp nối thân chảo, nắp đậy, khe khấp nối có độ dày trung bình (`1.0pt`), phân tách sạch sẽ từng bộ phận rạch ròi.
- **Vân Họa Tiết, Nấc Chỉ Số & Chữ Thương Hiệu (Tertiary Details):**
  - Chữ "Elmich" dán nổi, chỉ số nhiệt độ, vạch chia nước trong suốt có nét siêu mảnh (`0.5pt`), nét đơn rành mạch, có chiều sâu cơ học vững chãi.

---

## 3. Chế Ngự Bóng & Tông Sắc Đen Trắng (No Shading Rules)
- **Bài trừ hoàn toàn phối cảnh xám râm (Flat Monochrome Aesthetic):**
  - Đất vẽ chỉ sử dụng đúng 2 màu: Thân nét đen tuyền tinh khiết (`#000000`) rọi chiếu trên nền trắng `#FFFFFF`.
  - Không có các mảng tô màu tô gradient chuyển sắc, không có phủ sọc nở khối (halftone/cross-hatching) hay bôi vẽ bóng đổ âm bản, trừ phi cực kỳ cần thiết để chỉ rõ độ sâu rỗng bên trong lòng thiết bị sâu thẳm.

---

## 4. Những Điểm Cấm Kỵ Cần Tránh (Negative Guidelines)
- **Nét vẽ nghệ thuật phóng khoáng (Sketchy/Hand-drawn slop):** Các nét ngoáy bút chì không đứt điểm đầu cuối, nét gấp xoắn lộn lộn như tranh vẽ tay phác thảo mỹ thuật tự do.
- **Nhếch nhác khối (Dirty gradient/shading):** Xuất hiện dường dơ xám đục do chuyển đổi quang phổ từ ảnh màu sang không sạch, mặt chảo bị ố xám xịt nhếch nhác.
- **Mù mịt chi tiết (Line overlap clutter):** Quá nhiều đường vẽ gạch sọc lộn dồn tọat vào nhau tại các khu vực nút ấm cơ hay tay cầm làm hỏng đi biên hình khối gọn gàng, thoáng đãng.
