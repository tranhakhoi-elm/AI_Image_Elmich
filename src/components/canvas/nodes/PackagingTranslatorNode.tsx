import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Languages } from 'lucide-react';
import { NodeHeader } from './NodeHeader';
import { PackagingTranslatorNodeData } from '../types';
import { analyzeAndTranslatePackaging } from '../../../../services/geminiService';

interface Props {
  id: string;
  data: PackagingTranslatorNodeData;
}

export const PackagingTranslatorNode: React.FC<Props> = ({ id, data }) => {
  const inputImage = data.inputPackagingImage;
  const translatedUrl = data.translatedImageUrl;

  const runTranslation = async () => {
    if (!inputImage) {
      window.dispatchEvent(
        new CustomEvent('elmich:canvas-toast', {
          detail: { message: 'Chưa có ảnh bao bì đầu vào! Hãy nối dây ảnh vào cổng bên trái.', type: 'error' },
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
      const result = await analyzeAndTranslatePackaging(inputImage);
      const regionsCount = result.regions?.length || 0;
      window.dispatchEvent(
        new CustomEvent('elmich:canvas-node-update', {
          detail: {
            nodeId: id,
            data: {
              ...data,
              status: 'success',
              detectedText: `Đã dịch ${regionsCount} vùng văn bản`,
            },
          },
        })
      );
    } catch (err: any) {
      console.error('Packaging translation error:', err);
      window.dispatchEvent(
        new CustomEvent('elmich:canvas-node-update', {
          detail: { nodeId: id, data: { ...data, status: 'error', errorMessage: err.message } },
        })
      );
    }
  };

  return (
    <div className="w-80 rounded-2xl bg-[#242526] border-2 border-teal-500/50 shadow-2xl overflow-hidden hover:border-teal-400 transition-all text-white">
      {/* Cổng Vào Duy Nhất (Input) */}
      <Handle
        type="target"
        position={Position.Left}
        id="in"
        style={{ top: '50%' }}
        className="!w-4 !h-4 !bg-[#18191A] !border-2 !border-[#1877F2] hover:!border-cyan-400 hover:!scale-125 transition-all shadow-md cursor-crosshair !-left-2"
        title="Ảnh bao bì gốc (Input ➔ Nhận từ Node Ảnh)"
      />

      <NodeHeader
        title={data.label || 'Dịch Bao Bì'}
        category="utility"
        icon={<Languages size={15} />}
        status={data.status}
        onRun={runTranslation}
      />

      <div className="p-3.5 space-y-3">
        {inputImage ? (
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Ảnh bao bì gốc:</span>
            <div className="relative aspect-video rounded-xl overflow-hidden border border-[#3E4042] bg-[#18191A]">
              <img src={inputImage} alt="Packaging input" className="w-full h-full object-contain" />
            </div>
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-teal-950/20 border border-teal-900/40 text-[11px] text-teal-300 text-center">
            Nối dây từ Node Ảnh Bao Bì vào đây
          </div>
        )}

        {translatedUrl && (
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-emerald-400 uppercase">Bao bì đã dịch tiếng Việt:</span>
            <div className="relative aspect-video rounded-xl overflow-hidden border border-emerald-500/40 bg-[#18191A]">
              <img src={translatedUrl} alt="Translated" className="w-full h-full object-contain" />
            </div>
          </div>
        )}
      </div>

      {/* Cổng Ra Duy Nhất (Output) */}
      <Handle
        type="source"
        position={Position.Right}
        id="out"
        style={{ top: '50%' }}
        className="!w-4 !h-4 !bg-[#18191A] !border-2 !border-emerald-400 hover:!border-cyan-400 hover:!scale-125 transition-all shadow-md cursor-crosshair !-right-2"
        title="Ảnh bao bì tiếng Việt (Output ➔ Nối vào Xuất Ảnh)"
      />
    </div>
  );
};
