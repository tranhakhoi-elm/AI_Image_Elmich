import React, { useRef } from 'react';
import { 
  Utensils, 
  Sparkles, 
  Check, 
  Sliders, 
  Camera, 
  ShieldCheck, 
  Loader2,
  Trash2
} from 'lucide-react';
import { AppState, AspectRatio, FoodRetouchBackground, FoodRetouchConfig, GenerationSettings, ImageModelTier, ImageSize } from '../../../types';
import { FileDropzone } from '../common/FileDropzone';

interface FoodRetouchWorkflowProps {
  settings: GenerationSettings;
  setSettings: React.Dispatch<React.SetStateAction<GenerationSettings>>;
  onImageUpload: (filesOrEvent: React.ChangeEvent<HTMLInputElement> | FileList, type: 'product' | 'reference') => void;
  appState: AppState;
  setAlertMessage: (msg: string | null) => void;
  startGeneration: () => void;
}

const PRESET_DISHES = [
  { id: 'peking_duck', name: 'Vịt quay Bắc Kinh (Peking Roast Duck)', defaultGarnish: 'Thanh dưa chuột tươi giòn mọng nước, đầu hành hoa trắng mọng uốn cong, bánh tráng hấp mỏng mềm, đĩa sốt tương đen tuyền sánh bóng rắc chút vừng rang' },
  { id: 'crispy_pork', name: 'Thịt heo quay giòn bì / Xá xíu mật ong', defaultGarnish: 'Đồ chua củ kiệu cà rốt, ớt tỉa hoa tươi, nước sốt tương ngọt sánh đặc' },
  { id: 'steamed_fish', name: 'Cá hấp xì dầu kiểu Hồng Kông', defaultGarnish: 'Hành hoa thái sợi mảnh, thì là, ớt đỏ thái chỉ, nước sốt tương gừng thơm lừng' },
  { id: 'hotpot_soup', name: 'Lẩu / Món hầm bổ dưỡng thảo mộc', defaultGarnish: 'Táo đỏ, kỷ tử, nấm đông cô tươi, nấm linh chi, rau thơm tươi xanh' },
];

const BACKGROUND_OPTIONS: { id: FoodRetouchBackground; label: string; desc: string; icon: string }[] = [
  { id: 'LIGHT_GRAY_STONE', label: 'Đá ghi nhạt tự nhiên', desc: 'Mặt đá phiến/granite mờ tone ghi sáng, nhám nhẹ, không bóng chói', icon: '🪨' },
  { id: 'DARK_SLATE', label: 'Đá phiến đen (Dark Slate)', desc: 'Mặt đá trầm tối cao cấp, tôn vinh độ óng ả của đồ ăn', icon: '⬛' },
  { id: 'WHITE_MARBLE', label: 'Đá cẩm thạch trắng (White Marble)', desc: 'Mặt đá cẩm thạch trắng Carrara vân mờ tinh tế', icon: '⚪' },
  { id: 'RUSTIC_WOOD', label: 'Thớt gỗ sồi mộc (Rustic Wood)', desc: 'Thớt gỗ tự nhiên phong cách ẩm thực truyền thống', icon: '🪵' },
  { id: 'CUSTOM', label: 'Tùy chỉnh khác', desc: 'Nhập mô tả mặt bàn/nền theo ý muốn', icon: '✨' },
];

export const FoodRetouchWorkflow: React.FC<FoodRetouchWorkflowProps> = ({
  settings,
  setSettings,
  onImageUpload,
  appState,
  setAlertMessage,
  startGeneration,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Read config with safe defaults
  const config: FoodRetouchConfig = settings.foodRetouchConfig || {
    dishType: 'Vịt quay Bắc Kinh (Peking Roast Duck)',
    backgroundType: 'LIGHT_GRAY_STONE',
    cleanupStudioGear: true,
    lockFoodTexture: true,
    skinCrispnessLevel: 'MAXIMUM',
    garnishMode: 'ENHANCE_AND_BALANCE',
    garnishDetails: 'Thanh dưa chuột tươi giòn mọng nước, đầu hành hoa trắng mọng uốn cong, bánh tráng hấp mỏng mềm, đĩa sốt tương đen tuyền sánh bóng rắc chút vừng rang',
    colorVibrancy: 'RICH_CARAMEL',
    cameraAngle: '45-degree angle',
    customNotes: 'Giữ nguyên đĩa vịt thật, bóc phông nền sang mặt đá ghi nhạt'
  };

  const updateConfig = (patch: Partial<FoodRetouchConfig>) => {
    setSettings(prev => ({
      ...prev,
      foodRetouchConfig: {
        ...(prev.foodRetouchConfig || config),
        ...patch
      }
    }));
  };

  const sourceImage = settings.referenceImage || settings.productImages[0] || null;

  const handleSelectPresetDish = (dish: typeof PRESET_DISHES[0]) => {
    updateConfig({
      dishType: dish.name,
      garnishDetails: dish.defaultGarnish
    });
    setSettings(prev => ({ ...prev, productName: dish.name }));
  };

  const handleTriggerStart = () => {
    if (!sourceImage) {
      setAlertMessage("Vui lòng tải lên ảnh chụp món ăn cần retouch.");
      return;
    }
    setAlertMessage(null);
    startGeneration();
  };

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* 1. Upload Source Food Image */}
      <div className="space-y-2">
        <label className="block text-[10px] font-bold text-white uppercase tracking-wider">
          1. Ảnh chụp thực tế (RAW export / JPEG / PNG)
        </label>
        
        {sourceImage ? (
          <div className="relative group rounded-xl overflow-hidden border border-[#3E4042] bg-[#18191A] p-2 flex flex-col items-center">
            <img 
              src={sourceImage} 
              alt="Dish Source" 
              className="max-h-48 w-auto object-contain rounded-lg"
            />
            <div className="w-full mt-2 pt-2 border-t border-[#3E4042] flex items-center justify-between text-xs">
              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <Check size={12} /> Đã nạp ảnh gốc
              </span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] text-[#1877F2] hover:underline font-bold"
              >
                Đổi ảnh khác
              </button>
            </div>
          </div>
        ) : (
          <FileDropzone 
            onFilesDrop={(files) => onImageUpload(files, 'reference')} 
            onClick={() => fileInputRef.current?.click()} 
            className="h-36 w-full bg-[#242526] border-2 border-dashed border-[#3E4042] rounded-xl flex flex-col items-center justify-center cursor-pointer group hover:border-[#1877F2] transition-all p-4 text-center"
          >
            <Camera size={24} className="text-gray-400 group-hover:text-[#1877F2] mb-1.5 transition-colors" />
            <span className="text-xs font-bold text-white group-hover:text-[#1877F2]">+ Tải ảnh chụp món ăn</span>
            <span className="text-[10px] text-gray-500 mt-0.5">Ảnh chụp studio chứa tản sáng, rác, phông cũ</span>
          </FileDropzone>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          hidden 
          accept="image/*" 
          onChange={(e) => onImageUpload(e, 'reference')} 
        />
      </div>

      {/* 2. Preset Dish Name */}
      <div className="space-y-2">
        <label className="block text-[10px] font-bold text-white uppercase tracking-wider">
          2. Loại món ăn
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {PRESET_DISHES.map(dish => (
            <button
              key={dish.id}
              type="button"
              onClick={() => handleSelectPresetDish(dish)}
              className={`p-2 rounded-lg border text-left text-[11px] font-medium transition-all ${
                config.dishType === dish.name
                  ? 'bg-[#1877F2]/10 border-[#1877F2] text-white shadow-sm'
                  : 'bg-[#242526] border-[#3E4042] text-gray-300 hover:border-gray-500'
              }`}
            >
              <div className="font-bold truncate">{dish.name.split('(')[0]}</div>
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Tên món ăn cụ thể..."
          className="w-full bg-[#242526] border border-[#3E4042] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#1877F2] transition-colors"
          value={config.dishType}
          onChange={e => {
            updateConfig({ dishType: e.target.value });
            setSettings(prev => ({ ...prev, productName: e.target.value }));
          }}
        />
      </div>

      {/* 3. Background Surface Selector */}
      <div className="space-y-2">
        <label className="block text-[10px] font-bold text-white uppercase tracking-wider flex items-center justify-between">
          <span>3. Mặt nền thay thế</span>
          <span className="text-[9px] text-[#1877F2] font-semibold">Theo yêu cầu của bạn</span>
        </label>
        <div className="space-y-1.5">
          {BACKGROUND_OPTIONS.map(bg => (
            <button
              key={bg.id}
              type="button"
              onClick={() => updateConfig({ backgroundType: bg.id })}
              className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                config.backgroundType === bg.id
                  ? 'bg-[#1877F2]/10 border-[#1877F2] shadow-sm'
                  : 'bg-[#242526] border-[#3E4042] hover:border-gray-500'
              }`}
            >
              <span className="text-sm mt-0.5">{bg.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>{bg.label}</span>
                  {config.backgroundType === bg.id && <Check size={13} className="text-[#1877F2]" />}
                </div>
                <p className="text-[10px] text-gray-400 leading-tight mt-0.5">{bg.desc}</p>
              </div>
            </button>
          ))}
        </div>
        {config.backgroundType === 'CUSTOM' && (
          <input
            type="text"
            placeholder="Nhập mô tả mặt nền tự do..."
            className="w-full bg-[#242526] border border-[#3E4042] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#1877F2]"
            value={config.customBackground || ''}
            onChange={e => updateConfig({ customBackground: e.target.value })}
          />
        )}
      </div>

      {/* 4. Toggles: Studio Cleanup & Food Texture Lock */}
      <div className="space-y-2 pt-1">
        {/* Cleanup Studio Gear */}
        <div className="p-3 rounded-xl bg-[#242526] border border-[#3E4042] flex items-center justify-between">
          <div className="pr-2">
            <p className="text-xs font-bold text-white">Khử tản sáng & dọn rác studio</p>
            <p className="text-[10px] text-gray-400">Xóa softbox, chân đèn, hắt sáng, vết loang dầu</p>
          </div>
          <button
            type="button"
            onClick={() => updateConfig({ cleanupStudioGear: !config.cleanupStudioGear })}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
              config.cleanupStudioGear ? 'bg-[#1877F2]' : 'bg-[#3A3B3C]'
            }`}
          >
            <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
              config.cleanupStudioGear ? 'left-5.5' : 'left-0.5'
            }`} />
          </button>
        </div>

        {/* Food Texture Lock (Bắt buộc giữ nguyên da vịt) */}
        <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-[#242526] to-[#242526] border border-amber-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 pr-2">
              <ShieldCheck size={15} className="text-amber-400 shrink-0" />
              <span className="text-xs font-bold text-white">Khóa chất liệu da vịt (Texture Lock)</span>
            </div>
            <button
              type="button"
              onClick={() => updateConfig({ lockFoodTexture: !config.lockFoodTexture })}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                config.lockFoodTexture ? 'bg-amber-500' : 'bg-[#3A3B3C]'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                config.lockFoodTexture ? 'left-5.5' : 'left-0.5'
              }`} />
            </button>
          </div>
          <p className="text-[10px] text-gray-300 leading-tight">
            Giữ 100% hạt vi mô giòn rộp của da vịt quay lò chum và sớ thịt mềm ẩm. Không làm mịn sáp/nhựa.
          </p>
        </div>
      </div>

      {/* 5. Garnish Accompaniments */}
      <div className="space-y-2">
        <label className="block text-[10px] font-bold text-white uppercase tracking-wider">
          5. Đồ ăn kèm & Garnish
        </label>
        <textarea
          rows={2}
          className="w-full bg-[#242526] border border-[#3E4042] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#1877F2] resize-none"
          value={config.garnishDetails || ''}
          onChange={e => updateConfig({ garnishDetails: e.target.value })}
          placeholder="Dưa chuột thanh mỏng, đầu hành hoa trắng mọng, bánh tráng, sốt tương ngọt..."
        />
        <div className="flex flex-wrap gap-1 text-[9px]">
          {[
            '🥒 Dưa chuột thái thanh mọng',
            '🧅 Đầu hành hoa trắng tươi',
            '🥞 Bánh tráng mỏng mềm',
            '🥣 Sốt tương ngọt sánh bóng'
          ].map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                const current = config.garnishDetails || '';
                const cleanTag = tag.slice(2);
                if (!current.includes(cleanTag)) {
                  updateConfig({ garnishDetails: current ? `${current}, ${cleanTag}` : cleanTag });
                }
              }}
              className="px-2 py-0.5 rounded-md bg-[#242526] border border-[#3E4042] text-gray-300 hover:border-[#1877F2] transition-colors"
            >
              + {tag}
            </button>
          ))}
        </div>
      </div>

      {/* 6. Ratio, Size & Model */}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Tỷ lệ</label>
          <select
            value={settings.aspectRatio}
            onChange={e => setSettings(prev => ({ ...prev, aspectRatio: e.target.value as AspectRatio }))}
            className="w-full bg-[#242526] border border-[#3E4042] rounded-lg p-2 text-xs text-white outline-none"
          >
            <option value="1:1">1:1 Vuông</option>
            <option value="4:3">4:3 Chuẩn</option>
            <option value="16:9">16:9 Ngang</option>
            <option value="3:4">3:4 Dọc</option>
          </select>
        </div>

        <div>
          <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Độ nét</label>
          <select
            value={settings.imageSize}
            onChange={e => setSettings(prev => ({ ...prev, imageSize: e.target.value as ImageSize }))}
            className="w-full bg-[#242526] border border-[#3E4042] rounded-lg p-2 text-xs text-white outline-none"
          >
            <option value="1K">1K Sắc nét</option>
            <option value="2K">2K Siêu nét</option>
            <option value="4K">4K Cực đại</option>
          </select>
        </div>

        <div>
          <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Model AI</label>
          <select
            value={settings.imageModel}
            onChange={e => setSettings(prev => ({ ...prev, imageModel: e.target.value as ImageModelTier }))}
            className="w-full bg-[#242526] border border-[#3E4042] rounded-lg p-2 text-xs text-white outline-none"
          >
            <option value="FLASH">Flash (Nhanh)</option>
            <option value="PRO">Pro (Chi tiết)</option>
          </select>
        </div>
      </div>

      {/* 7. Action Button: Calls startGeneration() */}
      <button
        type="button"
        disabled={!sourceImage || appState !== AppState.READY}
        onClick={handleTriggerStart}
        className={`w-full py-3.5 rounded-xl font-bold uppercase text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
          !sourceImage || appState !== AppState.READY
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-amber-500 to-[#1877F2] hover:opacity-95 text-white shadow-lg shadow-amber-500/20'
        }`}
      >
        {appState === AppState.GENERATING ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>AI Đang Retouch Món Ăn...</span>
          </>
        ) : (
          <>
            <Sparkles size={16} />
            <span>Bắt đầu Retouch Ảnh Món Ăn</span>
          </>
        )}
      </button>
    </div>
  );
};
