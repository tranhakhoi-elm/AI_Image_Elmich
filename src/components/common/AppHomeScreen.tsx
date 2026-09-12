import React from 'react';
import { motion } from 'motion/react';
import { MessageCircle, History } from 'lucide-react';

export interface AppTile {
  id: string;
  icon: React.ReactNode;
  title: string;
  color: string; // class Tailwind nền màu đặc (vd: 'bg-blue-500')
}

interface AppHomeScreenProps {
  tools: AppTile[];
  onSelectTool: (id: string) => void;
  onSelectChat: () => void;
  onSelectHistory: () => void;
}

/**
 * Màn hình chọn công cụ ngay sau khi mở khóa — thay cho sidebar danh sách
 * dài trước đây. Trình bày như springboard iPhone: mỗi công cụ/Trợ lý
 * Chat/Lịch sử là 1 icon vuông bo góc, không còn phần "Trạng thái làm việc"
 * hay panel nào khác chen vào màn hình này.
 */
export const AppHomeScreen: React.FC<AppHomeScreenProps> = ({ tools, onSelectTool, onSelectChat, onSelectHistory }) => {
  const tiles: (AppTile & { onClick: () => void })[] = [
    ...tools.map(t => ({ ...t, onClick: () => onSelectTool(t.id) })),
    { id: '__chat', icon: <MessageCircle size={26} />, title: 'Trợ lý Chat AI', color: 'bg-pink-500', onClick: onSelectChat },
    { id: '__history', icon: <History size={26} />, title: 'Lịch sử', color: 'bg-gray-500', onClick: onSelectHistory },
  ];

  return (
    <div className="flex-1 w-full flex items-start justify-center overflow-y-auto custom-scrollbar px-6 py-10 xl:py-16">
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-x-4 gap-y-8 max-w-3xl w-full">
        {tiles.map(tile => (
          <motion.button
            key={tile.id}
            onClick={tile.onClick}
            whileTap={{ scale: 0.92 }}
            className="flex flex-col items-center gap-2"
          >
            <div className={`w-full aspect-square rounded-2xl ${tile.color} text-white flex items-center justify-center shadow-lg hover:brightness-110 transition-all`}>
              {tile.icon}
            </div>
            <span className="text-[11px] font-medium text-white text-center leading-tight line-clamp-2">{tile.title}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};
