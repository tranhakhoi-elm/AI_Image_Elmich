import { ElmichNode, ElmichEdge } from '../types';

export const DEMO_ELMICH_POT_IMAGE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAADAElEQVR4nO3dS08UQRSAUf//79AoiigBRwKCICKCCPKQNwjGt9sOYdfmTtIJRkEFSXVXncW3mcx0V92c5XTXjerktFa53Ui9AAEgAASAABAAAkAACAABIAAEgAAQAAJAAAgAASAABIAAEAAC4M/tHH7pt/vua7139O2n9o+///JZfK/5Teq1A3CJ3u5+qDf3PtZb+5/q7YPPVwIQv4/rxPXiuqn3BsA5rW4e1Wtbx/X69vtrBRDXj/vE/VLvGYCT03p5/aBe2ThMAiDuG/dPPYPiACwsb9eLKzv10upeKwDEOmI9sa7Us8kewPzSZqsBxPpSzyhLALMv1+q5xY1OAIh1xnpTzywbADMv3nQSQKw79ew6DWBq9nU9PbfSaQCx/thH6ll2DsCTmVdZAYj9pJ5pZwCMP13IEkDsK/VsWw9gbHI+awCxv9Qzbi2A3sRcEQBin6ln3ToAj8afFwUg9pt65q0BMDL2rEgAse/Us08OYLg3XTSA2H+xAB6MTgHQm+7PAQAAygIwNDIJwBkAMY9iAAwOTwDwGwAxFwAAyBvAvYfjAFwAIOaTLYCBoTEA/gJAzAkAAAAAICMAd+4/BuAfAMS8AAAgDwC3B3sAXAJAzA0AAAAAoMMAbt0dBeAKAGJ+AAAAAAAAANA1ADcHRgD4DwBijgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALQJQ+T9A2f8HAAAAAAAAoGgAlecCyn4uAAAAACgdQOXp4LKfDgYAgH4AFPyGEAAAAKB0AJX3BJb9nsAmAAp+UygAAPQDoOC3hTcBUPB5AQAA0A+Ags8MaioZQOrZtwJA5dxAAConhwJQOTsYgMrp4QBEOQJIPdNOAYhyApB6lp0E0NRlAKlnlwWAqIsAUs8sKwBNXQCQekZZA4jaDCD1bIoAcLY2AEg9g6IBNKUAkHrPAJzTdQJIvTcALtFVAKReOwACQAAIAAEgAASAABAAAkAACAABIAAEgAAQAAJAAAgAASAAdHE/AJMAnj1YV+PdAAAAAElFTkSuQmCC';

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  iconName: string;
  nodes: ElmichNode[];
  edges: ElmichEdge[];
}

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'lifestyle-pipeline',
    name: 'Phối Cảnh Lifestyle Toàn Diện',
    description: 'Quy trình chuẩn: Nhận diện chất liệu ➔ Lên Concept ➔ Gợi ý Đạo cụ ➔ Sinh ảnh Phối cảnh 4K',
    iconName: 'Layout',
    nodes: [
      {
        id: 'node-product-img',
        type: 'productImage',
        position: { x: 50, y: 100 },
        data: {
          label: 'Ảnh Sản Phẩm (Gốc)',
          category: 'input',
          images: [DEMO_ELMICH_POT_IMAGE],
        },
      },
      {
        id: 'node-specs',
        type: 'productSpec',
        position: { x: 50, y: 440 },
        data: {
          label: 'Thông Số Kỹ Thuật',
          category: 'input',
          productName: 'Nồi Inox Elmich Trimax Classic',
          productCode: 'EL-3849',
          length: '240',
          width: '240',
          height: '140',
        },
      },
      {
        id: 'node-material',
        type: 'materialDetector',
        position: { x: 450, y: 100 },
        data: {
          label: 'Nhận Diện Chất Liệu AI',
          category: 'analysis',
          selectedCategories: ['METAL'],
          description: 'Inox 304 xước satin mờ, quai đúc nguyên khối, phản xạ ánh sáng studio tinh tế.',
        },
      },
      {
        id: 'node-concept',
        type: 'conceptGenerator',
        position: { x: 450, y: 440 },
        data: {
          label: 'Gợi Ý Concept & Bối Cảnh',
          category: 'analysis',
          styleMode: 'CONCEPT',
          productName: 'Nồi Inox Elmich Trimax Classic',
          selectedConceptPrompt: 'Không gian bếp hiện đại tối giản phong cách Bắc Âu, mặt bàn đá cẩm thạch trắng, ánh sáng tự nhiên dịu nhẹ.',
          selectedConceptTitle: 'Gian Bếp Bắc Âu',
          conceptsList: [],
        },
      },
      {
        id: 'node-props',
        type: 'propsSuggester',
        position: { x: 880, y: 440 },
        data: {
          label: 'Đề Xuất Đạo Cụ',
          category: 'analysis',
          conceptPrompt: 'Không gian bếp hiện đại tối giản phong cách Bắc Âu',
          selectedProps: [
            { name: 'Vài nhánh hương thảo tươi' },
            { name: 'Lát chanh vàng' },
            { name: 'Hạt tiêu xay vỡ' },
          ],
          availableProps: ['Vài nhánh hương thảo tươi', 'Lát chanh vàng', 'Hạt tiêu xay vỡ', 'Thớt gỗ mộc'],
        },
      },
      {
        id: 'node-generator',
        type: 'imageGenerator',
        position: { x: 1280, y: 160 },
        data: {
          label: 'Mô Hình Sinh Ảnh AI',
          category: 'generator',
          generatorType: 'CONCEPT',
          aspectRatio: '1:1',
          imageSize: '1K',
          imageModel: 'FLASH',
          inputImages: [DEMO_ELMICH_POT_IMAGE],
          productName: 'Nồi Inox Elmich Trimax Classic',
          productCode: 'EL-3849',
          conceptPrompt: 'Không gian bếp hiện đại tối giản phong cách Bắc Âu, mặt bàn đá cẩm thạch trắng, ánh sáng tự nhiên dịu nhẹ.',
          materialsDescription: 'Inox 304 xước satin mờ, quai đúc nguyên khối, phản xạ ánh sáng studio tinh tế.',
          props: [
            { name: 'Vài nhánh hương thảo tươi' },
            { name: 'Lát chanh vàng' },
            { name: 'Hạt tiêu xay vỡ' },
          ],
        },
      },
      {
        id: 'node-preview',
        type: 'imagePreview',
        position: { x: 1720, y: 200 },
        data: {
          label: 'Xem & Xuất Ảnh Thành Phẩm',
          category: 'output',
        },
      },
    ],
    edges: [
      { id: 'e-img-to-mat', source: 'node-product-img', sourceHandle: 'out', target: 'node-material', targetHandle: 'in', type: 'animatedGradient' },
      { id: 'e-img-to-gen', source: 'node-product-img', sourceHandle: 'out', target: 'node-generator', targetHandle: 'in', type: 'animatedGradient' },
      { id: 'e-specs-to-concept', source: 'node-specs', sourceHandle: 'out', target: 'node-concept', targetHandle: 'in', type: 'animatedGradient' },
      { id: 'e-specs-to-gen', source: 'node-specs', sourceHandle: 'out', target: 'node-generator', targetHandle: 'in', type: 'animatedGradient' },
      { id: 'e-mat-to-concept', source: 'node-material', sourceHandle: 'out', target: 'node-concept', targetHandle: 'in', type: 'animatedGradient' },
      { id: 'e-mat-to-gen', source: 'node-material', sourceHandle: 'out', target: 'node-generator', targetHandle: 'in', type: 'animatedGradient' },
      { id: 'e-concept-to-props', source: 'node-concept', sourceHandle: 'out', target: 'node-props', targetHandle: 'in', type: 'animatedGradient' },
      { id: 'e-concept-to-gen', source: 'node-concept', sourceHandle: 'out', target: 'node-generator', targetHandle: 'in', type: 'animatedGradient' },
      { id: 'e-props-to-gen', source: 'node-props', sourceHandle: 'out', target: 'node-generator', targetHandle: 'in', type: 'animatedGradient' },
      { id: 'e-gen-to-preview', source: 'node-generator', sourceHandle: 'out', target: 'node-preview', targetHandle: 'in', type: 'animatedGradient' },
    ],
  },
  {
    id: 'studio-pipeline',
    name: 'Ảnh Studio Nền Trơn Đơn Sắc',
    description: 'Chụp sản phẩm trong Studio bục đơn sắc tone-on-tone cao cấp',
    iconName: 'Camera',
    nodes: [
      {
        id: 'node-studio-img',
        type: 'productImage',
        position: { x: 50, y: 150 },
        data: { label: 'Ảnh Sản Phẩm (Gốc)', category: 'input', images: [DEMO_ELMICH_POT_IMAGE] },
      },
      {
        id: 'node-studio-specs',
        type: 'productSpec',
        position: { x: 50, y: 480 },
        data: {
          label: 'Thông Số SP',
          category: 'input',
          productName: 'Chảo chống dính Elmich Hera',
          productCode: 'EL-8182',
          length: '260',
          width: '260',
          height: '60',
        },
      },
      {
        id: 'node-studio-gen',
        type: 'imageGenerator',
        position: { x: 500, y: 200 },
        data: {
          label: 'Studio Creative Generator',
          category: 'generator',
          generatorType: 'STUDIO',
          aspectRatio: '1:1',
          imageSize: '1K',
          imageModel: 'FLASH',
          inputImages: [DEMO_ELMICH_POT_IMAGE],
          productName: 'Chảo chống dính Elmich Hera',
          productCode: 'EL-8182',
          conceptPrompt: 'Minimalist high-end studio shot on a geometric stone plinth with monochromatic seamless studio backdrop.',
        },
      },
      {
        id: 'node-studio-preview',
        type: 'imagePreview',
        position: { x: 940, y: 220 },
        data: { label: 'Thành Phẩm Studio', category: 'output' },
      },
    ],
    edges: [
      { id: 'e-st-img', source: 'node-studio-img', sourceHandle: 'out', target: 'node-studio-gen', targetHandle: 'in', type: 'animatedGradient' },
      { id: 'e-st-specs', source: 'node-studio-specs', sourceHandle: 'out', target: 'node-studio-gen', targetHandle: 'in', type: 'animatedGradient' },
      { id: 'e-st-prev', source: 'node-studio-gen', sourceHandle: 'out', target: 'node-studio-preview', targetHandle: 'in', type: 'animatedGradient' },
    ],
  },
  {
    id: 'white-bg-pipeline',
    name: 'Làm Sạch Nền Trắng Thương Mại (#FFFFFF)',
    description: 'Bóc tách nền sạch tuyệt đối 100% chuẩn Catalog & Sàn TMĐT',
    iconName: 'Image',
    nodes: [
      {
        id: 'node-wbg-img',
        type: 'productImage',
        position: { x: 50, y: 180 },
        data: { label: 'Ảnh Chụp Thực Tế', category: 'input', images: [DEMO_ELMICH_POT_IMAGE] },
      },
      {
        id: 'node-wbg-mat',
        type: 'materialDetector',
        position: { x: 450, y: 180 },
        data: { label: 'Bóc Tách Chất Liệu', category: 'analysis', description: 'Inox xước satin mờ kết hợp quai chịu nhiệt.' },
      },
      {
        id: 'node-wbg-gen',
        type: 'imageGenerator',
        position: { x: 850, y: 180 },
        data: {
          label: 'White BG Retoucher',
          category: 'generator',
          generatorType: 'WHITE_BG_RETOUCH',
          aspectRatio: '1:1',
          imageSize: '1K',
          imageModel: 'FLASH',
          inputImages: [DEMO_ELMICH_POT_IMAGE],
          materialsDescription: 'Inox xước satin mờ kết hợp quai chịu nhiệt.',
        },
      },
      {
        id: 'node-wbg-prev',
        type: 'imagePreview',
        position: { x: 1280, y: 180 },
        data: { label: 'Ảnh Nền Trắng 100%', category: 'output' },
      },
    ],
    edges: [
      { id: 'e-wbg-1', source: 'node-wbg-img', sourceHandle: 'out', target: 'node-wbg-mat', targetHandle: 'in', type: 'animatedGradient' },
      { id: 'e-wbg-2', source: 'node-wbg-img', sourceHandle: 'out', target: 'node-wbg-gen', targetHandle: 'in', type: 'animatedGradient' },
      { id: 'e-wbg-3', source: 'node-wbg-mat', sourceHandle: 'out', target: 'node-wbg-gen', targetHandle: 'in', type: 'animatedGradient' },
      { id: 'e-wbg-4', source: 'node-wbg-gen', sourceHandle: 'out', target: 'node-wbg-prev', targetHandle: 'in', type: 'animatedGradient' },
    ],
  },
  {
    id: 'staging-layout-pipeline',
    name: 'Dàn Cảnh Bố Cục & Đồ Trang Trí',
    description: 'Quy trình dàn cảnh tương tác: Kéo thả sản phẩm, sắp đặt lớp đạo cụ và khóa vùng chừa chữ Marketing trước khi render',
    iconName: 'Layout',
    nodes: [
      {
        id: 'node-stg-img',
        type: 'productImage',
        position: { x: 50, y: 150 },
        data: {
          label: 'Ảnh Sản Phẩm (Gốc)',
          category: 'input',
          images: [DEMO_ELMICH_POT_IMAGE],
        },
      },
      {
        id: 'node-stg-concept',
        type: 'conceptGenerator',
        position: { x: 450, y: 100 },
        data: {
          label: 'Lên Concept Bối Cảnh',
          category: 'analysis',
          productName: 'Chảo Inox Elmich Trimax',
          selectedConceptPrompt: 'Gian bếp cao cấp Bắc Âu, mặt bàn đá cẩm thạch trắng Carrara, ánh nắng ban mai rọi qua khung cửa sổ lớn.',
          conceptsList: [],
        },
      },
      {
        id: 'node-stg-layout',
        type: 'stagingLayout',
        position: { x: 920, y: 80 },
        data: {
          label: 'Dàn Cảnh & Bố Cục Không Gian',
          category: 'analysis',
          aspectRatio: '1:1',
          productX: 40,
          productY: 58,
          productScale: 1.05,
          productRotation: 0,
          productFlipX: false,
          textSafeAreaEnabled: true,
          textSafeZone: 'top_right',
          propsLayers: [
            { id: 'p1', name: 'Thớt gỗ sồi', emoji: '🪵', x: 42, y: 72, scale: 1.2, rotation: 0, zIndex: 'back' },
            { id: 'p2', name: 'Nhánh hương thảo', emoji: '🌿', x: 72, y: 70, scale: 1.0, rotation: 15, zIndex: 'front' },
            { id: 'p3', name: 'Lát chanh tươi', emoji: '🍋', x: 62, y: 80, scale: 0.9, rotation: -10, zIndex: 'front' },
          ],
        },
      },
      {
        id: 'node-stg-gen',
        type: 'imageGenerator',
        position: { x: 1370, y: 100 },
        data: {
          label: 'Sinh Ảnh Khóa Bố Cục',
          category: 'generator',
          generatorType: 'CONCEPT',
          aspectRatio: '1:1',
          imageSize: '1K',
          imageModel: 'FLASH',
          inputImages: [DEMO_ELMICH_POT_IMAGE],
          productName: 'Chảo Inox Elmich Trimax',
          conceptPrompt: 'Gian bếp cao cấp Bắc Âu, mặt bàn đá cẩm thạch trắng Carrara, ánh nắng ban mai rọi qua khung cửa sổ lớn.',
        },
      },
      {
        id: 'node-stg-prev',
        type: 'imagePreview',
        position: { x: 1840, y: 120 },
        data: { label: 'Ảnh Hoàn Thiện', category: 'output' },
      },
    ],
    edges: [
      { id: 'e-stg-1', source: 'node-stg-img', sourceHandle: 'out', target: 'node-stg-layout', targetHandle: 'in', type: 'animatedGradient' },
      { id: 'e-stg-2', source: 'node-stg-img', sourceHandle: 'out', target: 'node-stg-gen', targetHandle: 'in', type: 'animatedGradient' },
      { id: 'e-stg-3', source: 'node-stg-concept', sourceHandle: 'out', target: 'node-stg-layout', targetHandle: 'in', type: 'animatedGradient' },
      { id: 'e-stg-4', source: 'node-stg-concept', sourceHandle: 'out', target: 'node-stg-gen', targetHandle: 'in', type: 'animatedGradient' },
      { id: 'e-stg-5', source: 'node-stg-layout', sourceHandle: 'out', target: 'node-stg-gen', targetHandle: 'in', type: 'animatedGradient' },
      { id: 'e-stg-6', source: 'node-stg-gen', sourceHandle: 'out', target: 'node-stg-prev', targetHandle: 'in', type: 'animatedGradient' },
    ],
  },
];
