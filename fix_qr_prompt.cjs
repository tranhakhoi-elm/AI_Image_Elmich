const fs = require('fs');
let content = fs.readFileSync('services/geminiService.ts', 'utf8');

const regex = /Đối với 'Mã QR' \(QR Code\):.*?Tuyệt đối không truy cập link thực tế\./s;

const newQR = `Đối với 'Mã QR' (QR Code): Nếu trong BẢNG THÔNG SỐ CHUẨN có yêu cầu kiểm tra Mã QR, bạn PHẢI TỰ QUÉT MÃ QR CÓ TRONG HÌNH ẢNH thiết kế để đọc nội dung mã hóa bên trong nó (tuyệt đối không chỉ đọc dòng chữ in bên cạnh/bên dưới mã). Lấy nội dung giải mã gốc (raw text/URL) để điền vào 'actual' CHÍNH XÁC NHƯ NHỮNG GÌ BẠN QUÉT ĐƯỢC (bao gồm cả http://, https:// nếu có). Khi so sánh với giá trị chuẩn, nếu kết quả quét raw từ ảnh CHỨA giá trị chuẩn (có thể thừa 'http://', 'https://' ở đầu hoặc '/' ở cuối), thì coi như MATCH = true (ví dụ: raw là 'https://www.elmich.vn/san-pham/4021617/' khớp với chuẩn 'www.elmich.vn/san-pham/4021617'). TUYỆT ĐỐI KHÔNG tự ý suy diễn hay truy cập link thực tế.`;

content = content.replace(regex, newQR);
fs.writeFileSync('services/geminiService.ts', content);
