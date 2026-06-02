import { GoogleGenAI, Type } from "@google/genai";
import { GenerationSettings, AISuggestions, AIConceptAnalysis, CameraSettings, PropConfig, ConceptSuggestion } from "../types";

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
      Bạn là một chuyên gia Prompt Engineer và Giám đốc sáng tạo nhiếp ảnh sản phẩm.
      Sản phẩm: "${productName}". Kích thước: ${dimensions}.
      ${refImage ? "Tôi có gửi kèm một ảnh mẫu phong cách (Style Reference). Hãy dựa vào style của ảnh này để đề xuất." : ""}
      
      YÊU CẦU:
      1. Đề xuất 5 Ý tưởng (Concept) phối cảnh chụp ảnh Lifestyle. Tên của concept (title) BẮT BUỘC phải là tiếng Việt.
      2. MỖI CONCEPT PHẢI ĐƯỢC VIẾT DƯỚI DẠNG MỘT PROMPT CHI TIẾT, MẠCH LẠC, BẮT BUỘC XUỐNG DÒNG RÕ RÀNG THEO CÁC TIÊU CHÍ SAU (viết 100% bằng tiếng Việt, KHÔNG viết tên tiêu chí, chỉ ghi nội dung bắt đầu bằng gạch đầu dòng):
         - [Mô tả phong cách]
         - [Mô tả không gian, bối cảnh]
         - [Mô tả cách đánh sáng]
         - [Mô tả cảm giác, màu sắc chủ đạo]
         (Lưu ý: Sử dụng ký tự xuống dòng \n giữa các tiêu chí để định dạng)
      3. Đề xuất bộ thông số Camera (Góc chụp, tiêu cự, khẩu độ, ISO) lý tưởng nhất.

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
    const prompt = `Phân tích kỹ thuật cho: "${productName}". Tính năng: "${techDesc}". Kích thước: ${dimensions}. 
    Trả về JSON 5 concept (mỗi concept gồm 'title' bằng tiếng Việt và 'prompt') và camera.
    YÊU CẦU CHO 'prompt': Viết 100% bằng tiếng Việt, mạch lạc, BẮT BUỘC XUỐNG DÒNG (dùng \\n), KHÔNG viết tên tiêu chí, chỉ ghi nội dung bắt đầu bằng gạch đầu dòng:
    - [Mô tả phong cách]
    - [Mô tả không gian, bối cảnh]
    - [Mô tả cách đánh sáng]
    - [Mô tả cảm giác, màu sắc chủ đạo]`;
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
      contents: `Sản phẩm: ${productName}, Tiêu đề: ${title}. Mô tả 3 ý tưởng hiển thị trên mặt nước biển đêm. JSON array với 'title' (tiếng Việt) và 'prompt'.
      YÊU CẦU CHO 'prompt': Viết 100% bằng tiếng Việt, mạch lạc, BẮT BUỘC XUỐNG DÒNG (dùng \\n), KHÔNG viết tên tiêu chí, chỉ ghi nội dung bắt đầu bằng gạch đầu dòng:
      - [Mô tả phong cách]
      - [Mô tả nền mặt biển]
      - [Mô tả cách đánh sáng]
      - [Mô tả cảm giác, màu sắc chủ đạo]`,
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
    const result = JSON.parse(response.text || "{}");
    return result.items || [];
  } catch (error) { return []; }
};

// 7. Phân tích Concept Studio (Mới)
export const analyzeStudioConcept = async (productName: string, dimensions: string, images: string[]): Promise<AIConceptAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const prompt = `
      Bạn là một chuyên gia Prompt Engineer và Giám đốc sáng tạo nhiếp ảnh sản phẩm.
      Sản phẩm: "${productName}". Kích thước: ${dimensions}.
      
      YÊU CẦU ĐẶC BIỆT CHO STUDIO CONCEPT:
      1. Đề xuất 5 Ý tưởng (Concept) chụp ảnh Studio phong phú (tối giản, hiện đại, ánh sáng kịch tính...). Tên của concept (title) BẮT BUỘC phải là tiếng Việt.
      2. MỖI CONCEPT PHẢI ĐƯỢC VIẾT DƯỚI DẠNG MỘT PROMPT CHI TIẾT, MẠCH LẠC, BẮT BUỘC XUỐNG DÒNG RÕ RÀNG THEO CÁC TIÊU CHÍ SAU (viết 100% bằng tiếng Việt, KHÔNG viết tên tiêu chí, chỉ ghi nội dung bắt đầu bằng gạch đầu dòng):
         - [Mô tả phong cách]
         - [Màu sắc, chất liệu nền giấy]
         - [Cách đánh sáng, tạo bóng]
         - [Mô tả cảm giác, màu sắc chủ đạo]
         (Lưu ý: Sử dụng ký tự xuống dòng \n giữa các tiêu chí để định dạng)
      3. RÀNG BUỘC BẮT BUỘC:
         - Hình ảnh chụp trên nền giấy trơn 1 màu (Plain Paper Background).
         - Màu nền giấy BẮT BUỘC phải CÙNG MÀU với màu của sản phẩm (Tone-on-tone, matching the product color).
         - Sản phẩm và đạo cụ nằm gọn trong khung hình.
         - Chừa khoảng trống trên nền để chèn chữ (Text).
      4. Đề xuất bộ thông số Camera (Góc chụp, tiêu cự, khẩu độ, ISO) lý tưởng nhất cho Studio.

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

    if (finalModelName === 'imagen-3.0-generate-002' || imageSize === '2K' || imageSize === '4K') {
      finalModelName = 'imagen-3.0-generate-002';
      imageConfig.imageSize = imageSize;
    }
let fallbackModel = finalModelName;
    // Bắt buộc dùng Gemini cho Chỉnh sửa hình ảnh (có input base64Image)
    if (finalModelName.startsWith('imagen-3.0-generate-002')) {
        fallbackModel = 'gemini-3.1-flash-image-preview';
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
      if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
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
    finalPrompt = `Staging professional: Add ${formatProps(settings.props)} into the real scene image following style "${settings.concept}". Keep original furniture. Camera & Lighting: ${formatCameraSettings(settings.camera)}. 8k, realistic.`;
  } else if (settings.visualStyle === "TECH_EFFECTS") {
    if (settings.techEffectType === "REMOVE_SIGNATURE") {
      finalPrompt = `Remove watermark/text from this image. Keep high quality, clear, bright.`;
    } else {
      finalPrompt = `Ocean night cinemetic. Product ${settings.productName}. Text "${settings.techTitle}". ${settings.selectedTechConcept}. Neon reflections, Camera: ${formatCameraSettings(settings.camera)}. 8k.`;
    }
  } else if (settings.visualStyle === "PACKAGING_MOCKUP") {
    finalPrompt = `3D Packaging Mockup for ${settings.productName}. ${settings.packagingOutputStyle === 'WHITE_BG_ROTATED' ? 'White background studio' : 'Contextual lifestyle'}. Camera: ${formatCameraSettings(settings.camera)}. 8k resolution.`;
  } else if (settings.visualStyle === "WHITE_BG_RETOUCH") {
    let stylePrompt = "";
    const productName = settings.productName || "Product";
    
    if (settings.whiteBGCategory === "METAL") {
      const config = settings.whiteBGMetalConfig;
      stylePrompt = `Ultra realistic lighting and shadow refinement for a single ${productName} on white background.

STRICT PRESERVATION:
- Keep the exact original product (no change in shape, angle, color, material, or texture)
- Do NOT duplicate or add objects
- Do NOT change composition or camera perspective

Lighting:
- soft directional key light from upper-left at 45 degrees
- clean studio lighting (premium commercial cookware photography style)
- highlight on upper rim and inner surface of the ${productName}
- subtle reflection on metal handle
- smooth light gradient across curved surfaces
- no overexposure

Shadow:
- realistic shadow attached to the ${productName} and handle
- shadow direction: to the right and slightly backward
- main shadow under the ${productName} body (elliptical shape)
- secondary elongated shadow from the handle extending to the right
- soft edge with gradual fade
- darker contact shadow directly under the ${productName} base
- lighter, more diffused shadow toward the handle tip

Background:
- clean white or very subtle grey gradient
- no texture, no color cast

Quality:
- high clarity, crisp but natural
- realistic depth and grounding
- premium commercial look

ABSOLUTE RULE:
- only adjust lighting and shadow, nothing else`;
    } else if (settings.whiteBGCategory === "PLASTIC") {
      const config = settings.whiteBGPlasticConfig;
      stylePrompt = `Studio product shot of ${productName},  ${config?.type || 'Matte'} plastic housing, isolated on a pure white background. Lighting: Large overhead ${config?.lighting || 'Softbox'} for even and diffused illumination, no harsh hotspots, subtle subsurface scattering for realistic plastic texture. Soft drop shadow at the base, clean minimalist presentation, 8k resolution.`;
    } else if (settings.whiteBGCategory === "GLASS") {
      const config = settings.whiteBGGlassConfig;
      stylePrompt = `Clean product photography of ${productName} made of ${config?.type || 'Borosilicate Glass'}, isolated on a pure white background. Lighting: Intense ${config?.lighting || 'Rim lighting'} to create sharp dark silhouettes on the edges, backlight to highlight ${config?.content || 'internal empty content'}. High refraction, ray tracing, transparent and crisp, 8k resolution.`;
    } else if (settings.whiteBGCategory === "CERAMIC") {
      const config = settings.whiteBGCeramicConfig;
      stylePrompt = `High-detail product shot of ${productName} with ${config?.surface || 'Granite speckled coating'}, isolated on a pure white background. Lighting: ${config?.lighting || '45-degree side lighting'} to emphasize the surface texture and micro-contrast, evenly lit handle, vibrant colors, clear coating details, photorealistic, 8k resolution.`;
    } else {
      stylePrompt = `A premium commercial studio product photograph of ${productName} on a clean, pure white background. High clarity, balanced contrast.`;
    }

    finalPrompt = `${stylePrompt}

CRITICAL REQUIREMENT: Absolutely do not change the original camera angle, perspective, shape, or texture/structure of the product. The product must remain exactly as it appears in the reference image. The background is a clean, pure white without any visible texture or color contamination. All product logos, text, and original product colors are strictly maintained exactly as they are in the original design.
Additional Instructions: ${settings.concept || 'None'}
Camera Setup: ${formatCameraSettings(settings.camera)}`;
  } else if (settings.visualStyle === "LINE_ART") {
    finalPrompt = `
A minimalist, clean line art illustration of the product. Pure white background, solid black outlines. Simple netline style, architectural drawing, blueprint style but black on white. 

Strict preservation (VERY IMPORTANT): 
keep the product's exact shape, proportions, and perspective exactly as original.
do NOT change the camera angle or perspective.
do NOT change shape, structure, proportions.

Style constraints:
No shading, no shadows, no gradients, no colors, no 3D realistic effects, no textures. 
Only crisp, continuous, and precise black lines defining the outer shape and essential inner contours of the product. 
Flat 2D vector style. High clarity, simple schematic outline.
    `;
  } else if (settings.visualStyle === "COLOR_CHANGE") {
    const changes = settings.colorChanges.map((c, i) => {
      let changeStr = `- Part / Position to recolor: "${c.partName}"`;
      if (c.pantoneCode) changeStr += ` to Pantone Color: "${c.pantoneCode}"`;
      if (c.description) changeStr += ` describing: "${c.description}"`;
      if (c.sampleImage) changeStr += ` (Reference the recoloring sample image ${i + 1} provided)`;
      return changeStr;
    }).join('\n');

    finalPrompt = `
Product Recoloring & Color Editing Task:
We have a product named "${settings.productName}".
Your task is to generate/edit the product image to change the colors of specified parts while meticulously preserving the design, format, and details of the original product.

COLOR CHANGE SPECIFICATIONS:
${changes || "Change the product colors to match professional kitchenware premium colors."}

STRICT PRESERVATION RULES (MANDATORY):
1. Original Geometry and Shape: Preserve the exact structural boundaries, dimensions, camera perspective, lens angles, physical silhouette, and coordinates of the product as seen in the original image. Do not distort, warp, or duplicate the product.
2. Material Texture & Surface Details: Maintain the exact surface textures (e.g., brushed stainless steel inox metal, glossy glazed ceramic coating, matte premium plastic polymers) of each part. The color change must look like a perfectly uniform pigment layer applied to that material, retaining its specific roughness, micro-scratches, or pores.
3. Luma & Accent Preservation (Luma Preservation): Preserve original specular highlights, reflections, and dark light-occluded crevices. Highlights should remain white or light-grey, reflecting the light source, rather than being painted over with color.
4. Lighting System: Retain the identical commercial 3-Point studio lighting (Key Light, Fill Light, Rim Light) and shading of the original product.
5. Color Bleeding (Color Bleed): Realistic light reflection (color bleed) of the new product color onto adjacent stainless steel or surrounding reflective surfaces.
6. Grounding and Shadows: Keep identical contact shadows (dense dark shadow at base of coordinates) and soft ambient key shadows on the floor/surface exactly as in the original picture.
7. Background: The background of the original image must be preserved without any other changes.

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

    const thinkingPrompt = `
      Act as an expert AI image generation prompt engineer and professional commercial product photographer.
      Write a highly detailed, descriptive, and professional image generation prompt (in English) for a ${mode}.
      
      Product: ${settings.productName}
      Creative Concept/Theme: ${settings.concept}
      Placement and Proportion: ${placementDetails}
      Props to include: ${propDetails}
      ${isStudio ? "Background: Plain paper background that is EXACTLY the same color as the product's primary color (tone-on-tone monochromatic look)." : ""}
      Empty Space Requirement: ${spaceInstruction}
      Composition: The product and props must be neatly arranged and fit entirely within the frame.
      Camera & Lighting Setup: ${cameraDetails}
      
      CORE PHOTOGRAPHY AND DESIGN PRINCIPLES (STRICTLY ENFORCE):
      1. Strict Geometry Preservation: Describe the product exactly as it is without altering dimensions or structures. DO NOT hallucinates shapes, structures, or add extra elements to the product itself.
      2. PBR (Physically Based Rendering): Describe realistic physical light interactions (reflection, refraction, subsurface scattering). NO fake 3D glows.
      3. Shadow Structure: Must include contact shadows (stark black at the base), soft gradient key shadows, and feathered extrusion shadows for handles.
      4. Lighting System: 3-Point Lighting System (Key Light, Fill Light, Rim Light).
      
      MATERIAL GUIDELINES TO APPLY IN PROMPT:
      - Metal (Inox/Aluminum): Fresnel reflection, sharp longitudinal highlights, anisotropic brushed textures.
      - Plastic: Soft subsurface scattering for matte, sharp reflection shape for glossy.
      - Glass/Crystal: Caustics (converging light), dark-field/bright-field rim lighting to emphasize glass edges.
      - Ceramic/Stone: Grazing 45-degree angle light for micro-displacement/pores.
      
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
    settings.colorChanges.forEach(c => {
      if (c.sampleImage) parts.push({ inlineData: { data: c.sampleImage.split(',')[1], mimeType: 'image/png' } });
    });
  } else if (settings.visualStyle === "PACKAGING_MOCKUP") {
    if (settings.packagingDesignType === "FLAT_DESIGN" && settings.packagingFaces.flat) parts.push({ inlineData: { data: settings.packagingFaces.flat.split(',')[1], mimeType: 'image/png' } });
  } else if (settings.referenceImage && (settings.visualStyle === "TECH_EFFECTS" || settings.visualStyle === "WHITE_BG_RETOUCH" || settings.visualStyle === "CONCEPT" || settings.visualStyle === "LINE_ART")) {
    parts.push({ inlineData: { data: settings.referenceImage.split(',')[1], mimeType: 'image/png' } });
  }
  
  const productImagesVisualStyles = ["CONCEPT", "TECH_PS", "COLOR_CHANGE", "STUDIO"];
  if (settings.productImages.length > 0 && productImagesVisualStyles.includes(settings.visualStyle)) {
    settings.productImages.forEach(img => parts.push({ inlineData: { data: img.split(',')[1], mimeType: 'image/png' } }));
  }

  try {
    let modelName = settings.aiModel;
    let imageConfig: any = { aspectRatio: settings.aspectRatio };

    if (modelName === 'imagen-3.0-generate-002' || settings.imageSize === '2K' || settings.imageSize === '4K' || settings.aspectRatio === '1:4' || settings.aspectRatio === '4:1') {
      modelName = 'imagen-3.0-generate-002';
      imageConfig.imageSize = settings.imageSize;
    }
let responseBase64 = "";

    // Nếu model là Imagen 3.0 và KHÔNG CÓ input images nào (parts.length === 1)
    if (modelName.startsWith('imagen') && parts.length === 1) {
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
      return `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
    } else {
      // Fallback cho việc edit hình / sử dụng input images với Gemini
      let fallbackModel = modelName;
      if (modelName.startsWith('imagen-3.0-generate-002')) {
          fallbackModel = 'gemini-3.1-flash-image-preview';
      } else if (modelName.startsWith('imagen')) {
          fallbackModel = 'gemini-2.5-flash-image';
      }

      const response = await ai.models.generateContent({
        model: fallbackModel,
        contents: { parts },
        config: { imageConfig }
      });
      if (!response.candidates?.[0]?.content?.parts) throw new Error("AI không phản hồi.");
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
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
    return response.text || "No response generated.";
  } catch (error) {
    console.error("Chat generation failed:", error);
    throw error;
  }
};