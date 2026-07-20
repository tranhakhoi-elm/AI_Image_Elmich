const fs = require('fs');
let content = fs.readFileSync('services/geminiService.ts', 'utf8');

const regex = /const prompt = \`Bạn là chuyên gia phân tích dữ liệu sản phẩm[\s\S]*?Định dạng JSON:\\n\{\\n  "params": \[\\n    \{ "key": "Tên thông số", "value": "Giá trị" \}\\n  \]\\n\}\\n\`;/;

const newPrompt = `const prompt = \`Bạn là chuyên gia phân tích dữ liệu sản phẩm. Hãy trích xuất các thông số kỹ thuật quan trọng từ văn bản thô (thường được copy từ file Excel) dưới đây.
Văn bản thô:
\${textData}

Hãy trích xuất và trả về MỘT mảng JSON các thông số sau ĐÚNG VỚI DANH SÁCH BÊN DƯỚI (chỉ bao gồm 14 thông số này):
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
11: Các thông tin kỹ thuật khác nếu có
12: Mã QR
13: Barcode 128
14: Barcode EAN13

LƯU Ý: 
- Nếu có thông tin kỹ thuật khác ngoài các mục 1-10 và 12-14, hãy gom chung vào mục "Các thông tin kỹ thuật khác nếu có".
- Nếu Mã QR không có sẵn, hãy tự tạo ra từ Mã sản phẩm theo định dạng: www.elmich.vn/san-pham/<mã sản phẩm viết thường>.
- Trả về danh sách đầy đủ 14 thông số trên, nếu thông số nào không có dữ liệu hãy để giá trị là "".

Định dạng JSON:
{
  "params": [
    { "key": "Tên thông số", "value": "Giá trị" }
  ]
}
\`;`;

content = content.replace(regex, newPrompt);
fs.writeFileSync('services/geminiService.ts', content);
