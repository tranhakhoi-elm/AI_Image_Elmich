import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check } from 'lucide-react';
import { GenerationSettings, PackagingFaces } from '../../../types';
import { FileDropzone } from '../common/FileDropzone';
import { ModelSelection } from '../common/ModelSelection';

// Bản sao cục bộ của StepIndicator trong App.tsx (giữ đúng giao diện gốc —
// khác với StepIndicator đơn giản hơn trong PackagingCheckWorkflow.tsx).
const StepIndicator = ({ current, total, labels }: { current: number; total: number; labels: string[] }) => (
  <div className="w-full mb-8">
    <div className="flex items-center justify-between relative">
      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[#242526]/10 -translate-y-1/2 z-0" />
      <motion.div
        className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 -translate-y-1/2 z-0"
        initial={{ width: 0 }}
        animate={{ width: `${((current - 1) / (total - 1)) * 100}%` }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />
      {labels.map((label, idx) => {
        const stepNum = idx + 1;
        const isActive = stepNum === current;
        const isCompleted = stepNum < current;
        return (
          <div key={idx} className="relative z-10 flex flex-col items-center">
            <motion.div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                isActive ? 'bg-[#242526] border-[#1877F2] text-[#1877F2] shadow-[0_0_15px_rgba(34,211,238,0.4)]' :
                isCompleted ? 'bg-[#1877F2] border-cyan-500 text-white' :
                'bg-[#242526] border-[#3E4042] text-white/40'
              }`}
              animate={isActive ? { scale: 1.1 } : { scale: 1 }}
            >
              {isCompleted ? <Check size={16} strokeWidth={3} /> : <span className="text-xs font-bold">{stepNum}</span>}
            </motion.div>
            <div className={`absolute top-10 whitespace-nowrap text-[8px] font-bold uppercase tracking-wider transition-colors duration-300 ${
              isActive ? 'text-[#1877F2]' : 'text-white'
            }`}>
              {label}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

interface PackagingMockupWorkflowProps {
  settings: GenerationSettings;
  setSettings: React.Dispatch<React.SetStateAction<GenerationSettings>>;
  packagingStep: number;
  setPackagingStep: (step: number) => void;
  // Ref dùng chung với App.tsx: onImageUpload() (vẫn ở App.tsx) đọc giá trị
  // này để biết đang upload cho mặt bao bì nào — phải là CÙNG 1 ref object.
  pendingPackagingFace: React.MutableRefObject<keyof PackagingFaces | "flat">;
  onImageUpload: (filesOrEvent: React.ChangeEvent<HTMLInputElement> | FileList, type: 'packaging') => void;
  startGeneration: () => void;
}

/** Workflow 5 — Mockup Bao bì 3D (PACKAGING_MOCKUP). Tách từ App.tsx (`renderPackagingWorkflow`). */
export const PackagingMockupWorkflow: React.FC<PackagingMockupWorkflowProps> = ({
  settings,
  setSettings,
  packagingStep,
  setPackagingStep,
  pendingPackagingFace,
  onImageUpload,
  startGeneration,
}) => {
  const packagingFileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-6">
      <StepIndicator current={packagingStep} total={3} labels={['Dữ liệu', 'Thiết kế', 'Xuất bản']} />

      <AnimatePresence mode="wait">
        <motion.div
          key={packagingStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {packagingStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <input type="text" placeholder="Tên sản phẩm..." className="col-span-2 bg-[#242526]  border border-[#3E4042] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#1877F2] transition-colors" value={settings.productName} onChange={e => setSettings({ ...settings, productName: e.target.value })} />
                <input type="text" placeholder="Mã sản phẩm..." className="bg-[#242526]  border border-[#3E4042] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#1877F2] transition-colors" value={settings.productCode || ''} onChange={e => setSettings({ ...settings, productCode: e.target.value })} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                 {['length', 'width', 'height'].map(f => (
                   <input key={f} type="number" placeholder={f === 'length' ? 'Dài (mm)' : f === 'width' ? 'Rộng (mm)' : 'Cao (mm)'} className="bg-[#242526]  border border-[#3E4042] rounded-lg p-2 text-xs text-white outline-none focus:border-[#1877F2] transition-colors" value={(settings.dimensions as any)[f]} onChange={e => setSettings({ ...settings, dimensions: { ...settings.dimensions, [f]: e.target.value } })} />
                 ))}
              </div>
              <select className="w-full bg-[#242526]  border border-[#3E4042] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#1877F2]" value={settings.packagingMaterial} onChange={e => setSettings({ ...settings, packagingMaterial: e.target.value as any })}>
                 <option value="COLOR_BOX" className="bg-[#242526]">Hộp giấy màu</option>
                 <option value="CARTON_BW" className="bg-[#242526]">Thùng Carton</option>
              </select>
              <button onClick={() => setPackagingStep(2)} className="w-full py-4 bg-[#1877F2] text-white font-bold rounded-xl uppercase text-xs">Tiếp tục</button>
            </div>
          )}
          {packagingStep === 2 && (
            <div className="space-y-4">
               <label className="block text-[9px] font-bold text-white uppercase">File thiết kế phẳng</label>
               <FileDropzone onFilesDrop={(f) => { pendingPackagingFace.current = 'flat'; onImageUpload(f, 'packaging'); }} onClick={() => { pendingPackagingFace.current = 'flat'; packagingFileRef.current?.click(); }} className="h-40 bg-[#242526]  border-2 border-dashed border-[#3E4042] rounded-xl flex items-center justify-center cursor-pointer overflow-hidden group hover:border-[#1877F2] transition-all">
                 {settings.packagingFaces.flat ? <img src={settings.packagingFaces.flat} className="h-full object-contain" referrerPolicy="no-referrer" /> : <span className="text-white text-xs font-bold uppercase group-hover:text-[#1877F2]">+ File thiết kế phẳng</span>}
               </FileDropzone>
               <input type="file" hidden ref={packagingFileRef} onChange={e => onImageUpload(e, 'packaging')} />
               <div className="flex gap-2">
                 <button onClick={() => setPackagingStep(1)} className="flex-1 py-4 border border-[#3E4042] text-white rounded-xl text-[10px] font-bold hover:bg-[#242526] ">Quay lại</button>
                 <button onClick={() => setPackagingStep(3)} className="flex-[2] py-4 bg-[#1877F2] text-white font-bold rounded-xl uppercase text-xs">Tiếp tục</button>
               </div>
            </div>
          )}
          {packagingStep === 3 && (
            <div className="space-y-4">
               <label className="block text-[9px] font-bold text-white uppercase">Kiểu xuất bản</label>
               <select className="w-full bg-[#242526]  border border-[#3E4042] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#1877F2]" value={settings.packagingOutputStyle} onChange={e => setSettings({ ...settings, packagingOutputStyle: e.target.value as any })}>
                 <option value="WHITE_BG_ROTATED" className="bg-[#242526]">Nền trắng xoay</option>
                 <option value="CONTEXTUAL" className="bg-[#242526]">Lifestyle Context</option>
               </select>
               <ModelSelection imageSize={settings.imageSize} onChange={(size) => setSettings({ ...settings, imageSize: size })} />
               <div className="flex gap-2">
                 <button onClick={() => setPackagingStep(2)} className="flex-1 py-4 border border-[#3E4042] text-white rounded-xl text-[10px] font-bold hover:bg-[#242526] ">Quay lại</button>
                 <button onClick={() => startGeneration()} className="flex-[2] py-4 bg-[#1877F2] text-white font-bold rounded-xl uppercase text-xs">Tạo ảnh</button>
               </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
