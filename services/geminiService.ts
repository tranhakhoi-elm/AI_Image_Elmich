import { GoogleGenAI, Type } from "@google/genai";
import { GenerationSettings, AISuggestions, AIConceptAnalysis, CameraSettings, PropConfig, ConceptSuggestion } from "../types";
import { reportToLark, calculateGeminiCost, calculateImagenCost } from "./larkService";

const trackGeminiUsage = async (response: any, taskName: string) => {
  try {
    const usage = response?.usageMetadata;
    if (usage) {
      const { promptTokenCount = 0, candidatesTokenCount = 0 } = usage;
      const { tokens, costUSD } = calculateGeminiCost(promptTokenCount, candidatesTokenCount);
      const productCode = localStorage.getItem('elmich_ai_product_code') || 'N/A';
      const productName = localStorage.getItem('elmich_ai_product_name') || taskName || 'Nhiệm vụ AI';
      reportToLark(productCode, productName, tokens, costUSD);
    }
  } catch (error) {
    console.error("Failed to track Gemini usage:", error);
  }
};

const trackImagenUsage = async (modelName: string, numImages: number, taskName: string, imageSize?: string) => {
  try {
    const { costUSD } = calculateImagenCost(modelName, numImages, imageSize);
    const productCode = localStorage.getItem('elmich_ai_product_code') || 'N/A';
    const productName = localStorage.getItem('elmich_ai_product_name') || taskName || 'Tạo ảnh AI';
    reportToLark(productCode, productName, 0, costUSD);
  } catch (error) {
    console.error("Failed to track Imagen usage:", error);
  }
};


import designLifestyleConcept from '../Design_Lifestyle_Concept.md?raw';
import designStudioCreative from '../Design_Studio_Creative.md?raw';
import designLineArt from '../Design_Line_Art.md?raw';
import designColorEditing from '../Design_Color_Editing.md?raw';
import designPackagingMockup from '../Design_Packaging_Mockup.md?raw';
import designWhiteBGRetouch from '../Design_WhiteBG_Retouch.md?raw';
import designTechEffects from '../Design_Tech_Effects.md?raw';

const upscaleImageTo4K = (base64Data: string): Promise<string> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      resolve(base64Data);
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        // Scale factor of 2.0 upscales a 2K (2048x2048) image to 4K (4096x4096)
        const scaleFactor = 2;
        canvas.width = img.width * scaleFactor;
        canvas.height = img.height * scaleFactor;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const mimeType = base64Data.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';
          resolve(canvas.toDataURL(mimeType, 0.95));
        } else {
          resolve(base64Data);
        }
      } catch (err) {
        console.error("Failed to upscale image to 4K:", err);
        resolve(base64Data);
      }
    };
    img.onerror = () => {
      resolve(base64Data);
    };
    img.src = base64Data;
  });
};

// --- CÁC HÀM CHO CÁC MODE CŨ ---
export const getAiSuggestions = async (settings: { productName: string, visualStyle: string, techDescription?: string }): Promise<AISuggestions> => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  let styleContext = settings.visualStyle === "TECH_PS" ? `Phong cách "Ảnh USP Kỹ thuật".` : `Phong cách cơ bản.`;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Gợi ý cho: "${settings.productName}". ${styleContext}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            concepts: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  prompt: { type: Type.STRING }
                },
                required: ["title", "prompt"]
              } 
            },
            locations: { type: Type.ARRAY, items: { type: Type.STRING } },
            props: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["concepts", "locations", "props"]
        }
      }
    });
    trackGeminiUsage(response, settings.productName || "Gợi ý AI");
    const result = JSON.parse(response.text || "{}");
    return {
      concepts: result.concepts || [],
      locations: result.locations || [],
      props: result.props || []
    };
  } catch (e) { return { concepts: [], locations: [], props: [] }; }
};

// 1. Phân tích Concept (Lifestyle) - CẬP NHẬT ĐỂ NHẬN ẢNH THAM KHẢO
export const analyzeConceptAndCamera = async (productName: string, dimensions: string, images: string[], refImage: string | null): Promise<AIConceptAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const prompt = `
=== ĐỌC QUY CHUẨN TRƯỚC KHI THỰC HIỆN (BẮT BUỘC) ===
Dưới đây là tài liệu quy chuẩn phong cách và các lỗi cần tránh của phong cách này:
${designLifestyleConcept}
========================================

Bạn là một chuyên gia Prompt Engineer và Giám đốc sáng tạo nhiếp ảnh sản phẩm chuyên nghiệp của Elmich. 
Dựa vào quy chuẩn phong cách thiết kế phía trên, hãy đề xuất ý tưởng Lifestyle:
Sản phẩm: "${productName}". Kích thước: ${dimensions}.
${refImage ? "Tôi có gửi kèm một ảnh mẫu phong cách (Style Reference). Hãy dựa vào style của ảnh này để đề xuất." : ""}

YÊU CẦU ĐỀ XUẤT (TUÂN THỦ HOÀN TOÀN QUY CHUẨN TRÊN):
1. Đề xuất 5 Ý tưởng (Concept) phối cảnh chụp ảnh Lifestyle. Tên của concept (title) BẮT BUỘC phải là tiếng Việt. Bố cục decor phải luôn duy trì sự ngăn nắp, hiện đại, trẻ trung, gọn gàng, tránh bừa bộn quá mức đời thường.
2. MỖI CONCEPT PHẢI ĐƯỢC VIẾT DƯỚI DẠNG MỘT PROMPT CHI TIẾT, MẠCH LẠC, BẮT BUỘC XUỐNG DÒNG RÕ RÀNG THEO CÁC TIÊU CHÍ SAU (viết 100% bằng tiếng Việt, KHÔNG viết tên tiêu chí, chỉ ghi nội dung bắt đầu bằng gạch đầu dòng):
   - [Mô tả phong cách hiện đại, gọn gàng]
   - [Mô tả không gian bối cảnh, khoảng trống không gian âm]
   - [Mô tả cách đánh sáng tự nhiên chân thực]
   - [Mô tả cảm giác, màu sắc chủ đạo trẻ trung]
   (Lưu ý: Sử dụng ký tự xuống dòng \n giữa các tiêu chí để định dạng)
3. Đề xuất bộ thông số Camera (Góc chụp lệc nhẹ 1/3, tiêu cự 50mm hoặc 85mm, khẩu độ lớn) lý tưởng nhất dựa trên Quy Chuẩn Phối Cảnh Đời Sống.

Trả về JSON với mảng concepts (mỗi concept gồm 'title' ngắn gọn và 'prompt' chi tiết) và suggestedCamera.
`;

    const parts: any[] = [{ text: prompt }];
    images.forEach(img => parts.push({ inlineData: { data: img.split(',')[1], mimeType: 'image/png' } }));
    if (refImage) {
      parts.push({ inlineData: { data: refImage.split(',')[1], mimeType: 'image/png' } });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            concepts: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  prompt: { type: Type.STRING }
                },
                required: ["title", "prompt"]
              } 
            },
            suggestedCamera: {
              type: Type.OBJECT,
              properties: {
                angle: { type: Type.NUMBER },
                focalLength: { type: Type.NUMBER },
                aperture: { type: Type.STRING },
                iso: { type: Type.STRING },
                isMacro: { type: Type.BOOLEAN }
              },
              required: ["angle", "focalLength", "aperture", "iso", "isMacro"]
            }
          },
          required: ["concepts", "suggestedCamera"]
        }
      }
    });

    trackGeminiUsage(response, productName || "Phân tích Concept");
    return JSON.parse(response.text || "{}") as AIConceptAnalysis;
  } catch (error: any) {
    if (error.message?.includes("Requested entity was not found")) throw new Error("AUTH_ERROR");
    throw error;
  }
};

// 2. Phân tích Tech USP
export const analyzeTechConceptAndCamera = async (productName: string, techDesc: string, dimensions: string, images: string[]): Promise<AIConceptAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const prompt = `
=== ĐỌC QUY CHUẨN TRƯỚC KHI THỰC HIỆN (BẮT BUỘC) ===
Dưới đây là tài liệu quy chuẩn phong cách và đặc tả kỹ năng cho tác vụ này:
${designTechEffects}
========================================

Bạn là một chuyên gia Prompt Engineer và Giám đốc sáng tạo nhiếp ảnh sản phẩm chuyên nghiệp của Elmich.
Dựa TRÊN QUY CHUẨN TRÊN, hãy thực hiện phân tích kỹ thuật:
Phân tích kỹ thuật cho: "${productName}". Tính năng: "${techDesc}". Kích thước: ${dimensions}. 

Trả về JSON 5 concept (mỗi concept gồm 'title' bằng tiếng Việt và 'prompt') và camera.
YÊU CẦU CHO 'prompt': Viết 100% bằng tiếng Việt, mạch lạc, BẮT BUỘC XUỐNG DÒNG (dùng \\n), KHÔNG viết tên tiêu chí, chỉ ghi nội dung bắt đầu bằng gạch đầu dòng:
- [Mô tả phong cách hiệu năng công nghệ]
- [Mô tả không gian hiển thị, bối cảnh tối sang trọng]
- [Mô tả cách đánh sáng phát quang tinh tế]
- [Mô tả cảm giác, màu sắc của dải nhiệt/lạnh phù hợp]
- [Quy chuẩn chống lòe loẹt, chống lỗi bóng mờ]`;
    const parts: any[] = [{ text: prompt }];
    images.forEach(img => parts.push({ inlineData: { data: img.split(',')[1], mimeType: 'image/png' } }));

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            concepts: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  prompt: { type: Type.STRING }
                },
                required: ["title", "prompt"]
              } 
            },
            suggestedCamera: {
              type: Type.OBJECT,
              properties: {
                angle: { type: Type.NUMBER }, focalLength: { type: Type.NUMBER }, aperture: { type: Type.STRING }, iso: { type: Type.STRING }, isMacro: { type: Type.BOOLEAN }
              },
              required: ["angle", "focalLength", "aperture", "iso", "isMacro"]
            }
          },
          required: ["concepts", "suggestedCamera"]
        }
      }
    });
    trackGeminiUsage(response, productName || "Phân tích Tech/USP");
    const result = JSON.parse(response.text || "{}");
    return {
      concepts: result.concepts || [],
      suggestedCamera: result.suggestedCamera || { angle: 0, focalLength: 50, aperture: 'f/2.8', iso: '100', isMacro: false }
    };
  } catch (error: any) { throw error; }
};

// 3. Gợi ý Props cho Concept Lifestyle
export const suggestPropsForConcept = async (productName: string, concept: string, mode: 'STUDIO' | 'LIFESTYLE' = 'LIFESTYLE'): Promise<{props: string[], placement: string}> => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Sản phẩm: ${productName}. Concept hoặc bối cảnh: "${concept}".
YÊU CẦU:
1. Suy luận sâu và đề xuất Vị trí và tỷ lệ sản phẩm trong khung hình (cách đặt sản phẩm, tương tác với ánh sáng).
2. Liệt kê 10 đạo cụ (props) trang trí ĐỘC ĐÁO, CÓ TÍNH NGHỆ THUẬT VÀ LIÊN QUAN MẬT THIẾT đến ${productName}.
${mode === 'STUDIO' 
  ? 'LƯU Ý CHO ẢNH STUDIO: Chụp trên phông nền giấy trơn. Đạo cụ phải TỐI GIẢN, TẬP TRUNG VÀO CHI TIẾT (VD: khối hình học mica mờ, bục đá marble cẩm thạch nguyên khối cắt xéo, nhành bạch đàn khô, vụn lá trà đen, hiệu ứng bóng đổ sắc nét từ rèm cửa, viên đá lạnh phay xước, tia nước bắn lên tĩnh vật...). TRÁNH TẠO RA CẢ MỘT CĂN PHÒNG, bàn ghế hay cây cối cồng kềnh.' 
  : 'LƯU Ý CHO ẢNH PHỐI CẢNH (LIFESTYLE): Tạo bầu không khí chân thực sống động. Tránh dùng hoa lá đá chung chung. Hãy dùng các đạo cụ cụ thể: Bóng cây đổ qua ô cửa kính lúc 4h chiều sọc ngang, khói bốc lên từ tách espresso, ánh sáng khúc xạ qua khối lăng kính, giọt sương đọng trên thớt gỗ sồi, các nguyên liệu phụ tùng đang dùng dở (vụn bánh mì, hạt muối ngầm Himalaya...).'
}
Trả về JSON với 'placement' (string) và 'props' (array of strings).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: { 
            placement: { type: Type.STRING },
            props: { type: Type.ARRAY, items: { type: Type.STRING } } 
          }
        }
      }
    });
    trackGeminiUsage(response, productName || "Đạo cụ Concept");
    return JSON.parse(response.text || "{}");
  } catch (error) { return { props: [], placement: "" }; }
};

// 4. Gợi ý Visual Elements cho Tech USP
export const suggestTechVisuals = async (productName: string, concept: string): Promise<{props: string[], placement: string}> => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Sản phẩm: ${productName}. Tech Concept: "${concept}". 
      YÊU CẦU:
      1. Suy luận sâu và đề xuất Vị trí và tỷ lệ sản phẩm (cách đặt sản phẩm, tỷ lệ so với khung hình).
      2. Liệt kê 10 hiệu ứng đồ họa/visual elements đi kèm phù hợp nhất.
      Trả về JSON với 'placement' (string) và 'props' (array of strings).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: { 
            placement: { type: Type.STRING },
            props: { type: Type.ARRAY, items: { type: Type.STRING } } 
          }
        }
      }
    });
    trackGeminiUsage(response, productName || "Hiệu ứng Tech");
    const result = JSON.parse(response.text || "{}");
    return {
      props: result.props || [],
      placement: result.placement || ""
    };
  } catch (error) { return { props: [], placement: "" }; }
};

// 5. Gợi ý Tech Concepts cho Hiệu ứng mặt biển
export const suggestTechConcepts = async (productName: string, title: string): Promise<ConceptSuggestion[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
=== ĐỌC QUY CHUẨN TRƯỚC KHI THỰC HIỆN (BẮT BUỘC) ===
Dưới đây là tài liệu quy chuẩn phong cách và đặc tả kỹ năng cho tác vụ này:
${designTechEffects}
========================================

Sản phẩm: ${productName}, Tiêu đề: ${title}. Mô tả 3 ý tưởng hiển thị trên mặt nước biển đêm theo đúng Quy Chuẩn Hiệu ứng Công nghệ.
JSON array với 'title' (tiếng Việt) và 'prompt'.
YÊU CẦU CHO 'prompt': Viết 100% bằng tiếng Việt, mạch lạc, BẮT BUỘC XUỐNG DÒNG (dùng \\n), KHÔNG viết tên tiêu chí, chỉ ghi nội dung bắt đầu bằng gạch đầu dòng:
- [Mô tả phong cách và cấu trúc hiệu ứng của sóng nước đại dương rực rỡ]
- [Mô tả nền mặt biển ẩm mượt, tinh khôi]
- [Mô tả cách đánh sáng phát quang, ánh neon phản chiếu xanh lam/ngọc bích]
- [Mô tả cảm giác, màu sắc chủ đạo, chất lượng hoàn hảo]`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: { 
            concepts: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  prompt: { type: Type.STRING }
                },
                required: ["title", "prompt"]
              } 
            } 
          }
        }
      }
    });
    trackGeminiUsage(response, productName || "Gợi ý Tech");
    const result = JSON.parse(response.text || "{}");
    return result.concepts || [];
  } catch (error) { return []; }
};

// 6. Phân tích phối cảnh staging
export const analyzeStagingScene = async (concept: string, realSceneImg: string, refStyleImg: string): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const prompt = `Phân tích trang trí phối cảnh. Concept: "${concept}". Trả về JSON 10 vật phẩm trang trí thêm vào phòng.`;
    const parts: any[] = [
      { text: prompt },
      { inlineData: { data: realSceneImg.split(',')[1], mimeType: 'image/png' } },
      { inlineData: { data: refStyleImg.split(',')[1], mimeType: 'image/png' } }
    ];
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: { items: { type: Type.ARRAY, items: { type: Type.STRING } } }
        }
      }
    });
    trackGeminiUsage(response, "Phân tích Phối cảnh");
    const result = JSON.parse(response.text || "{}");
    return result.items || [];
  } catch (error) { return []; }
};

// 7. Phân tích Concept Studio (Mới)
export const analyzeStudioConcept = async (productName: string, dimensions: string, images: string[]): Promise<AIConceptAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const prompt = `
=== ĐỌC QUY CHUẨN TRƯỚC KHI THỰC HIỆN (BẮT BUỘC) ===
${designStudioCreative}
========================================

Bạn là một chuyên gia Prompt Engineer và Giám đốc sáng tạo nhiếp ảnh sản phẩm của Elmich.
Dựa vào quy chuẩn chụp studio sáng tạo phía trên, hãy thực hiện phân tích:
Sản phẩm: "${productName}". Kích thước: ${dimensions}.

YÊU CẦU ĐẶC BIỆT CHO STUDIO CONCEPT (TUÂN THỦ HOÀN TOÀN QUY CHUẨN TRÊN):
1. Đề xuất 5 Ý tưởng (Concept) chụp ảnh Studio phong phú (tối giản, hiện đại, ánh sáng kịch tính...). Tên của concept (title) BẮT BUỘC phải là tiếng Việt.
2. MỖI CONCEPT PHẢI ĐƯỢC VIẾT DƯỚI DẠNG MỘT PROMPT CHI TIẾT, MẠCH LẠC, BẮT BUỘC XUỐNG DÒNG RÕ RÀNG THEO CÁC TIÊU CHÍ SAU (viết 100% bằng tiếng Việt, KHÔNG viết tên tiêu chí, chỉ ghi nội dung bắt đầu bằng gạch đầu dòng):
   - [Mô tả phong cách studio cao cấp]
   - [Màu sắc, chất liệu nền giấy trơn cùng tone sản phẩm]
   - [Cách đánh sáng đa điểm chuyên nghiệp (1 main, 1 top, 1 fill, 2 rim lights)]
   - [Mô tả cấu trúc bóng đổ đa tầng và khoảng trống chèn chữ]
   (Lưu ý: Sử dụng ký tự xuống dòng \n giữa các tiêu chí để định dạng)
3. RÀNG BUỘC BẮT BUỘC:
   - Hình ảnh chụp trên nền giấy trơn 1 màu (Plain Paper Background).
   - Màu nền giấy BẮT BUỘC phải CÙNG MÀU với màu của sản phẩm (Tone-on-tone, matching the product color).
   - Sản phẩm và đạo cụ nằm gọn trong khung hình, chừa khoảng trống trên nền để chèn chữ (Text) theo đúng Quy chuẩn.
4. Đề xuất bộ thông số Camera (Góc chụp, tiêu cự, khẩu độ, ISO) lý tưởng nhất cho Studio dựa trên Quy chuẩn.

Trả về JSON với 5 concepts (mỗi concept gồm 'title' ngắn gọn và 'prompt' chi tiết) và suggestedCamera.
`;

    const parts: any[] = [{ text: prompt }];
    images.forEach(img => parts.push({ inlineData: { data: img.split(',')[1], mimeType: 'image/png' } }));

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            concepts: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  prompt: { type: Type.STRING }
                },
                required: ["title", "prompt"]
              } 
            },
            suggestedCamera: {
              type: Type.OBJECT,
              properties: {
                angle: { type: Type.NUMBER },
                focalLength: { type: Type.NUMBER },
                aperture: { type: Type.STRING },
                iso: { type: Type.STRING },
                isMacro: { type: Type.BOOLEAN }
              },
              required: ["angle", "focalLength", "aperture", "iso", "isMacro"]
            }
          },
          required: ["concepts", "suggestedCamera"]
        }
      }
    });

    trackGeminiUsage(response, productName || "Phân tích Studio");
    return JSON.parse(response.text || "{}") as AIConceptAnalysis;
  } catch (error: any) {
    if (error.message?.includes("Requested entity was not found")) throw new Error("AUTH_ERROR");
    throw error;
  }
};

export const editProductImage = async (base64Image: string, prompt: string, modelName: string = 'imagen-3.0-generate-002', imageSize: string = '1K'): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const mimeTypeMatch = base64Image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!mimeTypeMatch || mimeTypeMatch.length !== 3) {
    throw new Error("Invalid image format");
  }
  
  const mimeType = mimeTypeMatch[1];
  const data = mimeTypeMatch[2];

  const parts: any[] = [
    { inlineData: { data, mimeType } },
    { text: prompt }
  ];

  try {
    let finalModelName = modelName;
    let imageConfig: any = {};

    if (finalModelName === 'gemini-3.1-flash-image') {
      imageConfig.imageSize = imageSize;
    } else if (finalModelName === 'imagen-3.0-generate-002' || imageSize === '2K' || imageSize === '4K') {
      finalModelName = 'imagen-3.0-generate-002';
      imageConfig.imageSize = imageSize === '4K' ? '2K' : imageSize;
    }

    let fallbackModel: string = finalModelName;
    // Bắt buộc dùng Gemini cho Chỉnh sửa hình ảnh (có input base64Image)
    if (finalModelName === 'gemini-3.1-flash-image') {
        fallbackModel = 'gemini-3.1-flash-image';
    } else if (finalModelName.startsWith('imagen-3.0-generate-002') || finalModelName.startsWith('gemini-3.1-flash-image-preview')) {
        fallbackModel = 'gemini-3.1-flash-image';
        imageConfig.imageSize = imageSize; // Nâng cấp lên native 4K
    } else if (finalModelName.startsWith('imagen')) {
        fallbackModel = 'gemini-2.5-flash-image';
    }

    const response = await ai.models.generateContent({
      model: fallbackModel,
      contents: { parts },
      config: { imageConfig }
    });
    
    if (!response.candidates?.[0]?.content?.parts) throw new Error("AI không phản hồi.");
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        trackImagenUsage(fallbackModel, 1, "Chỉnh sửa ảnh", imageSize);
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Không có ảnh.");  } catch (error: any) {
    throw error;
  }
};

// Bước cuối: Tạo Prompt và Tạo Ảnh
export const generateProductImage = async (settings: GenerationSettings, variantSeed: number, history?: import('../types').SuccessfulPrompt[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  let finalPrompt = "";
  
  // Optional: Use history to optimize the generation
  const optimizedHistoryNote = history && history.length > 0 
    ? `\nNote: Please align with the style of these previously successful concepts: ${history.map(h => h.imageSettings.concept || h.imageSettings.visualStyle).slice(-3).join(', ')}`
    : "";
  
  const formatProps = (props: PropConfig[]) => {
    return props.map(p => {
      let desc = p.name;
      const details = [];
      if (p.size && p.size !== 'auto') details.push(`size: ${p.size}`);
      if (p.position && p.position !== 'auto') details.push(`position: ${p.position}`);
      if (p.rotation && p.rotation !== 'auto') details.push(`rotation: ${p.rotation}`);
      if (details.length > 0) desc += ` (${details.join(', ')})`;
      return desc;
    }).join(", ");
  };

  const formatCameraSettings = (camera: any) => {
    const angleDesc = camera.angle === 0 ? "eye-level shot" :
                      camera.angle > 0 ? `high angle shot (${camera.angle} degrees)` :
                      `low angle shot (${Math.abs(camera.angle)} degrees)`;
                      
    const macroDesc = camera.isMacro ? "macro photography, extreme close-up details" : "standard product framing";
    
    return `Shot on ${camera.focalLength}mm lens, aperture ${camera.aperture}, ISO ${camera.iso}. ${angleDesc}. ${macroDesc}. Professional studio lighting, sharp focus, hyper-detailed, photorealistic.`;
  };
  
  if (settings.visualStyle === "SCENE_STAGING") {
    finalPrompt = `
Style Guide Requirements:
${designLifestyleConcept}

Staging professional: Add ${formatProps(settings.props)} into the real scene image following style "${settings.concept}". Keep original furniture. Camera & Lighting: ${formatCameraSettings(settings.camera)}. 8k, realistic.`;
  } else if (settings.visualStyle === "TECH_EFFECTS") {
    if (settings.techEffectType === "REMOVE_SIGNATURE") {
      finalPrompt = `Remove watermark/text from this image. Keep high quality, clear, bright.`;
    } else {
      finalPrompt = `
Style Guide Requirements:
${designTechEffects}

Ocean night cinemetic. Product ${settings.productName}. Text "${settings.techTitle}". ${settings.selectedTechConcept}. Neon reflections, Camera: ${formatCameraSettings(settings.camera)}. 8k.`;
    }
  } else if (settings.visualStyle === "PACKAGING_MOCKUP") {
    const prodName = settings.productName || "Product";
    const dim = settings.dimensions;
    const hasDimensions = dim && (dim.length || dim.width || dim.height);
    const dimPhrase = hasDimensions 
      ? `The 3D box must have physical outer proportions representing dimensions of ${dim.length || "150"}mm (Length) x ${dim.width || "150"}mm (Width) x ${dim.height || "200"}mm (Height).`
      : "The 3D box must have realistic square or rectangular product container packaging proportions.";

    const matType = settings.packagingMaterial === "CARTON_BW" 
      ? "Industrial Kraft Corrugated Cardboard box (Thùng carton nâu xi măng nhám, chất liệu bìa carton thô ráp nguyên bản)" 
      : "Premium coated white folding boxboard or SBS paperboard with high-quality printing (Hộp giấy màu phủ mịn bồi carton cao cấp)";
      
    const matDetails = settings.packagingMaterial === "CARTON_BW"
      ? "Texture: rough, natural raw fibrous kraft paper texture with micro-fibers, crease lines showing exposed light-brown cardboard pulp inside the folded seams. Printing: simple grayscale, matte black, or vintage dark ink colors directly screen-printed onto the brown container."
      : "Texture: smooth, silk-coated finish with slight satin luster on premium thick paperboard. The folds are crisp, showing white or colored paper pulp precisely. High-brightness, vibrant corporate color reproduction.";

    const outputScene = settings.packagingOutputStyle === "WHITE_BG_ROTATED"
      ? "White Background Studio: Placed strictly on an absolute pure, clean, seamless white commercial studio backdrop (#FFFFFF). The 3D box is rotated at a 3/4 perspective angle to clearly display three sides of the package (Front, Right/Side, Top)."
      : "Lifestyle Context: Placed elegantly inside a premium, modern minimalist lifestyle setting, such as on a clean light-refracting oak wood table, a solid concrete shelf, or a matte marble platform. The background is softly out-of-focus (gentle shallow depth-of-field) with natural organic window shadows, minimal natural props like a tiny green leaves plant branch.";

    finalPrompt = `
Style Guide Requirements:
${designPackagingMockup}

3D Packaging Mockup Reconstruction & Folding Task:
We have a product named "${prodName}".
Your task is to reconstruct a high-quality, photorealistic 3D paper container box mockup using the provided 2D flat custom die-line graphic layout from the input image (Image 1).

DIMENSIONS & MATERIAL STRUCTURE:
- ${dimPhrase}
- Packaging Box Material: ${matType}
- Material Surface Properties: ${matDetails}

CREATIVE WRAPPING & RECONSTRUCTION RULES (MANDATORY):
1. Precision 3D Folding: You must fold, wrap, and map the exact 2D graphic design layout from the flat layout image (Image 1) onto the respective faces of the 3D box.
2. Graphic & Branding Fidelity: All brand logos ("Elmich"), typography, product photos, detailed labels, lists of specifications, certificates, and decorative color patches from Image 1 must transfer cleanly and become perfectly readable on the 3D folded surfaces. No weird gibberish text or distorted details.
3. Realistic Seams, Flaps, and Creases: The paper seams where flaps lock together must be clearly modeled with paper thickness (approximately 1-2mm card edge). Edges must show natural crease lines (softly rounded edge highlights) reflecting light to define the box shape, rather than sharp computer-generated vectors.
4. Professional Camera Specifications: ${formatCameraSettings(settings.camera)}
5. Scene Setup:
   - ${outputScene}
6. Lighting and Grounding: Clean 3-point commercial studio lighting. A dark, diffuse, realistic contact shadow (grounding) must sit correctly beneath the bottom edges of the box, with soft ambient light shadows trailing off. No floating.

Output style: Premium commercial packaging mockup, hyper-detailed rendering, photorealistic 8k.
    `;
  } else if (settings.visualStyle === "WHITE_BG_RETOUCH") {
    let stylePrompt = "";
    const productName = settings.productName || "Product";
    const selectedCats = settings.whiteBGSelectedCategories || [];
    const matDesc = settings.whiteBGMaterialsDescription || "";

    let materialDirectives = "";
    if (selectedCats.includes("METAL")) {
      materialDirectives += `\n- Metallic Parts (Kim loại): Auto-detect and render highly realistic, pristine, and clean metallic surfaces (such as polished chrome, brushed stainless steel, or aluminum). Apply soft specular highlights, clean rim light reflections, and realistic metallic luster. Ensure the metallic finish is perfectly uniform, clean, flawless, and pristine.`;
    }
    if (selectedCats.includes("PLASTIC")) {
      materialDirectives += `\n- Plastic/Polymer Parts (Nhựa): Auto-detect plastic parts. Render them with perfectly clean, uniform matte or high-gloss polymer surfaces. Do not bleed metallic highlights or chrome sheen onto plastic housings. Ensure subtle subsurface scattering for realistic matte or gloss polymers, completely clean, uniform, smooth, and pristine.`;
    }
    if (selectedCats.includes("GLASS")) {
      materialDirectives += `\n- Glass/Transparent Parts (Thủy tinh): Render realistic glass transparency, subtle refraction, and clear rim specular highlights. Show internal contents nicely with soft studio backlighting if visible, keeping the glass entirely clean, uniform, and crystal clear.`;
    }
    if (selectedCats.includes("CERAMIC")) {
      materialDirectives += `\n- Ceramic/Coated Parts (Gốm sứ/Chống dính): Render a perfectly smooth, flawless, and uniform glossy glaze or clean non-stick coating. Ensure a pristine, homogeneous finish with soft, diffused light absorption, completely smooth, uniform, flawless, and pristine.`;
    }
    if (materialDirectives === "") {
      materialDirectives = "\n- Standard materials: Clean, realistic studio texture preservation, completely clean and pristine.";
    }

    stylePrompt = `High-detail, professional commercial studio product photography of the product "${productName}", meticulously isolated on a pure, solid white background (#FFFFFF).
    
MATERIAL SEPARATION & PROPERTY DIRECTIVES:
The product contains the following material compositions: [${selectedCats.join(', ')}].
${materialDirectives}

USER MATERIAL LOCATION & DETAIL DESCRIPTION:
"${matDesc || "Automated multi-material detection based on the input photograph."}"
-> Use this specific material mapping to assign glossiness, metalness, transparency, or roughness to different parts of the product. Keep original contours and text.

LIGHTING & STUDIO PRESENTATION:
- Light Source: Professional three-point studio lighting with high-end key and fill lights, displaying pristine product shape and beautiful gradients.
- Grounding: A very delicate, clean, and tight contact shadow must sit precisely underneath the base contact points. No floating, no artificial halo.
- Quality: Superb clarity, high contrast, clean noise-free colors, commercial catalog style, photorealistic.`;

    finalPrompt = `
Style Guide Requirements:
${designWhiteBGRetouch}

${stylePrompt}
 
CRITICAL REQUIREMENT: Absolutely do not change the original camera angle, perspective, shape, or texture/structure of the product. The product itself must remain exactly as it appears in the reference image.

BACKGROUND SANITIZATION (MANDATORY & MAXIMUM PRIORITY / YÊU CẦU BẮT BUỘC):
- WIPE OUT THE OLD BACKGROUND: You must completely remove, erase, and replace 100% of the original background, old room environment, countertop, floor, walls, and reflections from the input image.
- Flawless, PURE #FFFFFF SOLID WHITE STUDIO BACKGROUND.
- The background is completely blank, plain, clean, pristine, and 100% empty white digital canvas from edge to edge.
- Every single background pixel at the top, bottom, left, right borders, and corners must be absolute, seamless flat pure white (#FFFFFF) (RGB: 255, 255, 255).
- ABSOLUTELY NO other objects, NO vertical pillars, NO vertical stripes, NO grey patches, NO shadows from the room, and NO environmental reflections are allowed to leak into the background.
- ABSOLUTELY NO gray areas, NO vignetting, NO gradients, NO shading, NO noise, NO dust, NO specks, NO spots, and NO dirty smudges are allowed anywhere in the image.
- NỀN TRẮNG PHẢI SẠCH TUYỆT ĐỐI: Bạn phải LOẠI BỎ HOÀN TOÀN phông nền cũ và thay thế bằng màu trắng tinh khiết hoàn hảo (#FFFFFF). Không được có bóng xám dơ, không có cột đứng, không có vết bẩn, không có hạt nhiễu (noise), không có hiệu ứng tối góc (vignette), không có chuyển màu (gradient). Toàn bộ vùng nền xung quanh sản phẩm phải là màu trắng tinh khiết hoàn hảo #FFFFFF từ tâm ra đến tận rìa và bốn góc ảnh.
- VERY TIGHT GROUND SHADOW ONLY: The only shadow allowed is a very tight, clean, localized contact shadow (ambient occlusion) directly beneath the physical touchpoints of the product. It must be extremely minimal and must rapidly fade to absolute pure white (#FFFFFF) within a few millimeters.
- KHÔNG CÓ BÓNG ĐỔ RỘNG: Tuyệt đối không vẽ bóng đổ lan rộng ra nền nhà, không tạo bóng mờ xám to làm bẩn nền. Bóng đổ phải cực kỳ gọn, nhỏ, sắc nét và ôm sát ngay dưới chân đế của sản phẩm rồi tan biến hoàn toàn vào nền trắng tinh #FFFFFF.

All product logos, text, and original product colors are strictly maintained exactly as they are in the original design.
Additional Instructions: ${settings.concept || 'None'}
Camera Setup: ${formatCameraSettings(settings.camera)}`;
  } else if (settings.visualStyle === "LINE_ART") {
    finalPrompt = `
Style Guide Requirements:
${designLineArt}

A minimalist, clean line art illustration of the product. Pure white background, solid black outlines. Simple netline style, architectural drawing, blueprint style but black on white. 

Strict preservation (VERY IMPORTANT): 
keep the product's exact shape, proportions, and perspective exactly as original.
do NOT change the camera angle or perspective.
do NOT change shape, structure, proportions.

Style constraints:
No shading, no shadows, no gradients, no colors, no 3D realistic effects, no textures. 
Only crisp, continuous, and precise black lines defining the outer shape and essential inner contours of the product. 
Flat 2D vector style. High clarity, simple schematic outline.

BACKGROUND SANITIZATION (MANDATORY): The background must be 100% flat, solid, pure, clean, and seamless white (#FFFFFF) from edge to edge. The background is completely plain, blank, empty, and uniform. All pixels from center to borders and corners are perfectly solid white.
    `;
  } else if (settings.visualStyle === "COLOR_CHANGE") {
    const changes = settings.colorChanges.map((c, i) => {
      let changeStr = `- Part / Position to recolor: "${c.partName}"`;
      if (c.pantoneCode) changeStr += ` to Pantone Color: "${c.pantoneCode}"`;
      if (c.description) changeStr += ` describing: "${c.description}"`;
      if (c.sampleImage) changeStr += ` (Reference the target/desired color/texture in Image ${i + 2} provided)`;
      return changeStr;
    }).join('\n');

    finalPrompt = `
Style Guide Requirements:
${designColorEditing}

Product Recoloring & Color Editing Task:
We have a product named "${settings.productName}".
Your task is to generate/edit the product image to change the colors of specified parts while meticulously preserving the design, format, and details of the original product.

INPUT IMAGES DEFINITION:
- Image 1 (First uploaded image): This is the ORIGINAL/BASE product image of "${settings.productName}". You MUST edit this image ONLY. This is your template and canvas. Do NOT modify its geometry, silhouette, size, or perspective.
- Image 2 and onwards: These are color references/sample images indicating the target colors, tones, or materials to be applied to specified parts of Image 1. DO NOT edit or use these as your template; they are only reference samples!

COLOR CHANGE SPECIFICATIONS:
You must recolor specified parts of Image 1 based on these instructions and reference images (Image 2 onwards):
${changes || "Change the product colors to match professional kitchenware premium colors."}

STRICT PRESERVATION RULES (MANDATORY):
1. Original Geometry and Shape: Preserve the exact structural boundaries, dimensions, camera perspective, lens angles, physical silhouette, and coordinates of the product as seen in Image 1. Do not distort, warp, or duplicate the product. Do NOT use the shapes or dimensions of the reference sample images (Image 2 onwards).
2. Material Texture & Surface Details: Maintain the exact surface textures (e.g., brushed stainless steel inox metal, glossy glazed ceramic coating, matte premium plastic polymers) of each part in Image 1. The color change must look like a perfectly uniform pigment layer applied to that material, retaining its specific roughness, micro-scratches, or pores as seen in Image 1.
3. Luma & Accent Preservation (Luma Preservation): Preserve original specular highlights, reflections, and dark light-occluded crevices of Image 1. Highlights should remain white or light-grey, reflecting the light source, rather than being painted over with color.
4. Lighting System: Retain the identical commercial 3-Point studio lighting (Key Light, Fill Light, Rim Light) and shading of Image 1.
5. Color Bleeding (Color Bleed): Realistic light reflection (color bleed) of the new product color onto adjacent stainless steel or surrounding reflective surfaces.
6. Grounding and Shadows: Keep identical contact shadows (dense dark shadow at base of coordinates) and soft ambient key shadows on the floor/surface exactly as in Image 1.
7. Background: The background of Image 1 must be preserved without any other changes. Do not use the background of reference sample images.

Output style: Premium commercial cookware photography, hyper-detailed, 8k resolution, photorealistic.
    `;
  } else if (settings.visualStyle === "CONCEPT" || settings.visualStyle === "TECH_PS" || settings.visualStyle === "STUDIO") {
    
    let spaceInstruction = "";
    if (settings.emptySpacePosition && settings.emptySpacePosition.length > 0 && !settings.emptySpacePosition.includes('NONE' as any)) {
      const positions = settings.emptySpacePosition.map((p: any) => {
        if (p === 'TOP') return 'top (upper part)';
        if (p === 'BOTTOM') return 'bottom (lower part)';
        if (p === 'LEFT') return 'left side';
        if (p === 'RIGHT') return 'right side';
        return p;
      }).join(' and ');
      spaceInstruction = `Leave clear, unobstructed empty negative space on the ${positions} of the image for adding text/logos later.`;
    } else {
      spaceInstruction = "Center the subject normally.";
    }

    const isStudio = settings.visualStyle === "STUDIO";
    const mode = isStudio ? "minimalist high-end studio product shot" : "high-end commercial product photography shot";
    const propDetails = settings.props && settings.props.length > 0 ? settings.props.map(p => `${p.name}${p.amount ? ' (' + p.amount + ')' : ''}`).join(', ') : 'None';
    const placementDetails = settings.placement || "Centered";
    const cameraDetails = `${settings.camera?.angle || 'Front'}, ${settings.camera?.isMacro ? 'Macro Lens' : 'Standard Lens'}`;

    let selectedStyleGuide = "";
    if (settings.visualStyle === "CONCEPT") {
      selectedStyleGuide = designLifestyleConcept;
    } else if (settings.visualStyle === "STUDIO") {
      selectedStyleGuide = designStudioCreative;
    } else if (settings.visualStyle === "TECH_PS") {
      selectedStyleGuide = designTechEffects;
    }

    const thinkingPrompt = `
      Act as Elmich's Head of Creative, a senior commercial product photographer and expert prompt engineer. You must read and strictly adhere to the following three master styling manuals of Elmich AI Image Studio to write the absolute best prompt:
      
      === MASTER MANUAL 1: LIFESTYLE CONCEPT (BỐ CẢNH ĐỜI SỐNG ANH/CHỊ ĐÒI HỎI) ===
      ${designLifestyleConcept}
      
      === MASTER MANUAL 2: CREATIVE STUDIO PRO (CHỤP TRONG STUDIO/PHÔNG NỀN TRƠN) ===
      ${designStudioCreative}
      
      === MASTER MANUAL 3: TECH EFFECTS & VISUALS (HIỆU ỨNG CÔNG NGHỆ LOOPS VÀ PHYSICS) ===
      ${designTechEffects}
      
      =============================================================================

      Generate a highly detailed, descriptive, and professional image generation prompt (in English) for a ${mode}.
      Please apply the specific rules of the current selected style: "${settings.visualStyle}" (Main guide: ${settings.visualStyle === "CONCEPT" ? "LIFESTYLE" : settings.visualStyle === "STUDIO" ? "STUDIO" : "TECH EFFECTS"}), but cross-reference elements from the other manuals to guarantee absolute quality (e.g., maintain the premium material reflections, pristine geometry, absolute verticality, correct light bleed, and avoiding chaotic Sci-Fi graphics at all costs).
      
      Product: ${settings.productName}
      Creative Concept/Theme: ${settings.concept}
      Placement and Proportion: ${placementDetails}
      Props to include: ${propDetails}
      ${isStudio ? "Background: Plain paper background that is EXACTLY the same color as the product's primary color (tone-on-tone monochromatic look)." : ""}
      Empty Space Requirement: ${spaceInstruction}
      Composition: The product and props must be neatly arranged and fit entirely within the frame.
      Camera & Lighting Setup: ${cameraDetails}
      
      CORE PHOTOGRAPHY AND DESIGN PRINCIPLES (STRICTLY ENFORCE):
      1. Strict Geometry Preservation (Geometry Control Protocol): 
         - Axis Alignment: "Maintain absolute verticality for all cylindrical products. Ensure the base and lid are perfectly parallel to the horizon."
         - Logo Integrity: "Apply logo as a precise vector-based decal. No warping or distortion on curved surfaces. Center properly."
         - Scale Reference: "Scale 1:1 relative to standard environment. Ensure handle-to-body proportion follows engineering standards."
      2. PBR (Physically Based Rendering & Advanced Micro-surface Optics): 
         - Metal (Inox/Aluminum): "Use Anisotropic reflection with a blurriness factor of 0.05. Highlights must trace the contour of the object, not bloom uncontrollably." Apply Fresnel reflections.
         - Plastic: "Apply Micro-bump texture at 5% intensity to mimic high-grade food-safe plastic. Subtle Fresnel effect at the edges to show material thickness."
         - Glass: "Set Refraction Index (IOR) to 1.5. Ensure the internal walls of the container are visible through the glass, with slight chromatic aberration at the edges to simulate professional camera optics."
         - Ceramic/Stone: Grazing 45-degree light for micro-displacement/pores.
      3. Shadow Structure: Must include contact shadows (stark black at the base), soft gradient key shadows, and feathered extrusion shadows for handles.
      4. Lighting System: 3-Point Lighting System (Key Light, Fill Light, Rim Light).
      
      ASPECT RATIO SPECIFIC COMPOSITION DIRECTIVES:
      - Current Aspect Ratio: ${settings.aspectRatio}
      - For extremely wide aspect ratios (such as '4:1' or '16:9'), do NOT center a single tiny product in an empty void. Instead, design a breathtaking wide panoramic landscape/tabletop composition. Describe how the countertop, stone slabs, paper backdrop, or floor continuously extend horizontally from left to right across the ultra-wide frame. Place the main product strictly once, ideally offset to the left or right third (rule of thirds), and let the gorgeous ambient scenery or soft matching props (such as scattered ingredients, plants, glassware) flow elegantly along the horizontal axis, forming beautiful negative space.
      - For extremely tall aspect ratios (such as '1:4' or '9:16'), design a vertical cascading composition where elements stack elegantly vertically.
      
      STRICT AVOIDANCE (NEGATIVE PROMPT EQUIVS):
      - NO DUPLICATION: Under no circumstances should there be multiple copies, ghost shapes, blurred visual echoes, double images, or floating duplicate pieces of the main product. The main product must appear exactly ONCE in the entire image.
      - Avoid distorted logos, skewed geometry, non-functional hinges, floating parts.
      - Avoid over-saturated colors, unrealistic bloom, plastic-looking metal, blurry reflections.
      - Avoid inconsistent shadow direction, multiple light sources causing conflicting shadows.
      - Avoid low-resolution textures, pixelated edges on text/branding.
      
      Instructions for the prompt:
      - Describe the product's placement (MANDATORY: you must explicitly describe placing the product as described in "${placementDetails}"), lighting, shadows, and reflections in vivid technical detail based on the core principles.
      - Describe the background and environment based on the concept and color palette rules. Make sure the props (${propDetails}) are present.
      - ${isStudio ? "Ensure minimalist, clean, extremely neat layout." : "Follow the rule of thirds for composition. Use an elegant, harmonious color palette."}
      - Ensure the prompt emphasizes photorealism, 8k resolution, and high-end commercial aesthetic.
      - ONLY output the final prompt text (in English), no explanations.
    `;

    const thinkingResponse = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: thinkingPrompt
    });
    finalPrompt = thinkingResponse.text || "";
  } else if (settings.visualStyle === "TRACK_SOCKET_STAGING") {
    const socketDetails = settings.sockets?.map((s, idx) => {
      let detail = `- Loại ổ cắm ${idx + 1}: Số lượng ${s.quantity}`;
      if (s.applianceNote) detail += `, dùng cho: ${s.applianceNote}`;
      return detail;
    }).join('\n      ') || '';

    if (settings.trackSocketMode === 'REFERENCE') {
      finalPrompt = `
        Hình ảnh trực quan sản phẩm: Gắn các ổ cắm được cung cấp lên thanh ray.
        Thanh ray được gắn cố định trên tường.
        Các ổ cắm là các thành phần mô-đun có thể di chuyển dọc theo thanh ray và xoay để khóa/mở khóa.
        
        Cấu hình ổ cắm:
        ${socketDetails}
        
        Bối cảnh: Tái tạo lại chính xác bối cảnh, phong cách, ánh sáng và không gian từ ảnh mẫu (reference image) được cung cấp.
        
        HƯỚNG DẪN QUAN TRỌNG:
        1. Giữ nguyên thiết kế nội thất, màu sắc và bố cục của ảnh mẫu.
        2. Thêm hệ thống thanh ray và ổ cắm vào vị trí hợp lý trên tường trong ảnh mẫu.
        3. Đặt chính xác số lượng ổ cắm đã chỉ định lên thanh ray.
        4. Ít nhất một ổ cắm PHẢI có thiết bị cắm vào.
        5. Nếu ổ cắm có ghi chú "dùng cho", hãy hiển thị thiết bị đó đang được cắm vào.
        6. Hệ thống thanh ray và ổ cắm phải hòa hợp hoàn hảo với môi trường của ảnh mẫu.
        
        Phong cách nhiếp ảnh kiến trúc chuyên nghiệp, 8k, siêu thực, ánh sáng và bóng đổ hoàn hảo.
        Thông số máy ảnh: ${formatCameraSettings(settings.camera)}
      `;
    } else {
      finalPrompt = `
        Hình ảnh trực quan sản phẩm: Gắn các ổ cắm được cung cấp lên thanh ray.
        Thanh ray được gắn cố định trên tường, ưu tiên các vị trí lắp đặt cố định.
        Các ổ cắm là các thành phần mô-đun có thể di chuyển dọc theo thanh ray và xoay để khóa/mở khóa.
        
        Cấu hình ổ cắm:
        ${socketDetails}
        
        Bối cảnh: ${settings.location}. 
        Chi tiết môi trường: ${settings.concept || 'Nội thất hiện đại, sạch sẽ'}.
        
        HƯỚNG DẪN QUAN TRỌNG:
        1. Thanh ray phải được gắn trên tường hoặc bề mặt cố định phù hợp với bối cảnh.
        2. Đặt chính xác số lượng ổ cắm đã chỉ định lên thanh ray.
        3. Ít nhất một ổ cắm PHẢI có thiết bị cắm vào.
        4. Nếu ổ cắm có ghi chú "dùng cho", hãy hiển thị thiết bị đó đang được cắm vào.
        5. Hệ thống thanh ray và ổ cắm phải hòa hợp hoàn hảo với môi trường ${settings.location}.
        
        Phong cách nhiếp ảnh kiến trúc chuyên nghiệp, 8k, siêu thực, ánh sáng và bóng đổ hoàn hảo.
        Thông số máy ảnh: ${formatCameraSettings(settings.camera)}
      `;
    }
  }

  if (optimizedHistoryNote) {
    finalPrompt += optimizedHistoryNote;
  }

  const parts: any[] = [{ text: finalPrompt }];
  
  if (settings.visualStyle === "SCENE_STAGING") {
    if (settings.productImages[0]) parts.push({ inlineData: { data: settings.productImages[0].split(',')[1], mimeType: 'image/png' } });
    if (settings.referenceImage) parts.push({ inlineData: { data: settings.referenceImage.split(',')[1], mimeType: 'image/png' } });
  } else if (settings.visualStyle === "TRACK_SOCKET_STAGING") {
    if (settings.trackImage) parts.push({ inlineData: { data: settings.trackImage.split(',')[1], mimeType: 'image/png' } });
    settings.sockets?.forEach(s => {
      if (s.image) parts.push({ inlineData: { data: s.image.split(',')[1], mimeType: 'image/png' } });
    });
    if (settings.trackSocketMode === 'REFERENCE' && settings.referenceImage) {
      parts.push({ inlineData: { data: settings.referenceImage.split(',')[1], mimeType: 'image/png' } });
    }
  } else if (settings.visualStyle === "COLOR_CHANGE") {
    if (settings.productImages[0]) {
      parts.push({ inlineData: { data: settings.productImages[0].split(',')[1], mimeType: 'image/png' } });
    }
    settings.colorChanges.forEach(c => {
      if (c.sampleImage) parts.push({ inlineData: { data: c.sampleImage.split(',')[1], mimeType: 'image/png' } });
    });
  } else if (settings.visualStyle === "PACKAGING_MOCKUP") {
    if (settings.packagingDesignType === "FLAT_DESIGN" && settings.packagingFaces.flat) parts.push({ inlineData: { data: settings.packagingFaces.flat.split(',')[1], mimeType: 'image/png' } });
  } else if (settings.referenceImage && (settings.visualStyle === "TECH_EFFECTS" || settings.visualStyle === "WHITE_BG_RETOUCH" || settings.visualStyle === "CONCEPT" || settings.visualStyle === "LINE_ART")) {
    parts.push({ inlineData: { data: settings.referenceImage.split(',')[1], mimeType: 'image/png' } });
  }
  
  const productImagesVisualStyles = ["CONCEPT", "TECH_PS", "STUDIO"];
  if (settings.productImages.length > 0 && productImagesVisualStyles.includes(settings.visualStyle)) {
    settings.productImages.forEach(img => parts.push({ inlineData: { data: img.split(',')[1], mimeType: 'image/png' } }));
  }

  try {
    let modelName = settings.aiModel;
    let imageConfig: any = { aspectRatio: settings.aspectRatio };

    // Nếu model được chọn là Gemini 3.1 Flash Image (mô hình chất lượng cao mới)
    if (modelName === 'gemini-3.1-flash-image') {
      imageConfig.imageSize = settings.imageSize; // Hỗ trợ 1K, 2K, 4K gốc trực tiếp từ API!
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image',
        contents: { parts },
        config: { imageConfig }
      });
      if (!response.candidates?.[0]?.content?.parts) throw new Error("AI không phản hồi.");
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          trackImagenUsage('gemini-3.1-flash-image', 1, settings.productName || "Tạo ảnh sản phẩm", settings.imageSize);
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
      throw new Error("Không có ảnh.");
    }

    if (modelName === 'imagen-3.0-generate-002' || settings.imageSize === '2K' || settings.imageSize === '4K' || settings.aspectRatio === '1:4' || settings.aspectRatio === '4:1') {
      modelName = 'imagen-3.0-generate-002';
      imageConfig.imageSize = settings.imageSize === '4K' ? '2K' : settings.imageSize;
    }
    let responseBase64 = "";

    // Imagen 3.0 ONLY supports: '1:1', '3:4', '4:3', '9:16', '16:9'
    const standardAspectRatios = ['1:1', '3:4', '4:3', '9:16', '16:9'];
    const isStandardRatio = standardAspectRatios.includes(settings.aspectRatio);

    // Nếu model là Imagen 3.0, tỉ lệ được hỗ trợ bởi Imagen, và KHÔNG CÓ input images nào (parts.length === 1)
    if (modelName.startsWith('imagen') && parts.length === 1 && isStandardRatio) {
      const response = await ai.models.generateImages({
        model: modelName,
        prompt: parts[0].text,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: settings.aspectRatio as any || '1:1',
        }
      });
      if (!response.generatedImages?.[0]?.image?.imageBytes) throw new Error("AI không phản hồi.");
      trackImagenUsage(modelName, 1, settings.productName || "Tạo ảnh sản phẩm", settings.imageSize);
      const base64Data = `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
      if (settings.imageSize === '4K') {
        return await upscaleImageTo4K(base64Data);
      }
      return base64Data;
    } else {
      // Fallback cho việc edit hình / sử dụng input images với Gemini, hoặc khi tỉ lệ khung hình là tùy chỉnh (ví dụ 1:4, 4:1)
      let fallbackModel: string = modelName;
      if (modelName.startsWith('imagen-3.0-generate-002') || modelName.startsWith('imagen')) {
          // Gemini-3.1-flash-image hỗ trợ tỉ lệ tùy chọn và ảnh 4K gốc trực tiếp cực kỳ đẹp!
          fallbackModel = 'gemini-3.1-flash-image';
          imageConfig.imageSize = settings.imageSize;
      }

      const response = await ai.models.generateContent({
        model: fallbackModel,
        contents: { parts },
        config: { imageConfig }
      });
      if (!response.candidates?.[0]?.content?.parts) throw new Error("AI không phản hồi.");
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          trackImagenUsage(fallbackModel, 1, settings.productName || "Tạo ảnh sản phẩm (Gemini)", settings.imageSize);
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
      throw new Error("Không có ảnh.");
    }  } catch (error: any) { throw error; }
};

export const generateImageForChat = async (prompt: string, modelName: string = 'imagen-3.0-generate-002', aspectRatio: string = "1:1", imageBase64?: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const parts: any[] = [{ text: prompt }];
    if (imageBase64 && typeof imageBase64 === 'string') {
      const match = imageBase64.match(/^data:(image\/[a-z]+);base64,(.+)$/);
      if (match) {
        parts.push({
          inlineData: {
            mimeType: match[1],
            data: match[2]
          }
        });
      }
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any
        }
      }
    });

    const resParts = response.candidates?.[0]?.content?.parts;
    if (resParts) {
      for (const part of resParts) {
        if (part.inlineData) {
          trackImagenUsage(modelName, 1, "Tạo ảnh trong Chat");
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("Không có ảnh.");
  } catch (error: any) { throw error; }
};

export const chatWithAI = async (messages: import('../types').ChatMessage[], modelName: string = 'gemini-2.5-pro'): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const contents = messages.map(msg => {
    const parts: any[] = [{ text: msg.text }];
    if (msg.uploadedImageUrl) {
      // Extract base64 and mime type from data URI
      const match = msg.uploadedImageUrl.match(/^data:(image\/[a-z]+);base64,(.+)$/);
      if (match) {
        parts.push({
          inlineData: {
            mimeType: match[1],
            data: match[2]
          }
        });
      }
    }
    return {
      role: msg.role,
      parts
    };
  });
  
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: contents,
      config: {
        systemInstruction: "Bạn là một trợ lý AI tư vấn và lên ý tưởng hình ảnh sản phẩm. Luôn ưu tiên trả lời bằng tiếng Việt, trừ khi người dùng yêu cầu ngôn ngữ khác.",
      }
    });
    trackGeminiUsage(response, "Trò chuyện trợ lý");
    return response.text || "No response generated.";
  } catch (error) {
    console.error("Chat generation failed:", error);
    throw error;
  }
};