import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import {
  BookOpen,
  Check,
  Power,
  ChevronDown,
  ChevronUp,
  FileText,
  Eye,
  X,
  Sparkles,
  Info,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { NodeHeader } from './NodeHeader';
import { MarkdownSkillNodeData } from '../types';
import {
  MARKDOWN_SKILL_DOCS,
  compileSelectedSkillsGuidance,
  MarkdownSkillDoc,
} from '../services/markdownSkillRegistry';

interface Props {
  id: string;
  data: MarkdownSkillNodeData;
}

export const MarkdownSkillNode: React.FC<Props> = ({ id, data }) => {
  const selectedIds = data.selectedSkillIds || ['lifestyle_concept'];
  const isActive = data.isActive !== false;
  const customNote = data.customGuidanceNote || '';

  const [previewDoc, setPreviewDoc] = useState<MarkdownSkillDoc | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isNoteExpanded, setIsNoteExpanded] = useState(false);

  const updateData = (newData: Partial<MarkdownSkillNodeData>) => {
    window.dispatchEvent(
      new CustomEvent('elmich:canvas-node-update', {
        detail: { nodeId: id, data: { ...data, ...newData } },
      })
    );
  };

  const handleToggleSkill = (skillId: string) => {
    let nextIds: string[];
    if (selectedIds.includes(skillId)) {
      nextIds = selectedIds.filter((s) => s !== skillId);
    } else {
      nextIds = [...selectedIds, skillId];
    }
    const compiled = compileSelectedSkillsGuidance(nextIds, customNote);
    updateData({
      selectedSkillIds: nextIds,
      combinedGuidance: compiled.guidance,
      primarySkillTitle: compiled.title,
    });
  };

  const handleNoteChange = (text: string) => {
    const compiled = compileSelectedSkillsGuidance(selectedIds, text);
    updateData({
      customGuidanceNote: text,
      combinedGuidance: compiled.guidance,
      primarySkillTitle: compiled.title,
    });
  };

  const filteredDocs = MARKDOWN_SKILL_DOCS.filter((doc) => {
    const matchCat = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="w-[390px] rounded-2xl bg-[#242526] border-2 border-amber-500/60 shadow-2xl overflow-hidden hover:border-amber-400 transition-all text-white relative">
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
        title={data.label || 'Markdown Skills'}
        category="analysis"
        icon={<BookOpen size={14} className="text-amber-400" />}
        status={data.status}
      />

      <div className="p-3.5 space-y-3">
        {/* Active Toggle & Summary Status */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-[#18191A] border border-[#3E4042]">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isActive ? 'bg-amber-400 animate-ping' : 'bg-gray-500'
              }`}
            />
            <span className="text-[11px] font-bold text-gray-300">
              Đã chọn: <b className="text-amber-400">{selectedIds.length} tài liệu</b>
            </span>
          </div>

          <button
            type="button"
            onClick={() => updateData({ isActive: !isActive })}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border ${
              isActive
                ? 'bg-amber-600/30 text-amber-300 border-amber-500/50 shadow-sm'
                : 'bg-gray-800 text-gray-400 border-gray-700'
            }`}
          >
            <Power size={11} />
            <span>{isActive ? 'ĐANG BẬT' : 'TẠM TẮT'}</span>
          </button>
        </div>

        {/* Explain Banner */}
        <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-[10px] text-amber-200/90 leading-relaxed flex items-start gap-2">
          <Sparkles size={13} className="text-amber-400 shrink-0 mt-0.5" />
          <span>
            Chọn các tài liệu chuẩn hóa Elmich (.md) bên dưới để AI học tiêu chuẩn nhiếp ảnh,
            ánh sáng, vật liệu PBR trước khi tạo ảnh.
          </span>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={12} className="absolute left-2.5 top-2.5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm tài liệu chuẩn Elmich..."
              className="w-full bg-[#18191A] border border-[#3E4042] focus:border-amber-500 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white outline-none placeholder:text-gray-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#18191A] border border-[#3E4042] rounded-xl px-2 py-1.5 text-[11px] text-gray-300 outline-none cursor-pointer"
          >
            <option value="all">Tất cả ({MARKDOWN_SKILL_DOCS.length})</option>
            <option value="photography">Nhiếp ảnh</option>
            <option value="effects">Kỹ thuật & Hiệu ứng</option>
            <option value="commercial">Thương mại & Bao bì</option>
            <option value="materials">Vật liệu PBR</option>
            <option value="brand">Thương hiệu</option>
          </select>
        </div>

        {/* Skill Docs Checklist */}
        <div className="space-y-1.5 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
          {filteredDocs.map((doc) => {
            const isSelected = selectedIds.includes(doc.id);
            return (
              <div
                key={doc.id}
                className={`p-2 rounded-xl border transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'bg-amber-950/30 border-amber-500/70 shadow-sm'
                    : 'bg-[#18191A] border-[#3E4042] hover:border-gray-500'
                }`}
                onClick={() => handleToggleSkill(doc.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-all ${
                        isSelected
                          ? 'bg-amber-500 border-amber-400 text-black'
                          : 'border-gray-500 bg-[#242526]'
                      }`}
                    >
                      {isSelected && <Check size={11} className="stroke-[3]" />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white truncate">
                          {doc.title}
                        </span>
                        <span className="text-[9px] px-1 py-0.2 rounded bg-[#242526] text-amber-300/80 border border-[#3E4042] shrink-0 font-mono">
                          {doc.fileName}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 truncate mt-0.5">
                        {doc.summary}
                      </p>
                    </div>
                  </div>

                  {/* Preview Doc Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewDoc(doc);
                    }}
                    className="p-1 rounded-lg text-gray-400 hover:text-amber-300 hover:bg-[#242526] transition-colors ml-1 shrink-0"
                    title="Xem chi tiết tài liệu này"
                  >
                    <Eye size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom Notes Section */}
        <div className="border-t border-[#3E4042] pt-2">
          <button
            type="button"
            onClick={() => setIsNoteExpanded(!isNoteExpanded)}
            className="flex items-center justify-between w-full text-[10px] font-bold text-gray-400 hover:text-gray-200 transition-colors uppercase tracking-wider mb-1"
          >
            <span>+ Thêm Ghi Chú / Chỉ Thị Bổ Sung</span>
            {isNoteExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>

          {isNoteExpanded && (
            <textarea
              rows={2}
              value={customNote}
              onChange={(e) => handleNoteChange(e.target.value)}
              placeholder="VD: Ưu tiên ánh sáng ấm áp, tránh để nền lem màu, giữ tỷ lệ 1:1..."
              className="w-full bg-[#18191A] border border-[#3E4042] focus:border-amber-500 rounded-xl p-2 text-xs text-white outline-none resize-none transition-all placeholder:text-gray-500 font-normal leading-relaxed"
            />
          )}
        </div>

        {/* Port routing info */}
        <div className="flex items-center justify-between text-[10px] text-gray-400 px-1 pt-0.5">
          <span>Kéo dây nối sang Node:</span>
          <span className="text-amber-400 font-semibold">Sinh Ảnh / Concept ➔</span>
        </div>
      </div>

      {/* Cổng Ra Duy Nhất (Output) */}
      <Handle
        type="source"
        position={Position.Right}
        id="out"
        style={{ top: '50%' }}
        className="!w-4 !h-4 !bg-[#18191A] !border-2 !border-emerald-400 hover:!border-cyan-400 hover:!scale-125 transition-all shadow-md cursor-crosshair !-right-2"
        title="Tài liệu định hướng AI (Output ➔ Nối vào Sinh Ảnh / Concept)"
      />

      {/* Full Document Preview Modal */}
      {previewDoc && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewDoc(null)}
        >
          <div
            className="w-[620px] max-w-full max-h-[85vh] bg-[#242526] border-2 border-amber-500/70 rounded-2xl shadow-2xl p-5 text-white flex flex-col space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#3E4042]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
                  <FileText size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{previewDoc.title}</h3>
                  <span className="text-[10px] text-amber-400 font-mono">
                    {previewDoc.fileName} • {previewDoc.charCount.toLocaleString()} ký tự
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="w-7 h-7 rounded-lg bg-[#18191A] hover:bg-[#3A3B3C] text-gray-400 hover:text-white flex items-center justify-center transition-colors border border-[#3E4042]"
              >
                <X size={14} />
              </button>
            </div>

            {/* Key Principles */}
            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-1.5 text-xs text-amber-200">
              <span className="font-bold flex items-center gap-1.5 text-amber-400">
                <ShieldCheck size={14} /> Nguyên Tắc Cốt Lõi:
              </span>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-gray-200">
                {previewDoc.keyPrinciples.map((kp, idx) => (
                  <li key={idx}>{kp}</li>
                ))}
              </ul>
            </div>

            {/* Excerpt content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#18191A] p-3 rounded-xl border border-[#3E4042] text-[11px] text-gray-300 font-mono whitespace-pre-wrap leading-relaxed select-text">
              {previewDoc.rawContent}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#3E4042] text-xs">
              <span className="text-[10px] text-gray-400">
                Mô hình tối ưu: <b className="text-gray-200">{previewDoc.recommendedModels}</b>
              </span>
              <button
                type="button"
                onClick={() => {
                  handleToggleSkill(previewDoc.id);
                  setPreviewDoc(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedIds.includes(previewDoc.id)
                    ? 'bg-red-600/80 hover:bg-red-600 text-white'
                    : 'bg-amber-500 hover:bg-amber-400 text-black font-extrabold'
                }`}
              >
                {selectedIds.includes(previewDoc.id) ? 'Bỏ chọn tài liệu này' : 'Áp dụng tài liệu này'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
