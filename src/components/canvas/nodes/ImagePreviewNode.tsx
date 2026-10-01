import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Eye, Download, Maximize2, X, Check } from 'lucide-react';
import { NodeHeader } from './NodeHeader';
import { ImagePreviewNodeData } from '../types';

interface Props {
  id: string;
  data: ImagePreviewNodeData;
}

export const ImagePreviewNode: React.FC<Props> = ({ id: _id, data }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const imageUrl = data.imageUrl;

  const handleDownload = async () => {
    if (!imageUrl) return;
    setDownloading(true);
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `elmich-canvas-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2000);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <div className="w-84 rounded-2xl bg-[#242526] border-2 border-emerald-500/50 shadow-2xl overflow-hidden hover:border-emerald-500 transition-all text-white">
        {/* Cổng Vào Duy Nhất (Input) */}
        <Handle
          type="target"
          position={Position.Left}
          id="in"
          style={{ top: '50%' }}
          className="!w-4 !h-4 !bg-[#18191A] !border-2 !border-[#1877F2] hover:!border-cyan-400 hover:!scale-125 transition-all shadow-md cursor-crosshair !-left-2"
          title="Dữ liệu ảnh thành phẩm (Input ➔ Nhận từ Node Sinh Ảnh / Dịch Bao Bì)"
        />

        <NodeHeader
          title={data.label || 'Xem & Tải Ảnh'}
          category="output"
          icon={<Eye size={15} />}
          status={data.status}
        />

        <div className="p-3.5 space-y-3">
          {imageUrl ? (
            <div className="space-y-3">
              <div className="relative aspect-video rounded-xl overflow-hidden border border-[#3E4042] bg-[#18191A] group">
                <img src={imageUrl} alt="Result" className="w-full h-full object-contain" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                  <button
                    onClick={() => setIsFullscreen(true)}
                    className="p-2 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition-colors"
                    title="Xem toàn màn hình"
                  >
                    <Maximize2 size={16} />
                  </button>
                  <button
                    onClick={handleDownload}
                    className="p-2 rounded-full bg-[#1877F2] hover:bg-blue-600 text-white transition-colors"
                    title="Tải về máy"
                  >
                    <Download size={16} />
                  </button>
                </div>
              </div>

              <button
                onClick={handleDownload}
                disabled={downloading}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all"
              >
                {downloadSuccess ? (
                  <>
                    <Check size={14} /> Đã tải xuống thành công
                  </>
                ) : (
                  <>
                    <Download size={14} /> Tải ảnh chất lượng cao
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="h-40 border-2 border-dashed border-[#3E4042] rounded-xl bg-[#18191A]/40 flex flex-col items-center justify-center text-center p-4">
              <Eye size={24} className="text-gray-500 mb-2" />
              <span className="text-xs text-gray-400 font-semibold">Chưa có ảnh đầu ra</span>
              <span className="text-[10px] text-gray-500 mt-1">
                Nối cổng từ Node Sinh Ảnh để xem và tải ảnh tại đây
              </span>
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
          title="Dữ liệu ảnh thành phẩm (Output ➔ Nối sang Node khác)"
        />
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && imageUrl && (
        <div
          className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
          onClick={() => setIsFullscreen(false)}
        >
          <div className="relative max-w-6xl max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute -top-10 right-0 p-2 text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
            <img src={imageUrl} alt="Enlarged" className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl" />
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleDownload}
                className="py-2.5 px-6 bg-[#1877F2] hover:bg-blue-600 text-white font-bold rounded-xl text-sm flex items-center gap-2"
              >
                <Download size={16} /> Tải ảnh gốc 4K
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
