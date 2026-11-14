export const resizeImage = (file: File, maxDim: number = 1024, quality: number = 0.85): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error("Lỗi đọc ảnh"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Lỗi file"));
    reader.readAsDataURL(file);
  });
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Chuyển đổi an toàn Base64 data URI thành Blob nhị phân để tránh giới hạn dung lượng URL trình duyệt.
 */
export const dataUrlToBlob = (dataUrl: string): Blob => {
  const parts = dataUrl.split(',');
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/png';
  const bstr = atob(parts[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

/**
 * Tải file ảnh an toàn bằng Blob URL (triệt tiêu hoàn toàn lỗi 'Not supported file' / corrupted download).
 */
export const downloadImageFile = async (imageUrl: string, filename: string): Promise<void> => {
  try {
    // Chuẩn hóa tên file: loại bỏ dấu tiếng Việt, khoảng trắng và ký tự lạ để tránh lỗi hệ điều hành
    const safeFilename = filename
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_+/g, '_');

    let blob: Blob;
    // Dùng native fetch() trực tiếp trên Data URL hoặc HTTP URL — browser C++ xử lý không bao giờ lỗi bộ nhớ
    try {
      const res = await fetch(imageUrl);
      blob = await res.blob();
    } catch {
      // Fallback nếu fetch bị chặn
      blob = dataUrlToBlob(imageUrl);
    }

    let finalFilename = safeFilename;
    const actualMime = (blob.type || '').toLowerCase();
    if (actualMime.includes('jpeg') || actualMime.includes('jpg')) {
      if (finalFilename.toLowerCase().endsWith('.png')) {
        finalFilename = finalFilename.slice(0, -4) + '.jpg';
      } else if (!finalFilename.toLowerCase().endsWith('.jpg') && !finalFilename.toLowerCase().endsWith('.jpeg')) {
        finalFilename = finalFilename.replace(/\.[a-zA-Z0-9]+$/, '') + '.jpg';
      }
    } else if (actualMime.includes('png')) {
      if (finalFilename.toLowerCase().endsWith('.jpg') || finalFilename.toLowerCase().endsWith('.jpeg')) {
        finalFilename = finalFilename.replace(/\.(jpg|jpeg)$/i, '.png');
      } else if (!finalFilename.toLowerCase().endsWith('.png')) {
        finalFilename = finalFilename.replace(/\.[a-zA-Z0-9]+$/, '') + '.png';
      }
    }

    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = blobUrl;
    link.download = finalFilename;
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    }, 2000);
  } catch (err) {
    console.error("Lỗi khi tải ảnh:", err);
    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = safeFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

/**
 * Chuyển đổi PNG Data URL thành JPEG với chất lượng tùy chọn để giảm dung lượng file khi tải về.
 */
export const convertDataUrlToJpeg = (dataUrl: string, quality: number = 0.92): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } else {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
};

