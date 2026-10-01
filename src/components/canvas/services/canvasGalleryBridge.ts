import localforage from 'localforage';
import { GeneratedImage } from '../../../../types';
import { logGeneratedImage } from '../../../../services/historyService';

export interface SaveWorkflowImageParams {
  url: string;
  prompt?: string;
  productName?: string;
  productCode?: string;
  visualStyle?: string;
  aspectRatio?: string;
  imageSize?: string;
  imageModel?: string;
  costUSD?: number;
}

/**
 * Tự động lưu ảnh được tạo từ Workflow Canvas vào:
 * 1. IndexedDB (localForage key: 'elmich_ai_gallery') để đồng bộ với Thư viện ảnh của App
 * 2. Phát custom event 'elmich:canvas-image-saved' để App.tsx cập nhật state gallery ngay lập tức
 * 3. Ghi vào Lịch sử dùng chung trên Google Cloud / Firestore qua logGeneratedImage
 */
export async function saveWorkflowImageToLibrary(params: SaveWorkflowImageParams): Promise<GeneratedImage> {
  const time = Date.now();
  const id = `canvas-${time}-${Math.random().toString(36).substring(2, 7)}`;

  // Tính chi phí tương ứng
  const cost = params.costUSD ?? (
    params.imageModel === 'PRO'
      ? (params.imageSize === '4K' ? 0.24 : 0.134)
      : (params.imageSize === '4K' ? 0.151 : params.imageSize === '2K' ? 0.101 : 0.067)
  );

  const newImage: GeneratedImage = {
    id,
    url: params.url,
    prompt: params.prompt || 'Tạo ảnh từ Workflow Canvas',
    timestamp: time,
    settings: {
      productName: params.productName || 'Sản phẩm Elmich',
      productCode: params.productCode || '',
      visualStyle: (params.visualStyle as any) || 'CONCEPT',
      aspectRatio: (params.aspectRatio as any) || '1:1',
      imageSize: (params.imageSize as any) || '1K',
      imageModel: (params.imageModel as any) || 'FLASH',
      numImages: 1,
    } as any,
    variant: 1,
  };

  // 1. Lưu ngay vào localForage
  try {
    const existing = await localforage.getItem<GeneratedImage[]>('elmich_ai_gallery');
    const galleryList = Array.isArray(existing) ? existing : [];
    // Thêm ảnh mới vào đầu mảng và lưu lại
    const updatedGallery = [newImage, ...galleryList.filter((img) => img.id !== id)];
    await localforage.setItem('elmich_ai_gallery', updatedGallery);
  } catch (err) {
    console.error('Lỗi khi lưu ảnh Workflow vào IndexedDB (elmich_ai_gallery):', err);
  }

  // 2. Phát custom event để giao diện App / GalleryRail cập nhật tức thì
  window.dispatchEvent(
    new CustomEvent('elmich:canvas-image-saved', {
      detail: newImage,
    })
  );

  // 3. Ghi vào Lịch sử dùng chung Firestore / Cloud Storage (bắn-và-quên, không chặn UI)
  logGeneratedImage({
    id: newImage.id,
    url: newImage.url,
    prompt: newImage.prompt,
    productName: newImage.settings.productName,
    productCode: newImage.settings.productCode,
    visualStyle: newImage.settings.visualStyle,
    aspectRatio: newImage.settings.aspectRatio,
    imageSize: newImage.settings.imageSize,
    variant: 1,
    costUSD: cost,
    timestamp: time,
  }).catch((err) => {
    console.warn('Lỗi ghi log lịch sử dùng chung cho ảnh Canvas:', err);
  });

  return newImage;
}
