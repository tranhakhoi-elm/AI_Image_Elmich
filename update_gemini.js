const fs = require('fs');
let content = fs.readFileSync('services/geminiService.ts', 'utf8');

// Replace analyzePackagingContent
const newAnalyzePackagingContent = `export const analyzePackagingContent = async (
  designFiles: {name: string, data: string}[],
  standardParams: {key: string, value: string}[]
): Promise<{params: any[]}> => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const prompt = \`Bạn là chuyên gia kiểm duyệt nội dung bao bì (QA/QC).
Bạn được cung cấp các tài liệu thiết kế (bao gồm hộp màu, tem phụ, tem thông số kỹ thuật, thùng carton...).

Hãy so sánh nội dung văn bản có trên CÁC thiết kế (được cung cấp qua file đính kèm) với BẢNG THÔNG SỐ CHUẨN sau đây:

BẢNG THÔNG SỐ CHUẨN:
\${JSON.stringify(standardParams, null, 2)}

NHIỆM VỤ CỦA BẠN:
1. Đọc tất cả các chữ (văn bản) trên CÁC tài liệu thiết kế. Chú ý đọc thông tin trong phần thông tin chung và phần thông tin chi tiết sản phẩm của file chuẩn.
2. Đối chiếu từng thông số trong BẢNG THÔNG SỐ CHUẨN với nội dung bạn đọc được trên thiết kế.
3. Nếu nội dung khớp hoàn toàn (cả về ý nghĩa và thông tin cốt lõi) ở BẤT KỲ tài liệu nào, hãy đánh dấu match = true. Nếu có sai lệch, thiếu sót hoặc không khớp ở TẤT CẢ các tài liệu, đánh dấu match = false và ghi chú rõ lỗi sai hoặc thông tin thực tế trên thiết kế vào 'notes' và 'actual'. 'actual' là nội dung bạn đọc được trên thiết kế ứng với thông số đó.

Trả về một mảng JSON với cấu trúc cho MỖI thông số chuẩn:
{
  "key": "Tên thông số",
  "expected": "Giá trị chuẩn",
  "actual": "Giá trị thực tế đọc được trên thiết kế (hoặc rỗng nếu không tìm thấy)",
  "match": true/false,
  "notes": "Ghi chú nếu có sai sót, ví dụ: 'Thiếu thông tin', 'Sai chính tả', 'Không khớp'..."
}
Trả về ĐÚNG định dạng JSON sau:
{
  "params": [
    { "key": "...", "expected": "...", "actual": "...", "match": true, "notes": "" }
  ]
}
\`;

    const parts: any[] = [
      { text: prompt },
    ];
    
    designFiles.forEach(file => {
      const match = file.data.match(/^data:((?:image|application)\/[a-zA-Z0-9.-]+);base64,(.+)$/);
      if (match) {
        parts.push({ inlineData: { mimeType: match[1], data: match[2] } });
      }
    });

    if (parts.length === 1) throw new Error("Invalid files");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: parts
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            params: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  key: { type: Type.STRING },
                  expected: { type: Type.STRING },
                  actual: { type: Type.STRING },
                  match: { type: Type.BOOLEAN },
                  notes: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    trackGeminiUsage(response, "Kiểm tra bao bì");
    return JSON.parse(response.text || '{"params": []}');
  } catch (error) {
    console.error("Lỗi kiểm tra bao bì:", error);
    return { params: [] };
  }
};`;

content = content.replace(/export const analyzePackagingContent = async \([\s\S]*?\n\};\n?/m, newAnalyzePackagingContent + "\n");
fs.writeFileSync('services/geminiService.ts', content);
