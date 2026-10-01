import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Zap, Sparkles, Power, Copy, Trash2, ShieldCheck } from 'lucide-react';
import { PromptNodeData } from '../types';

interface Props {
  id: string;
  data: PromptNodeData;
}

const QUICK_PRESETS = [
  {
    name: '💎 Luxury Penthouse',
    text: 'Không gian căn hộ Penthouse siêu sang trọng, đảo bếp mặt đá thạch anh trắng cao cấp, ánh sáng tự nhiên ban mai rọi qua cửa kính lớn, bóng đổ mịn màng, cực kỳ đẳng cấp.',
  },
  {
    name: '🎬 Cinematic Lighting',
    text: 'Ánh sáng điện ảnh tương phản cao (chiaroscuro), đèn key light 45 độ kết hợp viền sáng rim-light sắc sảo tôn trọn vẹn đường cong kim loại Inox 304 xước satin.',
  },
  {
    name: '🌿 Japandi Tối Giản',
    text: 'Không gian bếp tối giản Bắc Âu kết hợp Nhật Bản (Japandi), tủ gỗ sồi sáng tự nhiên, tường be ấm áp, ánh sáng ban ngày dịu êm và thoáng đãng không tì vết.',
  },
  {
    name: '💧 Nước & Bọt Tinh Khiết',
    text: 'Hiệu ứng sóng nước động năng tốc độ cao đóng băng chuyển động, giọt nước li ti và bọt khí trong suốt như pha lê tươi mát xung quanh sản phẩm.',
  },
  {
    name: '⚡ Nhiệt Đối Lưu 360°',
    text: 'Hiệu ứng luồng nhiệt đối lưu 360 độ phát quang rực rỡ bao quanh thân và đáy sản phẩm, nền tối than chì công nghệ cao sắc nét.',
  },
];

export const PromptNode: React.FC<Props> = ({ id, data }) => {
  const promptText = data.promptText || '';
  const isActive = data.isActive !== false; // Default to true
  const priorityLevel = data.priorityLevel || 'OVERRIDE';

  const updateData = (patch: Partial<PromptNodeData>) => {
    window.dispatchEvent(
      new CustomEvent('elmich:canvas-node-update', {
        detail: {
          nodeId: id,
          data: {
            ...data,
            ...patch,
          },
        },
      })
    );
  };

  const handleToggleActive = () => {
    const nextState = !isActive;
    updateData({ isActive: nextState });
    window.dispatchEvent(
      new CustomEvent('elmich:canvas-toast', {
        detail: {
          message: nextState ? 'Đã BẬT Prompt Ưu Tiên' : 'Đã TẠM DỪNG Prompt Ưu Tiên',
          type: nextState ? 'success' : 'info',
        },
      })
    );
  };

  const handleApplyPreset = (presetText: string) => {
    updateData({ promptText: presetText });
    window.dispatchEvent(
      new CustomEvent('elmich:canvas-toast', {
        detail: { message: 'Đã nạp mẫu prompt nhanh', type: 'success' },
      })
    );
  };

  const handleClear = () => {
    updateData({ promptText: '' });
  };

  return (
    <div
      className={`w-96 rounded-2xl bg-[#242526] border-2 shadow-2xl overflow-hidden transition-all text-white ${
        isActive
          ? 'border-violet-500 ring-2 ring-violet-500/30 hover:border-violet-400'
          : 'border-[#3E4042] opacity-75 hover:opacity-100'
      }`}
    >
      {/* Cổng Vào Duy Nhất (Input) */}
      <Handle
        type="target"
        position={Position.Left}
        id="in"
        style={{ top: '50%' }}
        className="!w-4 !h-4 !bg-[#18191A] !border-2 !border-[#1877F2] hover:!border-cyan-400 hover:!scale-125 transition-all shadow-md cursor-crosshair !-left-2"
        title="Dữ liệu văn bản nối vào (Input)"
      />

      {/* Header */}
      <div className="px-3.5 py-2.5 bg-gradient-to-r from-violet-950/80 via-[#242526] to-[#18191A] border-b border-[#3E4042] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-violet-600 text-white flex items-center justify-center shadow-md shadow-violet-900/40">
            <Zap size={14} className={isActive ? 'animate-pulse' : ''} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white tracking-wide">
                {data.label || 'Prompt'}
              </span>
              <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wider bg-violet-500/20 text-violet-300 border border-violet-500/40">
                Ưu Tiên #1
              </span>
            </div>
          </div>
        </div>

        {/* Toggle switch */}
        <button
          onClick={handleToggleActive}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
            isActive
              ? 'bg-emerald-600/30 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-600/50'
              : 'bg-[#18191A] border border-[#3E4042] text-gray-400 hover:text-white'
          }`}
          title={isActive ? 'Nhấn để tạm tắt prompt này' : 'Nhấn để kích hoạt prompt này'}
        >
          <Power size={11} className={isActive ? 'text-emerald-400' : 'text-gray-500'} />
          <span>{isActive ? 'ĐANG BẬT' : 'TẠM TẮT'}</span>
        </button>
      </div>

      <div className="p-3.5 space-y-3">
        {/* Priority Status Banner */}
        <div
          className={`p-2 rounded-xl text-[10px] flex items-start gap-2 border transition-all ${
            isActive
              ? 'bg-violet-950/40 border-violet-800/60 text-violet-200'
              : 'bg-[#18191A] border-[#3E4042] text-gray-400'
          }`}
        >
          <ShieldCheck size={14} className="text-violet-400 shrink-0 mt-0.5" />
          <div className="leading-tight space-y-0.5">
            <span className="font-bold text-white block">
              {isActive ? '⚡ Prompt này sẽ được AI ưu tiên số 1 khi sinh ảnh' : '⚠️ Prompt đang tạm tắt'}
            </span>
            <span className="text-[9px] text-gray-300">
              Nội dung bên dưới sẽ được đưa lên đầu toàn bộ câu lệnh gửi sang Gemini, buộc AI tập trung tối đa vào yêu cầu này.
            </span>
          </div>
        </div>

        {/* Textarea for Priority Prompt */}
        <div>
          <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            <span>Nội Dung Prompt Ưu Tiên</span>
            {promptText && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(promptText);
                    window.dispatchEvent(
                      new CustomEvent('elmich:canvas-toast', {
                        detail: { message: 'Đã sao chép prompt ưu tiên', type: 'info' },
                      })
                    );
                  }}
                  className="text-[9px] text-gray-400 hover:text-violet-300 transition-colors flex items-center gap-0.5 normal-case font-medium"
                  title="Sao chép prompt"
                >
                  <Copy size={10} /> Chép
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-[9px] text-gray-400 hover:text-red-400 transition-colors flex items-center gap-0.5 normal-case font-medium"
                >
                  <Trash2 size={10} /> Xóa
                </button>
              </div>
            )}
          </div>
          <textarea
            rows={4}
            value={promptText}
            onChange={(e) => updateData({ promptText: e.target.value })}
            placeholder="Nhập prompt ưu tiên vào đây... (VD: Đặt sản phẩm trên bục đá đen huyền bí, mặt nước gợn sóng phản chiếu, ánh sáng kịch tính viền vàng rim-light, tone màu điện ảnh cinematic...)"
            className="w-full bg-[#18191A] border border-[#3E4042] focus:border-violet-500 rounded-xl p-2.5 text-xs text-white outline-none resize-none transition-all placeholder:text-gray-500 leading-relaxed font-normal"
          />
          <div className="flex items-center justify-between text-[9px] text-gray-500 mt-0.5 px-0.5">
            <span>{promptText.length} ký tự</span>
            <span className="text-violet-400 font-medium">Truyền tự động qua cổng Output</span>
          </div>
        </div>

        {/* Priority Mode Switcher */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Cấp Độ Ưu Tiên
          </label>
          <div className="grid grid-cols-2 gap-1.5 bg-[#18191A] p-1 rounded-xl border border-[#3E4042]">
            <button
              type="button"
              onClick={() => updateData({ priorityLevel: 'OVERRIDE' })}
              className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all text-center flex items-center justify-center gap-1 ${
                priorityLevel === 'OVERRIDE'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Zap size={11} />
              <span>Ưu Tiên Tuyệt Đối #1</span>
            </button>
            <button
              type="button"
              onClick={() => updateData({ priorityLevel: 'APPEND' })}
              className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all text-center flex items-center justify-center gap-1 ${
                priorityLevel === 'APPEND'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Sparkles size={11} />
              <span>Bổ Trợ & Hòa Quyện</span>
            </button>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            <span>Gợi Ý Mẫu Nhanh</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {QUICK_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(preset.text)}
                className="px-2 py-1 rounded-lg bg-[#18191A] hover:bg-violet-950/40 border border-[#3E4042] hover:border-violet-500/60 text-[10px] text-gray-300 hover:text-violet-200 transition-colors"
                title={preset.text}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cổng Ra Duy Nhất (Output) */}
      <Handle
        type="source"
        position={Position.Right}
        id="out"
        style={{ top: '50%' }}
        className="!w-4 !h-4 !bg-[#18191A] !border-2 !border-emerald-400 hover:!border-cyan-400 hover:!scale-125 transition-all shadow-md cursor-crosshair !-right-2"
        title="Prompt ưu tiên (Output ➔ Nối vào Sinh Ảnh / Concept)"
      />
    </div>
  );
};
