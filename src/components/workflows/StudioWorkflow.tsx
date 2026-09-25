import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Wand2 } from 'lucide-react';
import { AISuggestions, GenerationSettings } from '../../../types';
import { analyzeProductMaterials } from '../../../services/geminiService';
import { FileDropzone } from '../common/FileDropzone';
import { StepIndicator } from '../common/StepIndicator';

const EMPTY_SPACE_OPTIONS = [
  { id: 'TOP', label: 'Ở trên' },
  { id: 'BOTTOM', label: 'Ở dưới' },
  { id: 'LEFT', label: 'Bên trái' },
  { id: 'RIGHT', label: 'Bên phải' },
  { id: 'NONE', label: 'Không để trống' },
];

interface StudioWorkflowProps {
  settings: GenerationSettings;
  setSettings: React.Dispatch<React.SetStateAction<GenerationSettings>>;
  studioStep: number;
  setStudioStep: (step: number) => void;
  suggestions: AISuggestions;
  onImageUpload: (filesOrEvent: React.ChangeEvent<HTMLInputElement> | FileList, type: 'product') => void;
  isAnalyzingMaterial: boolean;
  setIsAnalyzingMaterial: (val: boolean) => void;
  setAlertMessage: (msg: string | null) => void;
  handleStudioAnalysis: () => void;
  handleStudioPropSuggestion: () => void;
  handleMoreStudioPropSuggestion: () => void;
  customProp: string;
  setCustomProp: (val: string) => void;
  addCustomPropToList: () => void;
  toggleProp: (propName: string) => void;
  // Bước 4 (camera + Tạo ảnh) dùng chung UI với CONCEPT/TRACK_SOCKET_STAGING —
  // App.tsx truyền hàm render sẵn có xuống thay vì tách riêng.
  renderCameraSettings: (onBack: () => void) => React.ReactNode;
}

/** Workflow 8 — Chụp ảnh trong Studio (STUDIO). Tách từ App.tsx (`renderStudioWorkflow`). */
export const StudioWorkflow: React.FC<StudioWorkflowProps> = ({
  settings,
  setSettings,
  studioStep,
  setStudioStep,
  suggestions,
  onImageUpload,
  isAnalyzingMaterial,
  setIsAnalyzingMaterial,
  setAlertMessage,
  handleStudioAnalysis,
  handleStudioPropSuggestion,
  handleMoreStudioPropSuggestion,
  customProp,
  setCustomProp,
  addCustomPropToList,
  toggleProp,
  renderCameraSettings,
}) => {
  const productFilesRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-6">
      <StepIndicator current={studioStep} total={4} labels={['Dữ liệu', 'Concept', 'Bố cục', 'Xuất bản']} />

      <AnimatePresence mode="wait">
        <motion.div
          key={studioStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {studioStep === 1 && (
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
                         <input key={f} type="number" placeholder={f === 'length' ? 'Dài (mm)' : f === 'width' ? 'Rộng (mm)' : 'Cao (mm)'} className="bg-[#242526]  border border-[#3E4042] rounded-lg p-2 text-xs text-white outline-none focus:border-[#1877F2]" value={(settings.dimensions as any)[f]} onChange={e => setSettings({...settings, dimensions: {...settings.dimensions, [f]: e.target.value}})} />
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
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-[9px] font-bold text-white uppercase">Ảnh sản phẩm (Nền trắng hoặc ảnh chụp điện thoại)</label>
                      {settings.productImages.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSettings(s => ({ ...s, productImages: [], whiteBGMaterialsDescription: '', concept: '', props: [] }))}
                          className="text-[9px] text-red-400 hover:text-red-300 font-bold transition-colors"
                        >
                          ✕ Đổi sản phẩm (Xóa ảnh cũ)
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                       {settings.productImages.map((img, i) => (
                         <div key={i} className="aspect-square bg-[#242526]  border border-[#3E4042] rounded-lg overflow-hidden relative group">
                           <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                           <button onClick={() => setSettings(s => ({...s, productImages: s.productImages.filter((_, idx) => idx !== i)}))} className="absolute inset-0 bg-red-500/80 opacity-0 group-hover:opacity-100 transition-all text-xs">✕</button>
                         </div>
                       ))}
                       {settings.productImages.length < 5 && (
                         <FileDropzone onFilesDrop={(f) => onImageUpload(f, 'product')} onClick={() => productFilesRef.current?.click()} className="aspect-square border-2 border-dashed border-[#3E4042] rounded-lg text-white flex items-center justify-center hover:border-[#1877F2] transition-all">+</FileDropzone>
                       )}
                    </div>
                    <input type="file" hidden ref={productFilesRef} accept="image/*" multiple onChange={e => onImageUpload(e, 'product')} />
                  </div>
                </div>
              </div>

              <button type="button" onClick={handleStudioAnalysis} className="w-full py-4 bg-[#1877F2] text-white font-bold rounded-xl uppercase text-xs shadow-lg hover:brightness-110 transition-all">Tiếp tục</button>
            </div>
          )}

          {studioStep === 2 && (
            <div className="space-y-4">
               <label className="block text-[9px] font-bold text-white uppercase">Chọn Concept Studio</label>
               <div className="grid grid-cols-1 xl:grid-cols-2 gap-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                 {suggestions.concepts.map((c, idx) => (
                   <button key={idx} onClick={() => setSettings({...settings, concept: c.prompt})} className={`w-full text-left p-4 rounded-xl border transition-all ${settings.concept === c.prompt ? 'bg-[#1877F2]/20 text-[#1877F2] border-[#1877F2] text-white border-[#1877F2]' : 'bg-[#242526]  border-[#3E4042] text-white hover:bg-[#3A3B3C]'}`}>
                     <div className="font-bold text-[11px] mb-1">{c.title}</div>
                     <div className="text-[10px] leading-relaxed opacity-80 whitespace-pre-line">{c.prompt}</div>
                   </button>
                 ))}
               </div>

               <div className="pt-4 border-t border-[#3E4042] space-y-2">
                  <label className="block text-[9px] font-bold text-white uppercase">Chỉnh sửa hoặc mô tả thêm về concept</label>
                  <textarea
                    placeholder="Mô tả chi tiết hơn hoặc chỉnh sửa concept..."
                    className="w-full bg-[#242526]  border border-[#3E4042] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#1877F2] resize-none h-24 custom-scrollbar"
                    value={settings.concept}
                    onChange={e => setSettings({...settings, concept: e.target.value})}
                  />
               </div>

               <div className="flex gap-2 pt-2">
                  <button onClick={() => setStudioStep(1)} className="flex-1 py-4 border border-[#3E4042] text-white rounded-xl uppercase text-[10px] font-bold hover:bg-[#242526] ">Quay lại</button>
                  <button onClick={handleStudioPropSuggestion} className="flex-[2] bg-[#1877F2] text-white font-bold rounded-xl uppercase text-xs">Tiếp tục</button>
               </div>
            </div>
          )}

          {studioStep === 3 && (
            <div className="space-y-5">
              <div className="bg-[#1877F2]/20 text-[#1877F2] border-[#1877F2]/10 p-3 rounded-xl border border-[#1877F2]/20">
                 <div className="text-[8px] font-bold text-[#1877F2] uppercase mb-1">Concept Studio đã chọn:</div>
                 <div className="text-[10px] text-white italic">"{settings.concept}"</div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
                <div className="space-y-4">
                  <div className="space-y-2">
                     <label className="block text-[9px] font-bold text-white uppercase">Vị trí và tỷ lệ sản phẩm</label>
                     <textarea
                       className="w-full bg-[#242526]  border border-[#3E4042] rounded-xl p-3 text-xs text-white outline-none focus:border-[#1877F2] min-h-[80px] custom-scrollbar"
                       value={settings.placement}
                       onChange={e => setSettings(prev => ({ ...prev, placement: e.target.value }))}
                       placeholder="Nhập vị trí và tỷ lệ sản phẩm..."
                     />
                  </div>

                  <div>
                     <label className="block text-[9px] font-bold text-white uppercase mb-2">Vị trí để trống chèn Text (Chọn nhiều)</label>
                     <div className="grid grid-cols-2 gap-2">
                        {EMPTY_SPACE_OPTIONS.map(pos => {
                          const isSelected = settings.emptySpacePosition.includes(pos.id as any);
                          return (
                            <button
                              key={pos.id}
                              onClick={() => {
                                if (pos.id === 'NONE') {
                                  setSettings({...settings, emptySpacePosition: ['NONE']});
                                } else {
                                  const current = settings.emptySpacePosition.filter(p => p !== 'NONE');
                                  const next = isSelected ? current.filter(p => p !== pos.id) : [...current, pos.id as any];
                                  setSettings({...settings, emptySpacePosition: next.length === 0 ? ['NONE'] : next});
                                }
                              }}
                              className={`py-2 rounded-lg border text-[9px] font-bold transition-all ${isSelected ? 'bg-[#1877F2]/20 text-[#1877F2] border-[#1877F2] text-white border-[#1877F2]' : 'bg-[#242526]  border-[#3E4042] text-white hover:text-white'}`}
                            >
                              {pos.label}
                            </button>
                          );
                        })}
                     </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                     <div className="flex items-center justify-between mb-2">
                       <label className="block text-[9px] font-bold text-white uppercase">Gợi ý đạo cụ Studio</label>
                       <button
                         type="button"
                         onClick={handleMoreStudioPropSuggestion}
                         className="text-[9px] font-bold text-[#1877F2] hover:brightness-125 transition-all flex items-center gap-1"
                       >
                         <Wand2 size={11} /> Gợi ý thêm
                       </button>
                     </div>
                     <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto custom-scrollbar">
                        {suggestions.props.map(p => (
                          <button key={p} onClick={() => toggleProp(p)} className={`px-3 py-2 rounded-lg border text-[9px] font-bold transition-all ${settings.props.some(i => i.name === p) ? 'bg-[#1877F2]/20 text-[#1877F2] border-[#1877F2] text-white border-[#1877F2]' : 'bg-[#242526]  border-[#3E4042] text-white hover:text-white'}`}>{p}</button>
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
              <button onClick={() => setStudioStep(2)} className="flex-1 py-4 border border-[#3E4042] text-white rounded-xl uppercase text-[10px] font-bold">Quay lại</button>
              <button onClick={() => setStudioStep(4)} className="flex-[2] bg-[#1877F2] text-white font-bold rounded-xl uppercase text-xs">Tiếp tục</button>
          </div>
        </div>
      )}
    </motion.div>
  </AnimatePresence>

  {studioStep === 4 && renderCameraSettings(() => setStudioStep(3))}
</div>
  );
};
