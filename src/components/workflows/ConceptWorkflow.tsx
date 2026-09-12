import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Wand2 } from 'lucide-react';
import { AISuggestions, GenerationSettings } from '../../../types';
import { analyzeProductMaterials } from '../../../services/geminiService';
import { FileDropzone } from '../common/FileDropzone';
import { StepIndicator } from '../common/StepIndicator';

interface ConceptWorkflowProps {
  settings: GenerationSettings;
  setSettings: React.Dispatch<React.SetStateAction<GenerationSettings>>;
  conceptStep: number;
  setConceptStep: (step: number) => void;
  suggestions: AISuggestions;
  onImageUpload: (filesOrEvent: React.ChangeEvent<HTMLInputElement> | FileList, type: 'product' | 'reference') => void;
  isAnalyzingMaterial: boolean;
  setIsAnalyzingMaterial: (val: boolean) => void;
  setAlertMessage: (msg: string | null) => void;
  handleConceptAnalysis: () => void;
  handlePropSuggestion: () => void;
  customProp: string;
  setCustomProp: (val: string) => void;
  addCustomPropToList: () => void;
  toggleProp: (propName: string) => void;
  // Bước 4 (camera + Tạo ảnh) dùng chung UI với STUDIO/TRACK_SOCKET_STAGING —
  // App.tsx truyền hàm render sẵn có xuống thay vì tách riêng.
  renderCameraSettings: (onBack: () => void) => React.ReactNode;
}

/** Workflow 1 — Ảnh phối cảnh (CONCEPT). Tách từ App.tsx (`renderConceptWorkflow`). */
export const ConceptWorkflow: React.FC<ConceptWorkflowProps> = ({
  settings,
  setSettings,
  conceptStep,
  setConceptStep,
  suggestions,
  onImageUpload,
  isAnalyzingMaterial,
  setIsAnalyzingMaterial,
  setAlertMessage,
  handleConceptAnalysis,
  handlePropSuggestion,
  customProp,
  setCustomProp,
  addCustomPropToList,
  toggleProp,
  renderCameraSettings,
}) => {
  const productFilesRef = useRef<HTMLInputElement>(null);
  const refFileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-6">
      <StepIndicator current={conceptStep} total={4} labels={['Dữ liệu', 'Ý tưởng', 'Đạo cụ', 'Xuất bản']} />

      <AnimatePresence mode="wait">
        <motion.div
          key={conceptStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {conceptStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[9px] font-bold text-white uppercase mb-2">Thông tin sản phẩm</label>
                    <div className="grid grid-cols-3 gap-2">
                      <input type="text" placeholder="Tên sản phẩm..." className="col-span-2 bg-[#242526]  border border-[#3E4042] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#1877F2] transition-colors" value={settings.productName} onChange={e => setSettings({...settings, productName: e.target.value})} />
                      <input type="text" placeholder="Mã sản phẩm..." className="bg-[#242526]  border border-[#3E4042] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#1877F2] transition-colors" value={settings.productCode || ''} onChange={e => setSettings({...settings, productCode: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                       {['length', 'width', 'height'].map(f => (
                         <input key={f} type="number" placeholder={f === 'length' ? 'Dài (mm)' : f === 'width' ? 'Rộng (mm)' : 'Cao (mm)'} className="bg-[#242526]  border border-[#3E4042] rounded-lg p-2 text-xs text-white outline-none focus:border-[#1877F2] transition-colors" value={(settings.dimensions as any)[f]} onChange={e => setSettings({...settings, dimensions: {...settings.dimensions, [f]: e.target.value}})} />
                       ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-white uppercase mb-2">Mô tả đặc tính vật liệu (Quan trọng để khử CGI)</label>
                    <textarea
                      rows={3}
                      placeholder="Ví dụ: Inox xước hairline mờ, tay cầm nhựa nhám, nắp kính cường lực..."
                      className="w-full bg-[#242526] border border-[#3E4042] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#1877F2] resize-none transition-all placeholder:text-gray-500"
                      value={settings.whiteBGMaterialsDescription || ''}
                      onChange={e => setSettings({...settings, whiteBGMaterialsDescription: e.target.value})}
                    />
                  </div>

                  <button
                    type="button"
                    disabled={settings.productImages.length === 0 || isAnalyzingMaterial}
                    onClick={async (e) => {
                      e.preventDefault();
                      if (settings.productImages.length === 0) return;
                      setIsAnalyzingMaterial(true);
                      try {
                        const result = await analyzeProductMaterials(settings.productImages[0]);
                        setSettings(s => ({
                          ...s,
                          whiteBGSelectedCategories: result.categories,
                          whiteBGMaterialsDescription: result.description
                        }));
                      } catch (err: any) {
                        console.error("Auto analyze failed:", err);
                        setAlertMessage("Lỗi phân tích chất liệu. Vui lòng thử lại.");
                      } finally {
                        setIsAnalyzingMaterial(false);
                      }
                    }}
                    className="w-full py-2 bg-[#2A2B2C] border border-[#1877F2]/30 text-[#1877F2] font-bold rounded-xl text-xs hover:bg-[#1877F2]/10 transition-all flex items-center justify-center gap-2"
                  >
                    {isAnalyzingMaterial ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                    {isAnalyzingMaterial ? 'Đang phân tích chất liệu...' : '✨ Tự động nhận diện chất liệu bằng AI'}
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[9px] font-bold text-white uppercase mb-2">Ảnh sản phẩm (Tải 1-5 ảnh)</label>
                    <div className="grid grid-cols-5 gap-2">
                       {settings.productImages.map((img, i) => (
                         <div key={i} className="aspect-square bg-[#242526]  border border-[#3E4042] rounded-lg overflow-hidden relative group">
                           <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                           <button onClick={() => setSettings(s => ({...s, productImages: s.productImages.filter((_, idx) => idx !== i)}))} className="absolute inset-0 bg-red-500/80 opacity-0 group-hover:opacity-100 transition-all text-xs flex items-center justify-center text-white">✕</button>
                         </div>
                       ))}
                       {settings.productImages.length < 5 && (
                         <FileDropzone onFilesDrop={(f) => onImageUpload(f, 'product')} onClick={() => productFilesRef.current?.click()} className="aspect-square border-2 border-dashed border-[#3E4042] rounded-lg text-white/40 flex items-center justify-center hover:border-[#1877F2] hover:text-[#1877F2] transition-all">+</FileDropzone>
                       )}
                    </div>
                    <input type="file" hidden ref={productFilesRef} accept="image/*" multiple onChange={e => onImageUpload(e, 'product')} />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-white uppercase mb-2">Ảnh mẫu style tham khảo</label>
                    <FileDropzone onFilesDrop={(f) => onImageUpload(f, 'reference')} onClick={() => refFileRef.current?.click()} className="h-24 w-full bg-[#242526]  border-2 border-dashed border-[#3E4042] rounded-xl flex items-center justify-center cursor-pointer hover:border-[#1877F2] transition-all overflow-hidden group">
                       {settings.referenceImage ? <img src={settings.referenceImage} className="h-full w-full object-contain" referrerPolicy="no-referrer" /> : <span className="text-white text-[10px] font-bold uppercase group-hover:text-[#1877F2]">+ Thêm ảnh mẫu style</span>}
                    </FileDropzone>
                    <input type="file" hidden ref={refFileRef} accept="image/*" onChange={e => onImageUpload(e, 'reference')} />
                  </div>
                </div>
              </div>

              <button type="button" onClick={handleConceptAnalysis} className="w-full py-4 bg-[#1877F2] text-white font-bold rounded-xl uppercase text-xs shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:brightness-110 transition-all">Tiếp tục</button>
            </div>
          )}

          {conceptStep === 2 && (
            <div className="space-y-4">
               <label className="block text-[9px] font-bold text-white uppercase">Chọn Phối cảnh</label>
               <div className="grid grid-cols-1 xl:grid-cols-2 gap-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                 {suggestions.concepts.map((c, idx) => (
                   <button key={idx} onClick={() => setSettings({...settings, concept: c.prompt, conceptTitle: c.title})} className={`w-full text-left p-4 rounded-xl border transition-all ${settings.concept === c.prompt ? 'bg-[#1877F2] text-white border-[#1877F2]' : 'bg-[#242526] shadow-sm text-white border-[#3E4042] text-white hover:bg-[#3A3B3C]'}`}>
                     <div className="font-bold text-[11px] mb-1">{c.title}</div>
                     <div className="text-[10px] leading-relaxed opacity-80 whitespace-pre-line">{c.prompt}</div>
                   </button>
                 ))}
               </div>

               <div className="pt-4 border-t border-[#3E4042] space-y-2">
                  <label className="block text-[9px] font-bold text-white uppercase">Chỉnh sửa hoặc mô tả thêm về phối cảnh</label>
                  <textarea
                    placeholder="Mô tả chi tiết hơn hoặc chỉnh sửa phối cảnh..."
                    className="w-full bg-[#242526]  border border-[#3E4042] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#1877F2] resize-none h-24 custom-scrollbar"
                    value={settings.concept}
                    onChange={e => setSettings({...settings, concept: e.target.value})}
                  />
               </div>

               <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setConceptStep(1)} className="flex-1 py-4 border border-[#3E4042] text-white rounded-xl uppercase text-[10px] font-bold hover:bg-[#242526] ">Quay lại</button>
                  <button type="button" onClick={handlePropSuggestion} className="flex-[2] py-4 bg-[#1877F2] text-white font-bold rounded-xl uppercase text-xs">Tiếp tục</button>
               </div>
            </div>
          )}

          {conceptStep === 3 && (
            <div className="space-y-5">
              <div className="bg-[#1877F2]/10 p-3 rounded-xl border border-cyan-500/20">
                 <div className="text-[8px] font-bold text-[#1877F2] uppercase mb-1">Phối cảnh đã chọn:</div>
                 <div className="text-[10px] text-white italic">"{settings.concept}"</div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
                <div className="space-y-2">
                   <label className="block text-[9px] font-bold text-white uppercase">Vị trí và tỷ lệ sản phẩm</label>
                   <textarea
                     className="w-full bg-[#242526]  border border-[#3E4042] rounded-xl p-3 text-xs text-white outline-none focus:border-[#1877F2] min-h-[80px] custom-scrollbar"
                     value={settings.placement}
                     onChange={e => setSettings(prev => ({ ...prev, placement: e.target.value }))}
                     placeholder="Nhập vị trí và tỷ lệ sản phẩm..."
                   />
                </div>

                <div className="space-y-4">
                  <div>
                     <label className="block text-[9px] font-bold text-white uppercase mb-2">Gợi ý đạo cụ</label>
                     <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto custom-scrollbar">
                        {suggestions.props.map(p => (
                          <button key={p} onClick={() => toggleProp(p)} className={`px-3 py-2 rounded-lg border text-[9px] font-bold transition-all ${settings.props.some(i => i.name === p) ? 'bg-[#1877F2] text-white border-[#1877F2]' : 'bg-[#242526] shadow-sm text-white border-[#3E4042] text-white hover:text-white'}`}>{p}</button>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-[#3E4042]">
                     <label className="block text-[9px] font-bold text-white uppercase">Thêm đạo cụ khác</label>
                     <div className="flex gap-2">
                        <input type="text" placeholder="Nhập tên đạo cụ..." className="flex-1 bg-[#242526]  border border-[#3E4042] rounded-xl px-4 text-xs text-white outline-none focus:border-[#1877F2]" value={customProp} onChange={e => setCustomProp(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustomPropToList()} />
                        <button type="button" onClick={addCustomPropToList} className="px-5 bg-[#3A3B3C] rounded-xl text-white font-bold hover:bg-[#242526]/20 transition-all">+</button>
                     </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                  <button type="button" onClick={() => setConceptStep(2)} className="flex-1 py-4 border border-[#3E4042] text-white rounded-xl uppercase text-[10px] font-bold hover:bg-[#242526] ">Quay lại</button>
                  <button type="button" onClick={() => setConceptStep(4)} className="flex-[2] py-4 bg-[#1877F2] text-white font-bold rounded-xl uppercase text-xs">Tiếp tục</button>
              </div>
            </div>
          )}

          {conceptStep === 4 && renderCameraSettings(() => setConceptStep(3))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
