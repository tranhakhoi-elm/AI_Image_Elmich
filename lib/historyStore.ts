import { getFirestore, getStorage, getGCSBucketName } from './googleCloud';
import crypto from 'crypto';

export interface ImageHistoryRecord {
  id: string;
  url: string;
  prompt: string;
  productName?: string;
  productCode?: string;
  visualStyle?: string;
  aspectRatio?: string;
  imageSize?: string;
  variant?: number;
  costUSD?: number;
  timestamp: number;
  createdAt?: string;
}

export interface ChatHistoryRecord {
  id: string;
  title: string;
  timestamp: number;
  messages: any[];
  updatedAt?: string;
}

// In-memory fallback buffer (holds up to 200 items in case Firestore is unconfigured)
const inMemoryImages: ImageHistoryRecord[] = [];
const inMemoryChats: Map<string, ChatHistoryRecord> = new Map();

/**
 * Generate a signed URL for client-side direct upload to GCS
 */
export async function createUploadUrl({ folder, contentType }: { folder: 'images' | 'chat'; contentType: string }) {
  const bucketName = getGCSBucketName();
  const storage = getStorage();

  if (!bucketName || !storage) {
    throw new Error("GCS_BUCKET_NAME hoặc Google Cloud Service Account chưa được cấu hình.");
  }

  const bucket = storage.bucket(bucketName);
  const ext = contentType.includes('png') ? 'png' : contentType.includes('jpeg') || contentType.includes('jpg') ? 'jpg' : 'bin';
  const fileName = `${folder}/${Date.now()}_${crypto.randomBytes(6).toString('hex')}.${ext}`;
  const file = bucket.file(fileName);

  const [uploadUrl] = await file.getSignedUrl({
    version: 'v4',
    action: 'write',
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    contentType,
  });

  const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;

  return {
    uploadUrl,
    publicUrl,
    fileKey: fileName,
  };
}

/**
 * Upload a Base64 data URL to GCS if configured
 */
async function uploadBase64ToGCS(base64DataUrl: string, folder: 'images' | 'chat'): Promise<string | null> {
  const bucketName = getGCSBucketName();
  const storage = getStorage();
  if (!bucketName || !storage) return null;

  try {
    const match = base64DataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) return null;

    const mimeType = match[1];
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, 'base64');
    const ext = mimeType.includes('png') ? 'png' : 'jpg';
    const fileName = `${folder}/${Date.now()}_${crypto.randomBytes(6).toString('hex')}.${ext}`;

    const bucket = storage.bucket(bucketName);
    const file = bucket.file(fileName);

    await file.save(buffer, {
      metadata: { contentType: mimeType },
      resumable: false,
    });

    return `https://storage.googleapis.com/${bucketName}/${fileName}`;
  } catch (err: any) {
    console.warn("Could not upload Base64 image to GCS:", err.message);
    return null;
  }
}

/**
 * Save an image record into Firestore (with in-memory fallback)
 */
export async function saveImageRecord(data: Partial<ImageHistoryRecord>): Promise<ImageHistoryRecord> {
  let finalUrl = data.url || '';

  // If URL is a large Base64 string and GCS is available, upload to GCS first
  if (finalUrl.startsWith('data:image/')) {
    const gcsUrl = await uploadBase64ToGCS(finalUrl, 'images');
    if (gcsUrl) {
      finalUrl = gcsUrl;
    }
  }

  const id = data.id || `img_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const timestamp = data.timestamp || Date.now();

  const record: ImageHistoryRecord = {
    id,
    url: finalUrl,
    prompt: data.prompt || '',
    productName: data.productName || '',
    productCode: data.productCode || '',
    visualStyle: data.visualStyle || 'CONCEPT',
    aspectRatio: data.aspectRatio || '1:1',
    imageSize: data.imageSize || '1K',
    variant: data.variant || 1,
    costUSD: data.costUSD || 0,
    timestamp,
    createdAt: new Date(timestamp).toISOString(),
  };

  // Always update in-memory cache
  inMemoryImages.unshift(record);
  if (inMemoryImages.length > 200) inMemoryImages.pop();

  // Save to Firestore if available
  const db = getFirestore();
  if (db) {
    try {
      // Don't save raw Base64 > 800KB directly in Firestore to avoid 1MB document limit
      const firestoreData = { ...record };
      if (firestoreData.url.startsWith('data:image/') && firestoreData.url.length > 800000) {
        // Truncate or omit raw base64 from firestore document if not yet in GCS
        firestoreData.url = firestoreData.url.substring(0, 100) + '...[truncated]';
      }
      await db.collection('elmich_history_images').doc(id).set(firestoreData);
    } catch (err: any) {
      console.warn("Firestore error saving image record (falling back to memory):", err.message);
    }
  }

  return record;
}

/**
 * List image records from Firestore with in-memory fallback
 */
export async function listImageRecords({ limit = 30, cursor }: { limit?: number; cursor?: string } = {}) {
  const db = getFirestore();

  if (db) {
    try {
      let query = db.collection('elmich_history_images')
        .orderBy('timestamp', 'desc')
        .limit(limit + 1);

      if (cursor) {
        const cursorDoc = await db.collection('elmich_history_images').doc(cursor).get();
        if (cursorDoc.exists) {
          query = query.startAfter(cursorDoc);
        }
      }

      const snapshot = await query.get();
      const docs = snapshot.docs;
      const hasMore = docs.length > limit;
      const items = docs.slice(0, limit).map(d => ({ ...d.data() } as ImageHistoryRecord));
      const nextCursor = hasMore ? docs[limit - 1]?.id : undefined;

      return { items, nextCursor };
    } catch (err: any) {
      console.warn("Firestore error listing image records (falling back to memory):", err.message);
    }
  }

  // Fallback to in-memory images
  const startIndex = cursor ? inMemoryImages.findIndex(i => i.id === cursor) + 1 : 0;
  const sliced = inMemoryImages.slice(startIndex, startIndex + limit);
  const nextCursor = startIndex + limit < inMemoryImages.length ? sliced[sliced.length - 1]?.id : undefined;

  return { items: sliced, nextCursor };
}

/**
 * Save chat session into Firestore (with in-memory fallback)
 */
export async function saveChatSession(data: any): Promise<{ id: string; success: boolean }> {
  const id = data.id || `chat_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const timestamp = data.timestamp || Date.now();

  const record: ChatHistoryRecord = {
    id,
    title: data.title || 'Đoạn chat mới',
    timestamp,
    messages: data.messages || [],
    updatedAt: new Date().toISOString(),
  };

  inMemoryChats.set(id, record);

  const db = getFirestore();
  if (db) {
    try {
      await db.collection('elmich_history_chats').doc(id).set(record);
    } catch (err: any) {
      console.warn("Firestore error saving chat session:", err.message);
    }
  }

  return { id, success: true };
}

/**
 * List chat sessions from Firestore with in-memory fallback
 */
export async function listChatSessions({ limit = 30, cursor }: { limit?: number; cursor?: string } = {}) {
  const db = getFirestore();

  if (db) {
    try {
      let query = db.collection('elmich_history_chats')
        .orderBy('timestamp', 'desc')
        .limit(limit + 1);

      if (cursor) {
        const cursorDoc = await db.collection('elmich_history_chats').doc(cursor).get();
        if (cursorDoc.exists) {
          query = query.startAfter(cursorDoc);
        }
      }

      const snapshot = await query.get();
      const docs = snapshot.docs;
      const hasMore = docs.length > limit;
      const items = docs.slice(0, limit).map(d => ({ ...d.data() } as ChatHistoryRecord));
      const nextCursor = hasMore ? docs[limit - 1]?.id : undefined;

      return { items, nextCursor };
    } catch (err: any) {
      console.warn("Firestore error listing chat sessions:", err.message);
    }
  }

  // Fallback to in-memory chats
  const allChats = Array.from(inMemoryChats.values()).sort((a, b) => b.timestamp - a.timestamp);
  const startIndex = cursor ? allChats.findIndex(c => c.id === cursor) + 1 : 0;
  const sliced = allChats.slice(startIndex, startIndex + limit);
  const nextCursor = startIndex + limit < allChats.length ? sliced[sliced.length - 1]?.id : undefined;

  return { items: sliced, nextCursor };
}
