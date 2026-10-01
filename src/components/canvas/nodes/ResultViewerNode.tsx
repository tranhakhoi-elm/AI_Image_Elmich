import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import {
  Eye,
  Download,
  Copy,
  Check,
  Maximize2,
  X,
  Sparkles,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import { NodeHeader } from './NodeHeader';
import { ResultViewerNodeData } from '../types';

interface Props {
  id: string;
  data: ResultViewerNodeData;
}

export const ResultViewerNode: React.FC<Props> = ({ id, data }) => {
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const displayImage = data.resultImage || (data as any).imageUrl || (data as any).image;
  const displayText = data.resultText || (data as any).promptText || (data as any).text;
  const hasContent = !!(displayImage || displayText);

  const handleDownload = () => {
    if (!displayImage) return;
    const a = document.createElement('a');
    a.href = displayImage;
    a.download = `elmich-result-${Date.now()}.png`;
    a.click();
  };

  const handleCopyText = () => {
    if (!displayText) return;
    navigator.clipboard.writeText(displayText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = displayText ? displayText.trim().split(/\s+/).length : 0;
  const charCount = displayText ? displayText.length : 0;

  return (
    <div className="w-[360px] rounded-2xl bg-[#242526] border-2 border-emerald-500/70 shadow-2xl overflow-hidden hover:border-emerald-400 transition-all text-white select-none">
      <NodeHeader
        title={data.label || 'Xem Kết Quả'}
        category="output"
        icon={<Eye size={15} className="text-emerald-400" />}
        status={data.status || (hasContent ? 'success' : 'idle')}
      />

      <div className="p-3.5 space-y-3">
        {!hasContent ? (
          /* Empty Waiting State */
          <div className="p-6 rounded-xl bg-[#18191A] border border-dashed border-[#3E4042] text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <Eye size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-300">Đang chờ kết quả...</p>
              <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                Kéo dây nối từ cổng ra của <b>Node AI</b> (hoặc node khác) vào cổng bên trái để hiển thị kết quả tại đây.
              </p>
            </div>
          </div>
        ) : (
          /* Has Content: Display Image or Text */
          <div className="space-y-3">
            {/* Image Result Display */}
            {displayImage && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-gray-300">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <ImageIcon size={12} />
                    <span>Hình Ảnh Kết Quả</span>
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setIsFullscreen(true)}
                      className="p-1.5 rounded-lg bg-[#18191A] hover:bg-[#3A3B3C] border border-[#3E4042] text-gray-300 hover:text-white transition-colors"
                      title="Phóng to ảnh"
                    >
                      <Maximize2 size={12} />
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#1877F2] hover:bg-blue-600 text-white shadow-sm transition-colors"
                      title="Tải ảnh về máy tính"
                    >
                      <Download size={12} />
                      <span>Tải Về</span>
                    </button>
                  </div>
                </div>

                <div
                  className="relative rounded-xl overflow-hidden border border-[#3E4042] aspect-square bg-black flex items-center justify-center group cursor-pointer"
                  onClick={() => setIsFullscreen(true)}
                >
                  <img
                    src={displayImage}
                    alt="Result Output"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/20 backdrop-blur-md text-white border border-white/30 flex items-center gap-1.5">
                      <Maximize2 size={13} />
                      <span>Bấm Để Phóng To</span>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Text Result Display */}
            {displayText && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-gray-300">
                  <span className="flex items-center gap-1.5 text-purple-400">
                    <FileText size={12} />
                    <span>Văn Bản / Nội Dung ({wordCount} từ)</span>
                  </span>
                  <button
                    onClick={handleCopyText}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-[#18191A] hover:bg-[#3A3B3C] border border-[#3E4042] text-gray-200 hover:text-white transition-colors"
                  >
                    {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{copied ? 'Đã sao chép' : 'Sao chép'}</span>
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-[#18191A] border border-[#3E4042] max-h-48 overflow-y-auto custom-scrollbar text-xs text-gray-200 leading-relaxed font-normal whitespace-pre-wrap select-text">
                  {displayText}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cổng Vào Duy Nhất (Input) */}
      <Handle
        type="target"
        position={Position.Left}
        id="in"
        style={{ top: '50%' }}
        className="!w-4 !h-4 !bg-[#18191A] !border-2 !border-[#1877F2] hover:!border-cyan-400 hover:!scale-125 transition-all shadow-md cursor-crosshair !-left-2"
        title="Nhận kết quả từ Node AI hoặc bất kỳ node nào (Input)"
      />

      {/* Cổng Ra Duy Nhất (Output) */}
      <Handle
        type="source"
        position={Position.Right}
        id="out"
        style={{ top: '50%' }}
        className="!w-4 !h-4 !bg-[#18191A] !border-2 !border-emerald-400 hover:!border-cyan-400 hover:!scale-125 transition-all shadow-md cursor-crosshair !-right-2"
        title="Truyền tiếp kết quả sang node khác (Output)"
      />

      {/* Fullscreen Image Preview Modal */}
      {isFullscreen && displayImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-150"
          onClick={() => setIsFullscreen(false)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-[#242526] border border-[#3E4042] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3.5 border-b border-[#3E4042] flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles size={14} className="text-emerald-400" />
                <span>Xem Kết Quả Chi Tiết</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#1877F2] text-white flex items-center gap-1.5 hover:bg-blue-600 transition-colors shadow-sm"
                >
                  <Download size={13} />
                  <span>Tải Về Máy</span>
                </button>
                <button
                  onClick={() => setIsFullscreen(false)}
                  className="p-1 rounded-lg hover:bg-[#3A3B3C] text-gray-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="p-4 flex items-center justify-center bg-black/70 overflow-auto">
              <img
                src={displayImage}
                alt="Fullscreen Result"
                className="max-h-[75vh] w-auto object-contain rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
