import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import {
  Layout,
  Maximize2,
  Sparkles,
  Layers,
  Move,
  RotateCw,
  FlipHorizontal,
  Plus,
  Trash2,
  Type,
  Eye,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { NodeHeader } from './NodeHeader';
import { StagingLayoutNodeData, PropLayer } from '../types';
import { AspectRatio } from '../../../../types';

interface Props {
  id: string;
  data: StagingLayoutNodeData;
}

const DEFAULT_PROP_TEMPLATES = [
  { name: 'Thớt gỗ sồi', emoji: '🪵', defaultZ: 'back' as const },
  { name: 'Nhánh hương thảo', emoji: '🌿', defaultZ: 'front' as const },
  { name: 'Lát chanh tươi', emoji: '🍋', defaultZ: 'front' as const },
  { name: 'Khối bục đá', emoji: '🏛️', defaultZ: 'back' as const },
  { name: 'Hạt tiêu & ớt', emoji: '🧄', defaultZ: 'front' as const },
  { name: 'Lá húng quế', emoji: '🍃', defaultZ: 'front' as const },
  { name: 'Cốc cafe / trà', emoji: '☕', defaultZ: 'back' as const },
];

export const StagingLayoutNode: React.FC<Props> = ({ id, data }) => {
  const [selectedLayerId, setSelectedLayerId] = useState<'product' | string>('product');
  const [isPropsPanelOpen, setIsPropsPanelOpen] = useState(false);
  const [customPropName, setCustomPropName] = useState('');
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);

  // Default values
  const aspectRatio: AspectRatio = data.aspectRatio || '1:1';
  const productX = data.productX ?? 50;
  const productY = data.productY ?? 55;
  const productScale = data.productScale ?? 1.0;
  const productRotation = data.productRotation ?? 0;
  const productFlipX = data.productFlipX ?? false;
  const propsLayers: PropLayer[] = data.propsLayers || [];
  const textSafeEnabled = data.textSafeAreaEnabled ?? true;
  const textSafeZone = data.textSafeZone || 'top_right';

  // Aspect ratio to CSS style
  const getAspectRatioPadding = () => {
    switch (aspectRatio) {
      case '16:9': return '56.25%';
      case '9:16': return '177.77%';
      case '4:3': return '75%';
      case '3:4': return '133.33%';
      default: return '100%';
    }
  };

  // Helper to emit update
  const emitUpdate = useCallback((partialData: Partial<StagingLayoutNodeData>) => {
    window.dispatchEvent(
      new CustomEvent('elmich:canvas-node-update', {
        detail: {
          nodeId: id,
          data: {
            ...data,
            ...partialData,
          },
        },
      })
    );
  }, [id, data]);

  // Sinh prompt mô tả bố cục không gian
  const generateSpatialPrompt = useCallback(() => {
    const lines: string[] = [];
    lines.push('[BỐ CỤC KHÔNG GIAN DÀN CẢNH — STRICT SPATIAL COMPOSITION]');
    
    // Vị trí sản phẩm
    let hAlign = 'trung tâm (Center)';
    if (productX < 40) hAlign = 'lệch trái (Left side)';
    else if (productX > 60) hAlign = 'lệch phải (Right side)';

    let vAlign = 'ở giữa khung hình';
    if (productY < 40) vAlign = 'phía trên (Elevated)';
    else if (productY > 60) vAlign = 'sát mặt bàn / sàn (Grounded base)';

    lines.push(
      `- Sản phẩm chính Elmich: Đặt tại tọa độ X: ${Math.round(productX)}%, Y: ${Math.round(productY)}% (${hAlign}, ${vAlign}), tỉ lệ hiển thị: ${productScale.toFixed(1)}x, xoay: ${productRotation}°.${productFlipX ? ' Hướng quay sản phẩm lật đối xứng.' : ''}`
    );

    // Đạo cụ
    if (propsLayers.length > 0) {
      lines.push('- Đồ trang trí & Đạo cụ bố trí xung quanh:');
      propsLayers.forEach((p, idx) => {
        const zPos = p.zIndex === 'back' ? 'phía sau / nền (Background layer)' : 'tiền cảnh / phía trước (Foreground accent)';
        lines.push(
          `  + Đạo cụ ${idx + 1} (${p.name}): Tọa độ X: ${Math.round(p.x)}%, Y: ${Math.round(p.y)}%, kích thước: ${p.scale.toFixed(1)}x, xếp ở ${zPos}.`
        );
      });
    }

    // Vùng chừa chữ
    if (textSafeEnabled) {
      let zoneDesc = 'Góc trên bên phải';
      if (textSafeZone === 'top_left') zoneDesc = 'Góc trên bên trái';
      else if (textSafeZone === 'bottom_full') zoneDesc = 'Dải ngang chân banner bên dưới';
      else if (textSafeZone === 'right_half') zoneDesc = 'Nửa bên phải 50% khung hình';
      else if (textSafeZone === 'left_half') zoneDesc = 'Nửa bên trái 50% khung hình';

      lines.push(
        `- Vùng an toàn chèn chữ Marketing (Negative Space): ${zoneDesc} BẮT BUỘC giữ nền sạch, mờ bokeh nhẹ, không có vật cản che khuất để designer đặt tiêu đề & thông số Elmich.`
      );
    }

    return lines.join('\n');
  }, [productX, productY, productScale, productRotation, productFlipX, propsLayers, textSafeEnabled, textSafeZone]);

  // Cập nhật spatial guidance tự động khi bố cục thay đổi
  useEffect(() => {
    const prompt = generateSpatialPrompt();
    if (data.spatialGuidance !== prompt) {
      emitUpdate({ spatialGuidance: prompt });
    }
  }, [generateSpatialPrompt, data.spatialGuidance, emitUpdate]);

  // Drag handler cho Canvas
  const [isDragging, setIsDragging] = useState(false);
  const activeDragTarget = useRef<'product' | string | null>(null);

  const handlePointerDown = (target: 'product' | string, e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedLayerId(target);
    activeDragTarget.current = target;
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !activeDragTarget.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const xPct = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
    const yPct = Math.max(5, Math.min(95, ((e.clientY - rect.top) / rect.height) * 100));

    if (activeDragTarget.current === 'product') {
      emitUpdate({ productX: xPct, productY: yPct });
    } else {
      const propId = activeDragTarget.current;
      const nextProps = propsLayers.map((p) =>
        p.id === propId ? { ...p, x: xPct, y: yPct } : p
      );
      emitUpdate({ propsLayers: nextProps });
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    activeDragTarget.current = null;
  };

  // Thao tác với đạo cụ
  const addPropLayer = (template: { name: string; emoji: string; defaultZ: 'front' | 'back' }) => {
    const newProp: PropLayer = {
      id: `prop-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      name: template.name,
      emoji: template.emoji,
      x: 30 + Math.random() * 40,
      y: 60 + Math.random() * 20,
      scale: 1.0,
      rotation: (Math.random() - 0.5) * 30,
      zIndex: template.defaultZ,
    };
    emitUpdate({ propsLayers: [...propsLayers, newProp] });
    setSelectedLayerId(newProp.id);
  };

  const addCustomProp = () => {
    if (!customPropName.trim()) return;
    const newProp: PropLayer = {
      id: `prop-${Date.now()}`,
      name: customPropName.trim(),
      emoji: '✨',
      x: 50,
      y: 70,
      scale: 1.0,
      rotation: 0,
      zIndex: 'front',
    };
    emitUpdate({ propsLayers: [...propsLayers, newProp] });
    setSelectedLayerId(newProp.id);
    setCustomPropName('');
  };

  const removeProp = (propId: string) => {
    emitUpdate({ propsLayers: propsLayers.filter((p) => p.id !== propId) });
    if (selectedLayerId === propId) setSelectedLayerId('product');
  };

  const togglePropZIndex = (propId: string) => {
    emitUpdate({
      propsLayers: propsLayers.map((p) =>
        p.id === propId ? { ...p, zIndex: p.zIndex === 'back' ? 'front' : 'back' } : p
      ),
    });
  };

  const copyPromptToClipboard = () => {
    const text = generateSpatialPrompt();
    navigator.clipboard.writeText(text);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  // Text safe area position styling
  const getTextSafeStyle = () => {
    switch (textSafeZone) {
      case 'top_right':
        return 'top-2 right-2 w-[45%] h-[40%]';
      case 'top_left':
        return 'top-2 left-2 w-[45%] h-[40%]';
      case 'bottom_full':
        return 'bottom-2 left-2 right-2 h-[30%]';
      case 'right_half':
        return 'top-2 bottom-2 right-2 w-[45%]';
      case 'left_half':
        return 'top-2 bottom-2 left-2 w-[45%]';
      default:
        return 'top-2 right-2 w-[45%] h-[40%]';
    }
  };

  return (
    <div className="w-[390px] rounded-2xl bg-[#242526] border-2 border-purple-500/80 shadow-2xl overflow-hidden hover:border-purple-400 transition-all text-white select-none relative">
      {/* Cổng Vào Duy Nhất (Input) */}
      <Handle
        type="target"
        position={Position.Left}
        id="in"
        style={{ top: '50%' }}
        className="!w-4 !h-4 !bg-[#18191A] !border-2 !border-[#1877F2] hover:!border-cyan-400 hover:!scale-125 transition-all shadow-md cursor-crosshair !-left-2"
        title="Dữ liệu đầu vào (Input ➔ Nhận từ Node Ảnh / Đạo Cụ / Concept)"
      />

      {/* Cổng Ra Duy Nhất (Output) */}
      <Handle
        type="source"
        position={Position.Right}
        id="out"
        style={{ top: '50%' }}
        className="!w-4 !h-4 !bg-[#18191A] !border-2 !border-emerald-400 hover:!border-cyan-400 hover:!scale-125 transition-all shadow-md cursor-crosshair !-right-2"
        title="Dữ liệu Bố Cục & Đạo Cụ (Output ➔ Nối sang Node Sinh Ảnh)"
      />

      <NodeHeader
        title={data.label || 'Bố Cục & Đạo Cụ'}
        category="analysis"
        icon={<Layout size={15} className="text-purple-400" />}
        status={data.status}
      />

      <div className="p-3.5 space-y-3">
        {/* Tỷ lệ khung hình & Căn chỉnh nhanh */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Tỉ Lệ:</span>
            <select
              value={aspectRatio}
              onChange={(e) => emitUpdate({ aspectRatio: e.target.value as AspectRatio })}
              className="px-2 py-1 rounded-lg bg-[#18191A] border border-[#3E4042] text-xs font-semibold text-white focus:outline-none focus:border-purple-500"
            >
              <option value="1:1">1:1 (Vuông)</option>
              <option value="4:3">4:3 (Ngang)</option>
              <option value="16:9">16:9 (Banner)</option>
              <option value="9:16">9:16 (Story)</option>
              <option value="3:4">3:4 (Thương mại)</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => emitUpdate({ productX: 50, productY: 55, productRotation: 0, productScale: 1.0 })}
              className="px-2 py-1 rounded-lg bg-[#18191A] border border-[#3E4042] hover:bg-[#3A3B3C] text-[10px] font-semibold text-gray-300"
              title="Đặt lại chính giữa"
            >
              Căn Giữa
            </button>
            <button
              type="button"
              onClick={() => emitUpdate({ productX: 30, productY: 60 })}
              className="px-2 py-1 rounded-lg bg-[#18191A] border border-[#3E4042] hover:bg-[#3A3B3C] text-[10px] font-semibold text-gray-300"
              title="Đặt lệch sang trái để chừa chữ bên phải"
            >
              Trái
            </button>
            <button
              type="button"
              onClick={() => emitUpdate({ productX: 70, productY: 60 })}
              className="px-2 py-1 rounded-lg bg-[#18191A] border border-[#3E4042] hover:bg-[#3A3B3C] text-[10px] font-semibold text-gray-300"
              title="Đặt lệch sang phải"
            >
              Phải
            </button>
          </div>
        </div>

        {/* KHUNG CANVAS BỐ CỤC TƯƠNG TÁC (VISUAL STAGING STAGE) */}
        <div className="relative w-full rounded-xl bg-[#141516] border border-[#3E4042] overflow-hidden shadow-inner">
          <div style={{ paddingBottom: getAspectRatioPadding() }} className="w-full relative">
            <div
              ref={canvasRef}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className="absolute inset-0 overflow-hidden cursor-crosshair"
            >
              {/* Lưới tọa độ & Đường sàn studio */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:20px_20px]" />
              <div className="absolute top-[65%] left-0 right-0 h-[1px] bg-purple-500/20" />
              <div className="absolute top-[65%] inset-x-0 bottom-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none" />

              {/* LỚP 1: Đạo cụ phía sau (Background Props) */}
              {propsLayers
                .filter((p) => p.zIndex === 'back')
                .map((prop) => (
                  <div
                    key={prop.id}
                    onPointerDown={(e) => handlePointerDown(prop.id, e)}
                    style={{
                      left: `${prop.x}%`,
                      top: `${prop.y}%`,
                      transform: `translate(-50%, -50%) scale(${prop.scale}) rotate(${prop.rotation}deg)`,
                      zIndex: 5,
                    }}
                    className={`absolute p-1.5 rounded-xl border flex items-center gap-1 shadow-lg transition-transform cursor-grab active:cursor-grabbing ${
                      selectedLayerId === prop.id
                        ? 'bg-purple-900/90 border-purple-400 text-white ring-2 ring-purple-500/50'
                        : 'bg-[#242526]/80 border-[#3E4042] text-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <span className="text-sm">{prop.emoji || '✨'}</span>
                    <span className="text-[10px] font-semibold max-w-[70px] truncate">{prop.name}</span>
                  </div>
                ))}

              {/* LỚP 2: SẢN PHẨM CHÍNH (HERO PRODUCT) */}
              <div
                onPointerDown={(e) => handlePointerDown('product', e)}
                style={{
                  left: `${productX}%`,
                  top: `${productY}%`,
                  transform: `translate(-50%, -50%) scale(${productScale}) rotate(${productRotation}deg) ${
                    productFlipX ? 'scaleX(-1)' : ''
                  }`,
                  zIndex: 10,
                }}
                className={`absolute w-36 h-36 flex items-center justify-center p-1 rounded-2xl border-2 transition-transform cursor-grab active:cursor-grabbing ${
                  selectedLayerId === 'product'
                    ? 'border-cyan-400 bg-cyan-950/20 ring-2 ring-cyan-500/40 shadow-2xl'
                    : 'border-transparent hover:border-white/40'
                }`}
              >
                {data.inputImage ? (
                  <img
                    src={data.inputImage}
                    alt="Sản phẩm Elmich"
                    className="max-w-full max-h-full object-contain pointer-events-none drop-shadow-xl"
                  />
                ) : (
                  <div className="w-full h-full rounded-xl bg-purple-900/20 border border-dashed border-purple-400/60 flex flex-col items-center justify-center p-2 text-center text-purple-300">
                    <span className="text-xl mb-1">🍳</span>
                    <span className="text-[9px] font-bold">Chưa có ảnh</span>
                    <span className="text-[8px] opacity-70">Nối từ Node Ảnh</span>
                  </div>
                )}
                {/* Center marker */}
                <div className="absolute w-2 h-2 rounded-full bg-cyan-400 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 opacity-60 pointer-events-none" />
              </div>

              {/* LỚP 3: Đạo cụ phía trước (Foreground Props) */}
              {propsLayers
                .filter((p) => p.zIndex === 'front')
                .map((prop) => (
                  <div
                    key={prop.id}
                    onPointerDown={(e) => handlePointerDown(prop.id, e)}
                    style={{
                      left: `${prop.x}%`,
                      top: `${prop.y}%`,
                      transform: `translate(-50%, -50%) scale(${prop.scale}) rotate(${prop.rotation}deg)`,
                      zIndex: 20,
                    }}
                    className={`absolute p-1.5 rounded-xl border flex items-center gap-1 shadow-lg transition-transform cursor-grab active:cursor-grabbing ${
                      selectedLayerId === prop.id
                        ? 'bg-purple-900/90 border-purple-400 text-white ring-2 ring-purple-500/50'
                        : 'bg-[#242526]/90 border-purple-500/40 text-purple-200 hover:border-purple-400'
                    }`}
                  >
                    <span className="text-sm">{prop.emoji || '✨'}</span>
                    <span className="text-[10px] font-semibold max-w-[70px] truncate">{prop.name}</span>
                  </div>
                ))}

              {/* LỚP 4: VÙNG AN TOÀN CHÈN CHỮ MARKETING (TEXT SAFE AREA) */}
              {textSafeEnabled && (
                <div
                  className={`absolute ${getTextSafeStyle()} rounded-xl border-2 border-dashed border-indigo-400/80 bg-indigo-950/40 backdrop-blur-[2px] p-2 flex flex-col justify-between pointer-events-none z-30 shadow-lg`}
                >
                  <div className="flex items-center gap-1 text-[9px] font-bold text-indigo-200 uppercase tracking-wider">
                    <Type size={11} className="text-indigo-400 shrink-0" />
                    <span>Vùng chừa chữ / Banner</span>
                  </div>
                  <span className="text-[8px] text-indigo-300/80 leading-tight">
                    AI giữ nền sạch bokeh, không vẽ vật cản
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BẢNG ĐIỀU KHIỂN LỚP ĐANG CHỌN (TRANSFORM INSPECTOR) */}
        {selectedLayerId === 'product' ? (
          <div className="p-2.5 rounded-xl bg-[#18191A] border border-[#3E4042] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-cyan-400 flex items-center gap-1">
                <Move size={12} /> Sản Phẩm Chính Elmich
              </span>
              <span className="text-[10px] text-gray-400 font-mono">
                X:{Math.round(productX)}% Y:{Math.round(productY)}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Tỉ lệ thu phóng */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-gray-300">
                  <span>Kích thước:</span>
                  <span className="font-mono text-cyan-300">{productScale.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.4"
                  max="1.8"
                  step="0.05"
                  value={productScale}
                  onChange={(e) => emitUpdate({ productScale: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-400 h-1 bg-[#242526] rounded-lg cursor-pointer"
                />
              </div>

              {/* Góc xoay */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-gray-300">
                  <span>Góc xoay:</span>
                  <span className="font-mono text-cyan-300">{productRotation}°</span>
                </div>
                <input
                  type="range"
                  min="-45"
                  max="45"
                  step="1"
                  value={productRotation}
                  onChange={(e) => emitUpdate({ productRotation: parseInt(e.target.value) })}
                  className="w-full accent-cyan-400 h-1 bg-[#242526] rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => emitUpdate({ productFlipX: !productFlipX })}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                  productFlipX
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                    : 'bg-[#242526] text-gray-300 border-[#3E4042] hover:text-white'
                }`}
              >
                <FlipHorizontal size={13} />
                <span>Lật Ngang</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedLayerId(propsLayers[0]?.id || 'product')}
                className="text-[10px] text-gray-400 hover:text-white"
              >
                Chọn Đạo Cụ ➔
              </button>
            </div>
          </div>
        ) : (
          /* Đạo cụ đang chọn */
          (() => {
            const activeProp = propsLayers.find((p) => p.id === selectedLayerId);
            if (!activeProp) return null;
            return (
              <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-purple-300 flex items-center gap-1 truncate">
                    {activeProp.emoji} {activeProp.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeProp(activeProp.id)}
                    className="p-1 rounded-md text-red-400 hover:bg-red-500/20"
                    title="Xóa đạo cụ này"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-gray-300">
                      <span>Kích cỡ:</span>
                      <span className="font-mono text-purple-300">{activeProp.scale.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="1.8"
                      step="0.1"
                      value={activeProp.scale}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        emitUpdate({
                          propsLayers: propsLayers.map((p) =>
                            p.id === activeProp.id ? { ...p, scale: val } : p
                          ),
                        });
                      }}
                      className="w-full accent-purple-400 h-1 bg-[#242526] rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="flex flex-col justify-end">
                    <button
                      type="button"
                      onClick={() => togglePropZIndex(activeProp.id)}
                      className="w-full py-1 px-2 rounded-lg bg-[#18191A] border border-purple-500/40 text-[10px] font-semibold text-purple-200 hover:bg-purple-900/30 flex items-center justify-center gap-1"
                    >
                      <Layers size={11} />
                      <span>{activeProp.zIndex === 'back' ? 'Đặt Phía Sau' : 'Đặt Tiền Cảnh'}</span>
                    </button>
                  </div>
                </div>

                <div className="flex justify-between pt-0.5 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setSelectedLayerId('product')}
                    className="text-cyan-400 hover:underline"
                  >
                    ← Chọn Sản phẩm
                  </button>
                </div>
              </div>
            );
          })()
        )}

        {/* QUẢN LÝ ĐẠO CỤ (PROPS PALETTE) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={11} className="text-purple-400" />
              <span>Đạo Cụ Đi Kèm ({propsLayers.length})</span>
            </span>
            <button
              type="button"
              onClick={() => setIsPropsPanelOpen(!isPropsPanelOpen)}
              className="text-[10px] text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-0.5"
            >
              <span>{isPropsPanelOpen ? 'Thu gọn' : '+ Thêm Đạo Cụ'}</span>
              {isPropsPanelOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>

          {/* Quick presets drawer */}
          {isPropsPanelOpen && (
            <div className="p-2.5 rounded-xl bg-[#18191A] border border-[#3E4042] space-y-2">
              <div className="flex flex-wrap gap-1">
                {DEFAULT_PROP_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.name}
                    type="button"
                    onClick={() => addPropLayer(tmpl)}
                    className="px-2 py-1 rounded-lg bg-[#242526] hover:bg-[#3A3B3C] border border-[#3E4042] text-[10px] font-medium flex items-center gap-1 text-gray-200 hover:text-white transition-all"
                  >
                    <span>{tmpl.emoji}</span>
                    <span>{tmpl.name}</span>
                  </button>
                ))}
              </div>

              {/* Input custom prop */}
              <div className="flex gap-1.5 pt-1">
                <input
                  type="text"
                  value={customPropName}
                  onChange={(e) => setCustomPropName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCustomProp()}
                  placeholder="Nhập tên đạo cụ khác..."
                  className="flex-1 px-2.5 py-1 bg-[#242526] border border-[#3E4042] rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
                <button
                  type="button"
                  onClick={addCustomProp}
                  className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold shrink-0"
                >
                  Thêm
                </button>
              </div>
            </div>
          )}
        </div>

        {/* VÙNG CHỪA CHỮ (SAFE AREA SETTINGS) */}
        <div className="p-2.5 rounded-xl bg-[#18191A] border border-[#3E4042] space-y-2">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={textSafeEnabled}
                onChange={(e) => emitUpdate({ textSafeAreaEnabled: e.target.checked })}
                className="w-3.5 h-3.5 rounded accent-indigo-500 cursor-pointer"
              />
              <span className="text-xs font-semibold text-gray-200">Khóa Vùng Chừa Chữ Marketing</span>
            </label>

            {textSafeEnabled && (
              <select
                value={textSafeZone}
                onChange={(e) => emitUpdate({ textSafeZone: e.target.value as any })}
                className="px-2 py-0.5 rounded-md bg-[#242526] border border-[#3E4042] text-[10px] text-indigo-300 font-semibold focus:outline-none"
              >
                <option value="top_right">Góc Trên Phải</option>
                <option value="top_left">Góc Trên Trái</option>
                <option value="right_half">Nửa Bên Phải 50%</option>
                <option value="left_half">Nửa Bên Trái 50%</option>
                <option value="bottom_full">Dải Dưới Chân</option>
              </select>
            )}
          </div>
        </div>

        {/* Nút xem Prompt Bố Cục & Sao chép */}
        <div className="pt-1 flex items-center justify-between">
          <button
            type="button"
            onClick={copyPromptToClipboard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#18191A] hover:bg-[#3A3B3C] border border-[#3E4042] text-xs font-semibold text-purple-300 transition-colors w-full justify-center"
          >
            {copiedPrompt ? <Check size={13} className="text-emerald-400" /> : <Sparkles size={13} />}
            <span>{copiedPrompt ? 'Đã sao chép Prompt Bố Cục!' : 'Sao Chép Chỉ Dẫn Bố Cục Không Gian'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
