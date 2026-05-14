const fs = require('fs');

// Update services/geminiService.ts
let serviceCode = fs.readFileSync('services/geminiService.ts', 'utf8');

serviceCode = serviceCode.replace(
  /export const suggestPropsForConcept = async \(productName: string, concept: string\): Promise<\{props: string\[\], placement: string\}> => \{/,
  `export const suggestPropsForConcept = async (productName: string, concept: string, mode: 'STUDIO' | 'LIFESTYLE' = 'LIFESTYLE'): Promise<{props: string[], placement: string}> => {`
);

serviceCode = serviceCode.replace(
  /contents: `Sản phẩm: \$\{productName\}\. Concept hoặc bối cảnh: "\$\{concept\}"\.[\s\S]*?Trả về JSON với 'placement' \(string\) và 'props' \(array of strings\)\.`,/,
  `contents: \`Sản phẩm: \${productName}. Concept hoặc bối cảnh: "\${concept}".
YÊU CẦU:
1. Suy luận sâu và đề xuất Vị trí và tỷ lệ sản phẩm trong khung hình (cách đặt sản phẩm, tương tác với ánh sáng).
2. Liệt kê 10 đạo cụ (props) trang trí ĐỘC ĐÁO, CÓ TÍNH NGHỆ THUẬT VÀ LIÊN QUAN MẬT THIẾT đến \${productName}.
\${mode === 'STUDIO' 
  ? 'LƯU Ý CHO ẢNH STUDIO: Chụp trên phông nền giấy trơn. Đạo cụ phải TỐI GIẢN, TẬP TRUNG VÀO CHI TIẾT (VD: khối hình học mica mờ, bục đá marble cẩm thạch nguyên khối cắt xéo, nhành bạch đàn khô, vụn lá trà đen, hiệu ứng bóng đổ sắc nét từ rèm cửa, viên đá lạnh phay xước, tia nước bắn lên tĩnh vật...). TRÁNH TẠO RA CẢ MỘT CĂN PHÒNG, bàn ghế hay cây cối cồng kềnh.' 
  : 'LƯU Ý CHO ẢNH PHỐI CẢNH (LIFESTYLE): Tạo bầu không khí chân thực sống động. Tránh dùng hoa lá đá chung chung. Hãy dùng các đạo cụ cụ thể: Bóng cây đổ qua ô cửa kính lúc 4h chiều sọc ngang, khói bốc lên từ tách espresso, ánh sáng khúc xạ qua khối lăng kính, giọt sương đọng trên thớt gỗ sồi, các nguyên liệu phụ tùng đang dùng dở (vụn bánh mì, hạt muối ngầm Himalaya...).'
}
Trả về JSON với 'placement' (string) và 'props' (array of strings).\`,`
);

fs.writeFileSync('services/geminiService.ts', serviceCode);


// Update App.tsx
let appCode = fs.readFileSync('App.tsx', 'utf8');

// For lifestyle - assume it's the first match in handlePropSuggestion
appCode = appCode.replace(
  /const handlePropSuggestion = async \(\) => \{[\s\S]*?const result = await suggestPropsForConcept\(settings\.productName, finalConcept\);/,
  match => match.replace(
    /const result = await suggestPropsForConcept\(settings\.productName, finalConcept\);/,
    `const result = await suggestPropsForConcept(settings.productName, finalConcept, 'LIFESTYLE');`
  )
);

// For studio - assume it's the first match in handleStudioPropSuggestion
appCode = appCode.replace(
  /const handleStudioPropSuggestion = async \(\) => \{[\s\S]*?const result = await suggestPropsForConcept\(settings\.productName, finalConcept\);/,
  match => match.replace(
    /const result = await suggestPropsForConcept\(settings\.productName, finalConcept\);/,
    `const result = await suggestPropsForConcept(settings.productName, finalConcept, 'STUDIO');`
  )
);

fs.writeFileSync('App.tsx', appCode);
console.log('Fixed props logic.');
