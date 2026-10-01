import React from 'react';
import { Loader2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { NodeExecutionStatus } from '../types';

interface NodeHeaderProps {
  title: string;
  category: 'input' | 'analysis' | 'generator' | 'utility' | 'output';
  icon?: React.ReactNode;
  status?: NodeExecutionStatus;
  statusMessage?: string;
  onRun?: () => void;
}

const CATEGORY_STYLES = {
  input: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/40',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    accent: '#f59e0b',
  },
  analysis: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/40',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    accent: '#a855f7',
  },
  generator: {
    bg: 'bg-blue-500/10',
    border: 'border-[#1877F2]/50',
    badge: 'bg-[#1877F2]/20 text-blue-300 border-[#1877F2]/40',
    accent: '#1877F2',
  },
  utility: {
    bg: 'bg-teal-500/10',
    border: 'border-teal-500/40',
    badge: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    accent: '#14b8a6',
  },
  output: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/40',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    accent: '#10b981',
  },
};

export const NodeHeader: React.FC<NodeHeaderProps> = ({
  title,
  category,
  icon,
  status = 'idle',
  statusMessage,
  onRun,
}) => {
  const style = CATEGORY_STYLES[category] || CATEGORY_STYLES.generator;

  return (
    <div className={`p-3 border-b border-[#3E4042] flex items-center justify-between gap-2 ${style.bg}`}>
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ color: style.accent }}>
          {icon || <Sparkles size={14} />}
        </div>
        <div className="min-w-0">
          <h4 className="text-xs font-bold text-white truncate tracking-wide">{title}</h4>
          {statusMessage && <p className="text-[10px] text-gray-400 truncate">{statusMessage}</p>}
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {status === 'running' && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-blue-400 px-2 py-0.5 rounded-full bg-blue-500/20 animate-pulse border border-blue-500/40">
            <Loader2 size={10} className="animate-spin" /> Đang chạy
          </span>
        )}
        {status === 'success' && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
            <CheckCircle2 size={10} /> Xong
          </span>
        )}
        {status === 'error' && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30">
            <AlertCircle size={10} /> Lỗi
          </span>
        )}

        {onRun && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRun();
            }}
            disabled={status === 'running'}
            title="Chạy riêng Node này"
            className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-[#3A3B3C] text-white hover:bg-[#1877F2] transition-colors disabled:opacity-50"
          >
            Run
          </button>
        )}
      </div>
    </div>
  );
};
