const fs = require('fs');

let code = fs.readFileSync('services/geminiService.ts', 'utf8');

const oldPrompt = `      contents: \`Sản phẩm: \${productName}. Concept hoặc bối cảnh: "\${concept}".
YÊU CẦU:
1. Suy luận sâu và đề xuất Vị trí và tỷ lệ sản phẩm trong khung hình (cách đặt sản phẩm, tương tác với ánh sáng).
2. Liệt kê 10 đạo cụ (props) trang trí ĐỘC ĐÁO, CÓ TÍNH NGHỆ THUẬT VÀ LIÊN QUAN MẬT THIẾT đến \${productName}.
\${mode === 'STUDIO' 
  ? 'LƯU Ý CHO ẢNH STUDIO: Chụp trên phông nền giấy trơn. Đạo cụ phải TỐI GIẢN, TẬP TRUNG VÀO CHI TIẾT (VD: khối hình học mica mờ, bục đá marble cẩm thạch nguyên khối cắt xéo, nhành bạch đàn khô, vụn lá trà đen, hiệu ứng bóng đổ sắc nét từ rèm cửa, viên đá lạnh phay xước, tia nước bắn lên tĩnh vật...). TRÁNH TẠO RA CẢ MỘT CĂN PHÒNG, bàn ghế hay cây cối cồng kềnh.' 
  : 'LƯU Ý CHO ẢNH PHỐI CẢNH (LIFESTYLE): Tạo bầu không khí chân thực sống động. Tránh dùng hoa lá đá chung chung. Hãy dùng các đạo cụ cụ thể: Bóng cây đổ qua ô cửa kính lúc 4h chiều sọc ngang, khói bốc lên từ tách espresso, ánh sáng khúc xạ qua khối lăng kính, giọt sương đọng trên thớt gỗ sồi, các nguyên liệu phụ tùng đang dùng dở (vụn bánh mì, hạt muối ngầm Himalaya...).'
}
Trả về JSON với 'placement' (string) và 'props' (array of strings).\`,`;

const newPrompt = `      contents: \`Sản phẩm đang chụp: \${productName}. 
Concept/Bối cảnh mong muốn: "\${concept}".

HÃY PHÂN TÍCH SẢN PHẨM TRÊN VÀ ĐƯA RA ĐỀ XUẤT:
1. Suy luận sâu và đề xuất cách đặt vị trí, tỷ lệ sản phẩm phù hợp nhất trong khung hình (cách đặt sản phẩm, tương tác ánh sáng, góc chụp).
2. Suy nghĩ về công dụng, chất liệu, màu sắc và bối cảnh sử dụng của sản phẩm "\${productName}". Sau đó, liệt kê 10 đạo cụ (props) trang trí ĐỘC ĐÁO, SÁNG TẠO VÀ PHẢI LIÊN QUAN MẬT THIẾT đến bản chất của "\${productName}" và concept "\${concept}". 
TUYỆT ĐỐI KHÔNG sao chép hay lặp lại các đạo cụ mẫu chung chung nếu nó không liên quan logic đến sản phẩm này. Hãy đưa ra các đạo cụ cụ thể, miêu tả rõ chất liệu, hình dáng và lý do nó hợp với sản phẩm.

\${mode === 'STUDIO' 
  ? 'LƯU Ý QUAN TRỌNG CHO STUDIO: Đạo cụ phải TỐI GIẢN, tinh tế, tôn lên sản phẩm chính, không làm lấn át. Tránh đạo cụ khổng lồ. Chỉ dùng các vật phẩm nhỏ, bề mặt đỡ (bục đá, khối mica, mặt nước, vân gỗ...), bóng đổ nghệ thuật, hoặc các nguyên liệu/thành phần bề mặt tạo nên sản phẩm đó. Mọi thứ đặt trên phông nền trơn.' 
  : 'LƯU Ý CHO LIFESTYLE: Tạo bầu không khí chân thực sống động gắn liền với môi trường sử dụng thực tế của "\${productName}". Hãy dùng các đạo cụ có tính tương tác: bóng râm hắt qua cửa sổ, khói bốc lên, giọt nước đọng, các phụ kiện đi kèm đang được sử dụng dở dang...'
}
Trả về JSON với 'placement' (string) và 'props' (array of strings).\`,`;

if (code.includes(oldPrompt)) {
  code = code.replace(oldPrompt, newPrompt);
  fs.writeFileSync('services/geminiService.ts', code);
  console.log("Updated suggestPropsForConcept prompt");
} else {
  console.log("Could not find the target string.");
}
