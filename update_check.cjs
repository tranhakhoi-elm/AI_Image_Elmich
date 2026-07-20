const fs = require('fs');
let content = fs.readFileSync('services/geminiService.ts', 'utf8');

const regex = /LƯU Ý QUAN TRỌNG VÀ BẮT BUỘC:\\n- Nếu Tên thông số là 'Mã vạch EAN13'/;
const newStr = `LƯU Ý QUAN TRỌNG VÀ BẮT BUỘC:
- KIỂM TRA ĐỒNG NHẤT: Nếu một thông số xuất hiện ở nhiều nơi trên cùng một file thiết kế (ví dụ tên sản phẩm, công suất...), bạn PHẢI kiểm tra tất cả các vị trí đó. Chúng đều phải trùng khớp với nhau và trùng với tiêu chuẩn. Nếu có bất kỳ sự không đồng nhất nào (ví dụ: mặt trước ghi 500W, mặt sau ghi 600W), hãy tính là MATCH = false và ghi rõ cảnh báo trong phần 'notes'.
- Nếu Tên thông số là 'Mã vạch EAN13'`;

content = content.replace(regex, newStr);
fs.writeFileSync('services/geminiService.ts', content);
