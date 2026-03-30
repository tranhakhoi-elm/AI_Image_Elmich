import { GoogleGenAI, Type } from "@google/genai";
import { GenerationSettings, AISuggestions, AIConceptAnalysis, CameraSettings, PropConfig, ConceptSuggestion } from "../types";

// --- CÁC HÀM CHO CÁC MODE CŨ ---
export const getAiSuggestions = async (settings: { productName: string, visualStyle: string, techDescription?: string }): Promise<AISuggestions> => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  let styleContext = settings.visualStyle === "TECH_PS" ? `Phong cách "Ảnh USP Kỹ thuật".` : `Phong cách cơ bản.`;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Gợi ý cho: "${settings.productName}". ${styleContext}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            concepts: { type: Type.ARRAY, items: { type: Type.STRING } },
            locations: { type: Type.ARRAY, items: { type: Type.STRING } },
            props: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["concepts", "locations", "props"]
        }
      }
    });
    return JSON.parse(response.text || "{}") as AISuggestions;
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
      model: "gemini-3.1-flash-lite-preview", 
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
      model: "gemini-3.1-flash-lite-preview",
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
    return JSON.parse(response.text || "{}") as AIConceptAnalysis;
  } catch (error: any) { throw error; }
};

// 3. Gợi ý Props cho Concept Lifestyle
export const suggestPropsForConcept = async (productName: string, concept: string): Promise<{props: string[], placement: string}> => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Sản phẩm: ${productName}. Concept: "${concept}". 
      YÊU CẦU:
      1. Suy luận sâu và đề xuất Vị trí và tỷ lệ sản phẩm (cách đặt sản phẩm, tỷ lệ so với khung hình).
      2. Liệt kê 10 đạo cụ (props) trang trí đi kèm phù hợp nhất.
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
      model: "gemini-3-flash-preview",
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
    return JSON.parse(response.text || "{}");
  } catch (error) { return { props: [], placement: "" }; }
};

// 5. Gợi ý Tech Concepts cho Hiệu ứng mặt biển
export const suggestTechConcepts = async (productName: string, title: string): Promise<ConceptSuggestion[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
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
    return JSON.parse(response.text || "{}").concepts || [];
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
      model: "gemini-3.1-flash-lite-preview",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: { items: { type: Type.ARRAY, items: { type: Type.STRING } } }
        }
      }
    });
    return JSON.parse(response.text || "{}").items || [];
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
         - Màu nền là màu Pastel tinh tế, HÀI HÒA hoặc ĐỒNG ĐIỆU với sản phẩm.
         - Sản phẩm và đạo cụ nằm gọn trong khung hình.
         - Chừa khoảng trống trên nền để chèn chữ (Text).
      4. Đề xuất bộ thông số Camera (Góc chụp, tiêu cự, khẩu độ, ISO) lý tưởng nhất cho Studio.

      Trả về JSON với 5 concepts (mỗi concept gồm 'title' ngắn gọn và 'prompt' chi tiết) và suggestedCamera.
    `;

    const parts: any[] = [{ text: prompt }];
    images.forEach(img => parts.push({ inlineData: { data: img.split(',')[1], mimeType: 'image/png' } }));

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview", 
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

export const editProductImage = async (base64Image: string, prompt: string, modelName: string = 'gemini-3.1-flash-image-preview', imageSize: string = '1K'): Promise<string> => {
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

    if (finalModelName === 'gemini-3.1-flash-image-preview' || imageSize === '2K' || imageSize === '4K') {
      finalModelName = 'gemini-3.1-flash-image-preview';
      imageConfig.imageSize = imageSize;
    }

    const response = await ai.models.generateContent({
      model: finalModelName,
      contents: { parts },
      config: { imageConfig }
    });
    
    if (!response.candidates?.[0]?.content?.parts) throw new Error("AI không phản hồi.");
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    throw new Error("Không có ảnh.");
  } catch (error: any) {
    throw error;
  }
};

// Bước cuối: Tạo Prompt và Tạo Ảnh
export const generateProductImage = async (settings: GenerationSettings, variantSeed: number): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  let finalPrompt = "";
  
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
    switch (settings.whiteBgRetouchStyle) {
      case 'DRAMATIC':
        stylePrompt = `A bold, high-contrast commercial studio product photograph on a pure white background. Illuminated by a strong, focused hard light from the side, creating striking, dramatic highlights and deep, sharply defined shadows. The lighting emphasizes texture and geometric forms. The shadows are bold and directional, grounding the product with authority. High clarity, intense contrast, modern and edgy aesthetic.`;
        break;
      case 'SOFT':
        stylePrompt = `A delicate, light and airy commercial studio product photograph on a pure white background. Illuminated by massive, ultra-soft diffused lighting from multiple angles, creating a nearly shadowless, ethereal environment. Highlights are incredibly smooth and gentle. Shadows are minimal, restricted to very faint, soft contact shadows just enough to ground the product without adding weight. High key exposure, pristine clarity, soft and inviting aesthetic.`;
        break;
      case 'CINEMATIC':
        stylePrompt = `A luxurious, cinematic studio product photograph on a pure white background. Featuring sophisticated lighting with a subtle overall exposure, accented by sharp, brilliant rim lights outlining the product's silhouette. Rich, deep contact shadows ground the item, while the edge lighting creates a glowing, premium three-dimensional effect. High clarity, rich micro-contrast, high-end luxury aesthetic.`;
        break;
      case 'TECHNICAL':
        stylePrompt = `An ultra-crisp, technical commercial studio product photograph on a pure white background. Illuminated by perfectly even, flat lighting from all directions to eliminate all directional shadows and reveal every micro-detail of the product. Only the tightest, darkest contact shadows are present to ground the item. Maximum sharpness, perfect color accuracy, clinical and informative aesthetic.`;
        break;
      case 'CLASSIC':
      default:
        stylePrompt = `A premium commercial studio product photograph featuring the main product on a clean, textureless white background. The composition is clean and focused, presenting the item as a high-value advertisement. The entire scene is illuminated by a single, soft directional key light positioned from the upper-left at a 45-degree angle, casting consistent and flattering light. This lighting creates smooth, controlled highlights on the polished surfaces and curved contours of the product. Subtle, defined reflections are carefully placed, avoiding any harsh glare or overexposure, giving the materials a rich, refined feel.

The shadow work is precise and adds significant depth and realism to the composition. The product casts a soft, subtle contact shadow directly beneath its base, grounding it firmly on the surface. There are absolutely no long, elongated, or trailing shadows extending outward. The shadow structure is strictly limited to a soft, diffused elliptical shadow immediately under the product, creating a natural and clean grounding effect without any directional cast shadows. Where parts are positioned close to one another, their individual contact shadows overlap naturally, creating realistic interaction that defines the physical space between them without merging into unnatural masses. A darker contact shadow is present exactly under each base, diffusing smoothly and quickly outward over a very short distance.`;
        break;
    }

    finalPrompt = `${stylePrompt}

CRITICAL REQUIREMENT: Absolutely do not change the original camera angle, perspective, shape, or texture/structure of the product. The product must remain exactly as it appears in the reference image. All shadows have soft edges with a smooth gradient fade, completely avoiding floating shadows, unnatural merged 'blobs', or any long trailing effects. The shadows precisely respect the spacing and depth, creating a realistic sense of layered composition and three-dimensional form while maintaining a perfectly clean surrounding white space. The background is a clean, pure white without any visible texture or color contamination. The overall image quality is characterized by high clarity, balanced contrast, and a realistic depth of field, presenting the product with a premium commercial aesthetic. All product logos, text, and original product colors are strictly maintained exactly as they are in the original design.

Additional Instructions: ${settings.concept || 'None'}
Camera & Lighting Setup: ${formatCameraSettings(settings.camera)}
Material Characteristics: ${settings.productMaterial}`;
  } else if (settings.visualStyle === "WHITE_BG_WEBSITE") {
    if (settings.whiteBgWebPromptType === 'B') {
      finalPrompt = `
Prompt B:
Ultra realistic studio enhancement from a clean white background product image. 

Strict preservation (VERY IMPORTANT): 
keep the product exactly as original  
do NOT change the camera angle or perspective
do NOT change shape, structure, proportions  
do NOT change color, material, or texture  
preserve all original edges and fine details  
no reinterpretation or redesign  

Lighting (premium look): 
strong directional key light from LEFT at 45 degrees  
soft fill light from front to keep product bright and clear  
subtle rim highlight on edges to enhance depth and volume  
lighting style: high-end EU/US commercial (like Caraway, Our Place)  
clean, crisp highlights, no overexposure  

Shadow (key part): 
strictly limited to a soft contact shadow directly beneath the product base  
NO long, elongated, or trailing cast shadows  
shadow must NOT extend far from the product  
soft edges with smooth gradient fade  
shadow attached to product (no floating)  
slightly darker near the base, diffusing quickly outward  

Contact shadow: 
add a tight, soft contact shadow directly under the product  
enhances grounding and realism without adding directional length  

Image quality: 
high contrast but balanced  
sharp, clean, premium commercial clarity  
preserve full detail in both highlights and shadows  

Background: 
pure white or very subtle white gradient  
clean studio environment, no color cast  

Final result: 
product looks grounded, dimensional, and high-end  
realistic lighting and shadow like professional studio photography
      `;
    } else {
      finalPrompt = `
Prompt A: 
Ultra realistic product enhancement from a clean white background product image. Keep the product 100% unchanged: absolutely do not alter the camera angle, perspective, shape, structure, proportions, or materials do not change color, texture, or surface details preserve all original edges, contours, and fine details Lighting – high-end studio (neutral white balance): strong directional key light (premium EU/US commercial style) neutral white light (around 5500K–6000K), no warm or yellow color cast clean, sharp highlights with full detail retention no blown-out or clipped highlights Shadow – defined and grounded: strictly limited to a soft contact shadow directly beneath the product base, NO long or trailing cast shadows, clearly visible well-defined contact shadow, slightly stronger density for a solid grounded feel, smooth gradient falloff diffusing quickly outward, preserve detail in shadow, no crushed blacks Color & tone control: accurate, true-to-life product color neutral whites, clean background (no yellow/green tint) balanced contrast with preserved midtones Enhance image quality: high clarity, crisp edges, sharp micro-contrast realistic depth and separation no artificial HDR or overprocessing Background: pure white or very subtle neutral grey-white gradient clean studio look, no color contamination Final result: product remains identical to original input strong, grounded contact shadow like premium commercial shoot neutral, clean white balance (catalog-ready) high-end advertising quality, natural and realistic
      `;
    }
  } else if (settings.visualStyle === "CONCEPT" || settings.visualStyle === "TECH_PS") {
    const thinkingPrompt = `
      Act as an expert AI image generation prompt engineer and professional product photographer.
      Write a highly detailed, descriptive, and professional image generation prompt (in English) for a product photography shot.
      
      Product: ${settings.productName}
      Creative Concept/Theme: ${settings.concept}
      Placement and Proportion: ${settings.placement}
      Props to include: ${formatProps(settings.props)}
      Camera & Lighting Setup: ${formatCameraSettings(settings.camera)}
      
      Instructions for the prompt:
      - Describe the product's placement, lighting, shadows, and reflections in detail.
      - Describe the background and environment based on the concept.
      - Ensure the prompt emphasizes photorealism, 8k resolution, and high-end commercial aesthetic.
      - ONLY output the final prompt text, no explanations.
    `;
    const thinkingResponse = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: thinkingPrompt
    });
    finalPrompt = thinkingResponse.text || "";
  } else if (settings.visualStyle === "COLOR_CHANGE") {
    const colorDetails = settings.colorChanges.map(c => {
      let detail = `${c.partName}: `;
      if (c.pantoneCode) detail += `Pantone ${c.pantoneCode}, `;
      if (c.description) detail += `${c.description}, `;
      if (c.sampleImage) detail += `refer to the provided color sample image for this part, `;
      return detail.trim().replace(/,$/, '');
    }).join("; ");

    finalPrompt = `
      Change the color of the ${settings.productName} according to these specifications:
      ${colorDetails}.
      IMPORTANT: Maintain all original textures, labels, and material properties (e.g., metallic, matte, glossy). 
      The lighting and environment from the original image should be preserved.
      Output: High-fidelity, realistic color modification, 8k resolution.
    `;
  } else if (settings.visualStyle === "STUDIO") {
    const spaceMap: Record<string, string> = {
      "TOP": "top",
      "BOTTOM": "bottom",
      "LEFT": "left side",
      "RIGHT": "right side",
      "NONE": ""
    };
    
    const selectedSpaces = settings.emptySpacePosition
      .filter(s => s !== "NONE")
      .map(s => spaceMap[s])
      .join(" and ");

    const spaceInstruction = selectedSpaces 
      ? `Leave empty space at the ${selectedSpaces} of the frame for text overlay.` 
      : "";
    
    const thinkingPrompt = `
      Act as an expert AI image generation prompt engineer and professional product photographer.
      Write a highly detailed, descriptive, and professional image generation prompt (in English) for a minimalist studio product shot.
      
      Product: ${settings.productName}
      Creative Concept: ${settings.concept}
      Placement and Proportion: ${settings.placement}
      Props to include: ${formatProps(settings.props)}
      Background: Plain paper background in a soft pastel color that matches the product's primary color.
      Empty Space Requirement: ${spaceInstruction}
      Composition: The product and props must be neatly arranged and fit entirely within the frame.
      Camera & Lighting Setup: ${formatCameraSettings(settings.camera)}
      
      Instructions for the prompt:
      - Emphasize clean, minimalist, high-end studio photography.
      - Describe the soft, professional studio lighting and subtle shadows.
      - Ensure the prompt emphasizes photorealism, 8k resolution, and commercial aesthetic.
      - ONLY output the final prompt text, no explanations.
    `;
    
    const thinkingResponse = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
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
  } else if (settings.referenceImage && (settings.visualStyle === "TECH_EFFECTS" || settings.visualStyle === "WHITE_BG_RETOUCH" || settings.visualStyle === "WHITE_BG_WEBSITE" || settings.visualStyle === "CONCEPT")) {
    parts.push({ inlineData: { data: settings.referenceImage.split(',')[1], mimeType: 'image/png' } });
  }
  
  if (settings.productImages.length > 0 && settings.visualStyle !== "SCENE_STAGING") {
    settings.productImages.forEach(img => parts.push({ inlineData: { data: img.split(',')[1], mimeType: 'image/png' } }));
  }

  try {
    let modelName = settings.aiModel;
    let imageConfig: any = { aspectRatio: settings.aspectRatio };

    if (modelName === 'gemini-3.1-flash-image-preview' || settings.imageSize === '2K' || settings.imageSize === '4K' || settings.aspectRatio === '1:4' || settings.aspectRatio === '4:1') {
      modelName = 'gemini-3.1-flash-image-preview';
      imageConfig.imageSize = settings.imageSize;
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts },
      config: { imageConfig }
    });
    if (!response.candidates?.[0]?.content?.parts) throw new Error("AI không phản hồi.");
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    throw new Error("Không có ảnh.");
  } catch (error: any) { throw error; }
};