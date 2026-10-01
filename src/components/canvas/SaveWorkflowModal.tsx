import React, { useState } from 'react';
import { Bookmark, Save, X, Layers, GitFork } from 'lucide-react';
import { ElmichNode, ElmichEdge } from './types';

interface SaveWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description: string) => Promise<void>;
  nodes: ElmichNode[];
  edges: ElmichEdge[];
  initialName?: string;
  initialDescription?: string;
}

export const SaveWorkflowModal: React.FC<SaveWorkflowModalProps> = ({
  isOpen,
  onClose,
  onSave,
  nodes,
  edges,
  initialName = '',
  initialDescription = '',
}) => {
  const [name, setName] = useState(initialName || 'Quy trình sản phẩm của tôi');
  const [description, setDescription] = useState(initialDescription || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      await onSave(name.trim(), description.trim());
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[#242526] border border-[#3E4042] rounded-2xl shadow-2xl overflow-hidden flex flex-col text-white animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#3E4042] bg-[#18191A]/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <Bookmark size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Lưu Quy Trình Lên Server Hệ Thống</h3>
              <p className="text-[11px] text-gray-400">Lưu vĩnh viễn vào server (data/workflows) & hệ thống GitHub</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-gray-400 hover:text-white hover:bg-[#3A3B3C] flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Stats summary */}
          <div className="flex items-center gap-4 p-2.5 rounded-xl bg-[#18191A] border border-[#3E4042] text-xs">
            <div className="flex items-center gap-1.5 text-gray-300">
              <Layers size={14} className="text-amber-400" />
              <span>
                <b>{nodes.length}</b> Node
              </span>
            </div>
            <div className="w-[1px] h-4 bg-[#3E4042]" />
            <div className="flex items-center gap-1.5 text-gray-300">
              <GitFork size={14} className="text-blue-400" />
              <span>
                <b>{edges.length}</b> Dây nối
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
              Tên Quy Trình <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Quy trình Nồi cơm điện Elmich 4K..."
              className="w-full bg-[#18191A] border border-[#3E4042] focus:border-[#1877F2] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
              Mô tả ngắn (Tùy chọn)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ghi chú mục đích sử dụng, dòng sản phẩm áp dụng..."
              className="w-full bg-[#18191A] border border-[#3E4042] focus:border-[#1877F2] rounded-xl p-2.5 text-xs text-white outline-none resize-none transition-colors"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#3E4042]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-[#3A3B3C] transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSaving || !name.trim()}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-[#1877F2] hover:brightness-110 text-white shadow-lg shadow-purple-900/30 flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Save size={14} />
              <span>{isSaving ? 'Đang lưu vào server...' : 'Lưu Vào Server Hệ Thống'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
