import React from 'react';

export interface NodeCatalogItem {
  type: string;
  label: string;
  cat: 'input' | 'analysis' | 'generator' | 'utility' | 'output';
}

export interface NodeCatalogGroup {
  group: string;
  items: NodeCatalogItem[];
}

export const NODE_GROUPS: NodeCatalogGroup[] = [
  {
    group: 'Đầu Vào',
    items: [
      { type: 'productImage', label: 'Ảnh', cat: 'input' },
      { type: 'referenceImage', label: 'Ảnh Tham Khảo', cat: 'input' },
      { type: 'productSpec', label: 'Thông Số', cat: 'input' },
      { type: 'promptNode', label: 'Prompt', cat: 'input' },
    ],
  },
  {
    group: 'Phân Tích AI',
    items: [
      { type: 'materialDetector', label: 'Chất Liệu', cat: 'analysis' },
      { type: 'conceptGenerator', label: 'Ý Tưởng', cat: 'analysis' },
      { type: 'propsSuggester', label: 'Đạo Cụ', cat: 'analysis' },
      { type: 'stagingLayout', label: 'Bố Cục & Đạo Cụ', cat: 'analysis' },
      { type: 'markdownSkill', label: 'Markdown Skills', cat: 'analysis' },
    ],
  },
  {
    group: 'Sinh Ảnh & Tiện Ích',
    items: [
      { type: 'aiNode', label: 'AI', cat: 'generator' },
      { type: 'presetStyle', label: 'Thể Loại Preset', cat: 'utility' },
      { type: 'imageGenerator', label: 'Sinh Ảnh AI', cat: 'generator' },
      { type: 'barcodeQr', label: 'Barcode & QR', cat: 'utility' },
      { type: 'packagingTranslator', label: 'Dịch Bao Bì', cat: 'utility' },
    ],
  },
  {
    group: 'Đầu Ra',
    items: [
      { type: 'resultViewer', label: 'Xem Kết Quả', cat: 'output' },
      { type: 'imagePreview', label: 'Xem & Tải Ảnh', cat: 'output' },
    ],
  },
];

interface NodeMenuProps {
  onSelectNode: (type: string, label: string, cat: any) => void;
  onClose?: () => void;
  className?: string;
  title?: string;
}

export const NodeMenu: React.FC<NodeMenuProps> = ({
  onSelectNode,
  onClose,
  className = '',
  title,
}) => {
  return (
    <div
      className={`w-52 bg-[#242526] border border-[#3E4042] rounded-xl shadow-2xl p-1.5 select-none text-white ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {title && (
        <div className="px-2.5 py-1 text-xs font-medium text-gray-400 border-b border-[#3E4042] mb-1">
          {title}
        </div>
      )}
      <div className="space-y-1">
        {NODE_GROUPS.map((grp, idx) => (
          <div
            key={grp.group}
            className={idx > 0 ? 'pt-1 mt-1 border-t border-[#3E4042]/50' : ''}
          >
            <div className="text-[11px] text-gray-400 px-2.5 py-0.5 font-medium">
              {grp.group}
            </div>
            <div className="space-y-0.5 mt-0.5">
              {grp.items.map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => {
                    onSelectNode(item.type, item.label, item.cat);
                    onClose?.();
                  }}
                  className="w-full text-left px-2.5 py-1 rounded-lg text-xs font-normal text-gray-200 hover:text-white hover:bg-[#3A3B3C] transition-colors cursor-pointer block"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

