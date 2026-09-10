import React from 'react';
import { Layout, MessageCircle, BookOpen, Sparkles, RefreshCw, History } from 'lucide-react';

interface HeaderProps {
  viewMode: 'studio' | 'chat' | 'history';
  setViewMode: (mode: 'studio' | 'chat' | 'history') => void;
  onOpenHandbook: () => void;
  onResetToMenu?: () => void;
  galleryCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  setViewMode,
  onOpenHandbook,
  onResetToMenu,
  galleryCount = 0
}) => {
  return (
    <header className="h-14 border-b border-[#3E4042] bg-[#242526] px-4 flex items-center justify-between z-30 shrink-0 sticky top-0">
      {/* Brand */}
      <div className="flex items-center gap-3 cursor-pointer select-none" onClick={onResetToMenu}>
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1877F2] to-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-md">
          AE
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm tracking-tight">Ai Image Elmich</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#1877F2]/20 text-[#1877F2] font-semibold">Pro Suite</span>
          </div>
          <span className="text-[10px] text-gray-400 hidden sm:inline">Trí tuệ nhân tạo đồ họa & kiểm duyệt bao bì</span>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex items-center bg-[#18191A] p-1 rounded-xl border border-[#3E4042]">
        <button
          onClick={() => setViewMode('studio')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            viewMode === 'studio'
              ? 'bg-[#1877F2] text-white shadow-sm'
              : 'text-gray-400 hover:text-white hover:bg-[#242526]'
          }`}
        >
          <Layout size={14} />
          <span>Studio Đồ Họa</span>
        </button>

        <button
          onClick={() => setViewMode('chat')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            viewMode === 'chat'
              ? 'bg-[#1877F2] text-white shadow-sm'
              : 'text-gray-400 hover:text-white hover:bg-[#242526]'
          }`}
        >
          <MessageCircle size={14} />
          <span>Trợ lý Chat AI</span>
        </button>

        <button
          onClick={() => setViewMode('history')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            viewMode === 'history'
              ? 'bg-[#1877F2] text-white shadow-sm'
              : 'text-gray-400 hover:text-white hover:bg-[#242526]'
          }`}
        >
          <History size={14} />
          <span>Lịch sử</span>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenHandbook}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3A3B3C] hover:bg-[#4E4F50] text-gray-200 hover:text-white text-xs font-semibold transition-colors border border-[#3E4042]"
          title="Xem Handbook & Hướng dẫn kỹ thuật"
        >
          <BookOpen size={14} className="text-[#1877F2]" />
          <span className="hidden sm:inline">Handbook & Skill</span>
        </button>

        {galleryCount > 0 && (
          <div className="text-[11px] font-medium text-gray-400 px-2 py-1 bg-[#18191A] rounded-lg border border-[#3E4042] hidden md:flex items-center gap-1">
            <Sparkles size={12} className="text-yellow-400" />
            <span>{galleryCount} ảnh</span>
          </div>
        )}
      </div>
    </header>
  );
};
