import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import {
  Sparkles,
  Play,
  Copy,
  Check,
  Download,
  Image as ImageIcon,
  FileText,
  Loader2,
  Wand2,
  Maximize2,
  X,
  Layers,
  Camera,
  Tag,
  Palette,
  BookOpen,
} from 'lucide-react';
import { NodeHeader } from './NodeHeader';
import { AiNodeData, AiType, AiContentSubtype } from '../types';
import { executeAiNodeTask } from '../../../../services/geminiService';
import { AspectRatio, ImageSize } from '../../../../types';
import { saveWorkflowImageToLibrary } from '../services/canvasGalleryBridge';

interface Props {
  id: string;
  data: AiNodeData;
}

export const AiNode: React.FC<Props> = ({ id, data }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);

  const aiType: AiType = data.aiType || 'IMAGE';
  const contentSubtype: AiContentSubtype = data.contentSubtype || 'PROMPT_OPTIMIZE';
  const customInstruction = data.customInstruction || '';
  const aspectRatio: AspectRatio = data.aspectRatio || '1:1';
  const imageSize: ImageSize = data.imageSize || '1K';

  const updateNodeData = (newData: Partial<AiNodeData>) => {
    window.dispatchEvent(
      new CustomEvent('elmich:canvas-node-update', {
        detail: { nodeId: id, data: newData },
      })
    );
  };

  const handleRunAi = async () => {
    if (isRunning) return;
    setIsRunning(true);
    updateNodeData({ status: 'running' });

    try {
      const startTime = Date.now();
      const res = await executeAiNodeTask({
        aiType,
        contentSubtype,
        customInstruction,
        inputImages: data.inputImages || [],
        referenceImage: data.referenceImage || null,
        referenceImageNote: data.referenceImageNote,
        referenceAiDescription: data.referenceAiDescription,
        productName: data.productName,
        productCode: data.productCode,
        dimensions: data.dimensions,
        promptText: data.promptText,
        priorityPrompt: data.priorityPrompt,
        presetStyle: data.presetStyle,
        presetStyleName: data.presetStyleName,
        markdownSkillGuidance: data.markdownSkillGuidance,
        markdownSkillTitle: data.markdownSkillTitle,
        materialsDescription: data.materialsDescription,
        conceptPrompt: data.conceptPrompt,
        inputText: data.inputText,
        aspectRatio,
        imageSize,
        imageModel: data.imageModel || 'FLASH',
      });

      const elapsed = Math.round((Date.now() - startTime) / 1000);

      // Nếu AI Node sinh ra ảnh, tự động lưu vào Thư viện và Lịch sử dùng chung
      if (res.resultImage) {
        saveWorkflowImageToLibrary({
          url: res.resultImage,
          prompt: data.promptText || data.conceptPrompt || 'Ảnh tạo từ AI Node',
          productName: data.productName || 'Sản phẩm Elmich',
          productCode: data.productCode || '',
          visualStyle: 'AI_NODE',
          aspectRatio,
          imageSize,
          imageModel: data.imageModel || 'FLASH',
        }).catch((e) => console.warn('Lỗi lưu ảnh AI node vào thư viện:', e));
      }

      updateNodeData({
        status: 'success',
        resultImage: res.resultImage,
        resultText: res.resultText,
        resultType: res.resultType,
        executionTime: elapsed,
      });

      window.dispatchEvent(
        new CustomEvent('elmich:canvas-toast', {
          detail: { message: `AI đã xử lý thành công (${elapsed}s)${res.resultImage ? ' & đã lưu vào Thư viện' : ''}!` },
        })
      );
    } catch (err: any) {
      console.error('Lỗi khi chạy AI node:', err);
      updateNodeData({
        status: 'error',
        errorMessage: err.message || 'Lỗi xử lý AI',
      });
      window.dispatchEvent(
        new CustomEvent('elmich:canvas-toast', {
          detail: { message: `Lỗi AI: ${err.message || 'Không thể tạo kết quả'}` },
        })
      );
    } finally {
      setIsRunning(false);
    }
  };

  const copyTextResult = () => {
    if (!data.resultText) return;
    navigator.clipboard.writeText(data.resultText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadImageResult = () => {
    if (!data.resultImage) return;
    const a = document.createElement('a');
    a.href = data.resultImage;
    a.download = `elmich-ai-${Date.now()}.png`;
    a.click();
  };

  const hasResult = !!(data.resultImage || data.resultText);

  return (
    <div className="w-[360px] rounded-2xl bg-[#242526] border-2 border-blue-500/70 shadow-2xl overflow-hidden hover:border-blue-400 transition-all text-white select-none">
      <NodeHeader
        title={data.label || 'AI'}
        category="generator"
        icon={<Sparkles size={15} className="text-blue-400" />}
        status={data.status}
      />

      <div className="p-3.5 space-y-3">
        {/* Toggle Mode: AI Sinh Ảnh vs AI Nội Dung */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-[#18191A] border border-[#3E4042] gap-1">
          <button
            type="button"
            onClick={() => updateNodeData({ aiType: 'IMAGE' })}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              aiType === 'IMAGE'
                ? 'bg-[#1877F2] text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ImageIcon size={13} />
            <span>AI Sinh Ảnh</span>
          </button>
          <button
            type="button"
            onClick={() => updateNodeData({ aiType: 'CONTENT' })}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              aiType === 'CONTENT'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <FileText size={13} />
            <span>AI Nội Dung</span>
          </button>
        </div>

        {/* AI Sinh Ảnh Settings */}
        {aiType === 'IMAGE' ? (
          <div className="space-y-2 p-2.5 rounded-xl bg-[#18191A]/80 border border-[#3E4042]">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Tỷ Lệ Khung Hình
                </label>
                <select
                  value={aspectRatio}
                  onChange={(e) => updateNodeData({ aspectRatio: e.target.value as AspectRatio })}
                  className="nodrag nowheel w-full bg-[#242526] border border-[#3E4042] rounded-lg p-1.5 text-xs text-white font-medium outline-none"
                >
                  <option value="1:1">1:1 (Vuông)</option>
                  <option value="4:3">4:3 (Ngang)</option>
                  <option value="3:4">3:4 (Dọc)</option>
                  <option value="16:9">16:9 (Toàn cảnh)</option>
                  <option value="9:16">9:16 (Story)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Độ Phân Giải
                </label>
                <select
                  value={imageSize}
                  onChange={(e) => updateNodeData({ imageSize: e.target.value as ImageSize })}
                  className="nodrag nowheel w-full bg-[#242526] border border-[#3E4042] rounded-lg p-1.5 text-xs text-white font-medium outline-none"
                >
                  <option value="1K">1K (Tiêu chuẩn)</option>
                  <option value="2K">2K (Sắc nét cao)</option>
                </select>
              </div>
            </div>
          </div>
        ) : (
          /* AI Nội Dung Settings */
          <div className="space-y-2 p-2.5 rounded-xl bg-[#18191A]/80 border border-[#3E4042]">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Nhiệm Vụ AI Nội Dung
              </label>
              <select
                value={contentSubtype}
                onChange={(e) =>
                  updateNodeData({ contentSubtype: e.target.value as AiContentSubtype })
                }
                className="nodrag nowheel w-full bg-[#242526] border border-[#3E4042] rounded-lg p-1.5 text-xs text-white font-medium outline-none"
              >
                <option value="PROMPT_OPTIMIZE">✨ Tối Ưu & Viết Prompt Hoàn Hảo</option>
                <option value="CONCEPT_IDEATION">💡 Đề Xuất 3 Ý Tưởng Bối Cảnh</option>
                <option value="PROPS_SUGGESTION">🌿 Gợi Ý 10 Đạo Cụ & Phụ Kiện</option>
                <option value="MATERIAL_ANALYSIS">🔍 Bóc Tách Vật Liệu PBR</option>
                <option value="TRANSLATE_COPY">📝 Soạn Thảo & Dịch Bao Bì</option>
                <option value="CUSTOM_TEXT">🎯 Yêu Cầu Tự Do Theo Ghi Chú</option>
              </select>
            </div>
          </div>
        )}

        {/* Custom Instruction Input */}
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            Yêu Cầu Bổ Sung Cho AI (Tùy Chọn)
          </label>
          <input
            type="text"
            value={customInstruction}
            onChange={(e) => updateNodeData({ customInstruction: e.target.value })}
            placeholder="Ví dụ: bối cảnh ấm cúng, nhấn mạnh viền inox xước..."
            className="nodrag w-full bg-[#18191A] border border-[#3E4042] rounded-xl px-2.5 py-1.5 text-xs text-white placeholder:text-gray-500 outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Connected Inputs Summary */}
        <div className="p-2.5 rounded-xl bg-[#18191A] border border-[#3E4042] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Dữ Liệu Đang Kết Nối Vào AI
            </span>
            <span className="text-[9px] text-cyan-400 font-semibold">Tự động nhận</span>
          </div>

          <div className="flex flex-wrap gap-1 text-[10px]">
            <span
              className={`px-1.5 py-0.5 rounded border flex items-center gap-1 ${
                data.inputImages && data.inputImages.length > 0
                  ? 'bg-blue-950/40 border-blue-500/50 text-blue-300'
                  : 'bg-[#242526] border-[#3E4042] text-gray-500'
              }`}
            >
              <Camera size={10} />
              <span>{data.inputImages?.length || 0} Ảnh SP</span>
            </span>

            <span
              className={`px-1.5 py-0.5 rounded border flex items-center gap-1 ${
                data.referenceImage
                  ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300'
                  : 'bg-[#242526] border-[#3E4042] text-gray-500'
              }`}
            >
              <Wand2 size={10} />
              <span>{data.referenceImage ? 'Ảnh mẫu' : 'Chưa có mẫu'}</span>
            </span>

            <span
              className={`px-1.5 py-0.5 rounded border flex items-center gap-1 ${
                data.productName
                  ? 'bg-amber-950/40 border-amber-500/50 text-amber-300'
                  : 'bg-[#242526] border-[#3E4042] text-gray-500'
              }`}
            >
              <Tag size={10} />
              <span className="truncate max-w-[80px]">{data.productName || 'Chưa tên'}</span>
            </span>

            <span
              className={`px-1.5 py-0.5 rounded border flex items-center gap-1 ${
                data.promptText
                  ? 'bg-purple-950/40 border-purple-500/50 text-purple-300'
                  : 'bg-[#242526] border-[#3E4042] text-gray-500'
              }`}
            >
              <FileText size={10} />
              <span>{data.promptText ? 'Prompt' : 'Chưa prompt'}</span>
            </span>

            <span
              className={`px-1.5 py-0.5 rounded border flex items-center gap-1 ${
                data.presetStyleName
                  ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-300'
                  : 'bg-[#242526] border-[#3E4042] text-gray-500'
              }`}
            >
              <Palette size={10} />
              <span>{data.presetStyleName || 'Mặc định'}</span>
            </span>

            {data.markdownSkillTitle && (
              <span className="px-1.5 py-0.5 rounded border bg-emerald-950/40 border-emerald-500/50 text-emerald-300 flex items-center gap-1">
                <BookOpen size={10} />
                <span>{data.markdownSkillTitle}</span>
              </span>
            )}
          </div>
        </div>

        {/* Action Button: Run AI */}
        <button
          type="button"
          onClick={handleRunAi}
          disabled={isRunning}
          className="w-full py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#1877F2] to-blue-600 hover:brightness-110 text-white shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {isRunning ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Đang xử lý luồng AI...</span>
            </>
          ) : (
            <>
              <Play size={13} className="fill-white" />
              <span>Chạy AI Ngay</span>
            </>
          )}
        </button>

        {/* Inline Result Preview */}
        {hasResult && (
          <div className="pt-2 border-t border-[#3E4042] space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-gray-300">
              <span className="text-emerald-400 flex items-center gap-1">
                <Sparkles size={11} />
                <span>Kết quả ({data.executionTime ? `${data.executionTime}s` : 'Hoàn tất'})</span>
              </span>

              {data.resultType === 'IMAGE' && data.resultImage && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsFullscreenPreview(true)}
                    className="p-1 rounded hover:bg-[#3A3B3C] text-gray-300 hover:text-white"
                    title="Phóng to ảnh"
                  >
                    <Maximize2 size={12} />
                  </button>
                  <button
                    onClick={downloadImageResult}
                    className="p-1 rounded hover:bg-[#3A3B3C] text-gray-300 hover:text-white"
                    title="Tải ảnh về máy"
                  >
                    <Download size={12} />
                  </button>
                </div>
              )}

              {data.resultType === 'TEXT' && data.resultText && (
                <button
                  onClick={copyTextResult}
                  className="flex items-center gap-1 text-[10px] text-gray-300 hover:text-white px-1.5 py-0.5 rounded hover:bg-[#3A3B3C]"
                  title="Sao chép nội dung"
                >
                  {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                  <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
                </button>
              )}
            </div>

            {data.resultType === 'IMAGE' && data.resultImage && (
              <div className="relative rounded-xl overflow-hidden border border-[#3E4042] aspect-square max-h-48 mx-auto bg-black flex items-center justify-center group">
                <img
                  src={data.resultImage}
                  alt="AI Result"
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => setIsFullscreenPreview(true)}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#1877F2] text-white shadow-md"
                  >
                    Xem Chi Tiết
                  </button>
                </div>
              </div>
            )}

            {data.resultType === 'TEXT' && data.resultText && (
              <div className="p-2.5 rounded-xl bg-[#18191A] border border-[#3E4042] max-h-36 overflow-y-auto custom-scrollbar text-[11px] text-gray-200 leading-relaxed font-normal whitespace-pre-wrap select-text">
                {data.resultText}
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
        title="Cổng nhận dữ liệu tổng hợp (Ảnh, Thông số, Prompt, Preset...)"
      />

      {/* Cổng Ra Duy Nhất (Output) */}
      <Handle
        type="source"
        position={Position.Right}
        id="out"
        style={{ top: '50%' }}
        className="!w-4 !h-4 !bg-[#18191A] !border-2 !border-emerald-400 hover:!border-cyan-400 hover:!scale-125 transition-all shadow-lg cursor-crosshair !-right-2"
        title="Kết quả trả ra từ AI ➔ Nối vào Xem Kết Quả hoặc Node khác"
      />

      {/* Fullscreen Image Preview Modal */}
      {isFullscreenPreview && data.resultImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-150"
          onClick={() => setIsFullscreenPreview(false)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-[#242526] border border-[#3E4042] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 border-b border-[#3E4042] flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles size={14} className="text-blue-400" />
                <span>Kết Quả AI Elmich Studio</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={downloadImageResult}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#1877F2] text-white flex items-center gap-1.5 hover:bg-blue-600 transition-colors"
                >
                  <Download size={13} />
                  <span>Tải Về Máy</span>
                </button>
                <button
                  onClick={() => setIsFullscreenPreview(false)}
                  className="p-1 rounded-lg hover:bg-[#3A3B3C] text-gray-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="p-4 flex items-center justify-center bg-black/60 overflow-auto">
              <img
                src={data.resultImage}
                alt="AI Result"
                className="max-h-[75vh] w-auto object-contain rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
