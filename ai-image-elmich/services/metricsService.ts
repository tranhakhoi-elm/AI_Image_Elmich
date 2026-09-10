export interface TokenUsageReport {
  productCode: string;
  productName: string;
  tokenCount: number;
  costUSD: number;
}

// Keep an in-memory or localStorage cache for current session totals
export function updateSessionStats(tokens: number, costUSD: number) {
  try {
    const sessionTokens = parseInt(sessionStorage.getItem('elmich_session_tokens') || '0', 10);
    const sessionCost = parseFloat(sessionStorage.getItem('elmich_session_cost') || '0');
    
    sessionStorage.setItem('elmich_session_tokens', (sessionTokens + tokens).toString());
    sessionStorage.setItem('elmich_session_cost', (sessionCost + costUSD).toString());
  } catch (e) {
    console.error("Failed to update session stats:", e);
  }
}

export function calculateGeminiCost(modelName: string, promptTokens: number, candidatesTokens: number): { tokens: number; costUSD: number } {
  // Bảng giá Gemini (Cập nhật cho Flash và Pro)
  let inputPricePerM = 0.075;
  let outputPricePerM = 0.300;

  if (modelName.includes("pro")) {
    // Gemini 1.5/2.5 Pro pricing: $1.25 per 1M input, $5.00 per 1M output
    inputPricePerM = 1.25;
    outputPricePerM = 5.00;
  }

  const costUSD = (promptTokens * inputPricePerM / 1000000) + (candidatesTokens * outputPricePerM / 1000000);
  return {
    tokens: promptTokens + candidatesTokens,
    costUSD: Math.round(costUSD * 100000) / 100000
  };
}

export function calculateImagenCost(modelName: string, numImages: number = 1, imageSize?: string): { tokens: number; costUSD: number } {
  // Imagen 3 Pricing: ~$0.03 per image. 
  // Nếu có tính năng upscale/chất lượng cao, giá có thể gấp đôi, nhưng mặc định chuẩn là 0.03.
  let perImageUSD = 0.03; 
  
  const isHighQuality = 
    imageSize === "4K" ||
    imageSize === "2K";

  if (isHighQuality) {
    if (imageSize === "4K") {
      perImageUSD = 0.06; // Estimated upscale cost
    } else if (imageSize === "2K") {
      perImageUSD = 0.045;
    }
  }

  const costUSD = perImageUSD * numImages;
  return {
    tokens: 0,
    costUSD: Math.round(costUSD * 1000) / 1000
  };
}

export async function reportToLark(productCode: string, productName: string, tokenCount: number, costUSD: number, taskName: string = "Không xác định") {
  // Always update session statistics locally first
  updateSessionStats(tokenCount, costUSD);

  try {
    // Chỉ lấy Ngày Tháng Năm (Định dạng DD/MM/YYYY)
    const now = new Date();
    const dateOnlyString = now.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }); 
    // Trả về dd/mm/yyyy

    const payload = {
      values: [
        [
          productCode || "N/A",
          productName || "Không xác định",
          tokenCount,
          costUSD,
          dateOnlyString,
          taskName
        ]
      ]
    };

    const response = await fetch("/api/sheets/report", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (data.error) {
       console.error("Error from Google Sheets:", data.error);
       return { success: false, error: data.error };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error pushing metrics to Google Sheets:", error);
    return { success: false, error };
  }
}
