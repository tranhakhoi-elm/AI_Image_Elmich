import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Tag } from 'lucide-react';
import { NodeHeader } from './NodeHeader';
import { ProductSpecNodeData } from '../types';

interface Props {
  id: string;
  data: ProductSpecNodeData;
}

export const ProductSpecNode: React.FC<Props> = ({ id, data }) => {
  const updateField = (field: keyof ProductSpecNodeData, value: string) => {
    window.dispatchEvent(
      new CustomEvent('elmich:canvas-node-update', {
        detail: { nodeId: id, data: { ...data, [field]: value } },
      })
    );
  };

  return (
    <div className="w-80 rounded-2xl bg-[#242526] border-2 border-[#3E4042] shadow-2xl overflow-hidden hover:border-amber-500/60 transition-all text-white relative">
      {/* Cổng Vào Duy Nhất (Input) */}
      <Handle
        type="target"
        position={Position.Left}
        id="in"
        style={{ top: '50%' }}
        className="!w-4 !h-4 !bg-[#18191A] !border-2 !border-[#1877F2] hover:!border-cyan-400 hover:!scale-125 transition-all shadow-md cursor-crosshair !-left-2"
        title="Cổng nhận dữ liệu (Input)"
      />

      <NodeHeader
        title={data.label || 'Thông Số'}
        category="input"
        icon={<Tag size={15} />}
        status={data.status}
      />

      <div className="p-3.5 space-y-3">
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            Tên sản phẩm Elmich
          </label>
          <input
            type="text"
            value={data.productName || ''}
            onChange={(e) => updateField('productName', e.target.value)}
            placeholder="Ví dụ: Ấm siêu tốc Elmich Inox 304..."
            className="w-full bg-[#18191A] border border-[#3E4042] focus:border-[#1877F2] rounded-xl px-3 py-2 text-xs text-white outline-none transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              Mã sản phẩm (SKU)
            </label>
            <input
              type="text"
              value={data.productCode || ''}
              onChange={(e) => updateField('productCode', e.target.value)}
              placeholder="EL-3849..."
              className="w-full bg-[#18191A] border border-[#3E4042] focus:border-[#1877F2] rounded-xl px-3 py-2 text-xs text-white outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              Dài x Rộng x Cao
            </label>
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={data.length || ''}
                onChange={(e) => updateField('length', e.target.value)}
                placeholder="D"
                className="w-full bg-[#18191A] border border-[#3E4042] focus:border-[#1877F2] rounded-lg px-2 py-1.5 text-[11px] text-white outline-none text-center"
              />
              <span className="text-gray-500 text-xs">x</span>
              <input
                type="text"
                value={data.width || ''}
                onChange={(e) => updateField('width', e.target.value)}
                placeholder="R"
                className="w-full bg-[#18191A] border border-[#3E4042] focus:border-[#1877F2] rounded-lg px-2 py-1.5 text-[11px] text-white outline-none text-center"
              />
              <span className="text-gray-500 text-xs">x</span>
              <input
                type="text"
                value={data.height || ''}
                onChange={(e) => updateField('height', e.target.value)}
                placeholder="C"
                className="w-full bg-[#18191A] border border-[#3E4042] focus:border-[#1877F2] rounded-lg px-2 py-1.5 text-[11px] text-white outline-none text-center"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Cổng Ra Duy Nhất (Output) */}
      <Handle
        type="source"
        position={Position.Right}
        id="out"
        style={{ top: '50%' }}
        className="!w-4 !h-4 !bg-[#18191A] !border-2 !border-emerald-400 hover:!border-cyan-400 hover:!scale-125 transition-all shadow-md cursor-crosshair !-right-2"
        title="Thông số kỹ thuật sản phẩm (Output ➔ Nối vào Concept / Sinh Ảnh / Barcode)"
      />
    </div>
  );
};
