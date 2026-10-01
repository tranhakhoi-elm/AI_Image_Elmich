import React, { useRef } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Image as ImageIcon, Upload, X } from 'lucide-react';
import { NodeHeader } from './NodeHeader';
import { ProductImageNodeData } from '../types';

interface Props {
  id: string;
  data: ProductImageNodeData;
}

export const ProductImageNode: React.FC<Props> = ({ id, data }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const images = data.images || [];

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const base64List: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve(ev.target?.result as string);
        reader.readAsDataURL(file);
      });
      base64List.push(base64);
    }

    const nextImages = [...images, ...base64List].slice(0, 5);
    window.dispatchEvent(
      new CustomEvent('elmich:canvas-node-update', {
        detail: { nodeId: id, data: { ...data, images: nextImages } },
      })
    );
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    const nextImages = images.filter((_, i) => i !== index);
    window.dispatchEvent(
      new CustomEvent('elmich:canvas-node-update', {
        detail: { nodeId: id, data: { ...data, images: nextImages } },
      })
    );
  };

  return (
    <div className="w-80 rounded-2xl bg-[#242526] border-2 border-[#3E4042] shadow-2xl overflow-hidden hover:border-amber-500/60 transition-all text-white">
      {/* Cổng Vào (Input) */}
      <Handle
        type="target"
        position={Position.Left}
        id="in"
        style={{ top: '50%' }}
        className="!w-4 !h-4 !bg-[#18191A] !border-2 !border-[#1877F2] hover:!border-cyan-400 hover:!scale-125 transition-all shadow-md cursor-crosshair !-left-2"
        title="Nhận ảnh từ Node AI hoặc nguồn khác (Input)"
      />

      <NodeHeader
        title={data.label || 'Ảnh'}
        category="input"
        icon={<ImageIcon size={15} />}
        status={data.status}
      />

      <div className="p-3.5 space-y-3">
        <div className="flex items-center justify-between text-[11px] text-gray-400">
          <span>Tải 1-5 ảnh sản phẩm</span>
          <span className="font-mono text-amber-400 font-bold">{images.length}/5 ảnh</span>
        </div>

        {images.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="relative aspect-square rounded-xl overflow-hidden border border-[#3E4042] bg-[#18191A] group"
              >
                <img src={img} alt={`Product ${idx}`} className="w-full h-full object-contain" />
                <button
                  onClick={() => removeImage(idx)}
                  className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-xl border border-dashed border-[#3E4042] hover:border-amber-400 text-gray-400 hover:text-amber-400 flex flex-col items-center justify-center text-[10px] gap-1 bg-[#18191A]/50 transition-colors"
              >
                <Upload size={14} />
                <span>+ Thêm</span>
              </button>
            )}
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="h-32 border-2 border-dashed border-[#3E4042] hover:border-amber-500/70 rounded-xl bg-[#18191A]/40 flex flex-col items-center justify-center text-center p-3 cursor-pointer group transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Upload size={16} />
            </div>
            <span className="text-xs font-semibold text-gray-300">Kéo thả hoặc click tải ảnh</span>
            <span className="text-[10px] text-gray-500 mt-0.5">Hỗ trợ PNG, JPG (tối đa 5 ảnh)</span>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleUpload}
        />
      </div>

      {/* Cổng Ra Duy Nhất (Output) */}
      <Handle
        type="source"
        position={Position.Right}
        id="out"
        style={{ top: '50%' }}
        className="!w-4 !h-4 !bg-[#18191A] !border-2 !border-emerald-400 hover:!border-cyan-400 hover:!scale-125 transition-all shadow-md cursor-crosshair !-right-2"
        title="Dữ liệu ảnh xuất ra (Output ➔ Nối vào các node tiếp theo)"
      />
    </div>
  );
};
