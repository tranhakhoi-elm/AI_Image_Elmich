import { Node, Edge } from '@xyflow/react';
import { AspectRatio, ImageModelTier, ImageSize, PropConfig, VisualStyle } from '../../../types';

export type NodeCategory = 'input' | 'analysis' | 'generator' | 'utility' | 'output';

export type NodeExecutionStatus = 'idle' | 'running' | 'success' | 'error';

export interface BaseNodeData extends Record<string, unknown> {
  label: string;
  category: NodeCategory;
  status?: NodeExecutionStatus;
  errorMessage?: string;
}

// 1. INPUT NODES
export interface ProductImageNodeData extends BaseNodeData {
  images: string[]; // Base64
}

export interface ReferenceImageNodeData extends BaseNodeData {
  image: string | null; // Base64
  referenceNote?: string; // Ghi chú: Tham khảo cái gì của ảnh (mặc định: phong cách, ánh sáng và bố cục)
  aiDescription?: string; // AI mô tả chi tiết các yếu tố của ảnh tham khảo
  isAnalyzing?: boolean;
}

export interface ProductSpecNodeData extends BaseNodeData {
  productName: string;
  productCode: string;
  length: string;
  width: string;
  height: string;
}

export interface ExcelDataNodeData extends BaseNodeData {
  fileName?: string;
  rowsCount?: number;
  parsedData?: any;
}

export interface PromptNodeData extends BaseNodeData {
  promptText: string;
  priorityLevel: 'OVERRIDE' | 'APPEND';
  isActive: boolean;
  notes?: string;
}

// 2. ANALYSIS NODES
export interface MaterialDetectorNodeData extends BaseNodeData {
  inputImage?: string;
  selectedCategories?: string[];
  description?: string;
}

export interface ConceptGeneratorNodeData extends BaseNodeData {
  productName?: string;
  dimensions?: string;
  materialsDescription?: string;
  styleMode?: 'CONCEPT' | 'STUDIO' | 'TECH' | 'CUSTOM';
  selectedStyleDirection?: string;
  selectedNoteId?: string;
  selectedNoteTitle?: string;
  customStyleNote?: string;
  priorityPrompt?: string;
  markdownSkillGuidance?: string;
  markdownSkillTitle?: string;
  selectedConceptPrompt?: string;
  selectedConceptTitle?: string;
  conceptsList?: Array<{ title: string; prompt: string }>;
}

export interface PropsSuggesterNodeData extends BaseNodeData {
  conceptPrompt?: string;
  productName?: string;
  selectedProps: PropConfig[];
  availableProps: string[];
}

export interface PackagingAuditNodeData extends BaseNodeData {
  designImage?: string;
  excelData?: any;
  auditResults?: any[];
  isPassed?: boolean;
}

// 2.1 PRESET STYLE & MARKDOWN SKILL NODES
export interface PresetStyleNodeData extends BaseNodeData {
  presetStyle: VisualStyle;
  styleName: string;
  description?: string;
  isActive: boolean;
}

export interface MarkdownSkillNodeData extends BaseNodeData {
  selectedSkillIds: string[];
  customGuidanceNote?: string;
  combinedGuidance?: string;
  primarySkillTitle?: string;
  isActive: boolean;
}

// 2.2 VISUAL STAGING & PROPS LAYOUT NODE
export interface PropLayer {
  id: string;
  name: string;
  emoji?: string;
  x: number; // 0 - 100%
  y: number; // 0 - 100%
  scale: number; // 0.3 - 2.0
  rotation: number; // -180 to 180 degrees
  zIndex: 'front' | 'back'; // Đặt trước hay sau sản phẩm chính
}

export interface StagingLayoutNodeData extends BaseNodeData {
  inputImage?: string;
  productName?: string;
  conceptPrompt?: string;
  aspectRatio: AspectRatio;

  // Hero Product Transform
  productX: number; // default: 50 (%)
  productY: number; // default: 55 (%)
  productScale: number; // default: 1.0 (0.3 - 2.0)
  productRotation: number; // default: 0 (-45 to 45)
  productFlipX: boolean; // default: false

  // Props & Decoration Layers
  propsLayers: PropLayer[];

  // Text / Banner Safe Area
  textSafeAreaEnabled: boolean;
  textSafeZone: 'top_right' | 'top_left' | 'bottom_full' | 'right_half' | 'left_half';

  // Generated Outputs
  layoutSnapshot?: string; // Data URI ảnh phác thảo bố cục
  spatialGuidance?: string; // Prompt chỉ dẫn tọa độ không gian
}

// 3. GENERATOR NODES
export interface GeneratorNodeData extends BaseNodeData {
  generatorType?: VisualStyle;
  isCustomFlow?: boolean;
  presetStyleName?: string;
  presetStyleActive?: boolean;
  markdownSkillGuidance?: string;
  markdownSkillTitle?: string;
  spatialLayoutGuidance?: string;
  layoutSnapshotImage?: string;
  inputImages: string[];
  referenceImage?: string;
  referenceImageNote?: string;
  referenceAiDescription?: string;
  productName?: string;
  productCode?: string;
  conceptPrompt?: string;
  priorityPrompt?: string;
  priorityPromptActive?: boolean;
  materialsDescription?: string;
  props?: PropConfig[];
  aspectRatio: AspectRatio;
  imageSize: ImageSize;
  imageModel: ImageModelTier;
  colorChanges?: Array<{ part: string; color: string; sampleImage?: string }>;
  outputImageUrl?: string;
}

// 4. UTILITY NODES
export interface BarcodeQrNodeData extends BaseNodeData {
  mode: 'barcode' | 'qr';
  codeType: string;
  content: string;
  outputSvg?: string;
}

export interface PackagingTranslatorNodeData extends BaseNodeData {
  inputPackagingImage?: string;
  translatedImageUrl?: string;
  detectedText?: string;
}

// 5. OUTPUT NODES
export interface ImagePreviewNodeData extends BaseNodeData {
  imageUrl?: string;
  promptUsed?: string;
  metadata?: any;
}

// 6. UNIVERSAL AI & RESULT VIEWER NODES
export type AiType = 'CONTENT' | 'IMAGE';
export type AiContentSubtype =
  | 'PROMPT_OPTIMIZE'
  | 'CONCEPT_IDEATION'
  | 'PROPS_SUGGESTION'
  | 'MATERIAL_ANALYSIS'
  | 'TRANSLATE_COPY'
  | 'CUSTOM_TEXT';

export interface AiNodeData extends BaseNodeData {
  aiType: AiType;
  contentSubtype?: AiContentSubtype;
  customInstruction?: string;

  // Connected inputs
  inputImages?: string[];
  referenceImage?: string;
  referenceImageNote?: string;
  referenceAiDescription?: string;
  productName?: string;
  productCode?: string;
  dimensions?: string;
  promptText?: string;
  priorityPrompt?: string;
  presetStyle?: VisualStyle;
  presetStyleName?: string;
  markdownSkillGuidance?: string;
  markdownSkillTitle?: string;
  materialsDescription?: string;
  conceptPrompt?: string;
  inputText?: string;

  // Settings for Image AI
  aspectRatio?: AspectRatio;
  imageSize?: ImageSize;
  imageModel?: ImageModelTier;

  // Execution result
  isExecuting?: boolean;
  resultImage?: string; // base64
  resultText?: string;
  resultType?: 'IMAGE' | 'TEXT';
  executionTime?: number;
}

export interface ResultViewerNodeData extends BaseNodeData {
  resultImage?: string;
  resultText?: string;
  resultType?: 'IMAGE' | 'TEXT' | 'EMPTY';
  sourceNodeLabel?: string;
  timestamp?: number;
}

export type ElmichNode = Node<BaseNodeData>;
export type ElmichEdge = Edge;

