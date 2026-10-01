import React, { useState, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import {
  Lightbulb,
  Check,
  Sparkles,
  Plus,
  Trash2,
  Edit3,
  Copy,
  StickyNote,
  Compass,
  Palette,
  Sun,
  X,
  BookOpen,
  ArrowRight,
  Bookmark,
  Zap,
} from 'lucide-react';
import { NodeHeader } from './NodeHeader';
import { ConceptGeneratorNodeData } from '../types';
import {
  ConceptStyleNote,
  ConceptNoteCategory,
  getSavedConceptNotes,
  saveConceptNote,
  deleteConceptNote,
  duplicateConceptNote,
} from '../services/conceptNoteStorage';
import {
  analyzeConceptAndCamera,
  analyzeStudioConcept,
  analyzeTechConceptAndCamera,
} from '../../../../services/geminiService';

interface Props {
  id: string;
  data: ConceptGeneratorNodeData;
}

export const ConceptGeneratorNode: React.FC<Props> = ({ id, data }) => {
  const [savedNotes, setSavedNotes] = useState<ConceptStyleNote[]>([]);
  const [filterCategory, setFilterCategory] = useState<'ALL' | ConceptNoteCategory>('ALL');
  const [isEditingNote, setIsEditingNote] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Draft form state for creating or editing a note
  const [draftTitle, setDraftTitle] = useState('');
  const [draftCategory, setDraftCategory] = useState<ConceptNoteCategory>('CONCEPT');
  const [draftDescription, setDraftDescription] = useState('');
  const [draftPalette, setDraftPalette] = useState('');
  const [draftLighting, setDraftLighting] = useState('');
  const [draftNotes, setDraftNotes] = useState('');

  // Load saved notes on mount and listen to updates
  useEffect(() => {
    let isMounted = true;
    getSavedConceptNotes().then((notes) => {
      if (isMounted) setSavedNotes(notes);
    });

    const handleNotesUpdated = (e: any) => {
      if (e.detail?.allNotes) {
        setSavedNotes(e.detail.allNotes);
      }
    };

    window.addEventListener('elmich:concept-notes-updated', handleNotesUpdated);
    return () => {
      isMounted = false;
      window.removeEventListener('elmich:concept-notes-updated', handleNotesUpdated);
    };
  }, []);

  // Filtered notes by category
  const filteredNotes = savedNotes.filter((n) => {
    if (filterCategory === 'ALL') return true;
    return n.category === filterCategory;
  });

  // Current active note
  const activeNote = savedNotes.find((n) => n.id === data.selectedNoteId) || null;

  const concepts = data.conceptsList || [];
  const selectedPrompt = data.selectedConceptPrompt || '';

  // Open form to create a new note
  const handleOpenCreateForm = () => {
    setEditingId(null);
    setDraftTitle('');
    setDraftCategory(filterCategory === 'ALL' ? 'CONCEPT' : filterCategory);
    setDraftDescription('');
    setDraftPalette('');
    setDraftLighting('');
    setDraftNotes('');
    setIsEditingNote(true);
  };

  // Open form to edit an existing note
  const handleOpenEditForm = (note: ConceptStyleNote, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(note.id);
    setDraftTitle(note.title);
    setDraftCategory(note.category);
    setDraftDescription(note.description);
    setDraftPalette(note.paletteHint || '');
    setDraftLighting(note.lightingHint || '');
    setDraftNotes(note.additionalNotes || '');
    setIsEditingNote(true);
  };

  // Save the draft note (create or update)
  const handleSaveDraftNote = async () => {
    if (!draftTitle.trim()) {
      window.dispatchEvent(
        new CustomEvent('elmich:canvas-toast', {
          detail: { message: 'Vui lòng nhập tên bộ note!', type: 'error' },
        })
      );
      return;
    }

    const { note, allNotes } = await saveConceptNote(
      {
        title: draftTitle.trim(),
        category: draftCategory,
        description: draftDescription.trim(),
        paletteHint: draftPalette.trim() || undefined,
        lightingHint: draftLighting.trim() || undefined,
        additionalNotes: draftNotes.trim() || undefined,
      },
      editingId || undefined
    );

    setSavedNotes(allNotes);
    setIsEditingNote(false);
    setEditingId(null);

    // Automatically select this note
    selectNote(note);

    window.dispatchEvent(
      new CustomEvent('elmich:canvas-toast', {
        detail: {
          message: editingId ? `Đã cập nhật bộ note "${note.title}"` : `Đã lưu bộ note "${note.title}"`,
          type: 'success',
        },
      })
    );
  };

  // Delete a note
  const handleDeleteNote = async (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = await deleteConceptNote(noteId);
    setSavedNotes(updated);
    if (data.selectedNoteId === noteId) {
      window.dispatchEvent(
        new CustomEvent('elmich:canvas-node-update', {
          detail: {
            nodeId: id,
            data: {
              ...data,
              selectedNoteId: undefined,
              selectedNoteTitle: undefined,
            },
          },
        })
      );
    }
    window.dispatchEvent(
      new CustomEvent('elmich:canvas-toast', {
        detail: { message: 'Đã xóa bộ note', type: 'info' },
      })
    );
  };

  // Duplicate a note
  const handleDuplicateNote = async (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = await duplicateConceptNote(noteId);
    setSavedNotes(updated);
    window.dispatchEvent(
      new CustomEvent('elmich:canvas-toast', {
        detail: { message: 'Đã nhân bản bộ note', type: 'success' },
      })
    );
  };

  // Select an active note
  const selectNote = (note: ConceptStyleNote) => {
    window.dispatchEvent(
      new CustomEvent('elmich:canvas-node-update', {
        detail: {
          nodeId: id,
          data: {
            ...data,
            selectedNoteId: note.id,
            selectedNoteTitle: note.title,
            styleMode: note.category === 'CUSTOM' ? 'CONCEPT' : note.category,
          },
        },
      })
    );
  };

  // Use the note content directly as the concept prompt
  const applyNoteDirectlyAsConcept = () => {
    if (!activeNote) return;
    const parts: string[] = [];
    if (activeNote.description) parts.push(activeNote.description);
    if (activeNote.paletteHint) parts.push(`Bảng màu chủ đạo: ${activeNote.paletteHint}.`);
    if (activeNote.lightingHint) parts.push(`Ánh sáng & Bố cục: ${activeNote.lightingHint}.`);
    if (activeNote.additionalNotes) parts.push(`Chi tiết bổ sung: ${activeNote.additionalNotes}.`);

    const fullPrompt = parts.join(' ');
    window.dispatchEvent(
      new CustomEvent('elmich:canvas-node-update', {
        detail: {
          nodeId: id,
          data: {
            ...data,
            selectedConceptPrompt: fullPrompt,
            selectedConceptTitle: activeNote.title,
          },
        },
      })
    );

    window.dispatchEvent(
      new CustomEvent('elmich:canvas-toast', {
        detail: {
          message: `Đã dùng nội dung bộ note "${activeNote.title}" làm Concept`,
          type: 'success',
        },
      })
    );
  };

  // Run AI concept generation based on the active note
  const runConceptGeneration = async () => {
    const prodName = data.productName || 'Sản phẩm gia dụng Elmich';
    const dim = data.dimensions || '200x200x250mm';

    window.dispatchEvent(
      new CustomEvent('elmich:canvas-node-update', {
        detail: { nodeId: id, data: { ...data, status: 'running' } },
      })
    );

    try {
      let guidance = '';
      if (data.markdownSkillGuidance && data.markdownSkillGuidance.trim()) {
        guidance += `*** TÀI LIỆU ĐỊNH HƯỚNG ELMICH ĐƯỢC CHỈ ĐỊNH (${data.markdownSkillTitle || 'TIÊU CHUẨN'}): ***\n${data.markdownSkillGuidance.trim()}\nToàn bộ 5 concept đề xuất BẮT BUỘC phải tuân thủ chặt chẽ tài liệu định hướng này!\n**************************************************************************************************\n\n`;
      }

      if (data.priorityPrompt && data.priorityPrompt.trim()) {
        guidance += `*** CHỈ THỊ ƯU TIÊN SỐ 1 TỪ PROMPT NODE (BẮT BUỘC ƯU TIÊN ĐẦU TIÊN KHI TẠO CONCEPT): ***
"${data.priorityPrompt.trim()}"
Toàn bộ các concept gợi ý bên dưới BẮT BUỘC phải phát triển xoay quanh chỉ thị ưu tiên này!
**************************************************************************************************\n\n`;
      }

      if (activeNote) {
        guidance += `ĐỊNH HƯỚNG PHONG CÁCH TỪ BỘ NOTE CỦA NGƯỜI DÙNG:
- Tên định hướng: ${activeNote.title}
- Không gian & Bối cảnh: ${activeNote.description || 'Không gian hiện đại sang trọng'}
${activeNote.paletteHint ? `- Bảng màu: ${activeNote.paletteHint}` : ''}
${activeNote.lightingHint ? `- Ánh sáng: ${activeNote.lightingHint}` : ''}
${activeNote.additionalNotes ? `- Ghi chú riêng: ${activeNote.additionalNotes}` : ''}
${data.materialsDescription ? `- Chất liệu sản phẩm (PBR): ${data.materialsDescription}` : ''}

QUY TẮC: TẤT CẢ 5 CONCEPT ĐỀ XUẤT BẮT BUỘC PHẢI TUÂN THỦ ĐỊNH HƯỚNG "${activeNote.title}" NÀY, nhưng biến tấu 5 góc nhìn/bố cục/khoảnh khắc ánh sáng khác nhau để tạo sự đa dạng và phong phú.`;
      } else {
        guidance = `Tự do đề xuất 5 concept bối cảnh cao cấp, phù hợp cho sản phẩm ${prodName}.
${data.materialsDescription ? `- Chất liệu sản phẩm (PBR): ${data.materialsDescription}` : ''}`;
      }

      let result;
      const cat = activeNote?.category || data.styleMode || 'CONCEPT';
      if (cat === 'STUDIO') {
        result = await analyzeStudioConcept(prodName, dim, [], guidance);
      } else if (cat === 'TECH') {
        result = await analyzeTechConceptAndCamera(prodName, guidance, dim, []);
      } else {
        result = await analyzeConceptAndCamera(prodName, dim, [], null, guidance);
      }

      const generatedConcepts = result.concepts || [];
      const firstConcept = generatedConcepts[0];

      window.dispatchEvent(
        new CustomEvent('elmich:canvas-node-update', {
          detail: {
            nodeId: id,
            data: {
              ...data,
              status: 'success',
              conceptsList: generatedConcepts,
              selectedConceptPrompt: firstConcept?.prompt || '',
              selectedConceptTitle: firstConcept?.title || '',
            },
          },
        })
      );

      window.dispatchEvent(
        new CustomEvent('elmich:canvas-toast', {
          detail: {
            message: activeNote
              ? `Đã tạo 5 Concept theo bộ note "${activeNote.title}"`
              : 'Đã tạo 5 Concept AI mới',
            type: 'success',
          },
        })
      );
    } catch (err: any) {
      console.error('Concept generation error:', err);
      window.dispatchEvent(
        new CustomEvent('elmich:canvas-node-update', {
          detail: { nodeId: id, data: { ...data, status: 'error', errorMessage: err.message } },
        })
      );
      window.dispatchEvent(
        new CustomEvent('elmich:canvas-toast', {
          detail: {
            message: `Lỗi đề xuất concept: ${err.message || 'Lỗi kết nối AI'}`,
            type: 'error',
          },
        })
      );
    }
  };

  const selectConcept = (c: { title: string; prompt: string }) => {
    window.dispatchEvent(
      new CustomEvent('elmich:canvas-node-update', {
        detail: {
          nodeId: id,
          data: {
            ...data,
            selectedConceptPrompt: c.prompt,
            selectedConceptTitle: c.title,
          },
        },
      })
    );
  };

  const setCustomPrompt = (text: string) => {
    window.dispatchEvent(
      new CustomEvent('elmich:canvas-node-update', {
        detail: {
          nodeId: id,
          data: {
            ...data,
            selectedConceptPrompt: text,
            selectedConceptTitle: 'Custom Concept',
          },
        },
      })
    );
  };

  const getCategoryBadge = (cat: ConceptNoteCategory) => {
    switch (cat) {
      case 'CONCEPT':
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">🌿 Lifestyle</span>;
      case 'STUDIO':
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-blue-950/60 text-blue-400 border border-blue-800/40">📸 Studio</span>;
      case 'TECH':
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-950/60 text-amber-400 border border-amber-800/40">⚡ Tech</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-purple-950/60 text-purple-400 border border-purple-800/40">✨ Tùy chỉnh</span>;
    }
  };

  return (
    <div className="w-[410px] rounded-2xl bg-[#242526] border-2 border-[#3E4042] shadow-2xl overflow-hidden hover:border-purple-500/60 transition-all text-white relative">
      {/* Cổng Vào Duy Nhất (Input) */}
      <Handle
        type="target"
        position={Position.Left}
        id="in"
        style={{ top: '50%' }}
        className="!w-4 !h-4 !bg-[#18191A] !border-2 !border-[#1877F2] hover:!border-cyan-400 hover:!scale-125 transition-all shadow-md cursor-crosshair !-left-2"
        title="Dữ liệu đầu vào (Input ➔ Nhận từ Node Thông Số / Chất Liệu / Prompt)"
      />

      <NodeHeader
        title={data.label || 'Ý Tưởng'}
        category="analysis"
        icon={<Lightbulb size={15} />}
        status={data.status}
        onRun={runConceptGeneration}
      />

      <div className="p-3.5 space-y-3">
        {/* Markdown Skill indicator if wired */}
        {data.markdownSkillGuidance && (
          <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/60 flex items-center gap-2 text-[10px] text-amber-200">
            <BookOpen size={12} className="text-amber-400 shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="font-bold text-amber-300 block">📚 Đã nhận Tài Liệu Skill:</span>
              <p className="truncate text-[10px] text-gray-200">{data.markdownSkillTitle || 'Quy chuẩn Elmich'}</p>
            </div>
          </div>
        )}

        {/* Priority prompt indicator if wired */}
        {data.priorityPrompt && (
          <div className="p-2 rounded-xl bg-violet-950/40 border border-violet-500/60 flex items-center gap-2 text-[10px] text-violet-200">
            <Zap size={12} className="text-violet-400 shrink-0 animate-pulse" />
            <div className="min-w-0 flex-1">
              <span className="font-bold text-violet-300 block">⚡ Đã nhận Prompt Ưu Tiên #1:</span>
              <p className="truncate text-[10px] text-gray-200">"{data.priorityPrompt}"</p>
            </div>
          </div>
        )}

        {/* Connection status strip */}
        <div className="flex items-center justify-between text-[10px] px-2.5 py-1.5 rounded-xl bg-[#18191A] border border-[#3E4042]">
          <span className="text-gray-400 truncate max-w-[190px]">
            SP: <b className="text-amber-300">{data.productName || 'Chưa nối specs'}</b>
          </span>
          <span className="text-purple-400 truncate font-semibold">
            {data.materialsDescription ? '✓ Có PBR' : 'Mặc định'}
          </span>
        </div>

        {/* PHẦN 1: BỘ NOTE ĐỊNH HƯỚNG PHONG CÁCH (DO NGƯỜI DÙNG TỰ TẠO & LƯU LẠI) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Bookmark size={13} className="text-purple-400" />
              <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">
                Bộ Note Phong Cách Cá Nhân
              </span>
            </div>
            <button
              onClick={handleOpenCreateForm}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-purple-600 hover:bg-purple-500 text-white transition-colors shadow-sm"
              title="Tạo bộ note mới"
            >
              <Plus size={12} />
              <span>Tạo Bộ Note</span>
            </button>
          </div>

          {/* Form Create / Edit Note */}
          {isEditingNote && (
            <div className="p-3 rounded-xl bg-[#1c1d1e] border-2 border-purple-500/80 space-y-2.5 shadow-xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-[#3E4042] pb-1.5">
                <span className="text-xs font-bold text-purple-300 flex items-center gap-1">
                  <Edit3 size={13} />
                  <span>{editingId ? 'Chỉnh Sửa Bộ Note' : 'Tạo Bộ Note Mới'}</span>
                </span>
                <button
                  onClick={() => setIsEditingNote(false)}
                  className="text-gray-400 hover:text-white p-0.5"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Tên bộ note */}
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 mb-0.5">
                  Tên bộ note phong cách <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  placeholder="Ví dụ: Bếp Bắc Âu Japandi, Penthouse Đá Marble..."
                  className="w-full bg-[#141516] border border-[#3E4042] focus:border-purple-500 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                />
              </div>

              {/* Thể loại */}
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 mb-0.5">
                  Phân loại thể loại
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {(['CONCEPT', 'STUDIO', 'TECH', 'CUSTOM'] as ConceptNoteCategory[]).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setDraftCategory(cat)}
                      className={`py-1 rounded text-[10px] font-semibold text-center transition-all ${
                        draftCategory === cat
                          ? 'bg-purple-600 text-white shadow'
                          : 'bg-[#141516] text-gray-400 hover:text-white border border-[#3E4042]'
                      }`}
                    >
                      {cat === 'CONCEPT' && '🌿 Life'}
                      {cat === 'STUDIO' && '📸 Studio'}
                      {cat === 'TECH' && '⚡ Tech'}
                      {cat === 'CUSTOM' && '✨ Tùy ý'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Không gian & Bối cảnh */}
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 mb-0.5">
                  Mô tả không gian & bối cảnh nền
                </label>
                <textarea
                  rows={2}
                  value={draftDescription}
                  onChange={(e) => setDraftDescription(e.target.value)}
                  placeholder="Mặt bàn đá marble trắng, tủ gỗ sồi sáng, tường be ấm áp, cây xanh nhỏ..."
                  className="w-full bg-[#141516] border border-[#3E4042] focus:border-purple-500 rounded-lg px-2.5 py-1.5 text-[11px] text-white outline-none resize-none"
                />
              </div>

              {/* Bảng màu & Ánh sáng */}
              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <label className="block text-[9px] font-semibold text-gray-400 mb-0.5">
                    🎨 Bảng màu (Palette)
                  </label>
                  <input
                    type="text"
                    value={draftPalette}
                    onChange={(e) => setDraftPalette(e.target.value)}
                    placeholder="Be ấm, trắng ngà, gỗ sáng"
                    className="w-full bg-[#141516] border border-[#3E4042] focus:border-purple-500 rounded-lg px-2 py-1 text-[10px] text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-semibold text-gray-400 mb-0.5">
                    ☀️ Ánh sáng & Góc chụp
                  </label>
                  <input
                    type="text"
                    value={draftLighting}
                    onChange={(e) => setDraftLighting(e.target.value)}
                    placeholder="Ánh nắng ban mai 3500K nhẹ"
                    className="w-full bg-[#141516] border border-[#3E4042] focus:border-purple-500 rounded-lg px-2 py-1 text-[10px] text-white outline-none"
                  />
                </div>
              </div>

              {/* Ghi chú cá nhân hóa thêm */}
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 mb-0.5">
                  Ghi chú riêng / Yêu cầu cá nhân hóa
                </label>
                <input
                  type="text"
                  value={draftNotes}
                  onChange={(e) => setDraftNotes(e.target.value)}
                  placeholder="Ví dụ: Không có người, khăn lanh thô dệt tay, chụp góc 45 độ..."
                  className="w-full bg-[#141516] border border-[#3E4042] focus:border-purple-500 rounded-lg px-2.5 py-1 text-[10px] text-white outline-none"
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#3E4042]">
                <button
                  type="button"
                  onClick={() => setIsEditingNote(false)}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-semibold text-gray-400 hover:text-white transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveDraftNote}
                  className="px-3.5 py-1 rounded-lg text-[10px] font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white shadow-md transition-all flex items-center gap-1"
                >
                  <Check size={12} />
                  <span>{editingId ? 'Cập Nhật' : 'Lưu Bộ Note'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Filter Bar (if there are notes) */}
          {savedNotes.length > 0 && !isEditingNote && (
            <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 text-[10px]">
              <div className="flex items-center gap-1 bg-[#18191A] p-0.5 rounded-lg border border-[#3E4042]">
                <button
                  onClick={() => setFilterCategory('ALL')}
                  className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                    filterCategory === 'ALL' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Tất cả ({savedNotes.length})
                </button>
                <button
                  onClick={() => setFilterCategory('CONCEPT')}
                  className={`px-1.5 py-0.5 rounded-md font-medium transition-colors ${
                    filterCategory === 'CONCEPT' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  🌿 Life
                </button>
                <button
                  onClick={() => setFilterCategory('STUDIO')}
                  className={`px-1.5 py-0.5 rounded-md font-medium transition-colors ${
                    filterCategory === 'STUDIO' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  📸 Studio
                </button>
                <button
                  onClick={() => setFilterCategory('TECH')}
                  className={`px-1.5 py-0.5 rounded-md font-medium transition-colors ${
                    filterCategory === 'TECH' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  ⚡ Tech
                </button>
              </div>
            </div>
          )}

          {/* EMPTY STATE - WHEN USER HAS NO SAVED NOTES (TRỐNG HOÀN TOÀN) */}
          {savedNotes.length === 0 && !isEditingNote && (
            <div className="p-4 rounded-xl bg-[#18191A] border-2 border-dashed border-[#3E4042] text-center space-y-2.5">
              <div className="w-10 h-10 mx-auto rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <StickyNote size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-gray-200">
                  Chưa có bộ note định hướng nào
                </h4>
                <p className="text-[10px] text-gray-400 max-w-xs mx-auto leading-relaxed">
                  Phần này đang để trống. Hãy tự tạo các bộ note phong cách của bạn để lưu lại và sử dụng cho các dự án sau này nhằm cá nhân hóa hơn!
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-1">
                <button
                  onClick={handleOpenCreateForm}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white font-bold text-xs shadow-md shadow-purple-950/50 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Plus size={14} />
                  <span>+ Tạo Bộ Note Mới</span>
                </button>
              </div>
            </div>
          )}

          {/* LIST OF SAVED NOTES */}
          {savedNotes.length > 0 && !isEditingNote && (
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              {filteredNotes.map((note) => {
                const isSelected = activeNote?.id === note.id;
                return (
                  <div
                    key={note.id}
                    onClick={() => selectNote(note)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-gradient-to-br from-purple-950/50 to-blue-950/30 border-purple-500 ring-2 ring-purple-500/40 shadow-lg shadow-purple-950/40'
                        : 'bg-[#18191A] border-[#3E4042] hover:border-gray-500 text-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-xs font-bold text-white truncate">{note.title}</span>
                        {getCategoryBadge(note.category)}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {isSelected && (
                          <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-400 bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-500/40">
                            <Check size={10} /> Đang chọn
                          </span>
                        )}
                        <button
                          onClick={(e) => handleOpenEditForm(note, e)}
                          className="p-1 rounded text-gray-400 hover:text-white hover:bg-[#242526] transition-colors"
                          title="Chỉnh sửa bộ note"
                        >
                          <Edit3 size={11} />
                        </button>
                        <button
                          onClick={(e) => handleDuplicateNote(note.id, e)}
                          className="p-1 rounded text-gray-400 hover:text-white hover:bg-[#242526] transition-colors"
                          title="Nhân bản bộ note"
                        >
                          <Copy size={11} />
                        </button>
                        <button
                          onClick={(e) => handleDeleteNote(note.id, e)}
                          className="p-1 rounded text-gray-400 hover:text-red-400 hover:bg-[#242526] transition-colors"
                          title="Xóa bộ note"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>

                    {note.description && (
                      <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed mb-1">
                        {note.description}
                      </p>
                    )}

                    {(note.paletteHint || note.lightingHint) && (
                      <div className="flex items-center gap-2 text-[9px] text-gray-400 pt-0.5">
                        {note.paletteHint && (
                          <span className="truncate max-w-[170px]">🎨 {note.paletteHint}</span>
                        )}
                        {note.lightingHint && (
                          <span className="truncate max-w-[170px]">☀️ {note.lightingHint}</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredNotes.length === 0 && (
                <div className="p-3 text-center text-[10px] text-gray-400 bg-[#18191A] rounded-xl border border-[#3E4042]">
                  Không có bộ note nào trong phân loại này.
                </div>
              )}
            </div>
          )}

          {/* ACTIVE NOTE CARD SUMMARY & ACTIONS */}
          {activeNote && !isEditingNote && (
            <div className="p-2.5 rounded-xl bg-purple-950/20 border border-purple-800/40 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-purple-300 flex items-center gap-1">
                  <span>Áp dụng bộ note:</span>
                  <span className="text-white underline">{activeNote.title}</span>
                </span>
                {getCategoryBadge(activeNote.category)}
              </div>

              {/* Action Buttons for active note */}
              <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                <button
                  onClick={runConceptGeneration}
                  disabled={data.status === 'running'}
                  className="py-1.5 px-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:brightness-110 text-white font-bold text-[11px] shadow-md flex items-center justify-center gap-1 transition-all disabled:opacity-50"
                >
                  <Sparkles size={13} className={data.status === 'running' ? 'animate-spin' : ''} />
                  <span>{data.status === 'running' ? 'Đang tạo...' : '✨ Gợi Ý 5 Concept'}</span>
                </button>

                <button
                  onClick={applyNoteDirectlyAsConcept}
                  className="py-1.5 px-2 rounded-xl bg-[#18191A] hover:bg-[#202122] border border-purple-500/50 hover:border-purple-400 text-purple-300 hover:text-white font-semibold text-[10px] flex items-center justify-center gap-1 transition-all"
                  title="Dùng thẳng nội dung ghi chú làm Concept Prompt"
                >
                  <ArrowRight size={12} />
                  <span>Dùng Thẳng Làm Concept</span>
                </button>
              </div>
            </div>
          )}

          {/* Button if no active note is selected yet */}
          {!activeNote && savedNotes.length > 0 && !isEditingNote && (
            <div className="p-2 rounded-xl bg-[#18191A] border border-dashed border-[#3E4042] text-[10px] text-gray-400 text-center">
              👆 Hãy nhấp chọn 1 bộ note ở trên để kích hoạt định hướng phong cách
            </div>
          )}
        </div>

        {/* PHẦN 2: DANH SÁCH 5 CONCEPT DO AI GỢI Ý */}
        <div className="space-y-1.5 pt-1 border-t border-[#3E4042]/70">
          <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            <span className="flex items-center gap-1 text-emerald-400">
              <Check size={12} />
              <span>Concept Gợi Ý Đã Sinh ({concepts.length})</span>
            </span>
            {concepts.length > 0 && (
              <span className="font-mono text-emerald-400 text-[9px]">Sẵn sàng truyền dữ liệu</span>
            )}
          </div>

          {concepts.length > 0 ? (
            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1 custom-scrollbar">
              {concepts.map((c, idx) => {
                const isSelected = selectedPrompt === c.prompt;
                return (
                  <div
                    key={idx}
                    onClick={() => selectConcept(c)}
                    className={`p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-purple-600/25 border-purple-400 text-white font-semibold shadow-md shadow-purple-950/40 ring-1 ring-purple-400'
                        : 'bg-[#18191A] border-[#3E4042] text-gray-300 hover:border-gray-500 hover:bg-[#202122]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-bold text-purple-300 flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-mono flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="truncate">{c.title}</span>
                      </span>
                      {isSelected && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded-md border border-emerald-500/40">
                          <Check size={11} /> Đã chọn
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed">
                      {c.prompt}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-[#18191A] border border-dashed border-[#3E4042] text-[10px] text-gray-400 text-center">
              Chọn hoặc tạo một bộ note phong cách ở trên, sau đó bấm "Gợi Ý 5 Concept" để nhận kết quả độc bản.
            </div>
          )}
        </div>

        {/* Prompt Concept đã chọn / Tùy chỉnh */}
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            Prompt Concept Hoàn Chỉnh (Truyền Tự Động Sang Generator):
          </label>
          <textarea
            rows={3}
            value={selectedPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Nội dung concept mô tả không gian, ánh sáng, góc nhìn sẽ tự động xuất hiện ở đây sau khi bạn chọn bộ note hoặc concept..."
            className="w-full bg-[#18191A] border border-[#3E4042] focus:border-[#1877F2] rounded-xl p-2.5 text-xs text-white outline-none resize-none transition-colors"
          />
        </div>
      </div>

      {/* Cổng Ra Duy Nhất (Output) */}
      <Handle
        type="source"
        position={Position.Right}
        id="out"
        style={{ top: '50%' }}
        className="!w-4 !h-4 !bg-[#18191A] !border-2 !border-emerald-400 hover:!border-cyan-400 hover:!scale-125 transition-all shadow-md cursor-crosshair !-right-2"
        title="Dữ liệu Concept (Output ➔ Nối vào Đạo Cụ / Sinh Ảnh)"
      />
    </div>
  );
};
