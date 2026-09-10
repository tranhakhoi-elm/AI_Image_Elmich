export interface ImageHistoryInput {
  url: string;
  prompt: string;
  productName?: string;
  productCode?: string;
  visualStyle?: string;
  aspectRatio?: string;
  imageSize?: string;
  variant?: number;
  costUSD?: number;
  timestamp?: number;
}

export interface ImageHistoryItem extends ImageHistoryInput {
  id: string;
  timestamp: number;
  createdAt?: string;
}

export interface ChatHistoryItem {
  id: string;
  title: string;
  timestamp: number;
  messages: any[];
  updatedAt?: string;
}

/**
 * Log a generated or edited image to the shared history backend
 */
export async function logGeneratedImage(data: ImageHistoryInput): Promise<any> {
  try {
    const response = await fetch('/api/history/images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error: any) {
    console.warn("Could not log image history to server:", error.message);
    return null;
  }
}

/**
 * Fetch image history list from server
 */
export async function fetchImageHistory(params?: { limit?: number; cursor?: string }): Promise<{ items: ImageHistoryItem[]; nextCursor?: string }> {
  try {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.cursor) query.set('cursor', params.cursor);

    const response = await fetch(`/api/history/images?${query.toString()}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    return {
      items: data.items || [],
      nextCursor: data.nextCursor,
    };
  } catch (error: any) {
    console.warn("Could not fetch image history:", error.message);
    return { items: [] };
  }
}

/**
 * Save chat session to shared history
 */
export async function logChatSession(session: any): Promise<any> {
  try {
    const response = await fetch('/api/history/chats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error: any) {
    console.warn("Could not log chat history to server:", error.message);
    return null;
  }
}

/**
 * Fetch chat sessions from shared history
 */
export async function fetchChatHistory(params?: { limit?: number; cursor?: string }): Promise<{ items: ChatHistoryItem[]; nextCursor?: string }> {
  try {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.cursor) query.set('cursor', params.cursor);

    const response = await fetch(`/api/history/chats?${query.toString()}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    return {
      items: data.items || [],
      nextCursor: data.nextCursor,
    };
  } catch (error: any) {
    console.warn("Could not fetch chat history:", error.message);
    return { items: [] };
  }
}
