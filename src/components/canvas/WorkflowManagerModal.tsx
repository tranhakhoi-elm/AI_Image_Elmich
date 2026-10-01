import React, { useState, useEffect } from 'react';
import {
  FolderOpen,
  X,
  Layers,
  GitFork,
  Calendar,
  Check,
  Trash2,
  Copy,
  Download,
  Upload,
  Plus,
  Server,
  Search,
  ExternalLink,
} from 'lucide-react';
import { SavedWorkflow, exportWorkflowToFile } from './services/workflowStorage';

interface WorkflowManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflows: SavedWorkflow[];
  activeWorkflowId: string;
  onSelectWorkflow: (id: string) => void;
  onCreateNewWorkflow: () => void;
  onDeleteWorkflow: (id: string) => Promise<void>;
  onDuplicateWorkflow: (workflow: SavedWorkflow) => Promise<void>;
  onImportFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const WorkflowManagerModal: React.FC<WorkflowManagerModalProps> = ({
  isOpen,
  onClose,
  workflows,
  activeWorkflowId,
  onSelectWorkflow,
  onCreateNewWorkflow,
  onDeleteWorkflow,
  onDuplicateWorkflow,
  onImportFile,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteTarget, setConfirmDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  // Reset deletedIds when modal re-opens or workflows change
  useEffect(() => {
    if (isOpen) {
      setDeletedIds(new Set());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = workflows.filter((w) => {
    if (deletedIds.has(w.id)) return false;
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      w.name.toLowerCase().includes(term) ||
      (w.description && w.description.toLowerCase().includes(term))
    );
  });

  const formatDate = (timestamp: number) => {
    if (!timestamp) return '';
    const d = new Date(timestamp);
    return `${d.toLocaleDateString('vi-VN')} ${d.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  };

  const handleDelete = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDeleteTarget({ id, name });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteTarget) return;
    const idToDelete = confirmDeleteTarget.id;
    setDeletingId(idToDelete);
    // Optimistically remove from view immediately
    setDeletedIds((prev) => new Set([...prev, idToDelete]));
    setConfirmDeleteTarget(null);
    try {
      await onDeleteWorkflow(idToDelete);
    } catch (err) {
      console.error('Error deleting workflow:', err);
      // Revert if error
      setDeletedIds((prev) => {
        const next = new Set(prev);
        next.delete(idToDelete);
        return next;
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleDuplicate = async (w: SavedWorkflow, e: React.MouseEvent) => {
    e.stopPropagation();
    await onDuplicateWorkflow(w);
  };

  const handleExport = (w: SavedWorkflow, e: React.MouseEvent) => {
    e.stopPropagation();
    exportWorkflowToFile(w);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-[#242526] border border-[#3E4042] rounded-2xl shadow-2xl overflow-hidden flex flex-col text-white max-h-[85vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#3E4042] bg-[#18191A]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <FolderOpen size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Quy Trình Đã Tạo Trên Server</h3>
                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">
                  <Server size={10} /> Hệ Thống Server / GitHub
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Toàn bộ các quy trình bạn đã thiết kế và lưu trữ trên hệ thống ({workflows.length} quy trình)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-gray-400 hover:text-white hover:bg-[#3A3B3C] flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Toolbar & Search */}
        <div className="p-4 border-b border-[#3E4042] bg-[#1c1d1e] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm quy trình đã tạo..."
              className="w-full bg-[#141516] border border-[#3E4042] focus:border-purple-500 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white outline-none placeholder:text-gray-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#242526] hover:bg-[#3A3B3C] border border-[#3E4042] text-xs font-semibold text-gray-300 hover:text-white cursor-pointer transition-colors">
              <Upload size={13} />
              <span>Nhập JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={onImportFile}
                className="hidden"
              />
            </label>

            <button
              onClick={() => {
                onCreateNewWorkflow();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white font-bold text-xs shadow-md transition-all"
            >
              <Plus size={13} />
              <span>+ Tạo Mới</span>
            </button>
          </div>
        </div>

        {/* Workflows List */}
        <div className="p-4 overflow-y-auto space-y-2.5 max-h-[50vh] custom-scrollbar">
          {filtered.length > 0 ? (
            filtered.map((w) => {
              const isActive = activeWorkflowId === w.id;
              return (
                <div
                  key={w.id}
                  onClick={() => {
                    onSelectWorkflow(w.id);
                    onClose();
                  }}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isActive
                      ? 'bg-gradient-to-br from-purple-950/40 to-blue-950/30 border-purple-500 ring-2 ring-purple-500/40 shadow-lg'
                      : 'bg-[#18191A] border-[#3E4042] hover:border-gray-500 text-gray-300 hover:bg-[#202122]'
                  }`}
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white truncate">{w.name}</span>
                      {isActive && (
                        <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/40">
                          <Check size={10} /> Đang mở
                        </span>
                      )}
                    </div>

                    {w.description && (
                      <p className="text-[11px] text-gray-400 line-clamp-1">
                        {w.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-[10px] text-gray-400">
                      <span className="flex items-center gap-1 text-amber-300">
                        <Layers size={11} /> {w.nodes?.length || 0} node
                      </span>
                      <span className="flex items-center gap-1 text-blue-300">
                        <GitFork size={11} /> {w.edges?.length || 0} dây nối
                      </span>
                      {w.updatedAt && (
                        <span className="flex items-center gap-1 text-gray-500">
                          <Calendar size={11} /> Cập nhật: {formatDate(w.updatedAt)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions for this workflow */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => {
                        onSelectWorkflow(w.id);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-300 hover:text-white font-semibold text-xs border border-purple-500/40 transition-colors"
                      title="Mở quy trình này lên Canvas"
                    >
                      Mở
                    </button>

                    <button
                      onClick={(e) => handleDuplicate(w, e)}
                      className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-[#242526] border border-transparent hover:border-[#3E4042] transition-colors"
                      title="Nhân bản quy trình"
                    >
                      <Copy size={13} />
                    </button>

                    <button
                      onClick={(e) => handleExport(w, e)}
                      className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-[#242526] border border-transparent hover:border-[#3E4042] transition-colors"
                      title="Tải file JSON về máy"
                    >
                      <Download size={13} />
                    </button>

                    <button
                      onClick={(e) => handleDelete(w.id, w.name, e)}
                      disabled={deletingId === w.id}
                      className="p-1.5 rounded-xl text-gray-400 hover:text-red-400 hover:bg-[#242526] border border-transparent hover:border-[#3E4042] transition-colors disabled:opacity-50"
                      title="Xóa quy trình khỏi server"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center space-y-2 bg-[#18191A] rounded-2xl border border-dashed border-[#3E4042]">
              <FolderOpen size={28} className="mx-auto text-gray-500" />
              <h4 className="text-xs font-bold text-gray-300">
                {searchTerm ? 'Không tìm thấy quy trình phù hợp' : 'Chưa có quy trình nào trên server'}
              </h4>
              <p className="text-[11px] text-gray-500 max-w-sm mx-auto">
                {searchTerm
                  ? 'Hãy thử tìm kiếm với từ khóa khác.'
                  : 'Hãy thêm các node trên Canvas và bấm "Lưu Quy Trình" để lưu quy trình vào server hệ thống.'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => {
                    onCreateNewWorkflow();
                    onClose();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs inline-flex items-center gap-1 transition-all mt-2"
                >
                  <Plus size={13} />
                  <span>Tạo Quy Trình Mới</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#3E4042] bg-[#18191A]/60 flex items-center justify-between text-[11px] text-gray-400">
          <span className="flex items-center gap-1.5">
            <Server size={12} className="text-purple-400" />
            <span>Dữ liệu lưu tại thư mục <b>data/workflows/</b> trên Server / GitHub</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold text-gray-300 hover:text-white hover:bg-[#3A3B3C] transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>

      {/* In-app Confirm Delete Dialog */}
      {confirmDeleteTarget && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-100"
          onClick={(e) => {
            e.stopPropagation();
            setConfirmDeleteTarget(null);
          }}
        >
          <div
            className="w-full max-w-sm bg-[#242526] border border-[#3E4042] rounded-2xl shadow-2xl p-5 text-white space-y-4 animate-in zoom-in-95 duration-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center shrink-0">
                <Trash2 size={20} />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-white">Xác nhận xóa quy trình?</h4>
                <p className="text-xs text-gray-400 truncate max-w-[210px] mt-0.5 font-medium">
                  "{confirmDeleteTarget.name}"
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed font-normal">
              Quy trình này sẽ bị xóa hoàn toàn khỏi server hệ thống và bộ nhớ. Hành động này không thể hoàn tác.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteTarget(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#18191A] hover:bg-[#3A3B3C] text-gray-300 hover:text-white border border-[#3E4042] transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={deletingId === confirmDeleteTarget.id}
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {deletingId === confirmDeleteTarget.id ? 'Đang xóa...' : 'Xác Nhận Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
