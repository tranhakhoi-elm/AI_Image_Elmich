import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  reconnectEdge,
  Connection,
  Edge,
  BackgroundVariant,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { ElmichNode, ElmichEdge } from './types';
import { WorkflowManagerModal } from './WorkflowManagerModal';

// Custom Nodes
import { ProductImageNode } from './nodes/ProductImageNode';
import { ReferenceImageNode } from './nodes/ReferenceImageNode';
import { ProductSpecNode } from './nodes/ProductSpecNode';
import { MaterialDetectorNode } from './nodes/MaterialDetectorNode';
import { ConceptGeneratorNode } from './nodes/ConceptGeneratorNode';
import { PropsSuggesterNode } from './nodes/PropsSuggesterNode';
import { ImageGeneratorNode } from './nodes/ImageGeneratorNode';
import { BarcodeQrNode } from './nodes/BarcodeQrNode';
import { PackagingTranslatorNode } from './nodes/PackagingTranslatorNode';
import { ImagePreviewNode } from './nodes/ImagePreviewNode';
import { PromptNode } from './nodes/PromptNode';
import { PresetStyleNode } from './nodes/PresetStyleNode';
import { MarkdownSkillNode } from './nodes/MarkdownSkillNode';
import { StagingLayoutNode } from './nodes/StagingLayoutNode';
import { AiNode } from './nodes/AiNode';
import { ResultViewerNode } from './nodes/ResultViewerNode';

// Custom Edges
import { AnimatedGradientEdge } from './edges/AnimatedGradientEdge';

// Icons
import {
  Play,
  RotateCcw,
  Plus,
  FolderOpen,
  Sparkles,
  Layers,
  ArrowRight,
  CheckCircle2,
  Trash2,
  MessageSquare,
  History,
  Grid,
  Bookmark,
  Save,
  Download,
  Upload,
  Server,
  FileText,
  Zap,
  Palette,
  BookOpen,
  MoreHorizontal,
  X,
} from 'lucide-react';
import { analyzeConceptAndCamera, analyzeProductMaterials, generateProductImage, suggestPropsForConcept, executeAiNodeTask } from '../../../services/geminiService';
import { saveWorkflowImageToLibrary } from './services/canvasGalleryBridge';
import { SaveWorkflowModal } from './SaveWorkflowModal';
import { HandleLegendPanel } from './HandleLegendPanel';
import { NodeMenu } from './NodeMenu';
import { WORKFLOW_TEMPLATES } from './templates/workflowTemplates';
import {
  getSavedWorkflows,
  saveWorkflow,
  deleteSavedWorkflow,
  exportWorkflowToFile,
  importWorkflowFromFile,
  SavedWorkflow,
} from './services/workflowStorage';

const nodeTypes = {
  productImage: ProductImageNode,
  referenceImage: ReferenceImageNode,
  productSpec: ProductSpecNode,
  promptNode: PromptNode,
  prompt: PromptNode,
  presetStyle: PresetStyleNode,
  markdownSkill: MarkdownSkillNode,
  materialDetector: MaterialDetectorNode,
  conceptGenerator: ConceptGeneratorNode,
  propsSuggester: PropsSuggesterNode,
  stagingLayout: StagingLayoutNode,
  imageGenerator: ImageGeneratorNode,
  barcodeQr: BarcodeQrNode,
  packagingTranslator: PackagingTranslatorNode,
  imagePreview: ImagePreviewNode,
  aiNode: AiNode,
  ai: AiNode,
  resultViewer: ResultViewerNode,
};

const edgeTypes = {
  animatedGradient: AnimatedGradientEdge,
  default: AnimatedGradientEdge,
};

const proOptions = { hideAttribution: true };

interface CanvasWorkspaceProps {
  onSwitchToStudio?: () => void;
  onSwitchToChat?: () => void;
  onSwitchToHistory?: () => void;
  onOpenHandbook?: () => void;
}

export const CanvasWorkspace: React.FC<CanvasWorkspaceProps> = ({
  onSwitchToStudio,
  onSwitchToChat,
  onSwitchToHistory,
  onOpenHandbook,
}) => {
  // Khởi tạo mặc định với quy trình Lifestyle chuẩn Elmich (luôn có sẵn node & dây nối hoạt động)
  const defaultWorkflow = WORKFLOW_TEMPLATES[0];
  const [nodes, setNodes, onNodesChange] = useNodesState<ElmichNode>(
    JSON.parse(JSON.stringify(defaultWorkflow.nodes))
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<ElmichEdge>(
    JSON.parse(JSON.stringify(defaultWorkflow.edges))
  );

  const [isRunningPipeline, setIsRunningPipeline] = useState(false);
  const [activeWorkflowId, setActiveWorkflowId] = useState<string>(defaultWorkflow.id);
  const [currentWorkflowName, setCurrentWorkflowName] = useState<string>(defaultWorkflow.name);
  const [savedWorkflows, setSavedWorkflows] = useState<SavedWorkflow[]>([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isManagerModalOpen, setIsManagerModalOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isEmptyNodeMenuOpen, setIsEmptyNodeMenuOpen] = useState(false);
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [confirmDeleteTarget, setConfirmDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [confirmClearCanvas, setConfirmClearCanvas] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const rfInstanceRef = useRef<any>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const importFileInputRef = useRef<HTMLInputElement>(null);

  // Close context menu and palette on Escape or click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setContextMenu(null);
        setIsPaletteOpen(false);
        setIsEmptyNodeMenuOpen(false);
      }
    };
    const handleClick = () => {
      setContextMenu(null);
      setIsPaletteOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', handleClick);
    };
  }, []);

  const onPaneContextMenu = useCallback((event: React.MouseEvent | MouseEvent) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
    });
    setIsPaletteOpen(false);
  }, []);

  // Sync references for custom events
  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;
  const edgesRef = useRef(edges);
  edgesRef.current = edges;

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  const edgeReconnectSuccessful = useRef(true);

  // Graph Data Propagation Engine: propagates data across all connected nodes immutably
  const propagateGraphData = useCallback(
    (nodesList: ElmichNode[], edgesList: ElmichEdge[], isDisconnect = false): ElmichNode[] => {
      let currentPassNodes = [...nodesList];

      // Up to 3 passes to cascade data across multi-node pipelines
      for (let pass = 0; pass < 3; pass++) {
        let hasAnyChange = false;

        currentPassNodes = currentPassNodes.map((targetNode) => {
          const incomingEdges = edgesList.filter((e) => e.target === targetNode.id);

          if (incomingEdges.length === 0) {
            if (!isDisconnect) return targetNode;
            let shouldReset = false;
            const cleanedData = { ...targetNode.data } as any;
            if (targetNode.type === 'imageGenerator') {
              if (cleanedData.inputImages?.length) {
                cleanedData.inputImages = [];
                shouldReset = true;
              }
              if (cleanedData.referenceImage) {
                cleanedData.referenceImage = undefined;
                cleanedData.referenceImageNote = undefined;
                cleanedData.referenceAiDescription = undefined;
                shouldReset = true;
              }
              if (cleanedData.priorityPrompt) {
                cleanedData.priorityPrompt = undefined;
                cleanedData.priorityPromptActive = undefined;
                shouldReset = true;
              }
              if (cleanedData.presetStyleName || cleanedData.presetStyleActive) {
                cleanedData.presetStyleName = undefined;
                cleanedData.presetStyleActive = undefined;
                shouldReset = true;
              }
              if (cleanedData.markdownSkillGuidance) {
                cleanedData.markdownSkillGuidance = undefined;
                cleanedData.markdownSkillTitle = undefined;
                shouldReset = true;
              }
            } else if (targetNode.type === 'referenceImage') {
              if (cleanedData.isWireConnected) {
                cleanedData.image = null;
                cleanedData.aiDescription = undefined;
                cleanedData.isWireConnected = false;
                shouldReset = true;
              }
            } else if (targetNode.type === 'conceptGenerator') {
              if (cleanedData.priorityPrompt) {
                cleanedData.priorityPrompt = undefined;
                shouldReset = true;
              }
              if (cleanedData.markdownSkillGuidance) {
                cleanedData.markdownSkillGuidance = undefined;
                cleanedData.markdownSkillTitle = undefined;
                shouldReset = true;
              }
            } else if (targetNode.type === 'materialDetector') {
              if (cleanedData.inputImage) {
                cleanedData.inputImage = undefined;
                shouldReset = true;
              }
            } else if (targetNode.type === 'packagingTranslator') {
              if (cleanedData.inputPackagingImage) {
                cleanedData.inputPackagingImage = undefined;
                shouldReset = true;
              }
            }
            if (shouldReset) {
              hasAnyChange = true;
              return { ...targetNode, data: cleanedData };
            }
            return targetNode;
          }

          let nextTargetData = { ...targetNode.data } as any;
          let nodeChanged = false;

          for (const edge of incomingEdges) {
            const sourceNode = currentPassNodes.find((n) => n.id === edge.source);
            if (!sourceNode) continue;

            const srcData = sourceNode.data as any;
            const srcType = sourceNode.type;

            // Gather images from source (including AI node result)
            const sourceImages: string[] =
              Array.isArray(srcData.images) && srcData.images.length > 0
                ? srcData.images
                : srcData.resultImage
                ? [srcData.resultImage]
                : srcData.image
                ? [srcData.image]
                : srcData.outputImageUrl
                ? [srcData.outputImageUrl]
                : srcData.imageUrl
                ? [srcData.imageUrl]
                : srcData.translatedImageUrl
                ? [srcData.translatedImageUrl]
                : srcData.outputSvg
                ? [srcData.outputSvg]
                : [];

            const sourceSpecs = {
              productName: srcData.productName || '',
              productCode: srcData.productCode || '',
              dimensions:
                srcData.length && srcData.width && srcData.height
                  ? `${srcData.length}x${srcData.width}x${srcData.height}mm`
                  : srcData.dimensions || '',
            };

            const sourceMaterials = srcData.description || srcData.materialsDescription || '';
            const sourceConcept =
              srcData.selectedConceptPrompt ||
              srcData.conceptPrompt ||
              (srcType === 'aiNode' && srcData.resultText ? srcData.resultText : '');
            const sourceText =
              srcData.resultText ||
              srcData.promptText ||
              srcData.conceptPrompt ||
              srcData.selectedConceptPrompt ||
              srcData.description ||
              '';
            const sourceProps = srcData.selectedProps || srcData.props || [];

            // Route into target node
            if (targetNode.type === 'imageGenerator') {
              // 1. Ảnh sản phẩm đầu vào (từ productImage, hoặc AI node trả về ảnh)
              const isImageSource =
                srcType === 'productImage' ||
                edge.targetHandle === 'image' ||
                edge.sourceHandle === 'image' ||
                ((srcType === 'aiNode' || srcType === 'ai') && sourceImages.length > 0 && !srcData.resultText);

              if (isImageSource && sourceImages.length > 0) {
                if (JSON.stringify(nextTargetData.inputImages) !== JSON.stringify(sourceImages)) {
                  nextTargetData.inputImages = [...sourceImages];
                  nodeChanged = true;
                }
              }

              // 2. Ảnh tham khảo phong cách / bố cục (từ referenceImage)
              const isRefSource =
                srcType === 'referenceImage' ||
                edge.targetHandle === 'ref_image' ||
                edge.sourceHandle === 'ref_image';

              if (isRefSource && (sourceImages.length > 0 || srcData.image)) {
                const targetRefImg = sourceImages[0] || srcData.image || '';
                const targetRefNote = srcData.referenceNote?.trim() || 'phong cách, ánh sáng và bố cục';
                const targetAiDesc = srcData.aiDescription || '';

                if (
                  nextTargetData.referenceImage !== targetRefImg ||
                  nextTargetData.referenceImageNote !== targetRefNote ||
                  nextTargetData.referenceAiDescription !== targetAiDesc
                ) {
                  nextTargetData.referenceImage = targetRefImg;
                  nextTargetData.referenceImageNote = targetRefNote;
                  nextTargetData.referenceAiDescription = targetAiDesc;
                  nodeChanged = true;
                }
              }

              // 3. Thông số kỹ thuật (từ productSpec)
              const isSpecsSource =
                srcType === 'productSpec' ||
                edge.targetHandle === 'specs' ||
                edge.sourceHandle === 'specs' ||
                (!!sourceSpecs.productName && srcType !== 'conceptGenerator' && srcType !== 'materialDetector');

              if (isSpecsSource && sourceSpecs.productName) {
                if (
                  nextTargetData.productName !== sourceSpecs.productName ||
                  (sourceSpecs.productCode && nextTargetData.productCode !== sourceSpecs.productCode)
                ) {
                  nextTargetData.productName = sourceSpecs.productName;
                  if (sourceSpecs.productCode) nextTargetData.productCode = sourceSpecs.productCode;
                  nodeChanged = true;
                }
              }

              // 4. Chất liệu bề mặt (từ materialDetector)
              const isMatSource =
                srcType === 'materialDetector' ||
                edge.targetHandle === 'materials' ||
                edge.sourceHandle === 'materials' ||
                (srcType !== 'productSpec' && !!sourceMaterials && !sourceSpecs.productName);

              if (isMatSource && sourceMaterials) {
                if (nextTargetData.materialsDescription !== sourceMaterials) {
                  nextTargetData.materialsDescription = sourceMaterials;
                  nodeChanged = true;
                }
              }

              // 5. Ý tưởng bối cảnh / Concept (từ conceptGenerator hoặc AI node trả về text)
              const isConceptSource =
                srcType === 'conceptGenerator' ||
                edge.targetHandle === 'concept' ||
                edge.sourceHandle === 'concept' ||
                ((srcType === 'aiNode' || srcType === 'ai') && !!sourceConcept);

              if (isConceptSource && sourceConcept) {
                if (nextTargetData.conceptPrompt !== sourceConcept) {
                  nextTargetData.conceptPrompt = sourceConcept;
                  nodeChanged = true;
                }
              }

              // 6. Đạo cụ dàn cảnh (từ propsSuggester)
              const isPropsSource =
                srcType === 'propsSuggester' ||
                edge.targetHandle === 'props' ||
                edge.sourceHandle === 'props' ||
                sourceProps.length > 0;

              if (isPropsSource && sourceProps.length > 0) {
                if (JSON.stringify(nextTargetData.props) !== JSON.stringify(sourceProps)) {
                  nextTargetData.props = [...sourceProps];
                  nodeChanged = true;
                }
              }

              // 7. Prompt ghi đè / ưu tiên (từ promptNode)
              const isPrioritySource =
                srcType === 'promptNode' ||
                srcType === 'prompt' ||
                edge.targetHandle === 'priority_prompt' ||
                edge.sourceHandle === 'priority_prompt';

              if (isPrioritySource) {
                const promptText = (srcData.promptText || '').trim();
                const isActive = srcData.isActive !== false;
                if (
                  nextTargetData.priorityPrompt !== promptText ||
                  nextTargetData.priorityPromptActive !== isActive
                ) {
                  nextTargetData.priorityPrompt = promptText;
                  nextTargetData.priorityPromptActive = isActive;
                  nodeChanged = true;
                }
              }

              // 8. Preset Style (từ presetStyle)
              const isPresetStyleSource =
                srcType === 'presetStyle' ||
                edge.targetHandle === 'preset_style' ||
                edge.sourceHandle === 'preset_style';

              if (isPresetStyleSource) {
                const style = srcData.presetStyle;
                const styleName = srcData.styleName;
                const isActive = srcData.isActive !== false;
                if (
                  nextTargetData.generatorType !== style ||
                  nextTargetData.presetStyleName !== styleName ||
                  nextTargetData.presetStyleActive !== isActive
                ) {
                  if (style) nextTargetData.generatorType = style;
                  nextTargetData.presetStyleName = styleName;
                  nextTargetData.presetStyleActive = isActive;
                  nodeChanged = true;
                }
              }

              // 9. Markdown Skill (từ markdownSkill)
              const isMarkdownSource =
                srcType === 'markdownSkill' ||
                edge.targetHandle === 'markdown_skill' ||
                edge.sourceHandle === 'markdown_skill';

              if (isMarkdownSource) {
                const guidance = srcData.combinedGuidance || '';
                const title = srcData.primarySkillTitle || '';
                const isActive = srcData.isActive !== false;
                const effectiveGuidance = isActive ? guidance : '';
                if (
                  nextTargetData.markdownSkillGuidance !== effectiveGuidance ||
                  nextTargetData.markdownSkillTitle !== title
                ) {
                  nextTargetData.markdownSkillGuidance = effectiveGuidance;
                  nextTargetData.markdownSkillTitle = title;
                  nodeChanged = true;
                }
              }

              // 10. Bố cục & Đạo cụ dàn cảnh (từ stagingLayout)
              const isStagingSource =
                srcType === 'stagingLayout' ||
                edge.targetHandle === 'staging_layout' ||
                edge.sourceHandle === 'layout';

              if (isStagingSource) {
                const guidance = srcData.spatialGuidance || '';
                const snapshot = srcData.layoutSnapshot || '';
                if (
                  nextTargetData.spatialLayoutGuidance !== guidance ||
                  nextTargetData.layoutSnapshotImage !== snapshot
                ) {
                  nextTargetData.spatialLayoutGuidance = guidance;
                  nextTargetData.layoutSnapshotImage = snapshot;
                  if (srcData.aspectRatio) nextTargetData.aspectRatio = srcData.aspectRatio;
                  nodeChanged = true;
                }
              }
            } else if (targetNode.type === 'stagingLayout') {
              if (sourceImages.length > 0 && nextTargetData.inputImage !== sourceImages[0]) {
                nextTargetData.inputImage = sourceImages[0];
                nodeChanged = true;
              }

              if (sourceConcept && nextTargetData.conceptPrompt !== sourceConcept) {
                nextTargetData.conceptPrompt = sourceConcept;
                nodeChanged = true;
              }

              if (sourceProps.length > 0) {
                const existingNames = new Set((nextTargetData.propsLayers || []).map((p: any) => p.name));
                const newLayers = [...(nextTargetData.propsLayers || [])];
                let added = false;
                sourceProps.forEach((prop: any, idx: number) => {
                  const pName = typeof prop === 'string' ? prop : prop.name;
                  if (pName && !existingNames.has(pName)) {
                    newLayers.push({
                      id: `prop-auto-${idx}-${Date.now()}`,
                      name: pName,
                      emoji: '✨',
                      x: 35 + (idx % 3) * 15,
                      y: 65 + (idx % 2) * 10,
                      scale: 1.0,
                      rotation: 0,
                      zIndex: idx === 0 ? 'back' : 'front',
                    });
                    existingNames.add(pName);
                    added = true;
                  }
                });
                if (added) {
                  nextTargetData.propsLayers = newLayers;
                  nodeChanged = true;
                }
              }

              if (sourceSpecs.productName && nextTargetData.productName !== sourceSpecs.productName) {
                nextTargetData.productName = sourceSpecs.productName;
                nodeChanged = true;
              }
            } else if (targetNode.type === 'materialDetector') {
              if (sourceImages.length > 0 && nextTargetData.inputImage !== sourceImages[0]) {
                nextTargetData.inputImage = sourceImages[0];
                nodeChanged = true;
              }
            } else if (targetNode.type === 'conceptGenerator') {
              if (sourceSpecs.productName) {
                if (
                  nextTargetData.productName !== sourceSpecs.productName ||
                  (sourceSpecs.dimensions && nextTargetData.dimensions !== sourceSpecs.dimensions)
                ) {
                  nextTargetData.productName = sourceSpecs.productName;
                  if (sourceSpecs.dimensions) nextTargetData.dimensions = sourceSpecs.dimensions;
                  nodeChanged = true;
                }
              }

              if (sourceMaterials && nextTargetData.materialsDescription !== sourceMaterials) {
                nextTargetData.materialsDescription = sourceMaterials;
                nodeChanged = true;
              }

              if (srcType === 'promptNode' || srcType === 'prompt') {
                const promptText = (srcData.promptText || '').trim();
                if (nextTargetData.priorityPrompt !== promptText) {
                  nextTargetData.priorityPrompt = promptText;
                  nodeChanged = true;
                }
              }

              if (srcType === 'markdownSkill') {
                const guidance = srcData.combinedGuidance || '';
                const title = srcData.primarySkillTitle || '';
                const isActive = srcData.isActive !== false;
                const effectiveGuidance = isActive ? guidance : '';
                if (
                  nextTargetData.markdownSkillGuidance !== effectiveGuidance ||
                  nextTargetData.markdownSkillTitle !== title
                ) {
                  nextTargetData.markdownSkillGuidance = effectiveGuidance;
                  nextTargetData.markdownSkillTitle = title;
                  nodeChanged = true;
                }
              }

              if (srcType === 'presetStyle') {
                const mappedMode = srcData.presetStyle === 'STUDIO' ? 'STUDIO' : srcData.presetStyle === 'TECH_PS' ? 'TECH' : 'CONCEPT';
                if (nextTargetData.styleMode !== mappedMode) {
                  nextTargetData.styleMode = mappedMode;
                  nodeChanged = true;
                }
              }
            } else if (targetNode.type === 'propsSuggester') {
              if (sourceConcept && nextTargetData.conceptPrompt !== sourceConcept) {
                nextTargetData.conceptPrompt = sourceConcept;
                nodeChanged = true;
              }
              if (sourceSpecs.productName && nextTargetData.productName !== sourceSpecs.productName) {
                nextTargetData.productName = sourceSpecs.productName;
                nodeChanged = true;
              }
            } else if (targetNode.type === 'referenceImage') {
              if (sourceImages.length > 0 && nextTargetData.image !== sourceImages[0]) {
                nextTargetData.image = sourceImages[0];
                nextTargetData.isWireConnected = true;
                nodeChanged = true;
              }
              if (sourceText && !nextTargetData.referenceNote) {
                nextTargetData.referenceNote = sourceText.slice(0, 100);
                nodeChanged = true;
              }
            } else if (targetNode.type === 'productImage') {
              if (sourceImages.length > 0 && JSON.stringify(nextTargetData.images) !== JSON.stringify(sourceImages)) {
                nextTargetData.images = [...sourceImages];
                nodeChanged = true;
              }
            } else if (targetNode.type === 'promptNode' || targetNode.type === 'prompt') {
              if (sourceText && nextTargetData.promptText !== sourceText) {
                nextTargetData.promptText = sourceText;
                nextTargetData.isActive = true;
                nodeChanged = true;
              }
            } else if (targetNode.type === 'packagingTranslator') {
              if (sourceImages.length > 0 && nextTargetData.inputPackagingImage !== sourceImages[0]) {
                nextTargetData.inputPackagingImage = sourceImages[0];
                nodeChanged = true;
              }
            } else if (targetNode.type === 'imagePreview') {
              if (sourceImages.length > 0 && nextTargetData.imageUrl !== sourceImages[0]) {
                nextTargetData.imageUrl = sourceImages[0];
                nextTargetData.status = 'success';
                nodeChanged = true;
              }
            } else if (targetNode.type === 'barcodeQr') {
              const newCode = sourceSpecs.productCode || sourceSpecs.productName || sourceText;
              if (newCode && nextTargetData.content !== newCode) {
                nextTargetData.content = newCode;
                nodeChanged = true;
              }
            } else if (targetNode.type === 'aiNode' || targetNode.type === 'ai') {
              // Target is AI node: gather ALL information connected to it
              if (sourceImages.length > 0) {
                if (JSON.stringify(nextTargetData.inputImages) !== JSON.stringify(sourceImages)) {
                  nextTargetData.inputImages = [...sourceImages];
                  nodeChanged = true;
                }
              }

              // Reference Image
              const isRef =
                edge.targetHandle === 'ref_image' ||
                edge.sourceHandle === 'ref_image' ||
                srcType === 'referenceImage';
              if (isRef && (srcData.image || srcData.referenceImage || srcData.resultImage)) {
                const refImg = srcData.referenceImage || srcData.image || srcData.resultImage || '';
                const refNote = srcData.referenceNote || '';
                const refDesc = srcData.aiDescription || '';
                if (
                  nextTargetData.referenceImage !== refImg ||
                  nextTargetData.referenceImageNote !== refNote ||
                  nextTargetData.referenceAiDescription !== refDesc
                ) {
                  nextTargetData.referenceImage = refImg;
                  nextTargetData.referenceImageNote = refNote;
                  nextTargetData.referenceAiDescription = refDesc;
                  nodeChanged = true;
                }
              }

              // Product Specs
              if (sourceSpecs.productName) {
                if (
                  nextTargetData.productName !== sourceSpecs.productName ||
                  nextTargetData.productCode !== sourceSpecs.productCode ||
                  nextTargetData.dimensions !== sourceSpecs.dimensions
                ) {
                  nextTargetData.productName = sourceSpecs.productName;
                  nextTargetData.productCode = sourceSpecs.productCode;
                  nextTargetData.dimensions = sourceSpecs.dimensions;
                  nodeChanged = true;
                }
              }

              // Prompt / Priority Prompt
              if (srcData.promptText) {
                if (nextTargetData.promptText !== srcData.promptText) {
                  nextTargetData.promptText = srcData.promptText;
                  nextTargetData.priorityPrompt = srcData.promptText;
                  nodeChanged = true;
                }
              }

              // Preset Style
              if (srcData.presetStyle) {
                if (
                  nextTargetData.presetStyle !== srcData.presetStyle ||
                  nextTargetData.presetStyleName !== srcData.styleName
                ) {
                  nextTargetData.presetStyle = srcData.presetStyle;
                  nextTargetData.presetStyleName = srcData.styleName;
                  nodeChanged = true;
                }
              }

              // Markdown Skills
              if (srcData.combinedGuidance || srcData.primarySkillTitle) {
                if (
                  nextTargetData.markdownSkillGuidance !== srcData.combinedGuidance ||
                  nextTargetData.markdownSkillTitle !== srcData.primarySkillTitle
                ) {
                  nextTargetData.markdownSkillGuidance = srcData.combinedGuidance;
                  nextTargetData.markdownSkillTitle = srcData.primarySkillTitle;
                  nodeChanged = true;
                }
              }

              // Materials
              if (sourceMaterials && nextTargetData.materialsDescription !== sourceMaterials) {
                nextTargetData.materialsDescription = sourceMaterials;
                nodeChanged = true;
              }

              // Concept
              if (sourceConcept && nextTargetData.conceptPrompt !== sourceConcept) {
                nextTargetData.conceptPrompt = sourceConcept;
                nodeChanged = true;
              }

              // Text input from upstream text node or other AI node
              if (srcData.resultText && nextTargetData.inputText !== srcData.resultText) {
                nextTargetData.inputText = srcData.resultText;
                if (!nextTargetData.promptText) {
                  nextTargetData.promptText = srcData.resultText;
                }
                nodeChanged = true;
              }
            } else if (targetNode.type === 'resultViewer') {
              // Target is Result Viewer Node
              let resImg: string | undefined = undefined;
              let resTxt: string | undefined = undefined;

              if (srcData.resultImage) resImg = srcData.resultImage;
              else if (sourceImages.length > 0) resImg = sourceImages[0];

              if (srcData.resultText) resTxt = srcData.resultText;
              else if (sourceText) resTxt = sourceText;

              const resType = resImg ? 'IMAGE' : resTxt ? 'TEXT' : 'EMPTY';

              if (
                nextTargetData.resultImage !== resImg ||
                nextTargetData.resultText !== resTxt ||
                nextTargetData.resultType !== resType
              ) {
                nextTargetData.resultImage = resImg;
                nextTargetData.resultText = resTxt;
                nextTargetData.resultType = resType;
                nextTargetData.status = resImg || resTxt ? 'success' : 'idle';
                nodeChanged = true;
              }
            }
          }

          if (targetNode.type === 'imageGenerator') {
            const hasRefEdge = incomingEdges.some((edge) => {
              const src = currentPassNodes.find((n) => n.id === edge.source);
              return (
                edge.targetHandle === 'ref_image' ||
                edge.sourceHandle === 'ref_image' ||
                src?.type === 'referenceImage'
              );
            });
            if (!hasRefEdge && (nextTargetData.referenceImage || nextTargetData.referenceImageNote)) {
              nextTargetData.referenceImage = undefined;
              nextTargetData.referenceImageNote = undefined;
              nextTargetData.referenceAiDescription = undefined;
              nodeChanged = true;
            }
          } else if (targetNode.type === 'referenceImage') {
            const hasImgEdge = incomingEdges.some((edge) => {
              const src = currentPassNodes.find((n) => n.id === edge.source);
              return (
                edge.targetHandle === 'image' ||
                !edge.targetHandle ||
                edge.sourceHandle === 'image' ||
                src?.type === 'productImage'
              );
            });
            if (!hasImgEdge && nextTargetData.isWireConnected) {
              nextTargetData.image = null;
              nextTargetData.aiDescription = undefined;
              nextTargetData.isWireConnected = false;
              nodeChanged = true;
            }
          }

          if (nodeChanged) {
            hasAnyChange = true;
            return {
              ...targetNode,
              data: nextTargetData,
            };
          }

          return targetNode;
        });

        if (!hasAnyChange) break;
      }

      return currentPassNodes;
    },
    []
  );

  // Load saved workflows from server/storage on mount and display created workflows
  useEffect(() => {
    getSavedWorkflows().then((list) => {
      setSavedWorkflows(list);
      // Nếu có quy trình đã lưu và có node hợp lệ, nạp quy trình đó
      const validSaved = list.find((w) => w.nodes && w.nodes.length > 0);
      if (validSaved) {
        setActiveWorkflowId(validSaved.id);
        setCurrentWorkflowName(validSaved.name);
        const clonedNodes = JSON.parse(JSON.stringify(validSaved.nodes));
        const clonedEdges = JSON.parse(JSON.stringify(validSaved.edges));
        const synced = propagateGraphData(clonedNodes, clonedEdges);
        setNodes(synced);
        setEdges(clonedEdges);
        edgesRef.current = clonedEdges;
        nodesRef.current = synced;
      } else {
        // Đảm bảo nạp quy trình chuẩn Elmich (không để canvas trống)
        const defaultWf = WORKFLOW_TEMPLATES[0];
        setActiveWorkflowId(defaultWf.id);
        setCurrentWorkflowName(defaultWf.name);
        const clonedNodes = JSON.parse(JSON.stringify(defaultWf.nodes));
        const clonedEdges = JSON.parse(JSON.stringify(defaultWf.edges));
        const synced = propagateGraphData(clonedNodes, clonedEdges);
        setNodes(synced);
        setEdges(clonedEdges);
        edgesRef.current = clonedEdges;
        nodesRef.current = synced;
      }
    });
  }, [propagateGraphData, setNodes, setEdges]);

  // Helper to delete an edge and clean up target node input
  const handleDeleteEdge = useCallback(
    (edgeId: string) => {
      const nextEdges = edgesRef.current.filter((e) => e.id !== edgeId);
      setEdges(nextEdges);
      edgesRef.current = nextEdges;

      setNodes((currentNodes) => {
        const nextNodes = propagateGraphData(currentNodes, nextEdges, true);
        nodesRef.current = nextNodes;
        return nextNodes;
      });

      showToast('Đã xóa đường dây nối');
    },
    [setEdges, setNodes, showToast, propagateGraphData]
  );

  // Listen to custom node updates and propagate data through edges
  useEffect(() => {
    const handleNodeUpdate = (e: any) => {
      const { nodeId, data } = e.detail;
      setNodes((currentNodes) => {
        const updatedNodes = currentNodes.map((n) =>
          n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
        );
        const nextNodes = propagateGraphData(updatedNodes, edgesRef.current);
        nodesRef.current = nextNodes;
        return nextNodes;
      });
    };

    const handleToast = (e: any) => {
      if (e.detail?.message) showToast(e.detail.message);
    };

    const handleDeleteEdgeEvent = (e: any) => {
      if (e.detail?.edgeId) {
        handleDeleteEdge(e.detail.edgeId);
      }
    };

    window.addEventListener('elmich:canvas-node-update', handleNodeUpdate);
    window.addEventListener('elmich:canvas-update-node', handleNodeUpdate);
    window.addEventListener('elmich:canvas-toast', handleToast);
    window.addEventListener('elmich:canvas-delete-edge', handleDeleteEdgeEvent);
    return () => {
      window.removeEventListener('elmich:canvas-node-update', handleNodeUpdate);
      window.removeEventListener('elmich:canvas-update-node', handleNodeUpdate);
      window.removeEventListener('elmich:canvas-toast', handleToast);
      window.removeEventListener('elmich:canvas-delete-edge', handleDeleteEdgeEvent);
    };
  }, [showToast, setNodes, handleDeleteEdge, propagateGraphData]);

  // Close context menu & palette on outside click or Escape
  useEffect(() => {
    const handleGlobalClick = () => {
      setContextMenu(null);
    };
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setContextMenu(null);
        setIsPaletteOpen(false);
      }
    };
    window.addEventListener('click', handleGlobalClick);
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, []);

  // Connect edges
  const onConnect = useCallback(
    (connection: Connection) => {
      const nextEdges = addEdge(
        {
          ...connection,
          sourceHandle: connection.sourceHandle || 'out',
          targetHandle: connection.targetHandle || 'in',
          type: 'animatedGradient',
        },
        edgesRef.current
      );
      setEdges(nextEdges);
      edgesRef.current = nextEdges;

      // Sync data across all nodes immediately with the new edge
      setNodes((currentNodes) => {
        const nextNodes = propagateGraphData(currentNodes, nextEdges);
        nodesRef.current = nextNodes;
        return nextNodes;
      });

      showToast('Đã nối thành công đường dây mới');
    },
    [setEdges, setNodes, showToast, propagateGraphData]
  );

  // Edge reconnection callbacks (di chuyển ở cả 2 đầu dây, kéo ra ngoài là xóa dây)
  const onReconnectStart = useCallback(() => {
    edgeReconnectSuccessful.current = false;
  }, []);

  const onReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      edgeReconnectSuccessful.current = true;
      const normalizedConn = {
        ...newConnection,
        sourceHandle: newConnection.sourceHandle || 'out',
        targetHandle: newConnection.targetHandle || 'in',
      };
      const nextEdges = reconnectEdge(oldEdge, normalizedConn, edgesRef.current);
      setEdges(nextEdges);
      edgesRef.current = nextEdges;

      setNodes((currentNodes) => {
        const nextNodes = propagateGraphData(currentNodes, nextEdges, true);
        nodesRef.current = nextNodes;
        return nextNodes;
      });

      showToast('Đã chuyển đầu nối sang cổng mới');
    },
    [setEdges, setNodes, showToast, propagateGraphData]
  );

  const onReconnectEnd = useCallback(
    (_: MouseEvent | TouchEvent, edge: Edge) => {
      if (!edgeReconnectSuccessful.current) {
        handleDeleteEdge(edge.id);
        showToast('Đã kéo ra ngoài để xóa đường dây nối');
      }
      edgeReconnectSuccessful.current = true;
    },
    [handleDeleteEdge, showToast]
  );

  // Count selected edges for quick delete button
  const selectedEdges = edges.filter((e) => e.selected);
  const deleteSelectedEdges = useCallback(() => {
    if (selectedEdges.length === 0) return;
    selectedEdges.forEach((e) => handleDeleteEdge(e.id));
  }, [selectedEdges, handleDeleteEdge]);

  // Handle selecting a workflow from created workflows list
  const handleWorkflowSelect = (val: string) => {
    if (val === 'empty' || val === 'new') {
      setActiveWorkflowId('empty');
      setCurrentWorkflowName('Quy trình mới');
      setNodes([]);
      setEdges([]);
      edgesRef.current = [];
      nodesRef.current = [];
      showToast('Đã làm trống Canvas để bạn tự do tạo quy trình mới');
      return;
    }

    // Kiểm tra quy trình mẫu chuẩn Elmich
    const templateWf = WORKFLOW_TEMPLATES.find((t) => t.id === val);
    if (templateWf) {
      setActiveWorkflowId(templateWf.id);
      setCurrentWorkflowName(templateWf.name);
      const clonedNodes = JSON.parse(JSON.stringify(templateWf.nodes));
      const clonedEdges = JSON.parse(JSON.stringify(templateWf.edges));
      const synced = propagateGraphData(clonedNodes, clonedEdges);
      setNodes(synced);
      setEdges(clonedEdges);
      edgesRef.current = clonedEdges;
      nodesRef.current = synced;
      showToast(`Đã mở quy trình mẫu: ${templateWf.name}`);
      return;
    }

    // Check if it's one of user's saved workflows
    const userWf = savedWorkflows.find((w) => w.id === val);
    if (userWf) {
      setActiveWorkflowId(userWf.id);
      setCurrentWorkflowName(userWf.name);
      const clonedNodes = JSON.parse(JSON.stringify(userWf.nodes));
      const clonedEdges = JSON.parse(JSON.stringify(userWf.edges));
      const synced = propagateGraphData(clonedNodes, clonedEdges);
      setNodes(synced);
      setEdges(clonedEdges);
      edgesRef.current = clonedEdges;
      nodesRef.current = synced;
      showToast(`Đã nạp quy trình: ${userWf.name}`);
      return;
    }
  };

  // Create a new blank workflow
  const handleCreateNewWorkflow = () => {
    setActiveWorkflowId('empty');
    setCurrentWorkflowName('Quy trình mới');
    setNodes([]);
    setEdges([]);
    edgesRef.current = [];
    nodesRef.current = [];
    showToast('Đã tạo Canvas mới để bạn tự do thiết kế quy trình');
  };

  // Duplicate a workflow
  const handleDuplicateWorkflow = async (workflow: SavedWorkflow) => {
    const cloned = await saveWorkflow(
      `${workflow.name} (Bản sao)`,
      workflow.nodes,
      workflow.edges,
      workflow.description
    );
    const updatedList = await getSavedWorkflows();
    setSavedWorkflows(updatedList);
    handleWorkflowSelect(cloned.id);
    showToast(`Đã nhân bản quy trình "${cloned.name}" trên server`);
  };

  // Delete workflow by id
  const handleDeleteWorkflowById = async (id: string) => {
    const updatedList = await deleteSavedWorkflow(id);
    setSavedWorkflows(updatedList);
    if (activeWorkflowId === id) {
      if (updatedList.length > 0) {
        handleWorkflowSelect(updatedList[0].id);
      } else {
        handleCreateNewWorkflow();
      }
    }
    showToast('Đã xóa quy trình khỏi server hệ thống');
  };

  // Save current nodes & edges as a custom workflow to server filesystem (data/workflows)
  const handleSaveWorkflow = async (name: string, description: string) => {
    if (nodes.length === 0) {
      showToast('Canvas đang trống! Hãy thêm ít nhất 1 node trước khi lưu.');
      return;
    }
    const isExistingUserWf = savedWorkflows.some((w) => w.id === activeWorkflowId);
    const finalName = name.trim() || currentWorkflowName.trim() || 'Quy trình không tên';
    const saved = await saveWorkflow(
      finalName,
      nodes,
      edges,
      description,
      isExistingUserWf ? activeWorkflowId : undefined
    );
    const updatedList = await getSavedWorkflows();
    setSavedWorkflows(updatedList);
    setActiveWorkflowId(saved.id);
    setCurrentWorkflowName(saved.name);
    showToast(`Đã lưu quy trình "${saved.name}" vào server hệ thống thành công!`);
  };

  // Delete current custom workflow
  const handleDeleteCurrentWorkflow = () => {
    const currentWf = savedWorkflows.find((w) => w.id === activeWorkflowId);
    if (!currentWf) return;
    setConfirmDeleteTarget({ id: currentWf.id, name: currentWf.name });
  };

  // Export current workflow to JSON file
  const handleExportCurrent = () => {
    if (nodes.length === 0) {
      showToast('Canvas chưa có dữ liệu để xuất file!');
      return;
    }
    const currentWf = savedWorkflows.find((w) => w.id === activeWorkflowId);
    const wfToExport: SavedWorkflow = currentWf || {
      id: `wf-${Date.now()}`,
      name: 'Quy_trinh_Canvas_Elmich',
      description: 'Quy trình tạo trên Elmich AI Studio Canvas',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      nodes,
      edges,
    };
    exportWorkflowToFile(wfToExport);
    showToast('Đã xuất file JSON quy trình thành công');
  };

  // Import workflow from JSON file
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importWorkflowFromFile(file);
      const saved = await saveWorkflow(
        imported.name || 'Quy trình đã nhập',
        imported.nodes || [],
        imported.edges || [],
        imported.description
      );
      const updatedList = await getSavedWorkflows();
      setSavedWorkflows(updatedList);
      setActiveWorkflowId(saved.id);
      const synced = propagateGraphData(saved.nodes, saved.edges);
      setNodes(synced);
      setEdges(saved.edges);
      edgesRef.current = saved.edges;
      nodesRef.current = synced;
      showToast(`Đã nhập thành công quy trình: ${saved.name}`);
    } catch (err: any) {
      showToast(`Lỗi nhập file: ${err.message || 'File không hợp lệ'}`);
    } finally {
      e.target.value = '';
    }
  };

  // Run the full execution pipeline
  const runFullPipeline = async () => {
    setIsRunningPipeline(true);
    showToast('Bắt đầu chạy dây chuyền sản xuất tự động...');

    try {
      // Đồng bộ toàn bộ dữ liệu qua các dây nối trước khi chạy
      const syncedNodes = propagateGraphData(nodesRef.current, edgesRef.current);
      nodesRef.current = syncedNodes;
      setNodes(syncedNodes);
      const currentNodes = [...syncedNodes];

      // Step 1: Find Product Image
      const imgNode = currentNodes.find((n) => n.type === 'productImage');
      const genNode = currentNodes.find((n) => n.type === 'imageGenerator');
      const genData: any = genNode?.data || {};

      const inputImages: string[] =
        (genData.inputImages && genData.inputImages.length > 0)
          ? genData.inputImages
          : (imgNode?.data as any)?.images || [];

      if (inputImages.length === 0) {
        showToast('Vui lòng tải ít nhất 1 ảnh sản phẩm vào Node Ảnh Sản Phẩm!');
        setIsRunningPipeline(false);
        return;
      }

      // Step 2: Material Detector Node (if present)
      const matNode = currentNodes.find((n) => n.type === 'materialDetector');
      let matDesc = (matNode?.data as any)?.description || genData.materialsDescription || '';
      if (matNode) {
        if (!matDesc && inputImages.length > 0) {
          setNodes((nds) =>
            nds.map((n) => (n.id === matNode.id ? { ...n, data: { ...n.data, status: 'running' } } : n))
          );
          try {
            const matRes = await analyzeProductMaterials(inputImages[0]);
            matDesc = matRes.description;
            setNodes((nds) =>
              nds.map((n) =>
                n.id === matNode.id
                  ? {
                      ...n,
                      data: {
                        ...n.data,
                        status: 'success',
                        selectedCategories: matRes.categories,
                        description: matRes.description,
                      },
                    }
                  : n
              )
            );
          } catch (e) {
            console.warn('Material step fallback:', e);
            matDesc = 'Inox 304 xước satin mờ kết hợp quai chịu nhiệt';
            setNodes((nds) =>
              nds.map((n) =>
                n.id === matNode.id
                  ? {
                      ...n,
                      data: {
                        ...n.data,
                        status: 'success',
                        selectedCategories: ['METAL'],
                        description: matDesc,
                      },
                    }
                  : n
              )
            );
          }
        } else {
          setNodes((nds) =>
            nds.map((n) => (n.id === matNode.id ? { ...n, data: { ...n.data, status: 'success' } } : n))
          );
        }
      }

      // Step 3: Concept Generator Node (if present)
      const specNode = currentNodes.find((n) => n.type === 'productSpec');
      const prodName = genData.productName || (specNode?.data as any)?.productName || 'Nồi Inox Elmich Trimax Classic';
      const prodCode = genData.productCode || (specNode?.data as any)?.productCode || '';
      const conceptNode = currentNodes.find((n) => n.type === 'conceptGenerator');
      let conceptPrompt = (conceptNode?.data as any)?.selectedConceptPrompt || genData.conceptPrompt || '';

      if (conceptNode) {
        if (!conceptPrompt) {
          setNodes((nds) =>
            nds.map((n) => (n.id === conceptNode.id ? { ...n, data: { ...n.data, status: 'running' } } : n))
          );
          try {
            const cRes = await analyzeConceptAndCamera(prodName, '240x240x140mm', inputImages, null);
            const first = cRes.concepts?.[0];
            conceptPrompt = first?.prompt || 'Không gian bếp hiện đại tối giản phong cách Bắc Âu, mặt bàn đá cẩm thạch trắng, ánh sáng tự nhiên dịu nhẹ.';
            setNodes((nds) =>
              nds.map((n) =>
                n.id === conceptNode.id
                  ? {
                      ...n,
                      data: {
                        ...n.data,
                        status: 'success',
                        conceptsList: cRes.concepts,
                        selectedConceptPrompt: conceptPrompt,
                        selectedConceptTitle: first?.title || 'Gian Bếp Bắc Âu',
                      },
                    }
                  : n
              )
            );
          } catch (e) {
            console.warn('Concept step fallback:', e);
            conceptPrompt = 'Không gian bếp hiện đại tối giản phong cách Bắc Âu, mặt bàn đá cẩm thạch trắng, ánh sáng tự nhiên dịu nhẹ.';
            setNodes((nds) =>
              nds.map((n) =>
                n.id === conceptNode.id
                  ? {
                      ...n,
                      data: {
                        ...n.data,
                        status: 'success',
                        selectedConceptPrompt: conceptPrompt,
                        selectedConceptTitle: 'Gian Bếp Bắc Âu',
                      },
                    }
                  : n
              )
            );
          }
        } else {
          setNodes((nds) =>
            nds.map((n) => (n.id === conceptNode.id ? { ...n, data: { ...n.data, status: 'success' } } : n))
          );
        }
      }

      // Step 4: Props Suggester Node (if present)
      const propsNode = currentNodes.find((n) => n.type === 'propsSuggester');
      let selectedProps = (propsNode?.data as any)?.selectedProps || genData.props || [];
      if (propsNode) {
        if (selectedProps.length === 0 && conceptPrompt) {
          setNodes((nds) =>
            nds.map((n) => (n.id === propsNode.id ? { ...n, data: { ...n.data, status: 'running' } } : n))
          );
          try {
            const pRes = await suggestPropsForConcept(prodName, conceptPrompt, 'LIFESTYLE');
            selectedProps = (pRes.props || []).slice(0, 3).map((name) => ({ name }));
            if (selectedProps.length === 0) {
              selectedProps = [{ name: 'Vài nhánh hương thảo tươi' }, { name: 'Lát chanh vàng' }];
            }
            setNodes((nds) =>
              nds.map((n) =>
                n.id === propsNode.id
                  ? {
                      ...n,
                      data: {
                        ...n.data,
                        status: 'success',
                        availableProps: pRes.props || ['Vài nhánh hương thảo tươi', 'Lát chanh vàng'],
                        selectedProps,
                      },
                    }
                  : n
              )
            );
          } catch (e) {
            console.warn('Props step fallback:', e);
            selectedProps = [{ name: 'Vài nhánh hương thảo tươi' }, { name: 'Lát chanh vàng' }];
            setNodes((nds) =>
              nds.map((n) =>
                n.id === propsNode.id
                  ? {
                      ...n,
                      data: {
                        ...n.data,
                        status: 'success',
                        availableProps: ['Vài nhánh hương thảo tươi', 'Lát chanh vàng'],
                        selectedProps,
                      },
                    }
                  : n
              )
            );
          }
        } else {
          setNodes((nds) =>
            nds.map((n) => (n.id === propsNode.id ? { ...n, data: { ...n.data, status: 'success' } } : n))
          );
        }
      }

      // Step 4.5: Staging Layout Node (nếu có trong quy trình)
      const stagingNode = currentNodes.find((n) => n.type === 'stagingLayout');
      const stagingGuidance = (stagingNode?.data as any)?.spatialGuidance || '';
      if (stagingNode) {
        setNodes((nds) =>
          nds.map((n) => (n.id === stagingNode.id ? { ...n, data: { ...n.data, status: 'success' } } : n))
        );
      }

      // Step 5: Image Generator Node
      if (genNode) {
        setNodes((nds) =>
          nds.map((n) => (n.id === genNode.id ? { ...n, data: { ...n.data, status: 'running' } } : n))
        );

        const finalConceptPrompt = [
          genData.conceptPrompt || conceptPrompt || 'Sang trọng hiện đại cao cấp',
          stagingGuidance || genData.spatialLayoutGuidance || '',
        ]
          .filter(Boolean)
          .join('\n\n');

        const resultUrl = await generateProductImage(
          {
            visualStyle: genData.generatorType || 'CONCEPT',
            productName: prodName,
            productCode: prodCode,
            productImages: inputImages,
            referenceImage: genData.referenceImage || genData.layoutSnapshotImage || null,
            referenceImageNote: genData.referenceImageNote,
            referenceAiDescription: genData.referenceAiDescription,
            concept: finalConceptPrompt,
            priorityPrompt: genData.priorityPromptActive !== false ? genData.priorityPrompt : undefined,
            markdownSkillGuidance: genData.markdownSkillGuidance,
            markdownSkillTitle: genData.markdownSkillTitle,
            whiteBGMaterialsDescription: genData.materialsDescription || matDesc,
            props: selectedProps,
            aspectRatio: genData.aspectRatio || '1:1',
            imageSize: genData.imageSize || '1K',
            imageModel: genData.imageModel || 'FLASH',
            numImages: 1,
            colorChanges: [],
            dimensions: { length: '200', width: '200', height: '250' },
            camera: { focalLength: 50, aperture: 'f/2.8', iso: '100', isMacro: false, angle: 0 },
          } as any,
          1
        );

        // Tự động lưu ảnh vào Thư viện và Lịch sử dùng chung
        saveWorkflowImageToLibrary({
          url: resultUrl,
          prompt: finalConceptPrompt,
          productName: prodName,
          productCode: prodCode,
          visualStyle: genData.generatorType || 'CONCEPT',
          aspectRatio: genData.aspectRatio || '1:1',
          imageSize: genData.imageSize || '1K',
          imageModel: genData.imageModel || 'FLASH',
        }).catch((e) => console.warn('Lỗi lưu ảnh workflow vào thư viện:', e));

        setNodes((nds) =>
          nds.map((n) => {
            if (n.id === genNode.id) {
              return { ...n, data: { ...n.data, status: 'success', outputImageUrl: resultUrl } };
            }
            if (n.type === 'imagePreview') {
              return { ...n, data: { ...n.data, status: 'success', imageUrl: resultUrl } };
            }
            return n;
          })
        );

        showToast('Dây chuyền hoàn tất! Đã lưu ảnh vào Thư viện và hiển thị tại Preview.');
      }

      // Step 6: AI Nodes (if present in the workflow)
      const aiNodes = currentNodes.filter((n) => n.type === 'aiNode' || n.type === 'ai');
      for (const aNode of aiNodes) {
        setNodes((nds) =>
          nds.map((n) => (n.id === aNode.id ? { ...n, data: { ...n.data, status: 'running' } } : n))
        );
        const aData: any = aNode.data;
        try {
          const res = await executeAiNodeTask({
            aiType: aData.aiType || 'IMAGE',
            contentSubtype: aData.contentSubtype || 'PROMPT_OPTIMIZE',
            customInstruction: aData.customInstruction || '',
            inputImages: aData.inputImages || inputImages,
            referenceImage: aData.referenceImage || null,
            referenceImageNote: aData.referenceImageNote,
            referenceAiDescription: aData.referenceAiDescription,
            productName: aData.productName || prodName,
            productCode: aData.productCode || (specNode?.data as any)?.productCode || '',
            dimensions: aData.dimensions,
            promptText: aData.promptText,
            priorityPrompt: aData.priorityPrompt,
            presetStyle: aData.presetStyle,
            presetStyleName: aData.presetStyleName,
            markdownSkillGuidance: aData.markdownSkillGuidance,
            markdownSkillTitle: aData.markdownSkillTitle,
            materialsDescription: aData.materialsDescription || matDesc,
            conceptPrompt: aData.conceptPrompt || conceptPrompt,
            inputText: aData.inputText,
            aspectRatio: aData.aspectRatio || '1:1',
            imageSize: aData.imageSize || '1K',
            imageModel: aData.imageModel || 'FLASH',
          });

          if (res.resultImage) {
            saveWorkflowImageToLibrary({
              url: res.resultImage,
              prompt: aData.promptText || aData.conceptPrompt || 'Ảnh tạo từ AI Node',
              productName: aData.productName || prodName,
              productCode: aData.productCode || '',
              visualStyle: 'AI_NODE',
              aspectRatio: aData.aspectRatio || '1:1',
              imageSize: aData.imageSize || '1K',
              imageModel: aData.imageModel || 'FLASH',
            }).catch((e) => console.warn('Lỗi lưu ảnh AI node vào thư viện:', e));
          }

          setNodes((nds) => {
            const updated = nds.map((n) => {
              if (n.id === aNode.id) {
                return {
                  ...n,
                  data: {
                    ...n.data,
                    status: 'success',
                    resultImage: res.resultImage,
                    resultText: res.resultText,
                    resultType: res.resultType,
                  },
                };
              }
              return n;
            });
            const synced = propagateGraphData(updated, edgesRef.current);
            nodesRef.current = synced;
            return synced;
          });
          showToast(`Node AI (${aData.label || 'AI'}) đã hoàn thành!`);
        } catch (aiErr: any) {
          console.error('Error running AI node in pipeline:', aiErr);
          setNodes((nds) =>
            nds.map((n) => (n.id === aNode.id ? { ...n, data: { ...n.data, status: 'error', errorMessage: aiErr.message } } : n))
          );
        }
      }
    } catch (err: any) {
      console.error('Pipeline error:', err);
      showToast(`Lỗi chạy dây chuyền: ${err.message || 'Lỗi xử lý'}`);
    } finally {
      setIsRunningPipeline(false);
    }
  };

  // Add a new node to canvas
  const addNewNode = (
    type: string,
    label: string,
    category: any,
    customPosition?: { x: number; y: number }
  ) => {
    const id = `node-${type}-${Date.now()}`;
    const position = customPosition || { x: 300 + Math.random() * 160, y: 150 + Math.random() * 160 };
    const newNode: ElmichNode = {
      id,
      type,
      position,
      data: {
        label,
        category,
        ...(type === 'productImage' ? { images: [] } : {}),
        ...(type === 'referenceImage' ? { image: null, referenceNote: '', aiDescription: '' } : {}),
        ...(type === 'productSpec' ? { productName: 'Sản phẩm mới', productCode: '', length: '', width: '', height: '' } : {}),
        ...(type === 'promptNode' || type === 'prompt' ? { promptText: '', priorityLevel: 'OVERRIDE', isActive: true, notes: '' } : {}),
        ...(type === 'presetStyle' ? { presetStyle: 'CONCEPT', styleName: 'Bối Cảnh Phong Cách Sống', description: 'Đặt sản phẩm trong không gian nội thất bếp sang trọng', isActive: true } : {}),
        ...(type === 'markdownSkill' ? { selectedSkillIds: ['lifestyle_concept'], customGuidanceNote: '', primarySkillTitle: 'Lifestyle Concept Cao Cấp', combinedGuidance: '', isActive: true } : {}),
        ...(type === 'conceptGenerator' ? { styleMode: 'CONCEPT', selectedConceptPrompt: '', selectedConceptTitle: '', conceptsList: [] } : {}),
        ...(type === 'propsSuggester' ? { selectedProps: [], availableProps: [] } : {}),
        ...(type === 'imageGenerator' ? { generatorType: 'CONCEPT', aspectRatio: '1:1', imageSize: '1K', imageModel: 'FLASH', inputImages: [] } : {}),
        ...(type === 'aiNode' || type === 'ai' ? {
          aiType: 'IMAGE',
          contentSubtype: 'PROMPT_OPTIMIZE',
          customInstruction: '',
          aspectRatio: '1:1',
          imageSize: '1K',
          imageModel: 'FLASH',
          inputImages: [],
        } : {}),
        ...(type === 'resultViewer' ? {
          resultType: 'EMPTY',
        } : {}),
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setIsPaletteOpen(false);
    setContextMenu(null);
    showToast(`Đã thêm ${label} vào Canvas`);
  };

  const handleAddFromContextMenu = (type: string, label: string, cat: any) => {
    let pos: { x: number; y: number } | undefined;
    if (contextMenu && rfInstanceRef.current) {
      pos = rfInstanceRef.current.screenToFlowPosition({
        x: contextMenu.x,
        y: contextMenu.y,
      });
    }
    addNewNode(type, label, cat, pos);
    setContextMenu(null);
  };

  const clearCanvas = () => {
    setConfirmClearCanvas(true);
  };

  return (
    <div className="w-full h-screen bg-[#18191A] text-white flex flex-col overflow-hidden select-none">
      {/* Top Bar Header */}
      <header className="h-14 border-b border-[#3E4042] bg-[#242526] px-2.5 sm:px-4 flex items-center justify-between shrink-0 z-30 shadow-md gap-2 overflow-visible">
        {/* MOBILE TOP BAR (Màn hình điện thoại < 768px) */}
        <div className="flex md:hidden items-center justify-between w-full gap-2">
          {/* Logo & Quick Switch */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#1877F2] to-cyan-400 text-white flex items-center justify-center font-black text-sm shadow-md shrink-0">
              <Layers size={17} />
            </div>
            {onSwitchToStudio && (
              <button
                onClick={onSwitchToStudio}
                className="px-2.5 py-1 rounded-lg text-xs font-bold text-gray-200 bg-[#18191A] border border-[#3E4042] hover:text-white"
                title="Quay lại Studio"
              >
                Studio
              </button>
            )}
            {onSwitchToChat && (
              <button
                onClick={onSwitchToChat}
                className="p-1.5 rounded-lg text-gray-300 bg-[#18191A] border border-[#3E4042] hover:text-white"
                title="Trợ lý Chat"
              >
                <MessageSquare size={14} />
              </button>
            )}
            {onSwitchToHistory && (
              <button
                onClick={onSwitchToHistory}
                className="p-1.5 rounded-lg text-gray-300 bg-[#18191A] border border-[#3E4042] hover:text-white"
                title="Thư viện & Lịch sử ảnh"
              >
                <History size={14} />
              </button>
            )}
          </div>

          {/* Workflow Name Badge (Clickable to open menu) */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex-1 min-w-0 max-w-[130px] px-2 py-1 rounded-lg bg-[#18191A] border border-[#3E4042] flex items-center gap-1 text-left truncate"
            title="Nhấn để đổi tên hoặc chọn quy trình"
          >
            <FolderOpen size={11} className="text-purple-400 shrink-0" />
            <span className="text-[11px] font-bold text-gray-200 truncate">
              {currentWorkflowName || 'Quy trình'}
            </span>
          </button>

          {/* Right quick actions on mobile */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Add Node Button */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPaletteOpen(!isPaletteOpen);
                  setContextMenu(null);
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all border ${
                  isPaletteOpen
                    ? 'bg-[#1877F2] text-white border-blue-400'
                    : 'bg-[#3A3B3C] text-white border-[#3E4042]'
                }`}
                title="Thêm Node"
              >
                <Plus size={13} />
                <span>Node</span>
              </button>

              {isPaletteOpen && (
                <div
                  className="absolute right-0 top-full mt-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <NodeMenu
                    title="Danh Sách Node"
                    onSelectNode={(type, label, cat) => {
                      addNewNode(type, label, cat);
                      setIsPaletteOpen(false);
                    }}
                    onClose={() => setIsPaletteOpen(false)}
                  />
                </div>
              )}
            </div>

            {/* Run Pipeline Button */}
            <button
              onClick={runFullPipeline}
              disabled={isRunningPipeline || nodes.length === 0}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-[#1877F2] to-blue-600 text-white shadow-md transition-all disabled:opacity-50"
              title="Chạy dây chuyền"
            >
              <Play size={12} className={isRunningPipeline ? 'animate-spin' : 'fill-white'} />
              <span>{isRunningPipeline ? '...' : 'Chạy'}</span>
            </button>

            {/* Mobile Actions Drawer Toggle (More Button) */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1 rounded-lg bg-[#18191A] border border-[#3E4042] text-gray-200 hover:text-white"
              title="Mở menu thao tác quy trình"
            >
              <MoreHorizontal size={17} />
            </button>
          </div>
        </div>

        {/* DESKTOP TOP BAR (Màn hình máy tính & tablet >= 768px) */}
        <div className="hidden md:flex items-center justify-between w-full gap-3">
          {/* Logo & Navigation */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#1877F2] to-cyan-400 text-white flex items-center justify-center font-black text-sm shadow-md shadow-blue-500/20">
                <Layers size={18} />
              </div>
              <div>
                <h1 className="text-xs sm:text-sm font-bold tracking-tight text-white leading-none">
                  Elmich Canvas
                </h1>
                <span className="text-[10px] text-cyan-400 font-medium">Node Flow</span>
              </div>
            </div>

            <div className="h-5 w-[1px] bg-[#3E4042] mx-0.5" />

            {/* Navigation view buttons */}
            <div className="flex items-center gap-1 bg-[#18191A] p-0.5 sm:p-1 rounded-xl border border-[#3E4042]">
              <button
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#1877F2] text-white shadow-sm flex items-center gap-1"
                title="Canvas kéo thả node & dây nối"
              >
                <Grid size={13} />
                <span>Canvas</span>
              </button>
              {onSwitchToStudio && (
                <button
                  onClick={onSwitchToStudio}
                  className="px-2 py-1 rounded-lg text-xs font-semibold text-gray-400 hover:text-white hover:bg-[#242526] transition-colors"
                  title="Quay lại giao diện Studio"
                >
                  Studio
                </button>
              )}
              {onSwitchToChat && (
                <button
                  onClick={onSwitchToChat}
                  className="px-2 py-1 rounded-lg text-xs font-semibold text-gray-400 hover:text-white hover:bg-[#242526] transition-colors flex items-center gap-1"
                  title="Trợ lý Hội thoại Chat"
                >
                  <MessageSquare size={13} />
                  <span>Chat</span>
                </button>
              )}
              {onSwitchToHistory && (
                <button
                  onClick={onSwitchToHistory}
                  className="px-2 py-1 rounded-lg text-xs font-semibold text-gray-400 hover:text-white hover:bg-[#242526] transition-colors flex items-center gap-1"
                  title="Lịch sử ảnh đã tạo"
                >
                  <History size={13} />
                  <span>Thư Viện & Lịch Sử</span>
                </button>
              )}
              {onOpenHandbook && (
                <button
                  onClick={onOpenHandbook}
                  className="px-2 py-1 rounded-lg text-xs font-semibold text-gray-400 hover:text-white hover:bg-[#242526] transition-colors flex items-center gap-1"
                  title="Sổ tay thiết kế Elmich"
                >
                  <BookOpen size={13} />
                  <span>Handbook</span>
                </button>
              )}
            </div>
          </div>

          {/* Workflow Controls & Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Editable Workflow Name */}
            <div className="flex items-center gap-1 bg-[#18191A] px-2 py-1.5 rounded-xl border border-[#3E4042] focus-within:border-purple-500 transition-colors">
              <Bookmark size={13} className="text-purple-400 shrink-0" />
              <input
                type="text"
                value={currentWorkflowName}
                onChange={(e) => setCurrentWorkflowName(e.target.value)}
                placeholder="Đặt tên..."
                className="bg-transparent text-xs font-bold text-white outline-none w-20 sm:w-28 md:w-36 placeholder:text-gray-500"
                title="Click để đổi tên quy trình"
              />
            </div>

            {/* Selector: Shows standard templates + saved workflows */}
            <div className="flex items-center gap-1 bg-[#18191A] px-2 py-1.5 rounded-xl border border-[#3E4042]">
              <FolderOpen size={13} className="text-purple-400 shrink-0" />
              <select
                value={activeWorkflowId}
                onChange={(e) => handleWorkflowSelect(e.target.value)}
                className="bg-transparent text-xs text-gray-200 font-semibold outline-none cursor-pointer max-w-[110px] sm:max-w-[140px] md:max-w-[180px] truncate"
              >
                <optgroup label="🌟 Mẫu chuẩn Elmich" className="bg-[#18191A] text-cyan-400 font-bold">
                  {WORKFLOW_TEMPLATES.map((t) => (
                    <option key={t.id} value={t.id} className="bg-[#242526] text-white">
                      {t.name}
                    </option>
                  ))}
                </optgroup>

                {savedWorkflows.length > 0 && (
                  <optgroup
                    label={`📁 Đã lưu (${savedWorkflows.length})`}
                    className="bg-[#18191A] text-purple-400 font-bold"
                  >
                    {savedWorkflows.map((w) => (
                      <option key={w.id} value={w.id} className="bg-[#242526] text-white">
                        {w.name}
                      </option>
                    ))}
                  </optgroup>
                )}

                <option value="empty" className="bg-[#242526] text-amber-300 font-bold">
                  ➕ Tạo Canvas Trống
                </option>
              </select>
            </div>

            {/* Button to open Workflow Manager Modal */}
            <button
              onClick={() => setIsManagerModalOpen(true)}
              className="p-1.5 sm:px-2 sm:py-1.5 rounded-xl text-xs font-semibold bg-[#18191A] hover:bg-[#3A3B3C] border border-[#3E4042] text-gray-200 hover:text-white transition-colors"
              title="Quản lý quy trình trên server"
            >
              <Server size={13} className="text-emerald-400" />
            </button>

            {/* Save Workflow Button */}
            <button
              onClick={() => {
                if (nodes.length === 0) {
                  showToast('Canvas đang trống! Hãy thêm ít nhất 1 node trước khi lưu.');
                  return;
                }
                setIsSaveModalOpen(true);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-[#1877F2] hover:brightness-110 text-white shadow-md border border-purple-500/40 transition-all shrink-0"
              title="Lưu quy trình vào Server"
            >
              <Save size={13} />
              <span className="hidden sm:inline">Lưu</span>
            </button>

            {/* Delete saved workflow button if currently viewing a saved one */}
            {savedWorkflows.some((w) => w.id === activeWorkflowId) && (
              <button
                onClick={handleDeleteCurrentWorkflow}
                className="p-1.5 rounded-xl text-gray-400 hover:text-red-400 hover:bg-[#3A3B3C] border border-[#3E4042] transition-colors"
                title="Xóa quy trình đã lưu này khỏi bộ nhớ"
              >
                <Trash2 size={13} />
              </button>
            )}

            {/* Export JSON file */}
            <button
              onClick={handleExportCurrent}
              className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-[#3A3B3C] border border-transparent hover:border-[#3E4042] transition-colors"
              title="Xuất file JSON quy trình về máy"
            >
              <Download size={13} />
            </button>

            {/* Import JSON file */}
            <button
              onClick={() => importFileInputRef.current?.click()}
              className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-[#3A3B3C] border border-transparent hover:border-[#3E4042] transition-colors"
              title="Nhập file JSON quy trình từ máy tính"
            >
              <Upload size={13} />
            </button>

            <div className="h-4 w-[1px] bg-[#3E4042] mx-0.5 shrink-0" />

            {/* Add Node Button & Dropdown Menu */}
            <div className="relative shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPaletteOpen(!isPaletteOpen);
                  setContextMenu(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  isPaletteOpen
                    ? 'bg-[#1877F2] text-white border-blue-400 shadow-md shadow-blue-500/25'
                    : 'bg-[#3A3B3C] hover:bg-[#4E4F50] text-white border-[#3E4042]'
                }`}
                title="Mở danh sách các node để thêm vào Canvas"
              >
                <Plus size={14} />
                <span>Thêm Node</span>
              </button>

              {isPaletteOpen && (
                <div
                  className="absolute right-0 top-full mt-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <NodeMenu
                    title="Danh Sách Node"
                    onSelectNode={(type, label, cat) => {
                      addNewNode(type, label, cat);
                      setIsPaletteOpen(false);
                    }}
                    onClose={() => setIsPaletteOpen(false)}
                  />
                </div>
              )}
            </div>

            {/* Handle Legend / Connection Guide Button */}
            <button
              onClick={() => setIsLegendOpen(!isLegendOpen)}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-bold transition-all border shrink-0 ${
                isLegendOpen
                  ? 'bg-cyan-600/30 border-cyan-500 text-cyan-300'
                  : 'bg-[#18191A] hover:bg-[#3A3B3C] border-[#3E4042] text-gray-300 hover:text-white'
              }`}
              title="Xem sơ đồ kết nối và quy tắc kéo dây"
            >
              <Palette size={13} className="text-cyan-400" />
              <span className="hidden xl:inline ml-1">Sơ Đồ Kết Nối</span>
            </button>

            {/* Delete selected edges button if any are selected */}
            {selectedEdges.length > 0 && (
              <button
                onClick={deleteSelectedEdges}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-red-600/90 hover:bg-red-600 text-white shadow-lg shadow-red-500/30 transition-all border border-red-500 animate-in fade-in shrink-0"
                title="Xóa các đường dây nối đang chọn (Delete)"
              >
                <Trash2 size={13} />
                <span className="hidden md:inline">Xóa {selectedEdges.length} dây</span>
              </button>
            )}

            {/* Reset / Clear */}
            <button
              onClick={clearCanvas}
              className="p-1.5 rounded-xl text-gray-400 hover:text-red-400 hover:bg-[#3A3B3C] transition-colors border border-transparent hover:border-[#3E4042] shrink-0"
              title="Làm trống Canvas"
            >
              <Trash2 size={14} />
            </button>

            {/* Run Pipeline Button */}
            <button
              onClick={runFullPipeline}
              disabled={isRunningPipeline || nodes.length === 0}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#1877F2] to-blue-600 hover:brightness-110 text-white shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 shrink-0"
              title="Chạy toàn bộ luồng pipeline"
            >
              <Play size={13} className={isRunningPipeline ? 'animate-spin' : 'fill-white'} />
              <span>{isRunningPipeline ? 'Đang chạy...' : 'Chạy Toàn Bộ Luồng'}</span>
            </button>
          </div>
        </div>
        <input
          ref={importFileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleImportFile}
        />
      </header>

      {/* Main Canvas Area */}
      <div className="flex-1 relative">
        {/* Empty Canvas Placeholder / Quick Actions */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-4 sm:p-6 z-10">
            <div
              className="pointer-events-auto max-w-lg w-full p-5 sm:p-7 rounded-3xl bg-[#242526]/95 backdrop-blur-xl border border-[#3E4042] text-center shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 text-[#1877F2] border border-[#1877F2]/30 flex items-center justify-center mx-auto shadow-inner">
                <Sparkles size={28} />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">Canvas Đang Trống</h2>
                <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                  Bắt đầu tự do thêm các Node và kết nối dây theo ý bạn, sau đó bấm <b>"Lưu Quy Trình"</b> để tái sử dụng bất cứ lúc nào.
                </p>
              </div>

              {/* Nút nạp nhanh quy trình chuẩn & mở danh mục chọn Node */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleWorkflowSelect('lifestyle-pipeline')}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white flex items-center gap-2 shadow-lg shadow-purple-950/40 transition-all cursor-pointer active:scale-95"
                >
                  <Sparkles size={14} className="text-amber-300" />
                  <span>⚡ Nạp Quy Trình Lifestyle Chuẩn</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEmptyNodeMenuOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#1877F2] hover:bg-blue-600 text-white flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer active:scale-95"
                >
                  <Plus size={15} />
                  <span>+ Chọn Thêm Node Đầu Tiên</span>
                </button>
              </div>

              {/* Nút thêm nhanh các Node phổ biến */}
              <div className="pt-2 border-t border-[#3E4042]/60">
                <span className="text-[11px] font-semibold text-gray-400 block mb-2">Hoặc thêm nhanh Node khởi đầu:</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      addNewNode('productImage', 'Ảnh Sản Phẩm', 'input', { x: 260, y: 160 });
                    }}
                    className="p-2.5 rounded-xl bg-[#18191A] hover:bg-[#3A3B3C] border border-[#3E4042] text-xs font-semibold text-gray-200 hover:text-white transition-all text-left flex items-center gap-2 cursor-pointer group active:scale-95"
                  >
                    <span className="text-base">📸</span>
                    <span className="truncate">Ảnh Sản Phẩm</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      addNewNode('conceptGenerator', 'Ý Tưởng Concept', 'analysis', { x: 260, y: 160 });
                    }}
                    className="p-2.5 rounded-xl bg-[#18191A] hover:bg-[#3A3B3C] border border-[#3E4042] text-xs font-semibold text-gray-200 hover:text-white transition-all text-left flex items-center gap-2 cursor-pointer group active:scale-95"
                  >
                    <span className="text-base">💡</span>
                    <span className="truncate">Tạo Ý Tưởng</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      addNewNode('promptNode', 'Soạn Prompt', 'input', { x: 260, y: 160 });
                    }}
                    className="p-2.5 rounded-xl bg-[#18191A] hover:bg-[#3A3B3C] border border-[#3E4042] text-xs font-semibold text-gray-200 hover:text-white transition-all text-left flex items-center gap-2 cursor-pointer group active:scale-95"
                  >
                    <span className="text-base">✍️</span>
                    <span className="truncate">Soạn Prompt</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      addNewNode('imageGenerator', 'Sinh Ảnh AI', 'generator', { x: 260, y: 160 });
                    }}
                    className="p-2.5 rounded-xl bg-[#18191A] hover:bg-[#3A3B3C] border border-[#3E4042] text-xs font-semibold text-gray-200 hover:text-white transition-all text-left flex items-center gap-2 cursor-pointer group active:scale-95"
                  >
                    <span className="text-base">⚡</span>
                    <span className="truncate">Sinh Ảnh AI</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      addNewNode('materialDetector', 'Nhận Diện Vật Liệu', 'analysis', { x: 260, y: 160 });
                    }}
                    className="p-2.5 rounded-xl bg-[#18191A] hover:bg-[#3A3B3C] border border-[#3E4042] text-xs font-semibold text-gray-200 hover:text-white transition-all text-left flex items-center gap-2 cursor-pointer group active:scale-95"
                  >
                    <span className="text-base">🔬</span>
                    <span className="truncate">Vật Liệu Inox</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      addNewNode('barcodeQr', 'Barcode & QR', 'utility', { x: 260, y: 160 });
                    }}
                    className="p-2.5 rounded-xl bg-[#18191A] hover:bg-[#3A3B3C] border border-[#3E4042] text-xs font-semibold text-gray-200 hover:text-white transition-all text-left flex items-center gap-2 cursor-pointer group active:scale-95"
                  >
                    <span className="text-base">🏷️</span>
                    <span className="truncate">Barcode & QR</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Danh Mục Node khi bấm "+ Chọn Thêm Node" trên Canvas trống */}
        {isEmptyNodeMenuOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
            onClick={() => setIsEmptyNodeMenuOpen(false)}
          >
            <div
              className="bg-[#242526] border border-[#3E4042] rounded-2xl max-w-sm w-full p-4 shadow-2xl space-y-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#3E4042]">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Plus size={16} className="text-[#1877F2]" />
                  <span>Chọn Node Để Thêm</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEmptyNodeMenuOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-[#3A3B3C] transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="max-h-[65vh] overflow-y-auto custom-scrollbar pr-1">
                <NodeMenu
                  title=""
                  onSelectNode={(type, label, cat) => {
                    addNewNode(type, label, cat, { x: 260, y: 160 });
                    setIsEmptyNodeMenuOpen(false);
                  }}
                  onClose={() => setIsEmptyNodeMenuOpen(false)}
                  className="w-full border-none shadow-none p-0 bg-transparent"
                />
              </div>
            </div>
          </div>
        )}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          proOptions={proOptions}
          onInit={(instance) => {
            rfInstanceRef.current = instance;
          }}
          onPaneContextMenu={onPaneContextMenu}
          onPaneClick={() => {
            setContextMenu(null);
            setIsPaletteOpen(false);
          }}
          onMoveStart={() => setContextMenu(null)}
          onNodeClick={() => setContextMenu(null)}
          deleteKeyCode={['Backspace', 'Delete']}
          edgesFocusable={true}
          edgesReconnectable={true}
          reconnectRadius={30}
          onReconnect={onReconnect}
          onReconnectStart={onReconnectStart}
          onReconnectEnd={onReconnectEnd}
          onDelete={({ edges: deletedEdges }) => {
            if (deletedEdges?.length) {
              deletedEdges.forEach((ed) => handleDeleteEdge(ed.id));
            }
          }}
          onEdgeContextMenu={(e, edge) => {
            e.preventDefault();
            handleDeleteEdge(edge.id);
          }}
          connectionLineStyle={{
            stroke: '#1877F2',
            strokeWidth: 2.5,
          }}
          fitView
          minZoom={0.2}
          maxZoom={2}
          defaultViewport={{ x: 50, y: 50, zoom: 0.8 }}
          className="bg-[#18191A]"
        >
          <Background color="#3E4042" gap={20} size={1.2} variant={BackgroundVariant.Dots} />
          <Controls className="!bg-[#242526] !border-[#3E4042] !rounded-xl !shadow-2xl overflow-hidden [&>button]:!bg-[#242526] [&>button]:!border-[#3E4042] [&>button]:!text-white [&>button:hover]:!bg-[#3A3B3C]" />
          <MiniMap
            className="!hidden md:!block !bg-[#242526]/90 !border-2 !border-[#3E4042] !rounded-2xl !shadow-2xl overflow-hidden"
            nodeColor={(n) => {
              if (n.type === 'productImage' || n.type === 'productSpec') return '#f59e0b';
              if (n.type === 'materialDetector' || n.type === 'conceptGenerator') return '#a855f7';
              if (n.type === 'imageGenerator') return '#1877F2';
              if (n.type === 'imagePreview') return '#10b981';
              return '#14b8a6';
            }}
            maskColor="rgba(24, 25, 26, 0.7)"
          />

          {/* Handle Legend Panel top right */}
          <Panel position="top-right" className="!m-2 sm:!m-4 !z-30">
            <HandleLegendPanel
              isOpen={isLegendOpen}
              onToggle={() => setIsLegendOpen(!isLegendOpen)}
            />
          </Panel>

          {/* Quick tips panel bottom left */}
          <Panel position="bottom-left" className="m-4 hidden md:block">
            <div className="bg-[#242526]/95 backdrop-blur-md border border-[#3E4042] rounded-xl px-3.5 py-2 text-[11px] text-gray-300 shadow-xl flex items-center gap-3">
              <span className="flex items-center gap-1.5 font-semibold text-white">
                <Sparkles size={13} className="text-amber-400" />
                <span>Nối dây: Kéo giữa các cổng để kết nối</span>
              </span>
              <span className="text-gray-500">|</span>
              <span className="text-cyan-300 font-medium">
                🖱️ Chuột phải: Hiện bảng danh sách thêm Node nhanh
              </span>
              <span className="text-gray-500">|</span>
              <span className="text-emerald-400 font-semibold">
                ✂️ Xóa dây: Kéo thả ra ngoài (hoặc phím Delete)
              </span>
            </div>
          </Panel>
        </ReactFlow>

        {/* Right-click Context Menu */}
        {contextMenu && (
          <>
            <div
              className="fixed inset-0 z-40 bg-transparent"
              onClick={() => setContextMenu(null)}
              onContextMenu={(e) => {
                e.preventDefault();
                setContextMenu({ x: e.clientX, y: e.clientY });
              }}
            />
            <div
              className="fixed z-50 animate-in fade-in zoom-in-95 duration-75"
              style={{
                left: Math.max(10, Math.min(contextMenu.x, window.innerWidth - 220)),
                top: Math.max(10, Math.min(contextMenu.y, window.innerHeight - 380)),
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <NodeMenu
                title="Danh Sách Node"
                onSelectNode={handleAddFromContextMenu}
                onClose={() => setContextMenu(null)}
              />
            </div>
          </>
        )}

        {/* Save Workflow to Server Modal */}
        <SaveWorkflowModal
          isOpen={isSaveModalOpen}
          onClose={() => setIsSaveModalOpen(false)}
          onSave={handleSaveWorkflow}
          nodes={nodes}
          edges={edges}
          initialName={currentWorkflowName}
        />

        {/* Workflow Manager Modal (Server / GitHub List) */}
        <WorkflowManagerModal
          isOpen={isManagerModalOpen}
          onClose={() => setIsManagerModalOpen(false)}
          workflows={savedWorkflows}
          activeWorkflowId={activeWorkflowId}
          onSelectWorkflow={handleWorkflowSelect}
          onCreateNewWorkflow={handleCreateNewWorkflow}
          onDeleteWorkflow={handleDeleteWorkflowById}
          onDuplicateWorkflow={handleDuplicateWorkflow}
          onImportFile={handleImportFile}
        />

        {/* Global Toast Notification */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#242526] border border-[#3E4042] text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top duration-150">
            <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* In-app Confirm Delete Workflow Modal */}
        {confirmDeleteTarget && (
          <div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-100"
            onClick={() => setConfirmDeleteTarget(null)}
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
                Quy trình này sẽ bị xóa vĩnh viễn khỏi server hệ thống và bộ nhớ canvas. Bạn có chắc chắn muốn xóa không?
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
                  onClick={async () => {
                    const idToDelete = confirmDeleteTarget.id;
                    setConfirmDeleteTarget(null);
                    await handleDeleteWorkflowById(idToDelete);
                  }}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 transition-colors cursor-pointer"
                >
                  Xác Nhận Xóa
                </button>
              </div>
            </div>
          </div>
        )}

        {/* In-app Confirm Clear Canvas Modal */}
        {confirmClearCanvas && (
          <div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-100"
            onClick={() => setConfirmClearCanvas(false)}
          >
            <div
              className="w-full max-w-sm bg-[#242526] border border-[#3E4042] rounded-2xl shadow-2xl p-5 text-white space-y-4 animate-in zoom-in-95 duration-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 text-amber-400">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <Trash2 size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Làm trống Canvas?</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Xóa tất cả các node và dây nối hiện tại</p>
                </div>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed font-normal">
                Toàn bộ các node đang mở trên màn hình sẽ bị dọn sạch. Các quy trình đã lưu trên server vẫn được giữ nguyên.
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmClearCanvas(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#18191A] hover:bg-[#3A3B3C] text-gray-300 hover:text-white border border-[#3E4042] transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNodes([]);
                    setEdges([]);
                    setConfirmClearCanvas(false);
                    showToast('Đã làm trống Canvas');
                  }}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/30 transition-colors cursor-pointer"
                >
                  Đồng Ý Làm Trống
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Actions Bottom Sheet Drawer */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-[80] md:hidden bg-black/75 backdrop-blur-sm flex items-end animate-in fade-in duration-150"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div
              className="w-full bg-[#242526] border-t border-[#3E4042] rounded-t-3xl p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200 text-white select-none shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer Handle & Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#3E4042]">
                <div className="flex items-center gap-2">
                  <Bookmark size={16} className="text-purple-400" />
                  <h3 className="font-bold text-sm text-white">Thao Tác Quy Trình</h3>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-full hover:bg-[#3A3B3C] text-gray-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Workflow Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Tên quy trình:</label>
                <div className="flex items-center gap-2 bg-[#18191A] px-3 py-2 rounded-xl border border-[#3E4042]">
                  <Bookmark size={14} className="text-purple-400 shrink-0" />
                  <input
                    type="text"
                    value={currentWorkflowName}
                    onChange={(e) => setCurrentWorkflowName(e.target.value)}
                    placeholder="Đặt tên quy trình..."
                    className="bg-transparent text-xs font-bold text-white outline-none w-full placeholder:text-gray-500"
                  />
                </div>
              </div>

              {/* Workflow Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Chọn quy trình:</label>
                <div className="flex items-center gap-2 bg-[#18191A] px-3 py-2.5 rounded-xl border border-[#3E4042]">
                  <FolderOpen size={15} className="text-purple-400 shrink-0" />
                  <select
                    value={activeWorkflowId}
                    onChange={(e) => {
                      handleWorkflowSelect(e.target.value);
                      setIsMobileMenuOpen(false);
                    }}
                    className="bg-transparent text-xs text-gray-200 font-semibold outline-none cursor-pointer w-full"
                  >
                    <option value="empty" className="bg-[#242526] text-amber-300 font-bold">
                      ➕ Tạo Mới
                    </option>
                    {savedWorkflows.length > 0 && (
                      <optgroup
                        label={`📁 Đã lưu (${savedWorkflows.length})`}
                        className="bg-[#18191A] text-purple-400 font-bold"
                      >
                        {savedWorkflows.map((w) => (
                          <option key={w.id} value={w.id} className="bg-[#242526] text-white">
                            {w.name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>
              </div>

              {/* Action Buttons Grid */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (nodes.length === 0) {
                      showToast('Canvas đang trống! Hãy thêm ít nhất 1 node trước khi lưu.');
                      return;
                    }
                    setIsSaveModalOpen(true);
                  }}
                  className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-[#1877F2] text-white font-bold text-xs shadow-md"
                >
                  <Save size={15} />
                  <span>Lưu Quy Trình</span>
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsManagerModalOpen(true);
                  }}
                  className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-[#18191A] border border-[#3E4042] text-emerald-400 hover:text-white font-semibold text-xs"
                >
                  <Server size={15} />
                  <span>Quản Lý Server</span>
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleExportCurrent();
                  }}
                  className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-[#18191A] border border-[#3E4042] text-gray-300 hover:text-white font-semibold text-xs"
                >
                  <Download size={15} />
                  <span>Xuất File JSON</span>
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    importFileInputRef.current?.click();
                  }}
                  className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-[#18191A] border border-[#3E4042] text-gray-300 hover:text-white font-semibold text-xs"
                >
                  <Upload size={15} />
                  <span>Nhập File JSON</span>
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsLegendOpen(!isLegendOpen);
                  }}
                  className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-[#18191A] border border-[#3E4042] text-cyan-400 hover:text-white font-semibold text-xs"
                >
                  <Palette size={15} />
                  <span>Sơ Đồ Kết Nối</span>
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    clearCanvas();
                  }}
                  className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-[#18191A] border border-red-500/30 text-red-400 hover:bg-red-500/10 font-semibold text-xs"
                >
                  <Trash2 size={15} />
                  <span>Làm Trống Canvas</span>
                </button>
              </div>

              {/* View Switcher on Mobile */}
              <div className="pt-3 border-t border-[#3E4042] space-y-2">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Chuyển màn hình:</span>
                <div className="grid grid-cols-2 gap-2">
                  {onSwitchToStudio && (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onSwitchToStudio();
                      }}
                      className="p-2.5 rounded-xl bg-[#18191A] border border-[#3E4042] text-xs font-semibold text-gray-300 hover:text-white flex items-center justify-center gap-2"
                    >
                      <span>🏢 Giao Diện Studio</span>
                    </button>
                  )}
                  {onSwitchToChat && (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onSwitchToChat();
                      }}
                      className="p-2.5 rounded-xl bg-[#18191A] border border-[#3E4042] text-xs font-semibold text-gray-300 hover:text-white flex items-center justify-center gap-2"
                    >
                      <MessageSquare size={14} className="text-pink-400" />
                      <span>Trợ Lý Chat</span>
                    </button>
                  )}
                  {onSwitchToHistory && (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onSwitchToHistory();
                      }}
                      className="p-2.5 rounded-xl bg-[#18191A] border border-[#3E4042] text-xs font-semibold text-gray-300 hover:text-white flex items-center justify-center gap-2"
                    >
                      <History size={14} className="text-amber-400" />
                      <span>Lịch Sử</span>
                    </button>
                  )}
                  {onOpenHandbook && (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenHandbook();
                      }}
                      className="p-2.5 rounded-xl bg-[#18191A] border border-[#3E4042] text-xs font-semibold text-gray-300 hover:text-white flex items-center justify-center gap-2"
                    >
                      <BookOpen size={14} className="text-blue-400" />
                      <span>Handbook</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
