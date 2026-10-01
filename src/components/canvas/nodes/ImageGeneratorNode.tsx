import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Wand2, Image as ImageIcon, Settings2, Sparkles, Layers, BookOpen, Zap, ChevronDown, ChevronUp, Layout } from 'lucide-react';
import { NodeHeader } from './NodeHeader';
import { GeneratorNodeData } from '../types';
import { generateProductImage } from '../../../../services/geminiService';
import { AspectRatio, ImageModelTier, ImageSize, VisualStyle } from '../../../../types';
import { saveWorkflowImageToLibrary } from '../services/canvasGalleryBridge';

interface Props {
  id: string;
  data: GeneratorNodeData;
}

export const ImageGeneratorNode: React.FC<Props> = ({ id, data }) => {
  const [isManualStyleOpen, setIsManualStyleOpen] = useState(false);
  const visualStyle = data.generatorType || 'CONCEPT';
  const aspectRatio = data.aspectRatio || '1:1';
  const imageSize = data.imageSize || '1K';
  const imageModel = data.imageModel || 'FLASH';

  const runGeneration = async () => {
    if (!data.inputImages || data.inputImages.length === 0) {
      window.dispatchEvent(
        new CustomEvent('elmich:canvas-toast', {
          detail: { message: 'Node chưa nhận được Ảnh sản phẩm! Hãy nối dây từ Node Ảnh Sản Phẩm.', type: 'error' },
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
      const isPresetActive = Boolean(data.presetStyleActive && data.generatorType);
      const finalConcept = [
        data.conceptPrompt || 'Sang trọng hiện đại đẳng cấp Elmich',
        data.spatialLayoutGuidance || '',
      ]
        .filter(Boolean)
        .join('\n\n');

      const generationSettings: any = {
        visualStyle: visualStyle,
        isCustomFlow: !isPresetActive,
        productName: data.productName || 'Sản phẩm gia dụng Elmich',
        productCode: data.productCode || '',
        productImages: data.inputImages,
        referenceImage: data.referenceImage || data.layoutSnapshotImage || null,
        referenceImageNote: data.referenceImageNote,
        referenceAiDescription: data.referenceAiDescription,
        concept: finalConcept,
        priorityPrompt: data.priorityPromptActive !== false ? data.priorityPrompt : undefined,
        markdownSkillGuidance: data.markdownSkillGuidance,
        markdownSkillTitle: data.markdownSkillTitle,
        whiteBGMaterialsDescription: data.materialsDescription || '',
        props: data.props || [],
        aspectRatio: aspectRatio,
        imageSize: imageSize,
        imageModel: imageModel,
        colorChanges: data.colorChanges || [],
        numImages: 1,
        dimensions: { length: '200', width: '200', height: '250' },
        camera: { focalLength: 50, aperture: 'f/2.8', iso: '100', isMacro: false, angle: 0 },
      };

      const resultUrl = await generateProductImage(generationSettings, 1);

      // Tự động lưu ảnh vào Thư viện và Lịch sử dùng chung
      saveWorkflowImageToLibrary({
        url: resultUrl,
        prompt: data.conceptPrompt || data.priorityPrompt || 'Ảnh tạo từ Node Sinh Ảnh',
        productName: data.productName || 'Sản phẩm Elmich',
        productCode: data.productCode || '',
        visualStyle: visualStyle,
        aspectRatio: aspectRatio,
        imageSize: imageSize,
        imageModel: imageModel,
      }).catch((e) => console.warn('Lỗi lưu ảnh vào thư viện:', e));

      window.dispatchEvent(
        new CustomEvent('elmich:canvas-node-update', {
          detail: {
            nodeId: id,
            data: {
              ...data,
              status: 'success',
              outputImageUrl: resultUrl,
            },
          },
        })
      );

      // Notify canvas that an image was created
      window.dispatchEvent(
        new CustomEvent('elmich:canvas-image-generated', {
          detail: {
            url: resultUrl,
            nodeId: id,
            prompt: data.conceptPrompt,
            visualStyle: visualStyle,
          },
        })
      );

      window.dispatchEvent(
        new CustomEvent('elmich:canvas-toast', {
          detail: { message: 'Đã tạo ảnh thành công & tự động lưu vào Thư viện!' },
        })
      );
    } catch (err: any) {
      console.error('Canvas generation error:', err);
      window.dispatchEvent(
        new CustomEvent('elmich:canvas-node-update', {
          detail: { nodeId: id, data: { ...data, status: 'error', errorMessage: err.message } },
        })
      );
      window.dispatchEvent(
        new CustomEvent('elmich:canvas-toast', {
          detail: { message: `Lỗi tạo ảnh: ${err.message || 'Lỗi kết nối AI'}`, type: 'error' },
        })
      );
    }
  };

  const updateSetting = (field: keyof GeneratorNodeData, value: any) => {
    window.dispatchEvent(
      new CustomEvent('elmich:canvas-node-update', {
        detail: { nodeId: id, data: { ...data, [field]: value } },
      })
    );
  };

  return (
    <div className="w-[370px] rounded-2xl bg-[#242526] border-2 border-[#1877F2]/60 shadow-2xl overflow-hidden hover:border-[#1877F2] transition-all text-white relative">
      {/* Cổng Vào Duy Nhất (Input) */}
      <Handle
        type="target"
        position={Position.Left}
        id="in"
        style={{ top: '50%' }}
        className="!w-4 !h-4 !bg-[#18191A] !border-2 !border-[#1877F2] hover:!border-cyan-400 hover:!scale-125 transition-all shadow-md cursor-crosshair !-left-2"
        title="Điểm Nhận Dữ Liệu Tổng Hợp (Input)"
      />

      <NodeHeader
        title={data.label || 'Sinh Ảnh AI'}
        category="generator"
        icon={<Wand2 size={15} />}
        status={data.status}
        onRun={runGeneration}
      />

      <div className="p-3.5 space-y-3">
        {/* Staging Layout Indicator */}
        {data.spatialLayoutGuidance && (
          <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/60 flex items-center justify-between text-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <Layout size={14} className="text-purple-400 shrink-0" />
              <div>
                <span className="text-[10px] text-purple-300 font-bold block uppercase tracking-wider">
                  ✓ Đã nhận Bố Cục & Đạo Cụ:
                </span>
                <span className="text-[10px] text-gray-300 block truncate max-w-[190px]">
                  Đã khóa vị trí vật thể & vùng chừa chữ
                </span>
              </div>
            </div>
            <span className="text-[9px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-mono font-bold shrink-0">
              STAGED
            </span>
          </div>
        )}
        {/* Style Handling: Decoupled into Preset node or Custom Flow */}
        {data.presetStyleActive && data.presetStyleName ? (
          <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Layers size={14} className="text-indigo-400" />
              <div>
                <span className="text-[10px] text-indigo-300 font-bold block uppercase tracking-wider">
                  ✓ Đã nhận Preset Đầu Ra:
                </span>
                <span className="font-bold text-white text-xs">{data.presetStyleName}</span>
              </div>
            </div>
            <span className="text-[9px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-mono font-bold">
              {visualStyle}
            </span>
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-[#18191A] border border-[#3E4042] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={11} className="text-amber-400" />
                <span>Chế Độ Sinh Ảnh:</span>
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-semibold">
                Tùy Chỉnh Theo Dây Chuyền
              </span>
            </div>
            <p className="text-[10px] text-gray-400 leading-normal">
              Chạy tự do theo Concept, Prompt và Thông Số kết nối (không bị áp khuôn mẫu).
            </p>
            <div className="pt-1 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsManualStyleOpen(!isManualStyleOpen)}
                className="text-[10px] text-blue-400 hover:text-blue-300 font-medium flex items-center gap-0.5"
              >
                <span>{isManualStyleOpen ? 'Đóng chọn mẫu' : 'Hoặc chọn nhanh thể loại mẫu'}</span>
                {isManualStyleOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              </button>
            </div>

            {isManualStyleOpen && (
              <select
                value={visualStyle}
                onChange={(e) => updateSetting('generatorType', e.target.value as VisualStyle)}
                className="w-full bg-[#242526] border border-[#3E4042] focus:border-[#1877F2] rounded-xl px-2.5 py-1.5 text-xs text-white outline-none mt-1 cursor-pointer"
              >
                <option value="CONCEPT">Bối Cảnh Phong Cách Sống (Lifestyle)</option>
                <option value="STUDIO">Studio Chuyên Nghiệp (Creative)</option>
                <option value="TECH_PS">Kỹ Thuật Bóc Tách (Tech Effects)</option>
                <option value="WHITE_BG_RETOUCH">Ảnh Nền Trắng (White BG Retouch)</option>
                <option value="PACKAGING_MOCKUP">Bao Bì & Mockup (Packaging 3D)</option>
                <option value="COLOR_CHANGE">Đổi Màu Sản Phẩm (Color Change)</option>
                <option value="LINE_ART">Nét Vẽ Kỹ Thuật (Line Art)</option>
                <option value="3D_TO_REAL_WHITE_BG">3D Sang Ảnh Thật (3D to Real)</option>
              </select>
            )}
          </div>
        )}

        {/* Reference Image Connected Banner */}
        {data.referenceImage && (
          <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/60 flex items-start gap-2 shadow-lg shadow-cyan-950/40 animate-in fade-in">
            <img
              src={data.referenceImage}
              alt="Ref"
              className="w-8 h-8 object-cover rounded-lg border border-cyan-500/40 shrink-0 mt-0.5"
            />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider block">
                📸 Đã Nhận Ảnh Tham Khảo:
              </span>
              <p className="text-[10px] text-gray-200 truncate mt-0.5 font-medium">
                {data.referenceImageNote || 'Tham khảo phong cách, ánh sáng và bố cục'}
              </p>
            </div>
          </div>
        )}

        {/* Markdown Skill Connected Banner */}
        {data.markdownSkillGuidance && (
          <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/60 flex items-start gap-2 shadow-lg shadow-amber-950/40 animate-in fade-in">
            <BookOpen size={13} className="text-amber-400 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                📚 Đang Áp Dụng Tài Liệu Định Hướng AI:
              </span>
              <p className="text-[10px] text-gray-200 truncate mt-0.5 font-medium">
                {data.markdownSkillTitle || 'Tài liệu Markdown Skills chuẩn Elmich'}
              </p>
            </div>
          </div>
        )}

        {/* Priority Prompt Connected Banner */}
        {data.priorityPrompt && (
          <div className="p-2.5 rounded-xl bg-violet-950/40 border border-violet-500/60 flex items-start gap-2 shadow-lg shadow-violet-950/40 animate-in fade-in">
            <Zap size={12} className="text-violet-400 shrink-0 mt-0.5 animate-pulse" />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold text-violet-300 uppercase tracking-wider block">
                ⚡ Đang Áp Dụng Prompt Ưu Tiên #1:
              </span>
              <p className="text-[10px] text-gray-200 line-clamp-2 leading-relaxed mt-0.5 font-medium">
                "{data.priorityPrompt}"
              </p>
            </div>
          </div>
        )}

        {/* Inputs status preview */}
        <div className="grid grid-cols-2 gap-2 text-[10px] p-2 rounded-xl bg-[#18191A] border border-[#3E4042]">
          <div className="flex items-center gap-1.5 truncate">
            <span className={`w-2 h-2 rounded-full ${data.inputImages?.length ? 'bg-emerald-400' : 'bg-gray-600'}`} />
            <span className="text-gray-300 truncate">Ảnh SP: {data.inputImages?.length ? `${data.inputImages.length} ảnh` : 'Chưa có'}</span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <span className={`w-2 h-2 rounded-full ${data.priorityPrompt ? 'bg-violet-400 animate-pulse' : data.conceptPrompt ? 'bg-emerald-400' : 'bg-gray-600'}`} />
            <span className={`truncate ${data.priorityPrompt ? 'text-violet-300 font-semibold' : 'text-gray-300'}`}>
              {data.priorityPrompt ? '⚡ Prompt #1: Có' : data.conceptPrompt ? 'Concept: Sẵn sàng' : 'Prompt: Chưa có'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <span className={`w-2 h-2 rounded-full ${data.materialsDescription ? 'bg-emerald-400' : 'bg-gray-600'}`} />
            <span className="text-gray-300 truncate">Chất liệu: {data.materialsDescription ? 'Có PBR' : 'Mặc định'}</span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <span className={`w-2 h-2 rounded-full ${data.props?.length ? 'bg-emerald-400' : 'bg-gray-600'}`} />
            <span className="text-gray-300 truncate">Đạo cụ: {data.props?.length || 0} món</span>
          </div>
        </div>

        {/* Connected input images preview */}
        {data.inputImages && data.inputImages.length > 0 ? (
          <div className="flex items-center gap-2 p-2 rounded-xl bg-[#18191A] border border-emerald-500/40 animate-in fade-in">
            <div className="flex -space-x-2 overflow-hidden shrink-0">
              {data.inputImages.slice(0, 3).map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`Input ${i}`}
                  className="inline-block h-8 w-8 rounded-lg object-contain bg-black/40 ring-1 ring-emerald-500/50"
                />
              ))}
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-semibold text-emerald-400 block truncate">
                ✓ Đã nhận {data.inputImages.length} ảnh sản phẩm qua dây nối
              </span>
              <span className="text-[9px] text-gray-400 block truncate">
                {data.productName ? `${data.productName}` : 'Sẵn sàng bấm chạy sinh ảnh'}
              </span>
            </div>
          </div>
        ) : (
          <div className="p-2 rounded-xl bg-amber-950/20 border border-amber-800/40 text-[10px] text-amber-300 text-center flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>Chưa nhận ảnh: Hãy nối dây từ Node Ảnh Sản Phẩm (hoặc tải ảnh)</span>
          </div>
        )}

        {/* Image specs */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Tỷ lệ</label>
            <select
              value={aspectRatio}
              onChange={(e) => updateSetting('aspectRatio', e.target.value as AspectRatio)}
              className="w-full bg-[#18191A] border border-[#3E4042] text-[11px] rounded-lg p-1.5 text-white outline-none focus:border-[#1877F2]"
            >
              <option value="1:1">1:1 Vuông</option>
              <option value="16:9">16:9 HD</option>
              <option value="9:16">9:16 Story</option>
              <option value="4:3">4:3</option>
              <option value="3:4">3:4</option>
              <option value="4:1">4:1 Banner</option>
            </select>
          </div>
          <div>
            <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Độ nét</label>
            <select
              value={imageSize}
              onChange={(e) => updateSetting('imageSize', e.target.value as ImageSize)}
              className="w-full bg-[#18191A] border border-[#3E4042] text-[11px] rounded-lg p-1.5 text-white outline-none focus:border-[#1877F2]"
            >
              <option value="1K">1K Nhanh</option>
              <option value="2K">2K Chuẩn</option>
              <option value="4K">4K Ultra</option>
            </select>
          </div>
          <div>
            <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Mô hình</label>
            <select
              value={imageModel}
              onChange={(e) => updateSetting('imageModel', e.target.value as ImageModelTier)}
              className="w-full bg-[#18191A] border border-[#3E4042] text-[11px] rounded-lg p-1.5 text-white outline-none focus:border-[#1877F2]"
            >
              <option value="FLASH">Flash 3.1</option>
              <option value="PRO">Pro 3.0</option>
            </select>
          </div>
        </div>

        {/* Thumbnail preview if generated */}
        {data.outputImageUrl && (
          <div className="relative aspect-video rounded-xl overflow-hidden border border-emerald-500/50 bg-[#18191A] group">
            <img src={data.outputImageUrl} alt="Generated output" className="w-full h-full object-contain" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-bold text-emerald-400 transition-opacity">
              Đã tạo thành công
            </div>
          </div>
        )}
      </div>

      {/* Cổng Ra Duy Nhất: Ảnh Thành Phẩm */}
      <Handle
        type="source"
        position={Position.Right}
        id="out"
        style={{ top: '50%' }}
        className="!w-4 !h-4 !bg-[#18191A] !border-2 !border-emerald-400 hover:!border-cyan-400 hover:!scale-125 transition-all shadow-md cursor-crosshair !-right-2"
        title="Điểm Xuất Ảnh Thành Phẩm (Output)"
      />
    </div>
  );
};
