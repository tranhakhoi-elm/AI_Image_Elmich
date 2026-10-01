import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Sparkles, Layers } from 'lucide-react';
import { NodeHeader } from './NodeHeader';
import { MaterialDetectorNodeData } from '../types';
import { analyzeProductMaterials } from '../../../../services/geminiService';

interface Props {
  id: string;
  data: MaterialDetectorNodeData;
}

export const MaterialDetectorNode: React.FC<Props> = ({ id, data }) => {
  const categories = data.selectedCategories || [];
  const description = data.description || '';

  const runAnalysis = async () => {
    if (!data.inputImage) {
      window.dispatchEvent(
        new CustomEvent('elmich:canvas-toast', {
          detail: { message: 'Chưa có ảnh đầu vào. Hãy nối cổng từ Node Ảnh Sản Phẩm!', type: 'error' },
        })
      );
      return;
    }

    window.dispatchEvent(
      new CustomEvent('elmich:canvas-node-update', {
        detail: { nodeId: id, data: { ...data, status: 'running' } },
      })
    );

    try {
      const result = await analyzeProductMaterials(data.inputImage);
      window.dispatchEvent(
        new CustomEvent('elmich:canvas-node-update', {
          detail: {
            nodeId: id,
            data: {
              ...data,
              status: 'success',
              selectedCategories: result.categories,
              description: result.description,
            },
          },
        })
      );
    } catch (err: any) {
      console.error('Material detection error:', err);
      window.dispatchEvent(
        new CustomEvent('elmich:canvas-node-update', {
          detail: { nodeId: id, data: { ...data, status: 'error', errorMessage: err.message } },
        })
      );
    }
  };

  const updateDescription = (desc: string) => {
    window.dispatchEvent(
      new CustomEvent('elmich:canvas-node-update', {
        detail: { nodeId: id, data: { ...data, description: desc } },
      })
    );
  };

  return (
    <div className="w-80 rounded-2xl bg-[#242526] border-2 border-[#3E4042] shadow-2xl overflow-hidden hover:border-purple-500/60 transition-all text-white">
      {/* Cổng Vào Duy Nhất (Input) */}
      <Handle
        type="target"
        position={Position.Left}
        id="in"
        style={{ top: '50%' }}
        className="!w-4 !h-4 !bg-[#18191A] !border-2 !border-[#1877F2] hover:!border-cyan-400 hover:!scale-125 transition-all shadow-md cursor-crosshair !-left-2"
        title="Dữ liệu đầu vào (Input ➔ Nhận từ Node Ảnh)"
      />

      <NodeHeader
        title={data.label || 'Chất Liệu'}
        category="analysis"
        icon={<Sparkles size={15} />}
        status={data.status}
        onRun={runAnalysis}
      />

      <div className="p-3.5 space-y-3">
        {data.inputImage ? (
          <div className="flex items-center gap-2 p-2 rounded-xl bg-[#18191A] border border-[#3E4042]">
            <img src={data.inputImage} alt="Input" className="w-10 h-10 object-contain rounded-lg border border-[#3E4042]" />
            <div className="min-w-0">
              <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                ✓ Đã nhận ảnh đầu vào
              </span>
              <span className="text-[9px] text-gray-400">Sẵn sàng bóc tách đặc tính vật liệu</span>
            </div>
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-purple-950/20 border border-purple-900/40 text-[11px] text-purple-300 text-center">
            Nối dây từ cổng Node Ảnh Sản Phẩm vào đây
          </div>
        )}

        {categories.length > 0 && (
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Chất liệu phát hiện:</span>
            <div className="flex flex-wrap gap-1">
              {categories.map((cat) => (
                <span
                  key={cat}
                  className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            Đặc tính bề mặt (PBR Material)
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => updateDescription(e.target.value)}
            placeholder="AI sẽ tự động nhận diện inox xước, nhựa nhám, kính cường lực..."
            className="w-full bg-[#18191A] border border-[#3E4042] focus:border-[#1877F2] rounded-xl p-2.5 text-xs text-white outline-none resize-none transition-colors"
          />
        </div>
      </div>

      {/* Cổng Ra Duy Nhất (Output) */}
      <Handle
        type="source"
        position={Position.Right}
        id="out"
        style={{ top: '50%' }}
        className="!w-4 !h-4 !bg-[#18191A] !border-2 !border-emerald-400 hover:!border-cyan-400 hover:!scale-125 transition-all shadow-md cursor-crosshair !-right-2"
        title="Dữ liệu chất liệu PBR (Output ➔ Nối vào Concept / Sinh Ảnh)"
      />
    </div>
  );
};
