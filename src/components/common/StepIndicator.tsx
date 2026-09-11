import React from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  current: number;
  total: number;
  labels: string[];
}

/**
 * Thanh hiển thị bước (1-2-3...) dùng chung cho các workflow nhiều bước.
 * Tách từ App.tsx (trước đó bị lặp lại y hệt ở nhiều nơi khi tách từng
 * workflow — gom về đây để tránh N bản sao khi tách nốt các workflow còn lại).
 */
export const StepIndicator: React.FC<StepIndicatorProps> = ({ current, total, labels }) => (
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
