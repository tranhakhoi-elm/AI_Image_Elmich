import React, { useState, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Palette, Sparkles, Power, Layers, Camera, Box, Wrench, RefreshCw, PenTool, Image as ImageIcon } from 'lucide-react';
import { NodeHeader } from './NodeHeader';
import { PresetStyleNodeData } from '../types';
import { VisualStyle } from '../../../../types';

interface Props {
  id: string;
  data: PresetStyleNodeData;
}

export const PRESET_STYLE_CONFIGS: Record<
  string,
  {
    name: string;
    englishTag: string;
    desc: string;
    icon: React.ReactNode;
    color: string;
    borderColor: string;
    bgBadge: string;
    characteristics: string[];
  }
> = {
  CONCEPT: {
    name: 'Bối Cảnh Phong Cách Sống',
    englishTag: 'Lifestyle Concept',
    desc: 'Đặt sản phẩm trong không gian nội thất bếp/phòng ăn sang trọng, ánh sáng tự nhiên dịu nhẹ.',
    icon: <Camera size={13} />,
    color: 'text-amber-400',
    borderColor: 'border-amber-500/50',
    bgBadge: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    characteristics: ['Nội thất Japandi / Industrial', 'Góc máy 30-45°', 'Chừa 30% khoảng trống âm'],
  },
  STUDIO: {
    name: 'Studio Chuyên Nghiệp',
    englishTag: 'Creative Studio',
    desc: 'Phông nền trơn tone-on-tone cùng bục đỡ (đá marble, travertine, gỗ sồi), ánh sáng 3 điểm sắc sảo.',
    icon: <Sparkles size={13} />,
    color: 'text-purple-400',
    borderColor: 'border-purple-500/50',
    bgBadge: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
    characteristics: ['Phông nền tone-sur-tone', 'Bục Plinth cao cấp', 'Ánh sáng Softbox 3 điểm'],
  },
  TECH_PS: {
    name: 'Kỹ Thuật Bóc Tách',
    englishTag: 'Tech Effects',
    desc: 'Phân rã linh kiện 3D explode, luồng nhiệt đối lưu 360°, x-ray thấu thị mô tả công nghệ hiện đại.',
    icon: <Wrench size={13} />,
    color: 'text-cyan-400',
    borderColor: 'border-cyan-500/50',
    bgBadge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
    characteristics: ['3D Explode linh kiện', 'Nhiệt đối lưu 360°', 'Mặt cắt kim loại nhiều lớp'],
  },
  WHITE_BG_RETOUCH: {
    name: 'Ảnh Nền Trắng E-Commerce',
    englishTag: 'White BG Retouch',
    desc: 'Tách nền trắng tinh khiết chuẩn #FFFFFF, giữ nguyên độ bóng satin Inox 304, thủy tinh không chói.',
    icon: <ImageIcon size={13} />,
    color: 'text-blue-400',
    borderColor: 'border-blue-500/50',
    bgBadge: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
    characteristics: ['Nền trắng chuẩn #FFFFFF', 'Inox 304 satin xước', 'Bóng tiếp xúc tự nhiên'],
  },
  PACKAGING_MOCKUP: {
    name: 'Bao Bì & Mockup 3D',
    englishTag: 'Packaging 3D',
    desc: 'Dựng hình khối bao bì hộp/túi 3D góc nhìn phối cảnh 3/4 isometric chuẩn bản bế dieline.',
    icon: <Box size={13} />,
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/50',
    bgBadge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    characteristics: ['Tỉ lệ hộp DxRxC chuẩn', 'Nếp gấp sắc cạnh', 'Chất liệu giấy Ivory/Kraft'],
  },
  COLOR_CHANGE: {
    name: 'Đổi Màu Sản Phẩm',
    englishTag: 'Color Change',
    desc: 'Thay đổi màu sắc vỏ ngoài theo bảng màu chỉ định, giữ nguyên chất liệu kim loại và bóng sáng.',
    icon: <Palette size={13} />,
    color: 'text-rose-400',
    borderColor: 'border-rose-500/50',
    bgBadge: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    characteristics: ['Giữ 100% hình khối gốc', 'Màu sơn chuẩn Pantone', 'Phản quang bóng tự nhiên'],
  },
  LINE_ART: {
    name: 'Nét Vẽ Kỹ Thuật Line Art',
    englishTag: 'Line Art Blueprint',
    desc: 'Chuyển hình ảnh sản phẩm thành bản vẽ nét kỹ thuật vector sắc nét phục vụ sách HDSD và catalog.',
    icon: <PenTool size={13} />,
    color: 'text-yellow-400',
    borderColor: 'border-yellow-500/50',
    bgBadge: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30',
    characteristics: ['Đường nét vector mảnh', 'Sơ đồ cấu tạo kỹ thuật', 'Phù hợp in ấn sách HDSD'],
  },
  '3D_TO_REAL_WHITE_BG': {
    name: '3D Sang Ảnh Thật',
    englishTag: '3D to Real Photo',
    desc: 'Nâng cấp render 3D CAD thô ráp thành bức ảnh chụp studio hoàn hảo, chân thật.',
    icon: <RefreshCw size={13} />,
    color: 'text-teal-400',
    borderColor: 'border-teal-500/50',
    bgBadge: 'bg-teal-500/10 text-teal-300 border-teal-500/30',
    characteristics: ['Khử độ cứng giả lập của 3D', 'Bổ sung vi vân xước', 'Ánh sáng môi trường thật'],
  },
};

const STYLE_LIST: Array<{ key: VisualStyle; label: string; short: string }> = [
  { key: 'CONCEPT', label: 'Bối Cảnh Phong Cách Sống', short: 'Lifestyle' },
  { key: 'STUDIO', label: 'Studio Chuyên Nghiệp', short: 'Studio' },
  { key: 'TECH_PS', label: 'Kỹ Thuật Bóc Tách', short: 'Bóc Tách' },
  { key: 'WHITE_BG_RETOUCH', label: 'Ảnh Nền Trắng', short: 'Nền Trắng' },
  { key: 'PACKAGING_MOCKUP', label: 'Bao Bì & Mockup 3D', short: 'Bao Bì 3D' },
  { key: 'COLOR_CHANGE', label: 'Đổi Màu Sản Phẩm', short: 'Đổi Màu' },
  { key: 'LINE_ART', label: 'Nét Vẽ Kỹ Thuật', short: 'Line Art' },
  { key: '3D_TO_REAL_WHITE_BG', label: '3D Sang Ảnh Thật', short: '3D Thật' },
];

export const PresetStyleNode: React.FC<Props> = ({ id, data }) => {
  const [currentStyle, setCurrentStyle] = useState<VisualStyle>(data.presetStyle || 'CONCEPT');
  const [isActive, setIsActive] = useState<boolean>(data.isActive !== false);

  useEffect(() => {
    if (data.presetStyle && data.presetStyle !== currentStyle) {
      setCurrentStyle(data.presetStyle);
    }
    if (data.isActive !== undefined && data.isActive !== isActive) {
      setIsActive(data.isActive);
    }
  }, [data.presetStyle, data.isActive]);

  const config = PRESET_STYLE_CONFIGS[currentStyle] || PRESET_STYLE_CONFIGS.CONCEPT;

  const updateData = (newData: Partial<PresetStyleNodeData>) => {
    window.dispatchEvent(
      new CustomEvent('elmich:canvas-node-update', {
        detail: { nodeId: id, data: newData },
      })
    );
    window.dispatchEvent(
      new CustomEvent('elmich:canvas-update-node', {
        detail: { nodeId: id, data: newData },
      })
    );
  };

  const handleStyleChange = (style: VisualStyle) => {
    setCurrentStyle(style);
    const selectedCfg = PRESET_STYLE_CONFIGS[style] || PRESET_STYLE_CONFIGS.CONCEPT;
    updateData({
      presetStyle: style,
      styleName: selectedCfg.name,
      description: selectedCfg.desc,
    });
    window.dispatchEvent(
      new CustomEvent('elmich:canvas-toast', {
        detail: { message: `Đã chọn phong cách: ${selectedCfg.name}`, type: 'success' },
      })
    );
  };

  const handleToggleActive = () => {
    const nextActive = !isActive;
    setIsActive(nextActive);
    updateData({ isActive: nextActive });
  };

  return (
    <div className="w-[340px] rounded-2xl bg-[#242526] border-2 border-indigo-500/60 shadow-2xl overflow-hidden hover:border-indigo-400 transition-all text-white select-none relative">
      {/* Cổng Vào Duy Nhất (Input) */}
      <Handle
        type="target"
        position={Position.Left}
        id="in"
        style={{ top: '50%' }}
        className="!w-4 !h-4 !bg-[#18191A] !border-2 !border-[#1877F2] hover:!border-cyan-400 hover:!scale-125 transition-all shadow-md cursor-crosshair !-left-2"
        title="Cổng nhận dữ liệu (Input)"
      />

      <NodeHeader
        title={data.label || 'Preset'}
        category="utility"
        icon={<Layers size={14} className="text-indigo-400" />}
        status={data.status}
      />

      <div className="p-3.5 space-y-3">
        {/* Active Toggle & Header Banner */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-[#18191A] border border-[#3E4042]">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isActive ? 'bg-indigo-400 animate-ping' : 'bg-gray-500'
              }`}
            />
            <span className="text-[11px] font-bold text-gray-300">Trạng Thái Preset</span>
          </div>

          <button
            type="button"
            onClick={handleToggleActive}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border cursor-pointer ${
              isActive
                ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50 shadow-sm'
                : 'bg-gray-800 text-gray-400 border-gray-700'
            }`}
          >
            <Power size={11} />
            <span>{isActive ? 'ĐANG BẬT' : 'TẠM TẮT'}</span>
          </button>
        </div>

        {/* Quick Style Chips */}
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
            Chọn Nhanh Phong Cách
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {STYLE_LIST.map((item) => {
              const isSelected = currentStyle === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleStyleChange(item.key)}
                  className={`px-2 py-1.5 rounded-lg text-[10px] font-semibold transition-all border text-center truncate cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow-md ring-1 ring-indigo-400/50'
                      : 'bg-[#18191A] text-gray-300 border-[#3E4042] hover:bg-[#3A3B3C] hover:text-white'
                  }`}
                  title={item.label}
                >
                  {item.short}
                </button>
              );
            })}
          </div>
        </div>

        {/* Style Dropdown Selector */}
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            Danh Sách Đầy Đủ
          </label>
          <select
            value={currentStyle}
            onChange={(e) => handleStyleChange(e.target.value as VisualStyle)}
            className="nodrag nopan nowheel w-full bg-[#18191A] border border-[#3E4042] focus:border-indigo-500 rounded-xl p-2.5 text-xs text-white outline-none font-semibold transition-all cursor-pointer"
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
        </div>

        {/* Selected Style Detail Card */}
        <div className={`p-3 rounded-xl bg-[#18191A] border ${config.borderColor} space-y-2`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-xs text-white">
              <span className={config.color}>{config.icon}</span>
              <span>{config.name}</span>
            </div>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${config.bgBadge}`}>
              {config.englishTag}
            </span>
          </div>

          <p className="text-[11px] text-gray-300 leading-relaxed font-normal">
            {config.desc}
          </p>

          <div className="pt-1.5 border-t border-[#3E4042]/60 flex flex-wrap gap-1">
            {config.characteristics.map((charac, idx) => (
              <span
                key={idx}
                className="text-[9px] px-1.5 py-0.5 rounded-md bg-[#242526] text-gray-300 border border-[#3E4042]"
              >
                • {charac}
              </span>
            ))}
          </div>
        </div>

        {/* Port routing note */}
        <div className="flex items-center justify-between text-[10px] text-gray-400 px-1 pt-1">
          <span>Kéo dây nối sang:</span>
          <span className="text-indigo-300 font-semibold">Node AI hoặc Sinh Ảnh ➔</span>
        </div>
      </div>

      {/* Cổng Ra Duy Nhất (Output) */}
      <Handle
        type="source"
        position={Position.Right}
        id="out"
        style={{ top: '50%' }}
        className="!w-4 !h-4 !bg-[#18191A] !border-2 !border-emerald-400 hover:!border-cyan-400 hover:!scale-125 transition-all shadow-md cursor-crosshair !-right-2"
        title="Loại hình ảnh đầu ra (Output ➔ Nối vào Sinh Ảnh hoặc Node AI)"
      />
    </div>
  );
};
