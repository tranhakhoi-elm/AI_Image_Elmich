const fs = require('fs');

let serviceCode = fs.readFileSync('services/geminiService.ts', 'utf8');

// The replacement logic for generateProductImage
const genImagePattern = `
    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts },
      config: { imageConfig }
    });
    if (!response.candidates?.[0]?.content?.parts) throw new Error("AI không phản hồi.");
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return \`data:\${part.inlineData.mimeType};base64,\${part.inlineData.data}\`;
    }
    throw new Error("Không có ảnh.");
`;

const newGenImageLogic = `
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
      return \`data:image/jpeg;base64,\${response.generatedImages[0].image.imageBytes}\`;
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
        if (part.inlineData) return \`data:\${part.inlineData.mimeType};base64,\${part.inlineData.data}\`;
      }
      throw new Error("Không có ảnh.");
    }
`;

serviceCode = serviceCode.replace(genImagePattern, newGenImageLogic.trim());

// For editProductImage, always fallback since it has an image part
const editImagePattern = `
    const response = await ai.models.generateContent({
      model: finalModelName,
      contents: { parts },
      config: { imageConfig }
    });
    
    if (!response.candidates?.[0]?.content?.parts) throw new Error("AI không phản hồi.");
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return \`data:\${part.inlineData.mimeType};base64,\${part.inlineData.data}\`;
    }
    throw new Error("Không có ảnh.");
`;

const newEditImageLogic = `
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
      if (part.inlineData) return \`data:\${part.inlineData.mimeType};base64,\${part.inlineData.data}\`;
    }
    throw new Error("Không có ảnh.");
`;

serviceCode = serviceCode.replace(editImagePattern, newEditImageLogic.trim());

// For generateImageForChat
const chatImagePattern = `
    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any
        }
      }
    });

    if (!response.candidates?.[0]?.content?.parts) throw new Error("AI không phản hồi.");
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return \`data:\${part.inlineData.mimeType};base64,\${part.inlineData.data}\`;
    }
    throw new Error("Không có ảnh.");
`;

const newChatImageLogic = `
    if (modelName.startsWith('imagen') && parts.length === 1) {
      const response = await ai.models.generateImages({
        model: modelName,
        prompt: parts[0].text,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: aspectRatio as any || '1:1',
        }
      });
      if (!response.generatedImages?.[0]?.image?.imageBytes) throw new Error("AI không phản hồi.");
      return \`data:image/jpeg;base64,\${response.generatedImages[0].image.imageBytes}\`;
    } else {
      let fallbackModel = modelName;
      if (modelName.startsWith('imagen-3.0-generate-002')) {
          fallbackModel = 'gemini-3.1-flash-image-preview';
      } else if (modelName.startsWith('imagen')) {
          fallbackModel = 'gemini-2.5-flash-image';
      }

      const response = await ai.models.generateContent({
        model: fallbackModel,
        contents: { parts },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as any
          }
        }
      });

      if (!response.candidates?.[0]?.content?.parts) throw new Error("AI không phản hồi.");
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) return \`data:\${part.inlineData.mimeType};base64,\${part.inlineData.data}\`;
      }
      throw new Error("Không có ảnh.");
    }
`;

serviceCode = serviceCode.replace(chatImagePattern, newChatImageLogic.trim());

fs.writeFileSync('services/geminiService.ts', serviceCode);
console.log("Updated API calls to properly use imagen models");
