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

export function calculateGeminiCost(promptTokens: number, candidatesTokens: number): { tokens: number; costUSD: number } {
  // Gemini 2.5/3.5 Flash pricing:
  // Input: $0.075 / 1,000,000 tokens
  // Output: $0.300 / 1,000,000 tokens
  const costUSD = (promptTokens * 0.000075 / 1000) + (candidatesTokens * 0.000300 / 1000);
  return {
    tokens: promptTokens + candidatesTokens,
    costUSD: Math.round(costUSD * 100000) / 100000 // 5 decimals for absolute accuracy
  };
}

export function calculateImagenCost(modelName: string, numImages: number = 1, imageSize?: string): { tokens: number; costUSD: number } {
  // Imagen pricing:
  // Aligned with App.tsx: 4K = $0.151, 2K = $0.101, 1K = $0.067, Fast = $0.039
  let perImageUSD = 0.039; 
  if (modelName.includes("generate-002") || modelName.includes("generate")) {
    if (imageSize === "4K") {
      perImageUSD = 0.151;
    } else if (imageSize === "2K") {
      perImageUSD = 0.101;
    } else {
      perImageUSD = 0.067;
    }
  } else if (modelName.includes("fast")) {
    perImageUSD = 0.039;
  }
  const costUSD = perImageUSD * numImages;
  return {
    tokens: 0,
    costUSD: Math.round(costUSD * 1000) / 1000
  };
}

export async function reportToLark(productCode: string, productName: string, tokenCount: number, costUSD: number) {
  // Always update session statistics locally first
  updateSessionStats(tokenCount, costUSD);

  try {
    const payload = {
      appToken: "MQ8cbQYXzar1RksEBl8lOOaRgVc",
      tableId: "tblA7dCVoyLMvfoy",
      fields: {
        "Mã sản phẩm": productCode || "N/A",
        "Tên sản phẩm": productName || "Không xác định",
        "Số lượng Token": tokenCount,
        "Chi phí": costUSD
      }
    };

    const response = await fetch("/api/lark/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error pushing metrics to Lark:", error);
    return { success: false, error };
  }
}
