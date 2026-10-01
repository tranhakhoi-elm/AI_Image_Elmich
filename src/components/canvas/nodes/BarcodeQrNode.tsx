import React, { useEffect, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { QrCode } from 'lucide-react';
import { NodeHeader } from './NodeHeader';
import { BarcodeQrNodeData } from '../types';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode-svg';

interface Props {
  id: string;
  data: BarcodeQrNodeData;
}

export const BarcodeQrNode: React.FC<Props> = ({ id, data }) => {
  const mode = data.mode || 'qr';
  const content = data.content || 'https://elmich.vn';
  const [svgData, setSvgData] = useState<string>('');

  useEffect(() => {
    try {
      if (mode === 'qr') {
        const qr = new QRCode({
          content: content || 'https://elmich.vn',
          padding: 2,
          width: 140,
          height: 140,
          color: '#ffffff',
          background: '#18191A',
          ecl: 'M',
        });
        const svg = qr.svg();
        setSvgData(svg);
        const base64 = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
        window.dispatchEvent(
          new CustomEvent('elmich:canvas-node-update', {
            detail: { nodeId: id, data: { ...data, outputSvg: base64 } },
          })
        );
      } else {
        const canvas = document.createElement('canvas');
        JsBarcode(canvas, content || '8936012345678', {
          format: 'CODE128',
          width: 2,
          height: 50,
          displayValue: true,
          lineColor: '#ffffff',
          background: '#18191A',
        });
        const url = canvas.toDataURL('image/png');
        setSvgData(`<img src="${url}" class="max-w-full h-auto" />`);
        window.dispatchEvent(
          new CustomEvent('elmich:canvas-node-update', {
            detail: { nodeId: id, data: { ...data, outputSvg: url } },
          })
        );
      }
    } catch (err) {
      console.error('Barcode/QR generation error:', err);
    }
  }, [mode, content]);

  return (
    <div className="w-76 rounded-2xl bg-[#242526] border-2 border-teal-500/50 shadow-2xl overflow-hidden hover:border-teal-400 transition-all text-white">
      {/* Cổng Vào Duy Nhất (Input) */}
      <Handle
        type="target"
        position={Position.Left}
        id="in"
        style={{ top: '50%' }}
        className="!w-4 !h-4 !bg-[#18191A] !border-2 !border-[#1877F2] hover:!border-cyan-400 hover:!scale-125 transition-all shadow-md cursor-crosshair !-left-2"
        title="Dữ liệu thông số / SKU (Input ➔ Nhận từ Node Thông Số)"
      />

      <NodeHeader
        title={data.label || 'Barcode & QR'}
        category="utility"
        icon={<QrCode size={15} />}
        status={data.status}
      />

      <div className="p-3.5 space-y-3">
        <div className="flex bg-[#18191A] p-1 rounded-xl border border-[#3E4042]">
          <button
            onClick={() => {
              window.dispatchEvent(
                new CustomEvent('elmich:canvas-node-update', {
                  detail: { nodeId: id, data: { ...data, mode: 'qr' } },
                })
              );
            }}
            className={`flex-1 py-1 text-xs font-bold rounded-lg transition-colors ${
              mode === 'qr' ? 'bg-teal-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            QR Code
          </button>
          <button
            onClick={() => {
              window.dispatchEvent(
                new CustomEvent('elmich:canvas-node-update', {
                  detail: { nodeId: id, data: { ...data, mode: 'barcode' } },
                })
              );
            }}
            className={`flex-1 py-1 text-xs font-bold rounded-lg transition-colors ${
              mode === 'barcode' ? 'bg-teal-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Mã Vạch
          </button>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            Nội dung / Link URL / Số EAN
          </label>
          <input
            type="text"
            value={content}
            onChange={(e) => {
              window.dispatchEvent(
                new CustomEvent('elmich:canvas-node-update', {
                  detail: { nodeId: id, data: { ...data, content: e.target.value } },
                })
              );
            }}
            placeholder="https://elmich.vn..."
            className="w-full bg-[#18191A] border border-[#3E4042] focus:border-[#1877F2] rounded-xl px-3 py-2 text-xs text-white outline-none transition-colors"
          />
        </div>

        <div className="flex items-center justify-center p-3 rounded-xl bg-[#18191A] border border-[#3E4042] min-h-[120px]">
          {mode === 'qr' ? (
            <div dangerouslySetInnerHTML={{ __html: svgData }} />
          ) : (
            <div dangerouslySetInnerHTML={{ __html: svgData }} />
          )}
        </div>
      </div>

      {/* Cổng Ra Duy Nhất (Output) */}
      <Handle
        type="source"
        position={Position.Right}
        id="out"
        style={{ top: '50%' }}
        className="!w-4 !h-4 !bg-[#18191A] !border-2 !border-emerald-400 hover:!border-cyan-400 hover:!scale-125 transition-all shadow-md cursor-crosshair !-right-2"
        title="Dữ liệu mã Barcode/QR (Output)"
      />
    </div>
  );
};
