const fs = require('fs');
let content = fs.readFileSync('services/geminiService.ts', 'utf8');

const regex = /Hãy trích xuất và trả về MỘT mảng JSON các thông số sau ĐÚNG VỚI DANH SÁCH BÊN DƯỚI \(chỉ bao gồm 14 thông số này\):[\s\S]*?LƯU Ý: \n- Nếu có thông tin kỹ thuật khác ngoài các mục 1-10 và 12-14, hãy gom chung vào mục "Các thông tin kỹ thuật khác nếu có"\.\n- Nếu Mã QR không có sẵn, hãy tự tạo ra từ Mã sản phẩm theo định dạng: www\.elmich\.vn\/san-pham\/<mã sản phẩm viết thường>\.\n- Trả về danh sách đầy đủ 14 thông số trên, nếu thông số nào không có dữ liệu hãy để giá trị là ""\./;

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
12: Các thông tin kỹ thuật khác nếu có
13: Mã QR
14: Barcode 128
15: Barcode EAN13

LƯU Ý: 
- Nếu có thông tin kỹ thuật khác ngoài các mục trên, hãy gom chung vào mục "Các thông tin kỹ thuật khác nếu có".
- Nếu Mã QR không có sẵn, hãy tự tạo ra từ Mã sản phẩm theo định dạng: www.elmich.vn/san-pham/<mã sản phẩm viết thường>.
- Trả về danh sách đầy đủ 15 thông số trên, nếu thông số nào không có dữ liệu hãy để giá trị là "".`;

content = content.replace(regex, newPrompt);
fs.writeFileSync('services/geminiService.ts', content);
