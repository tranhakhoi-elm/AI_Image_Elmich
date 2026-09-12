import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AspectRatio, ColorChangeEntry, GenerationSettings } from '../../../types';
import { FileDropzone } from '../common/FileDropzone';
import { ModelSelection } from '../common/ModelSelection';
import { StepIndicator } from '../common/StepIndicator';

interface ColorChangeWorkflowProps {
  settings: GenerationSettings;
  setSettings: React.Dispatch<React.SetStateAction<GenerationSettings>>;
  colorChangeStep: number;
  setColorChangeStep: (step: number) => void;
  // currentSampleImage giữ ở App.tsx vì onImageUpload() (vẫn ở App.tsx) ghi
  // trực tiếp vào state này khi type === 'color_sample'.
  currentSampleImage: string | null;
  setCurrentSampleImage: (val: string | null) => void;
  onImageUpload: (filesOrEvent: React.ChangeEvent<HTMLInputElement> | FileList, type: 'product' | 'color_sample') => void;
  startGeneration: () => void;
}

/** Workflow 4 — Đổi màu sản phẩm (COLOR_CHANGE). Tách từ App.tsx (`renderColorWorkflow`). */
export const ColorChangeWorkflow: React.FC<ColorChangeWorkflowProps> = ({
  settings,
  setSettings,
  colorChangeStep,
  setColorChangeStep,
  currentSampleImage,
  setCurrentSampleImage,
  onImageUpload,
  startGeneration,
}) => {
  const productFilesRef = useRef<HTMLInputElement>(null);
  const colorSampleRef = useRef<HTMLInputElement>(null);
  const [currentColorPart, setCurrentColorPart] = useState('');
  const [currentPantoneCode, setCurrentPantoneCode] = useState('');
  const [currentColorDescription, setCurrentColorDescription] = useState('');

  return (
    <div className="space-y-6">
      <StepIndicator current={colorChangeStep} total={3} labels={['Dữ liệu', 'Màu sắc', 'Xuất bản']} />

      <AnimatePresence mode="wait">
        <motion.div
          key={colorChangeStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {colorChangeStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
                <input type="text" placeholder="Tên SP..." className="w-full bg-[#242526]  border border-[#3E4042] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#1877F2] transition-colors" value={settings.productName} onChange={e => setSettings({...settings, productName: e.target.value})} />

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-white uppercase">Ảnh sản phẩm gốc</label>
                  <FileDropzone onFilesDrop={(f) => onImageUpload(f, 'product')} onClick={() => productFilesRef.current?.click()} className="h-40 w-full bg-[#242526]  border-2 border-dashed border-[#3E4042] rounded-2xl flex items-center justify-center cursor-pointer overflow-hidden group hover:border-[#1877F2] transition-all">
                    {settings.productImages[0] ? <img src={settings.productImages[0]} className="h-full object-contain" referrerPolicy="no-referrer" /> : <span className="text-white font-bold text-xs uppercase group-hover:text-[#1877F2]">+ Ảnh gốc</span>}
                  </FileDropzone>
                  <input type="file" hidden ref={productFilesRef} accept="image/*" onChange={e => onImageUpload(e, 'product')} />
                </div>
              </div>
              <button disabled={!settings.productImages[0]} onClick={() => setColorChangeStep(2)} className="w-full py-4 bg-[#1877F2] text-white font-bold rounded-xl uppercase text-xs disabled:opacity-50">Tiếp tục</button>
            </div>
          )}

          {colorChangeStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
                  <div className="space-y-3">
                    <label className="block text-[10px] font-bold text-white uppercase">Danh sách thay đổi màu</label>
                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                      {settings.colorChanges.map((c, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-[#242526]  rounded-xl border border-white/5 text-[10px]">
                          <div className="flex items-center gap-3">
                            {c.sampleImage && <img src={c.sampleImage} className="w-8 h-8 rounded object-cover border border-[#3E4042]" referrerPolicy="no-referrer" />}
                            <div>
                              <div className="font-bold text-white">{c.partName}</div>
                              <div className="text-white">{c.pantoneCode || 'Không có mã Pantone'}</div>
                            </div>
                          </div>
                          <button onClick={()=>setSettings(s=>({...s, colorChanges:s.colorChanges.filter((_,idx)=>idx!==i)}))} className="text-red-400 hover:text-red-300">✕</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#242526]  p-4 rounded-2xl border border-[#3E4042] space-y-3">
                      <div className="text-[9px] font-bold text-[#1877F2] uppercase mb-1">Thêm vị trí đổi màu</div>
                      <input type="text" placeholder="Vị trí (VD: Thân vỏ, Nắp chai...)" className="w-full bg-[#242526] shadow-sm border border-[#3E4042] border border-[#3E4042] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#1877F2]" value={currentColorPart} onChange={e=>setCurrentColorPart(e.target.value)} />

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <label className="block text-[8px] font-bold text-white uppercase">Mã Pantone (Tùy chọn)</label>
                          <input type="text" placeholder="VD: Pantone 18-1662" className="w-full bg-[#242526] shadow-sm border border-[#3E4042] border border-[#3E4042] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#1877F2]" value={currentPantoneCode} onChange={e=>setCurrentPantoneCode(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-[8px] font-bold text-white uppercase">Ảnh mẫu màu</label>
                          <FileDropzone onFilesDrop={(f) => onImageUpload(f, 'color_sample')} onClick={() => colorSampleRef.current?.click()} className="h-[38px] w-full bg-[#242526] shadow-sm border border-[#3E4042] border border-dashed border-[#3E4042] rounded-lg flex items-center justify-center cursor-pointer overflow-hidden group hover:border-[#1877F2] transition-all">
                            {currentSampleImage ? <img src={currentSampleImage} className="h-full object-cover w-full" referrerPolicy="no-referrer" /> : <span className="text-[8px] text-white uppercase group-hover:text-[#1877F2]">+ Tải ảnh</span>}
                          </FileDropzone>
                          <input type="file" hidden ref={colorSampleRef} accept="image/*" onChange={e => onImageUpload(e, 'color_sample')} />
                        </div>
                      </div>

                      <textarea placeholder="Mô tả thêm (VD: Màu đỏ nhám, hiệu ứng kim loại...)" className="w-full bg-[#242526] shadow-sm border border-[#3E4042] border border-[#3E4042] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#1877F2] h-16 resize-none custom-scrollbar" value={currentColorDescription} onChange={e=>setCurrentColorDescription(e.target.value)} />

                      <button
                        onClick={()=>{
                          if(currentColorPart){
                            setSettings(s=>({...s, colorChanges:[...s.colorChanges, {
                              partName: currentColorPart,
                              pantoneCode: currentPantoneCode,
                              description: currentColorDescription,
                              sampleImage: currentSampleImage || undefined
                            } as ColorChangeEntry]}));
                            setCurrentColorPart('');
                            setCurrentPantoneCode('');
                            setCurrentColorDescription('');
                            setCurrentSampleImage(null);
                          }
                        }}
                        className="w-full py-2 bg-[#3A3B3C] hover:bg-[#242526]/20 rounded-lg text-[10px] font-bold text-white transition-all"
                      >
                        + Thêm vào danh sách
                      </button>
                  </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setColorChangeStep(1)} className="flex-1 py-4 border border-[#3E4042] text-white rounded-xl text-[10px] font-bold hover:bg-[#242526] ">Quay lại</button>
                <button onClick={() => setColorChangeStep(3)} className="flex-[2] py-4 bg-[#1877F2] text-white font-bold rounded-xl uppercase text-xs">Tiếp tục</button>
              </div>
            </div>
          )}

          {colorChangeStep === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-white uppercase">Tỉ lệ khung hình</label>
                  <select className="w-full bg-[#242526]  border border-[#3E4042] rounded-lg p-2 text-[10px] text-white outline-none focus:border-[#1877F2]" value={settings.aspectRatio} onChange={e => setSettings({...settings, aspectRatio: e.target.value as AspectRatio})}>
                    {['1:1', '3:4', '4:3', '9:16', '16:9', '1:4', '4:1'].map(r => <option key={r} value={r} className="bg-[#242526]">{r}</option>)}
                  </select>
                </div>

                <ModelSelection imageSize={settings.imageSize} onChange={(size) => setSettings({ ...settings, imageSize: size })} imageModel={settings.imageModel} onModelChange={(model) => setSettings({ ...settings, imageModel: model })} />
              </div>

              <div className="flex gap-2">
                <button onClick={() => setColorChangeStep(2)} className="flex-1 py-4 border border-[#3E4042] text-white rounded-xl text-[10px] font-bold hover:bg-[#242526] ">Quay lại</button>
                <button onClick={() => startGeneration()} className="flex-[2] py-4 bg-[#1877F2] text-white font-bold rounded-xl uppercase text-xs shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all">Tạo ảnh</button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
