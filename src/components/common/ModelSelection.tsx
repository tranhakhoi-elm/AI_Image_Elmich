import React from 'react';
import { ImageSize } from '../../../types';

interface ModelSelectionProps {
  imageSize: ImageSize;
  onChange: (size: ImageSize) => void;
}

/**
 * Bộ chọn chất lượng ảnh (1K/2K/4K) dùng chung cho các workflow tạo ảnh
 * trong Studio. Tách ra từ App.tsx (hàm `renderModelSelection`).
 */
export const ModelSelection: React.FC<ModelSelectionProps> = ({ imageSize, onChange }) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <label className="block text-[9px] font-bold text-white uppercase mb-1">Chất lượng hình ảnh</label>
      <div className="grid grid-cols-3 gap-2">
        {(['1K', '2K', '4K'] as ImageSize[]).map(size => (
          <button
            key={size}
            onClick={() => onChange(size)}
            className={`py-2 rounded-lg border text-[9px] font-bold transition-all ${imageSize === size ? 'bg-[#1877F2] text-white border-[#1877F2]' : 'bg-[#242526] shadow-sm text-white border-[#3E4042] text-white hover:text-white'}`}
          >
            {size === '1K' ? '1K Standard' : size === '2K' ? '2K Pro' : '4K Ultra HD'}
          </button>
        ))}
      </div>
    </div>
  </div>
);
