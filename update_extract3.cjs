const fs = require('fs');
let content = fs.readFileSync('services/geminiService.ts', 'utf8');

const regex = /Hãy trích xuất và trả về MỘT mảng JSON các thông số sau ĐÚNG VỚI DANH SÁCH BÊN DƯỚI \(chỉ bao gồm 16 thông số này\):[\s\S]*?LƯU Ý: \n- Nếu Mã QR không có sẵn, hãy tự tạo ra từ Mã sản phẩm theo định dạng: www\.elmich\.vn\/san-pham\/<mã sản phẩm viết thường>\.\n- Trả về danh sách đầy đủ 16 thông số trên, nếu thông số nào không có dữ liệu hãy để giá trị là ""\./;

const newPrompt = `Hãy trích xuất và trả về MỘT mảng JSON các thông số sau ĐÚNG VỚI DANH SÁCH BÊN DƯỚI (chỉ bao gồm 15 thông số này):
1: Tên sản phẩm
2: Model
3: Mã sản phẩm
4: Dung tích
5: Công suất
6: Điện áp
7: Tần số
8: Khối lượng
9: Định lượng / hộp màu
10: Định lượng / thùng carton
11: Số Serial
12: Nhà sản xuất
13: Địa chỉ nhà sản xuất
14: Mã QR
15: Barcode 128
16: Barcode EAN13

(Bỏ qua thông số Các thông tin kỹ thuật khác nếu có)

LƯU Ý: 
- Nếu Mã QR không có sẵn, hãy tự tạo ra từ Mã sản phẩm theo định dạng: www.elmich.vn/san-pham/<mã sản phẩm viết thường>.
- Trả về danh sách đầy đủ 15 thông số trên, nếu thông số nào không có dữ liệu hãy để giá trị là "".`;

const finalPrompt = `Hãy trích xuất và trả về MỘT mảng JSON các thông số sau ĐÚNG VỚI DANH SÁCH BÊN DƯỚI (chỉ bao gồm 15 thông số này):
1: Tên sản phẩm
2: Model
3: Mã sản phẩm
4: Dung tích
5: Công suất
6: Điện áp
7: Tần số
8: Khối lượng
9: Định lượng / hộp màu
10: Định lượng / thùng carton
11: Số Serial
12: Nhà sản xuất
13: Địa chỉ nhà sản xuất
14: Mã QR
15: Barcode 128
16: Barcode EAN13

LƯU Ý: 
- Nếu Mã QR không có sẵn, hãy tự tạo ra từ Mã sản phẩm theo định dạng: www.elmich.vn/san-pham/<mã sản phẩm viết thường>.
- Trả về danh sách đầy đủ 15 thông số trên (từ 1 đến 15, lưu ý mã QR, Barcode 128, Barcode EAN13 là 13, 14, 15), nếu thông số nào không có dữ liệu hãy để giá trị là "".`;

const reallyFinalPrompt = `Hãy trích xuất và trả về MỘT mảng JSON các thông số sau ĐÚNG VỚI DANH SÁCH BÊN DƯỚI (chỉ bao gồm 15 thông số này):
1: Tên sản phẩm
2: Model
3: Mã sản phẩm
4: Dung tích
5: Công suất
6: Điện áp
7: Tần số
8: Khối lượng
9: Định lượng / hộp màu
10: Định lượng / thùng carton
11: Số Serial
12: Nhà sản xuất
13: Địa chỉ nhà sản xuất
14: Mã QR
15: Barcode 128
16: Barcode EAN13

(Xin lỗi, danh sách trên có 16 mục, hãy bỏ qua các thông số kỹ thuật khác). Hãy lấy chính xác 15 thông số:
1: Tên sản phẩm
2: Model
3: Mã sản phẩm
4: Dung tích
5: Công suất
6: Điện áp
7: Tần số
8: Khối lượng
9: Định lượng / hộp màu
10: Định lượng / thùng carton
11: Số Serial
12: Nhà sản xuất
13: Địa chỉ nhà sản xuất
14: Mã QR
15: Barcode EAN13
16: Barcode 128`;

const fixedPrompt = `Hãy trích xuất và trả về MỘT mảng JSON các thông số sau ĐÚNG VỚI DANH SÁCH BÊN DƯỚI (chỉ bao gồm 15 thông số này):
1: Tên sản phẩm
2: Model
3: Mã sản phẩm
4: Dung tích
5: Công suất
6: Điện áp
7: Tần số
8: Khối lượng
9: Định lượng / hộp màu
10: Định lượng / thùng carton
11: Số Serial
12: Nhà sản xuất
13: Địa chỉ nhà sản xuất
14: Mã QR
15: Barcode EAN13

LƯU Ý: 
- Nếu Mã QR không có sẵn, hãy tự tạo ra từ Mã sản phẩm theo định dạng: www.elmich.vn/san-pham/<mã sản phẩm viết thường>.
- Trả về danh sách đầy đủ 15 thông số trên, nếu thông số nào không có dữ liệu hãy để giá trị là "".`;

content = content.replace(regex, fixedPrompt);
fs.writeFileSync('services/geminiService.ts', content);
