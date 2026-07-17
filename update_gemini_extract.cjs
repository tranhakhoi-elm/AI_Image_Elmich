const fs = require('fs');
let content = fs.readFileSync('services/geminiService.ts', 'utf8');

const newFunc = `
export const extractStandardParamsWithAI = async (textData: string): Promise<{key: string, value: string}[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const prompt = \`Bạn là chuyên gia phân tích dữ liệu sản phẩm. Hãy trích xuất các thông số kỹ thuật quan trọng từ văn bản thô (thường được copy từ file Excel) dưới đây.
Văn bản thô:
\${textData}

Hãy trích xuất và trả về MỘT mảng JSON các thông số quan trọng (như Tên sản phẩm, Model, Mã sản phẩm, Công suất, Điện áp, Tần số, Kích thước, Trọng lượng, Định lượng, Dung tích, Chất liệu, Xuất xứ, Năm sản xuất, Đơn vị sản xuất, Địa chỉ, Mã vạch EAN13, Mã vạch code 128, Mã QR...).
Nếu Mã QR không có sẵn, hãy tự tạo ra từ Mã sản phẩm theo định dạng: www.elmich.vn/san-pham/<mã sản phẩm> (viết thường).
Định dạng JSON:
{
  "params": [
    { "key": "Tên thông số", "value": "Giá trị" }
  ]
}
\`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            params: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  key: { type: "STRING" },
                  value: { type: "STRING" }
                },
                required: ["key", "value"]
              }
            }
          }
        }
      }
    });
    const res = JSON.parse(response.text || '{"params": []}');
    return res.params || [];
  } catch (error) {
    console.error("Lỗi trích xuất thông số:", error);
    return [];
  }
};
\`;

if (!content.includes('extractStandardParamsWithAI')) {
    content = content + "\\n" + newFunc;
    fs.writeFileSync('services/geminiService.ts', content);
    console.log("Added extractStandardParamsWithAI");
} else {
    console.log("Already exists");
}
