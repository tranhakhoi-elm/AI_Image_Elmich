import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Coffee, Plus, X } from 'lucide-react';
import { NodeHeader } from './NodeHeader';
import { PropsSuggesterNodeData } from '../types';
import { suggestPropsForConcept } from '../../../../services/geminiService';
import { PropConfig } from '../../../../types';

interface Props {
  id: string;
  data: PropsSuggesterNodeData;
}

export const PropsSuggesterNode: React.FC<Props> = ({ id, data }) => {
  const selectedProps = data.selectedProps || [];
  const availableProps = data.availableProps || [];
  const [customPropInput, setCustomPropInput] = useState('');

  const runSuggestProps = async () => {
    const conceptText = data.conceptPrompt || 'Modern kitchen lifestyle';
    const prodName = data.productName || 'Sản phẩm gia dụng Elmich';

    window.dispatchEvent(
      new CustomEvent('elmich:canvas-node-update', {
        detail: { nodeId: id, data: { ...data, status: 'running' } },
      })
    );

    try {
      const result = await suggestPropsForConcept(prodName, conceptText, 'LIFESTYLE');
      const propsList = result.props || [];

      window.dispatchEvent(
        new CustomEvent('elmich:canvas-node-update', {
          detail: {
            nodeId: id,
            data: {
              ...data,
              status: 'success',
              availableProps: propsList,
              selectedProps: propsList.slice(0, 4).map((name) => ({ name })),
            },
          },
        })
      );
    } catch (err: any) {
      console.error('Suggest props error:', err);
      window.dispatchEvent(
        new CustomEvent('elmich:canvas-node-update', {
          detail: { nodeId: id, data: { ...data, status: 'error', errorMessage: err.message } },
        })
      );
    }
  };

  const toggleProp = (name: string) => {
    const exists = selectedProps.some((p) => p.name === name);
    const nextProps: PropConfig[] = exists
      ? selectedProps.filter((p) => p.name !== name)
      : [...selectedProps, { name }];

    window.dispatchEvent(
      new CustomEvent('elmich:canvas-node-update', {
        detail: { nodeId: id, data: { ...data, selectedProps: nextProps } },
      })
    );
  };

  const addCustomProp = () => {
    const trimmed = customPropInput.trim();
    if (!trimmed) return;
    if (!selectedProps.some((p) => p.name === trimmed)) {
      const nextProps = [...selectedProps, { name: trimmed }];
      window.dispatchEvent(
        new CustomEvent('elmich:canvas-node-update', {
          detail: {
            nodeId: id,
            data: {
              ...data,
              availableProps: Array.from(new Set([...availableProps, trimmed])),
              selectedProps: nextProps,
            },
          },
        })
      );
    }
    setCustomPropInput('');
  };

  return (
    <div className="w-80 rounded-2xl bg-[#242526] border-2 border-[#3E4042] shadow-2xl overflow-hidden hover:border-purple-500/60 transition-all text-white">
      {/* Cổng Vào Duy Nhất (Input) */}
      <Handle
        type="target"
        position={Position.Left}
        id="in"
        style={{ top: '50%' }}
        className="!w-4 !h-4 !bg-[#18191A] !border-2 !border-[#1877F2] hover:!border-cyan-400 hover:!scale-125 transition-all shadow-md cursor-crosshair !-left-2"
        title="Dữ liệu đầu vào (Input ➔ Nhận từ Node Concept)"
      />

      <NodeHeader
        title={data.label || 'Đạo Cụ'}
        category="analysis"
        icon={<Coffee size={15} />}
        status={data.status}
        onRun={runSuggestProps}
      />

      <div className="p-3.5 space-y-3">
        <div className="flex items-center justify-between text-[11px] text-gray-400">
          <span>Đạo cụ hòa hợp bối cảnh:</span>
          <span className="font-mono text-purple-400 font-bold">{selectedProps.length} đã chọn</span>
        </div>

        {availableProps.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
            {availableProps.map((pName) => {
              const isSelected = selectedProps.some((p) => p.name === pName);
              return (
                <button
                  key={pName}
                  onClick={() => toggleProp(pName)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    isSelected
                      ? 'bg-[#1877F2] text-white border border-[#1877F2]'
                      : 'bg-[#18191A] text-gray-300 border border-[#3E4042] hover:border-gray-500'
                  }`}
                >
                  {isSelected && <span className="mr-1">✓</span>}
                  {pName}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="p-2 rounded-xl bg-purple-950/20 border border-purple-900/40 text-[11px] text-purple-300 text-center">
            {data.conceptPrompt ? '✓ Đã nhận Concept qua dây nối! Bấm "Run" để AI gợi ý đạo cụ' : 'Nối Concept và bấm "Run" để AI gợi ý đạo cụ'}
          </div>
        )}

        <div className="flex gap-1.5">
          <input
            type="text"
            value={customPropInput}
            onChange={(e) => setCustomPropInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustomProp()}
            placeholder="Thêm đạo cụ tùy chỉnh..."
            className="flex-1 bg-[#18191A] border border-[#3E4042] focus:border-[#1877F2] rounded-xl px-3 py-1.5 text-xs text-white outline-none transition-colors"
          />
          <button
            onClick={addCustomProp}
            className="px-3 bg-[#3A3B3C] hover:bg-[#1877F2] text-white rounded-xl text-xs font-bold transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Cổng Ra Duy Nhất (Output) */}
      <Handle
        type="source"
        position={Position.Right}
        id="out"
        style={{ top: '50%' }}
        className="!w-4 !h-4 !bg-[#18191A] !border-2 !border-emerald-400 hover:!border-cyan-400 hover:!scale-125 transition-all shadow-md cursor-crosshair !-right-2"
        title="Dữ liệu đạo cụ (Output ➔ Nối vào Sinh Ảnh)"
      />
    </div>
  );
};
