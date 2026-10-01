import React, { useRef, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Sparkles, Upload, X, Loader2, Eye, Compass, Sun, Palette as PaletteIcon } from 'lucide-react';
import { NodeHeader } from './NodeHeader';
import { ReferenceImageNodeData } from '../types';
import { analyzeReferenceImageStyle } from '../../../../services/geminiService';

interface Props {
  id: string;
  data: ReferenceImageNodeData;
}

export const ReferenceImageNode: React.FC<Props> = ({ id, data }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const image = data.image || null;
  const referenceNote = data.referenceNote || '';
  const aiDescription = data.aiDescription || '';
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAiDetails, setShowAiDetails] = useState(true);

  const updateData = (newData: Partial<ReferenceImageNodeData>) => {
    window.dispatchEvent(
      new CustomEvent('elmich:canvas-node-update', {
        detail: { nodeId: id, data: { ...data, ...newData } },
      })
    );
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (ev) => resolve(ev.target?.result as string);
      reader.readAsDataURL(file);
    });

    updateData({ image: base64 });
    e.target.value = '';
  };

  const removeImage = () => {
    updateData({ image: null, aiDescription: '' });
  };

  const handleAnalyze = async () => {
    if (!image || isAnalyzing) return;
    setIsAnalyzing(true);
    updateData({ status: 'running' });

    try {
      const result = await analyzeReferenceImageStyle(image, referenceNote);
      updateData({
        aiDescription: result.description,
        status: 'success',
      });
      setShowAiDetails(true);
    } catch (err: any) {
      console.error(err);
      updateData({ status: 'error', errorMessage: err.message || 'Lỗi khi phân tích' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-[340px] rounded-2xl bg-[#242526] border-2 border-[#3E4042] shadow-2xl overflow-hidden hover:border-cyan-500/70 transition-all text-white">
      {/* Cổng Vào Duy Nhất (Input) */}
      <Handle
        type="target"
        position={Position.Left}
        id="in"
        style={{ top: '50%' }}
        className="!w-4 !h-4 !bg-[#18191A] !border-2 !border-[#1877F2] hover:!border-cyan-400 hover:!scale-125 transition-all shadow-md cursor-crosshair !-left-2"
        title="Nhận ảnh từ Node Ảnh hoặc nguồn khác (Input)"
      />

      <NodeHeader
        title={data.label || 'Ảnh Tham Khảo'}
        category="input"
        icon={<PaletteIcon size={14} className="text-cyan-400" />}
        status={data.status}
      />

      <div className="p-3.5 space-y-3">
        {/* Image Preview / Upload Area */}
        {image ? (
          <div className="relative aspect-video rounded-xl overflow-hidden border border-[#3E4042] bg-[#18191A] group">
            <img src={image} alt="Ảnh tham khảo" className="w-full h-full object-cover" />
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[10px] font-bold text-cyan-300 border border-cyan-500/30">
              Ảnh Tham Khảo AI
            </div>
            <button
              onClick={removeImage}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600/90 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
              title="Gỡ ảnh"
            >
              <X size={13} />
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="h-28 border-2 border-dashed border-[#3E4042] hover:border-cyan-500/70 rounded-xl bg-[#18191A]/50 flex flex-col items-center justify-center text-center p-3 cursor-pointer group transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <Upload size={14} />
            </div>
            <span className="text-xs font-semibold text-gray-200">Kéo Node Ảnh vào đây</span>
            <span className="text-[10px] text-gray-400 mt-0.5">hoặc bấm để tải ảnh tham khảo từ máy</span>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
        />

        {/* Reference Focus Note */}
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            Ghi Chú Tham Khảo (Mục Tiêu)
          </label>
          <textarea
            rows={2}
            value={referenceNote}
            onChange={(e) => updateData({ referenceNote: e.target.value })}
            placeholder="Mặc định: Tham khảo phong cách, ánh sáng và bố cục"
            className="w-full bg-[#18191A] border border-[#3E4042] focus:border-cyan-500 rounded-xl p-2.5 text-xs text-white outline-none resize-none placeholder:text-gray-500 font-normal leading-relaxed transition-all"
          />
          <span className="text-[9px] text-gray-400 italic block mt-0.5">
            *Để trống sẽ mặc định học theo phong cách nghệ thuật, ánh sáng và bố cục.
          </span>
        </div>

        {/* AI Analysis Trigger */}
        {image && (
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-cyan-950/40 transition-all cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>AI Đang Phân Tích Ảnh...</span>
              </>
            ) : (
              <>
                <Sparkles size={13} />
                <span>AI Phân Tích & Mô Tả Ảnh Này</span>
              </>
            )}
          </button>
        )}

        {/* AI Analysis Result */}
        {aiDescription && (
          <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/50 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-[10px] font-bold text-cyan-300">
              <span className="flex items-center gap-1">
                <Compass size={12} />
                <span>AI Đã Trích Xuất:</span>
              </span>
              <button
                type="button"
                onClick={() => setShowAiDetails(!showAiDetails)}
                className="text-gray-400 hover:text-white"
              >
                {showAiDetails ? 'Thu gọn' : 'Xem'}
              </button>
            </div>

            {showAiDetails && (
              <p className="text-[11px] text-gray-200 leading-relaxed font-normal bg-[#18191A]/60 p-2 rounded-lg border border-[#3E4042]">
                {aiDescription}
              </p>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-[10px] text-gray-400 pt-0.5">
          <span>Kéo dây nối sang Node:</span>
          <span className="text-cyan-300 font-semibold">Sinh Ảnh AI ➔</span>
        </div>
      </div>

      {/* Cổng Ra Duy Nhất (Output) */}
      <Handle
        type="source"
        position={Position.Right}
        id="out"
        style={{ top: '50%' }}
        className="!w-4 !h-4 !bg-[#18191A] !border-2 !border-emerald-400 hover:!border-cyan-400 hover:!scale-125 transition-all shadow-md cursor-crosshair !-right-2"
        title="Dữ liệu ảnh tham khảo & chỉ thị AI (Output ➔ Nối vào Sinh Ảnh)"
      />
    </div>
  );
};
