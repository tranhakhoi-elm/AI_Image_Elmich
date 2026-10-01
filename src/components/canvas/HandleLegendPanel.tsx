import React, { useState } from 'react';
import { Network, X, ArrowRight, Zap, Sparkles, Scissors, RefreshCw, Layers, BookOpen, Camera, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onToggle: () => void;
}

export const HandleLegendPanel: React.FC<Props> = ({ isOpen, onToggle }) => {
  const [activeTab, setActiveTab] = useState<'workflows' | 'controls'>('workflows');

  if (!isOpen) return null;

  return (
    <div className="w-[360px] max-h-[85vh] bg-[#242526]/95 backdrop-blur-xl border-2 border-cyan-500/70 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-white animate-in fade-in slide-in-from-top-4 duration-200">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-cyan-950/80 via-[#242526] to-[#18191A] border-b border-[#3E4042] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-cyan-600 text-white flex items-center justify-center shadow-md shadow-cyan-950/40">
            <Network size={14} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide">
              Sơ Đồ Kết Nối & Luồng Dữ Liệu
            </h3>
            <span className="text-[10px] text-cyan-300 font-medium">
              Chỉ cần nối dây — không rườm rà màu sắc
            </span>
          </div>
        </div>

        <button
          onClick={onToggle}
          className="w-6 h-6 rounded-lg bg-[#18191A] hover:bg-[#3A3B3C] text-gray-400 hover:text-white flex items-center justify-center transition-colors border border-[#3E4042]"
        >
          <X size={13} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#3E4042] bg-[#18191A]/60 p-1 gap-1">
        <button
          onClick={() => setActiveTab('workflows')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'workflows'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Luồng Mẫu Tiêu Biểu
        </button>
        <button
          onClick={() => setActiveTab('controls')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'controls'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Thao Tác Dây Nối
        </button>
      </div>

      {/* Content */}
      <div className="p-3.5 space-y-3 overflow-y-auto custom-scrollbar select-text text-xs">
        {activeTab === 'workflows' ? (
          <>
            {/* Core Principle Notice */}
            <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/40 text-[11px] text-cyan-200 space-y-1">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Sparkles size={12} className="text-cyan-400" />
                Nguyên Tắc Kết Nối Đơn Giản:
              </span>
              <p className="text-gray-300 leading-relaxed font-normal">
                Bạn chỉ cần kéo từ cổng ra <b>bên phải</b> của một node sang cổng vào <b>bên trái</b> của node nhận. Toàn bộ thông tin được đồng bộ tự động tức thì.
              </p>
            </div>

            {/* Workflow 1: Reference Image AI */}
            <div className="p-3 rounded-xl bg-[#18191A] border border-[#3E4042] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-cyan-400 text-xs flex items-center gap-1.5">
                  <Camera size={13} /> 1. Luồng Sử Dụng Ảnh Tham Khảo AI
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold uppercase">
                  Mới
                </span>
              </div>
              <div className="p-2 rounded-lg bg-[#242526] border border-[#3E4042] text-[11px] font-mono text-gray-200 flex items-center justify-between">
                <span className="text-amber-400 font-bold">Node Ảnh</span>
                <ArrowRight size={12} className="text-gray-500" />
                <span className="text-cyan-300 font-bold">Ảnh Tham Khảo</span>
                <ArrowRight size={12} className="text-gray-500" />
                <span className="text-blue-400 font-bold">Sinh Ảnh AI</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                • Kéo ảnh mẫu vào Node <b>Ảnh Tham Khảo</b>.<br />
                • Điền ghi chú những gì cần học từ ảnh (để trống sẽ mặc định học theo <i>phong cách nghệ thuật, ánh sáng và bố cục</i>).<br />
                • Nối sang <b>Sinh Ảnh AI</b> để áp dụng trực tiếp!
              </p>
            </div>

            {/* Workflow 2: Standard Production */}
            <div className="p-3 rounded-xl bg-[#18191A] border border-[#3E4042] space-y-2">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <Layers size={13} className="text-blue-400" /> 2. Luồng Sinh Ảnh Chuẩn
              </span>
              <div className="p-2 rounded-lg bg-[#242526] border border-[#3E4042] text-[11px] font-mono text-gray-200 flex items-center justify-between">
                <span className="text-amber-400 font-bold">Ảnh + Thông Số</span>
                <ArrowRight size={12} className="text-gray-500" />
                <span className="text-blue-400 font-bold">Sinh Ảnh AI</span>
                <ArrowRight size={12} className="text-gray-500" />
                <span className="text-emerald-400 font-bold">Xem & Tải Ảnh</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Nối ảnh sản phẩm cùng thông số kích thước vào node Sinh Ảnh để tạo hình ảnh hoàn thiện chuẩn catalog Elmich.
              </p>
            </div>

            {/* Workflow 3: Markdown Skills & Preset */}
            <div className="p-3 rounded-xl bg-[#18191A] border border-[#3E4042] space-y-2">
              <span className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                <BookOpen size={13} /> 3. Nối Markdown Skills & Preset Tùy Chọn
              </span>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                • <b>Thể Loại Preset</b>: Chọn nhanh phong cách (Lifestyle, Studio, Tech Bóc Tách, Nền trắng...).<br />
                • <b>Markdown Skills</b>: Cho phép AI học các tài liệu kỹ thuật (.md) trước khi sinh ảnh để đảm bảo chất liệu inox 304 xước satin và ánh sáng hoàn hảo.
              </p>
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-[#18191A] border border-[#3E4042] space-y-1.5">
              <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                <RefreshCw size={13} /> Chuyển Cổng Nối Nhanh
              </span>
              <p className="text-[11px] text-gray-300 leading-relaxed">
                Bạn có thể bấm giữ và kéo <b>bất kỳ đầu nào</b> của dây nối (đầu nguồn hoặc đầu đích) để gắn lại vào cổng khác mà không cần xóa dây.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#18191A] border border-[#3E4042] space-y-1.5">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <Scissors size={13} /> Kéo Thả Ra Ngoài Để Xóa Dây
              </span>
              <p className="text-[11px] text-gray-300 leading-relaxed">
                Để ngắt kết nối, chỉ cần bấm giữ 1 đầu nút nối và <b>kéo thả ra khoảng trống bên ngoài canvas</b>. Dây sẽ tự động biến mất và dữ liệu được làm sạch ngay.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#18191A] border border-[#3E4042] space-y-1.5">
              <span className="font-bold text-violet-300 flex items-center gap-1.5">
                <Zap size={13} /> Phím Tắt Tiện Dụng
              </span>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-gray-400">
                <li><b className="text-white">Delete / Backspace:</b> Xóa node hoặc dây đang chọn.</li>
                <li><b className="text-white">Cuộn chuột:</b> Phóng to / thu nhỏ canvas.</li>
                <li><b className="text-white">Giữ chuột giữa / Space:</b> Kéo di chuyển toàn bộ không gian canvas.</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
