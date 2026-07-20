import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import jsQR from 'jsqr';
import { 
  Eye,
  Download,
  Camera, 
  Palette, 
  Box, 
  Zap, 
  Image as ImageIcon, 
  Eraser, 
  Sparkles, 
  Plug, 
  ChevronRight, 
  ChevronLeft,
  Check,
  Layout,
  Layers,
  Settings,
  ArrowLeft,
  Wand2,
  Loader2,
  PenTool,
  Undo2,
  Redo2,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  MessageCircle,
  Send,
  X,
  ChevronDown,
  Trash2,
  QrCode,
  AlertCircle
} from 'lucide-react';
import { AppState, GenerationSettings, GeneratedImage, AspectRatio, ImageSize, AISuggestions, VisualStyle, ColorChangeEntry, CameraSettings, PackagingFaces, PropConfig, ChatMessage, SuccessfulPrompt } from './types';
import { BarcodeGenerator } from './src/components/BarcodeGenerator';
import { 
  CAMERA_APERTURES, 
  CAMERA_ISO, 
  TONE_STYLES 
} from './constants';
import { analyzePackagingContent, extractStandardParamsWithAI, generateProductImage, editProductImage, analyzeProductMaterials, getAiSuggestions, analyzeConceptAndCamera, analyzeTechConceptAndCamera, suggestPropsForConcept, suggestTechVisuals, suggestTechConcepts, analyzeStagingScene, analyzeStudioConcept, generateImageForChat, chatWithAI } from './services/geminiService';

const initialSettings: GenerationSettings = {
  productName: '',
  productImages: [],
  referenceImage: null,
  visualStyle: 'CONCEPT',
  techDescription: '',
  colorChanges: [],
  dimensions: { length: '', width: '', height: '' },
  packagingMaterial: 'COLOR_BOX',
  packagingDesignType: 'FLAT_DESIGN',
  packagingOutputStyle: 'WHITE_BG_ROTATED',
  packagingFaces: {},
  techEffectType: 'REMOVE_SIGNATURE',
  techTitle: '',
  selectedTechConcept: '',
  productMaterial: 'MATTE',
  whiteBGCategory: 'METAL',
  whiteBGSelectedCategories: ['METAL'],
  whiteBGMaterialsDescription: '',
  whiteBGMetalConfig: { type: 'Brushed Stainless Steel', highlight: 'sharp longitudinal highlights', shape: 'cylindrical' },
  whiteBGPlasticConfig: { type: 'Matte', color: 'White', lighting: 'Softbox' },
  whiteBGGlassConfig: { type: 'Borosilicate Glass', lighting: 'Rim lighting', content: '' },
  whiteBGCeramicConfig: { surface: 'Ceramic finish', lighting: '45-degree side lighting' },
  whiteBGMetalAndPlasticConfig: { metalParts: 'Inox xước, thép không gỉ sáng bóng', plasticParts: 'Nhựa ABS phủ mờ màu sáng hoặc tối', lighting: 'Softbox cường độ vừa phải kết hợp phản xạ dịu trên kim loại' },
  emptySpacePosition: [],
  sockets: [],
  trackSocketMode: 'CREATIVE',
  concept: '',
  placement: '',
  location: '',
  camera: { focalLength: 50, aperture: 'f/2.8', iso: '100', isMacro: false, angle: 0 },
  props: [],
  tone: TONE_STYLES[0],
  aspectRatio: '1:1',
  imageSize: '1K',
  aiModel: 'gemini-3.1-flash-image',
  numImages: 1 
};

function useSettingsHistory(initialState: GenerationSettings) {
  const [state, setState] = useState<{
    past: GenerationSettings[];
    present: GenerationSettings;
    future: GenerationSettings[];
  }>({
    past: [],
    present: initialState,
    future: []
  });

  const setSettings = React.useCallback((newSettings: GenerationSettings | ((prev: GenerationSettings) => GenerationSettings)) => {
    setState(prevState => {
      const nextSettings = typeof newSettings === 'function' ? newSettings(prevState.present) : newSettings;
      if (JSON.stringify(nextSettings) === JSON.stringify(prevState.present)) {
        return prevState;
      }
      const newPast = [...prevState.past, prevState.present];
      if (newPast.length > 50) newPast.shift();
      return {
        past: newPast,
        present: nextSettings,
        future: []
      };
    });
  }, []);

  const undoSettings = React.useCallback(() => {
    setState(prevState => {
      if (prevState.past.length === 0) return prevState;
      const previous = prevState.past[prevState.past.length - 1];
      const newPast = prevState.past.slice(0, prevState.past.length - 1);
      return {
        past: newPast,
        present: previous,
        future: [prevState.present, ...prevState.future]
      };
    });
  }, []);

  const redoSettings = React.useCallback(() => {
    setState(prevState => {
      if (prevState.future.length === 0) return prevState;
      const next = prevState.future[0];
      const newFuture = prevState.future.slice(1);
      return {
        past: [...prevState.past, prevState.present],
        present: next,
        future: newFuture
      };
    });
  }, []);

  return {
    settings: state.present,
    setSettings,
    undoSettings,
    redoSettings,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0
  };
}

const TypingEffect = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let i = 0;
    setDisplayedText("");
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(prev => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 15);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <span>
      {displayedText.split('').map((line, i) => (
        <React.Fragment key={i}>
          {line}
          {i !== displayedText.split('').length - 1 && <br />}
        </React.Fragment>
      ))}
    </span>
  );
};

const FileDropzone: React.FC<React.HTMLAttributes<HTMLDivElement> & { onFilesDrop: (files: FileList) => void }> = ({ onFilesDrop, className, children, ...props }) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesDrop(e.dataTransfer.files);
    }
  };

  return (
    <div
      {...props}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`${className || ''} ${isDragActive ? '!border-[#1877F2] !bg-[#1877F2]/10 transition-all' : ''}`}
    >
      {children}
    </div>
  );
};

const App: React.FC = () => {
  const [isLocked, setIsLocked] = useState(true); 
  const [passwordInput, setPasswordInput] = useState(""); 
  const [passwordError, setPasswordError] = useState(""); 
  
  const [appState, setAppState] = useState<AppState>(AppState.READY);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isImagePanelVisible, setIsImagePanelVisible] = useState(true);
  
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [conceptStep, setConceptStep] = useState<number>(1);
  const [techStep, setTechStep] = useState<number>(1); 
  const [packagingStep, setPackagingStep] = useState<number>(1); 
  const [techEffectStep, setTechEffectStep] = useState<number>(1); 
  const [packagingCheckStep, setPackagingCheckStep] = useState<number>(1);
  const [packagingInputMode, setPackagingInputMode] = useState<'MANUAL' | 'EXCEL'>('EXCEL');
  const [packagingFileType, setPackagingFileType] = useState<string>('HỘP MÀU');
  const [packagingFileName, setPackagingFileName] = useState<string>('');
  const [standardParams, setStandardParams] = useState<{key: string, value: string}[]>([]);
  const [packagingFiles, setPackagingFiles] = useState<{name: string, data: string}[]>([]);
  const [packagingDesignImage, setPackagingDesignImage] = useState<string | null>(null);
  const [packagingCheckResult, setPackagingCheckResult] = useState<{ params: any[], qr?: any } | null>(null);
  const [isAnalyzingMaterial, setIsAnalyzingMaterial] = useState<boolean>(false);
  const [render3DStep, setRender3DStep] = useState<number>(1);
  const [whiteBgStep, setWhiteBgStep] = useState<number>(1); 
  const [colorChangeStep, setColorChangeStep] = useState<number>(1); 
  const [whiteBgWebStep, setWhiteBgWebStep] = useState<number>(1); 
  const [stagingStep, setStagingStep] = useState<number>(1); 
  const [studioStep, setStudioStep] = useState<number>(1); 
  const [trackSocketStep, setTrackSocketStep] = useState<number>(1); 

  const [suggestions, setSuggestions] = useState<AISuggestions>({
    concepts: [],
    locations: [],
    props: []
  });

  const { settings, setSettings, undoSettings, redoSettings, canUndo, canRedo } = useSettingsHistory(initialSettings);
  
  const [customConcept, setCustomConcept] = useState('');
  const [customProp, setCustomProp] = useState('');
  const [currentColorPart, setCurrentColorPart] = useState('');
  const [currentPantoneCode, setCurrentPantoneCode] = useState('');
  const [currentColorDescription, setCurrentColorDescription] = useState('');
  const [currentSampleImage, setCurrentSampleImage] = useState<string | null>(null); 
  
  const [gallery, setGallery] = useState<GeneratedImage[]>([]);
  const [isGalleryLoaded, setIsGalleryLoaded] = useState(false);
  const [askFeedbackImage, setAskFeedbackImage] = useState<GeneratedImage | null>(null);
  const [successfulPrompts, setSuccessfulPrompts] = useState<SuccessfulPrompt[]>(() => {
    try {
      const saved = localStorage.getItem('elmich_ai_successful_prompts');
      if (saved) {
        return JSON.parse(saved) as SuccessfulPrompt[];
      }
    } catch (e) {
      console.error('Failed to parse successful prompts', e);
    }
    return [];
  });
  useEffect(() => {
    import('localforage').then((m) => {
      const lf = m.default || m;
      // Load gallery
      lf.getItem('elmich_ai_gallery').then((saved) => {
        if (saved) {
           const parsed = typeof saved === 'string' ? JSON.parse(saved) : saved as GeneratedImage[];
           const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
           setGallery(parsed.filter((img: any) => img.timestamp > oneWeekAgo));
        }
        setIsGalleryLoaded(true);
      });
    }).catch(e => {
       console.error('Failed to load gallery', e);
       setIsGalleryLoaded(true);
    });
  }, []);

  const [activeImage, setActiveImage] = useState<GeneratedImage | null>(null);
  const [editPrompt, setEditPrompt] = useState('');

  useEffect(() => {
    localStorage.setItem('elmich_ai_successful_prompts', JSON.stringify(successfulPrompts));
  }, [successfulPrompts]);

  // Sync productName and productCode for background Lark tracking
  useEffect(() => {
    localStorage.setItem('elmich_ai_product_name', settings.productName || '');
    if (settings.visualStyle === 'COLOR_CHANGE') {
      localStorage.setItem('elmich_ai_product_code', 'sản phẩm mới');
    } else {
      localStorage.setItem('elmich_ai_product_code', settings.productCode || '');
    }
  }, [settings.productName, settings.productCode, settings.visualStyle]);

  const [isEditingImage, setIsEditingImage] = useState(false);
  const [editQuality, setEditQuality] = useState<ImageSize>('1K');
  
  const [viewMode, setViewMode] = useState<'studio' | 'chat'>('studio');
  
  const [chatSessions, setChatSessions] = useState<import('./types').ChatSession[]>([]);
  const [isChatLoaded, setIsChatLoaded] = useState(false);

  useEffect(() => {
    import('localforage').then((m) => {
      const lf = m.default || m;
      lf.getItem('elmich_ai_chat_sessions').then((saved) => {
        if (saved) {
          const parsed = typeof saved === 'string' ? JSON.parse(saved) : saved as import('./types').ChatSession[];
          const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
          setChatSessions(parsed.filter((s: any) => s.timestamp > oneWeekAgo));
        }
        setIsChatLoaded(true);
      });
    }).catch(e => {
       console.error('Failed to load chat sessions', e);
       setIsChatLoaded(true);
    });
  }, []);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (isChatLoaded && !activeSessionId && chatSessions.length > 0) {
      setActiveSessionId(chatSessions[0].id);
    }
  }, [isChatLoaded, chatSessions, activeSessionId]);
  
  useEffect(() => {
    if (isChatLoaded) {
      import('localforage').then((m) => {
        const lf = m.default || m;
        lf.setItem('elmich_ai_chat_sessions', chatSessions).catch((e: any) => {
          console.error('Lỗi khi lưu chat vào localForage:', e);
        });
      });
    }
  }, [chatSessions, isChatLoaded]);

  const currentSession = chatSessions.find(s => s.id === activeSessionId);
  const chatMessages = currentSession?.messages || [];
  
  const [chatInput, setChatInput] = useState('');
  const [chatInputImageBase64, setChatInputImageBase64] = useState<string | null>(null);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatMode, setChatMode] = useState<'chat' | 'image'>('chat');
  const [chatImageAspectRatio, setChatImageAspectRatio] = useState('1:1');
  const [chatImageQuality, setChatImageQuality] = useState('1K');
  const [showSessionsList, setShowSessionsList] = useState(false);
  
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (viewMode === 'chat') {
      scrollToBottom();
    }
  }, [chatMessages, viewMode]);

  const handleSendMessage = async () => {
    if ((!chatInput.trim() && !chatInputImageBase64) || isChatLoading) return;
    
    const newUserMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: chatInput, uploadedImageUrl: chatInputImageBase64 || undefined };
    
    let targetSessionId = activeSessionId;
    if (!targetSessionId) {
      targetSessionId = Date.now().toString();
      setActiveSessionId(targetSessionId);
      setChatSessions(prev => [{ id: targetSessionId!, title: chatInput.trim().slice(0, 30) || 'New Chat', messages: [newUserMsg], timestamp: Date.now() }, ...prev]);
    } else {
      setChatSessions(prev => prev.map(s => s.id === targetSessionId ? { ...s, messages: [...s.messages, newUserMsg], timestamp: Date.now() } : s));
    }

    setChatInput('');
    setChatInputImageBase64(null);
    setIsChatLoading(true);

    try {
      let newModelMsg: ChatMessage;
      if (chatMode === 'image') {
        const fullPrompt = `${chatInput}`;
        // Default implicit image model
        const defaultImageModel = 'gemini-3.1-flash-image';
        const imageUrl = await generateImageForChat(fullPrompt, defaultImageModel, chatImageAspectRatio, chatInputImageBase64 || undefined, chatImageQuality);
        newModelMsg = { id: Date.now().toString() + 'm', role: 'model', text: 'Đây là hình ảnh của bạn:', imageUrl };
      } else {
        const currentMsgs = targetSessionId ? (chatSessions.find(s => s.id === targetSessionId)?.messages || []) : [];
        const messagesToSend = [...currentMsgs, newUserMsg];
        // Default implicit chat model
        const defaultChatModel = 'gemini-2.5-flash';
        const replyText = await chatWithAI(messagesToSend, defaultChatModel);
        newModelMsg = { id: Date.now().toString() + 'm', role: 'model', text: replyText };
      }
      setChatSessions(prev => prev.map(s => s.id === targetSessionId ? { ...s, messages: [...s.messages, newModelMsg], timestamp: Date.now() } : s));
    } catch (e: any) {
      const errorMsg: ChatMessage = { id: Date.now().toString() + 'e', role: 'model', text: `⚠️ Error: ${e.message || 'Something went wrong.'}` };
      setChatSessions(prev => prev.map(s => s.id === targetSessionId ? { ...s, messages: [...s.messages, errorMsg], timestamp: Date.now() } : s));
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleImageUploadToChat = (filesOrEvent: React.ChangeEvent<HTMLInputElement> | FileList) => {
    const files = 'target' in filesOrEvent ? filesOrEvent.target.files : filesOrEvent;
    const file = files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setChatInputImageBase64(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNewChat = () => {
    setActiveSessionId(null);
    setShowSessionsList(false);
  };

  useEffect(() => {
    if (isGalleryLoaded) {
      import('localforage').then((m) => {
        const lf = m.default || m;
        lf.setItem('elmich_ai_gallery', gallery).catch((e: any) => {
          console.error('Lỗi khi lưu vào localForage:', e);
          setAlertMessage('Bộ nhớ quá tải, không thể lưu thêm ảnh.');
        });
      });
    }
  }, [gallery, isGalleryLoaded]);

  const productFilesRef = useRef<HTMLInputElement>(null);
  const refFileRef = useRef<HTMLInputElement>(null);
  const colorSampleRef = useRef<HTMLInputElement>(null);
  const packagingFileRef = useRef<HTMLInputElement>(null); 
  const trackFileRef = useRef<HTMLInputElement>(null);
  const socketFileRef = useRef<HTMLInputElement>(null);
  const pendingPackagingFace = useRef<keyof PackagingFaces | "flat">("flat");

  const handlePasswordChange = (val: string) => {
    setPasswordInput(val);
    setPasswordError("");
    if (val === "1111") {
      setIsLocked(false);
    } else if (val.length >= 4) {
      setPasswordError("Mật khẩu không chính xác");
    }
  };

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width; let height = img.height;
          const maxDim = 2560; 
          if (width > maxDim || height > maxDim) {
            const ratio = Math.min(maxDim / width, maxDim / height);
            width = Math.round(width * ratio); height = Math.round(height * ratio);
          }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.onerror = () => reject(new Error("Lỗi đọc ảnh"));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Lỗi file"));
      reader.readAsDataURL(file);
    });
  };

  const onImageUpload = async (filesOrEvent: React.ChangeEvent<HTMLInputElement> | FileList, type: 'product' | 'reference' | 'color_sample' | 'packaging' | 'track' | 'socket') => {
    const files = 'target' in filesOrEvent ? filesOrEvent.target.files : filesOrEvent;
    if (!files || files.length === 0) return;
    try {
      if (type === 'packaging') {
          const base64 = await resizeImage(files[0]);
          const face = pendingPackagingFace.current;
          setSettings(prev => ({ ...prev, packagingFaces: { ...prev.packagingFaces, [face]: base64 } }));
      } else if (type === 'color_sample') {
        const base64 = await resizeImage(files[0]);
        setCurrentSampleImage(base64); 
      } else if (type === 'reference') {
        const base64 = await resizeImage(files[0]);
        setSettings(prev => ({ ...prev, referenceImage: base64 }));
      } else if (type === 'product') {
        const newImages = await Promise.all(Array.from(files).map((file) => resizeImage(file as File)));
        setSettings(prev => ({ ...prev, productImages: [...prev.productImages, ...newImages].slice(0, 5) }));
      } else if (type === 'track') {
        const base64 = await resizeImage(files[0]);
        setSettings(prev => ({ ...prev, trackImage: base64 }));
      } else if (type === 'socket') {
        const base64 = await resizeImage(files[0]);
        setSettings(prev => ({ 
          ...prev, 
          sockets: [...(prev.sockets || []), { id: Date.now().toString(), image: base64, quantity: 1, applianceNote: '' }] 
        }));
      }
    } catch (error) { setAlertMessage("Lỗi khi tải ảnh."); }
    e.target.value = '';
  };

  // --- LOGIC CONCEPT WORKFLOW (STRICT 4 STEPS) ---
  const handleConceptAnalysis = async () => {
    if (!settings.productName || settings.productImages.length === 0) return setAlertMessage("Vui lòng nhập tên và tải ít nhất 1 ảnh sản phẩm.");
    setAppState(AppState.ANALYZING);
    setLoadingMessage("AI đang phân tích dữ liệu và đề xuất phối cảnh...");
    try {
      const dimStr = `${settings.dimensions.length}x${settings.dimensions.width}x${settings.dimensions.height}mm`;
      const result = await analyzeConceptAndCamera(settings.productName, dimStr, settings.productImages, settings.referenceImage);
      setSuggestions(prev => ({ ...prev, concepts: result.concepts }));
      setSettings(prev => ({ ...prev, camera: result.suggestedCamera, concept: result.concepts[0]?.prompt || '', conceptTitle: result.concepts[0]?.title || '' }));
      setConceptStep(2);
    } catch (e: any) { console.error(e); } 
    finally { setAppState(AppState.READY); }
  };

  const handlePropSuggestion = async () => {
    const finalConcept = settings.concept;
    if (!finalConcept) return setAlertMessage("Vui lòng chọn hoặc nhập 1 phối cảnh.");
    setAppState(AppState.ANALYZING);
    setLoadingMessage("AI đang tìm kiếm đạo cụ phù hợp cho phối cảnh này...");
    try {
      const result = await suggestPropsForConcept(settings.productName, finalConcept, 'LIFESTYLE');
      setSuggestions(prev => ({ ...prev, props: result.props }));
      setSettings(prev => ({ ...prev, props: [], placement: result.placement }));
      setConceptStep(3);
    } catch (e) { console.error(e); } 
    finally { setAppState(AppState.READY); }
  };

  const addCustomConceptToList = () => {
    if (customConcept && !suggestions.concepts.some(c => c.prompt === customConcept)) {
      setSuggestions(prev => ({ ...prev, concepts: [{ title: "Tùy chỉnh", prompt: customConcept }, ...prev.concepts] }));
      setSettings(prev => ({ ...prev, concept: customConcept }));
      setCustomConcept('');
    }
  };

  const addCustomPropToList = () => {
    if (customProp && !suggestions.props.includes(customProp)) {
      setSuggestions(prev => ({ ...prev, props: [customProp, ...prev.props] }));
      setSettings(prev => ({ ...prev, props: [...prev.props, { name: customProp, size: 'auto', position: 'auto', rotation: 'auto' }] }));
      setCustomProp('');
    }
  };

  const toggleProp = (propName: string) => {
    setSettings(prev => {
      const exists = prev.props.some(p => p.name === propName);
      if (exists) {
        return { ...prev, props: prev.props.filter(p => p.name !== propName) };
      } else {
        return { ...prev, props: [...prev.props, { name: propName, size: 'auto', position: 'auto', rotation: 'auto' }] };
      }
    });
  };

  const updateProp = (propName: string, updates: Partial<PropConfig>) => {
    setSettings(prev => ({
      ...prev,
      props: prev.props.map(p => p.name === propName ? { ...p, ...updates } : p)
    }));
  };

  // --- LOGIC TECH WORKFLOW ---
  const handleTechAnalysis = async () => {
    if (!settings.productName || !settings.techDescription || settings.productImages.length === 0) return setAlertMessage("Thiếu thông tin");
    setAppState(AppState.ANALYZING);
    setLoadingMessage("Gemini đang thiết kế ý tưởng kỹ thuật...");
    try {
      const dimStr = `${settings.dimensions.length}x${settings.dimensions.width}x${settings.dimensions.height}mm`;
      const result = await analyzeTechConceptAndCamera(settings.productName, settings.techDescription, dimStr, settings.productImages);
      setSuggestions(prev => ({ ...prev, concepts: result.concepts }));
      setSettings(prev => ({ ...prev, camera: result.suggestedCamera, concept: result.concepts[0]?.prompt || '' }));
      setTechStep(3);
    } catch (e: any) { console.error(e); } 
    finally { setAppState(AppState.READY); }
  };

  const handleTechVisualSuggestion = async () => {
    const finalConcept = settings.concept;
    setAppState(AppState.ANALYZING);
    setLoadingMessage("Đang tìm hiệu ứng...");
    try {
      const result = await suggestTechVisuals(settings.productName, finalConcept);
      setSuggestions(prev => ({ ...prev, props: result.props }));
      setSettings(prev => ({ ...prev, props: [], placement: result.placement }));
      setTechStep(4);
    } catch (e) { console.error(e); } 
    finally { setAppState(AppState.READY); }
  };

  const handleSeaConceptSuggestion = async () => {
      if (!settings.productName || !settings.techTitle) return setAlertMessage("Thiếu tên SP/Tiêu đề");
      setAppState(AppState.ANALYZING);
      setLoadingMessage("Đang gợi ý concept biển...");
      try {
          const concepts = await suggestTechConcepts(settings.productName, settings.techTitle);
          setSuggestions(prev => ({ ...prev, concepts }));
          setSettings(prev => ({ ...prev, selectedTechConcept: concepts[0]?.prompt || '' }));
          setTechEffectStep(3);
      } catch (e) { console.error(e); }
      finally { setAppState(AppState.READY); }
  };

  const handleStagingAnalysis = async () => {
      if (!settings.concept || !settings.productImages[0] || !settings.referenceImage) return setAlertMessage("Vui lòng điền đủ thông tin & up ảnh.");
      setAppState(AppState.ANALYZING);
      setLoadingMessage("AI đang phân tích phối cảnh...");
      try {
          const items = await analyzeStagingScene(settings.concept, settings.productImages[0], settings.referenceImage);
          setSuggestions(prev => ({ ...prev, props: items }));
          setSettings(prev => ({ ...prev, props: [] }));
          setStagingStep(4);
      } catch (e: any) { console.error(e); } 
      finally { setAppState(AppState.READY); }
  };

  // --- LOGIC STUDIO WORKFLOW ---
  const handleStudioAnalysis = async () => {
    if (!settings.productName || settings.productImages.length === 0) return setAlertMessage("Vui lòng nhập tên và tải ít nhất 1 ảnh sản phẩm.");
    setAppState(AppState.ANALYZING);
    setLoadingMessage("AI đang phân tích và đề xuất Studio Concept...");
    try {
      const dimStr = `${settings.dimensions.length}x${settings.dimensions.width}x${settings.dimensions.height}mm`;
      const result = await analyzeStudioConcept(settings.productName, dimStr, settings.productImages);
      setSuggestions(prev => ({ ...prev, concepts: result.concepts }));
      setSettings(prev => ({ ...prev, camera: result.suggestedCamera, concept: result.concepts[0]?.prompt || '' }));
      setStudioStep(2);
    } catch (e: any) { console.error(e); } 
    finally { setAppState(AppState.READY); }
  };

  const handleStudioPropSuggestion = async () => {
    const finalConcept = settings.concept;
    if (!finalConcept) return setAlertMessage("Vui lòng chọn hoặc nhập 1 concept.");
    setAppState(AppState.ANALYZING);
    setLoadingMessage("AI đang tìm kiếm đạo cụ Studio phù hợp...");
    try {
      const result = await suggestPropsForConcept(settings.productName, finalConcept, 'STUDIO');
      setSuggestions(prev => ({ ...prev, props: result.props }));
      setSettings(prev => ({ ...prev, props: [], placement: result.placement }));
      setStudioStep(3);
    } catch (e) { console.error(e); } 
    finally { setAppState(AppState.READY); }
  };

  const startGeneration = async (overrideSettings?: Partial<GenerationSettings>) => {
    setAppState(AppState.GENERATING);
    setLoadingMessage("Gemini Thinking đang chuẩn bị kiệt tác...");
    try {
      const finalSettings = { ...settings, ...overrideSettings };
      const urls = await Promise.all(Array.from({ length: finalSettings.numImages }, (_, i) => generateProductImage(finalSettings, i + 1, successfulPrompts)));
      const time = Date.now();
      const newImages: GeneratedImage[] = urls.map((url, i) => ({ id: `${time}-${i}`, url, prompt: finalSettings.concept, timestamp: time, settings: { ...finalSettings }, variant: i + 1 }));
      setGallery(prev => [...newImages, ...prev]);
      setActiveImage(newImages[0]);
    } catch (error: any) {
      console.error(error);
      setAlertMessage("Lỗi tạo ảnh.");
    } finally { setAppState(AppState.READY); }
  };

  const handleEditImage = async () => {
    if (!activeImage || !editPrompt.trim()) return;
    setIsEditingImage(true);
    try {
      const newUrl = await editProductImage(activeImage.url, editPrompt, editQuality);
      const time = Date.now();
      const newImage: GeneratedImage = {
        id: `${time}-edited`,
        url: newUrl,
        prompt: editPrompt,
        timestamp: time,
        settings: { ...activeImage.settings },
        variant: activeImage.variant + 1
      };
      setGallery(prev => [newImage, ...prev]);
      setActiveImage(newImage);
      setEditPrompt("");
    } catch (error: any) {
      console.error(error);
      setAlertMessage("Lỗi chỉnh sửa ảnh.");
    } finally {
      setIsEditingImage(false);
    }
  };

  const resetMode = () => {
    setCurrentStep(1); setConceptStep(1); setTechStep(1); setPackagingStep(1); setTechEffectStep(1); setWhiteBgStep(1); setColorChangeStep(1); setStagingStep(1); setStudioStep(1); setTrackSocketStep(1);
    setSettings(prev => ({
      ...prev, productName: '', productImages: [], referenceImage: null, techDescription: '', concept: '', placement: '', props: [], colorChanges: [], packagingFaces: {}, techTitle: '', selectedTechConcept: '', productMaterial: 'MATTE', emptySpacePosition: [], trackImage: undefined, sockets: []
    }));
    setSuggestions({ concepts: [], locations: [], props: [] });
    setCurrentSampleImage(null); setCustomConcept(''); setCustomProp('');
  };

  // --- REUSABLE COMPONENTS ---

  const StepIndicator = ({ current, total, labels }: { current: number, total: number, labels: string[] }) => (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[#242526]/10 -translate-y-1/2 z-0" />
        <motion.div 
          className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 -translate-y-1/2 z-0"
          initial={{ width: 0 }}
          animate={{ width: `${((current - 1) / (total - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
        
        {labels.map((label, idx) => {
          const stepNum = idx + 1;
          const isActive = stepNum === current;
          const isCompleted = stepNum < current;
          
          return (
            <div key={idx} className="relative z-10 flex flex-col items-center">
              <motion.div 
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                  isActive ? 'bg-[#242526] border-[#1877F2] text-[#1877F2] shadow-[0_0_15px_rgba(34,211,238,0.4)]' : 
                  isCompleted ? 'bg-[#1877F2] border-cyan-500 text-white' : 
                  'bg-[#242526] border-[#3E4042] text-white/40'
                }`}
                animate={isActive ? { scale: 1.1 } : { scale: 1 }}
              >
                {isCompleted ? <Check size={16} strokeWidth={3} /> : <span className="text-xs font-bold">{stepNum}</span>}
              </motion.div>
              <div className={`absolute top-10 whitespace-nowrap text-[8px] font-bold uppercase tracking-wider transition-colors duration-300 ${
                isActive ? 'text-[#1877F2]' : 'text-white'
              }`}>
                {label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // --- RENDER FUNCTIONS ---

  // 1. Ảnh phối cảnh Workflow (Lifestyle Concept)
  
  
  const filterAndFormatImportantParams = (extracted: {key: string, value: string}[]) => {
    const findValue = (keywords: string[]) => {
      for (const item of extracted) {
        const lowerKey = item.key.toLowerCase();
        if (keywords.some(kw => lowerKey.includes(kw))) {
          return item.value;
        }
      }
      return "";
    };

    const maSp = findValue(["mã sản phẩm", "mã sp", "item code", "mã hàng"]);
    const ean13 = findValue(["ean13", "ean-13", "mã vạch", "barcode"]);
    
    return [
      { key: "Tên sản phẩm", value: findValue(["tên sản phẩm", "tên hàng"]) },
      { key: "Model", value: findValue(["model"]) },
      { key: "Mã sản phẩm", value: maSp },
      { key: "Công suất", value: findValue(["công suất"]) },
      { key: "Điện áp", value: findValue(["điện áp", "nguồn điện"]) },
      { key: "Tần số", value: findValue(["tần số"]) },
      { key: "Kích thước sản phẩm", value: findValue(["kích thước"]) },
      { key: "Trọng lượng sản phẩm", value: findValue(["trọng lượng", "khối lượng"]) },
      { key: "Định lượng", value: findValue(["định lượng"]) },
      { key: "Dung tích", value: findValue(["dung tích", "thể tích"]) },
      { key: "Chất liệu vỏ", value: findValue(["chất liệu"]) },
      { key: "Xuất xứ", value: findValue(["xuất xứ", "made in", "sản xuất tại"]) },
      { key: "Năm sản xuất", value: findValue(["năm sản xuất"]) },
      { key: "Đơn vị sản xuất", value: findValue(["đơn vị sản xuất", "nhà sản xuất", "sản xuất bởi"]) },
      { key: "Địa chỉ", value: findValue(["địa chỉ", "address"]) },
      { key: "Mã vạch EAN13", value: ean13 },
      { key: "Mã vạch code 128", value: maSp },
      { key: "Mã QR", value: maSp ? `www.elmich.vn/san-pham/${maSp.toLowerCase()}` : "" }
    ];
  };

  const processRawRows = (rows: any[][]) => {
    const extractedParams: {key: string, value: string}[] = [];
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!Array.isArray(row)) continue;
        
        const validCells = row.filter(cell => cell !== undefined && cell !== null && String(cell).trim() !== "");
        if (validCells.length < 2) continue; 
        
        let cellsToProcess = [...validCells];
        const firstCellStr = String(cellsToProcess[0]).trim();
        if (/^(\d+|[IVXLCDM]+)$/i.test(firstCellStr)) {
          cellsToProcess.shift();
        }
        
        if (cellsToProcess.length < 2) continue;
        
        const value = String(cellsToProcess.pop()).trim();
        const key = cellsToProcess.map(c => String(c).trim()).join(" - ");
        extractedParams.push({ key, value });
    }
    return filterAndFormatImportantParams(extractedParams);
  };

  
  const handlePackagingFilesUpload = (filesOrEvent: React.ChangeEvent<HTMLInputElement> | FileList) => {
    const filesList = 'target' in filesOrEvent ? filesOrEvent.target.files : filesOrEvent;
    const files = Array.from(filesList || []) as File[];
    if (files.length > 0) {
      setPackagingFiles(prev => [...prev, ...files]);
    }
  };

  const handleExcelUpload = async (filesOrEvent: React.ChangeEvent<HTMLInputElement> | FileList) => {
    const files = 'target' in filesOrEvent ? filesOrEvent.target.files : filesOrEvent;
    const file = files?.[0];
    if (!file) return;
    setLoadingMessage("AI đang phân tích dữ liệu Excel...");
    setAppState(AppState.ANALYZING);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      
      let textData = "";
      workbook.SheetNames.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
        jsonData.forEach(row => {
            textData += row.join(" \t ") + "";
        });
      });
      
      const aiParams = await extractStandardParamsWithAI(textData);
      setStandardParams(aiParams);
      setAppState(AppState.READY);
    } catch (err: any) {
      console.error(err);
      setAlertMessage("Lỗi khi đọc file Excel: " + err.message);
      setAppState(AppState.READY);
    }
    e.target.value = '';
  };

  const handlePastedExcelData = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (!text.trim()) return;
    
    setLoadingMessage("AI đang phân tích dữ liệu văn bản...");
    setAppState(AppState.ANALYZING);
    try {
      const aiParams = await extractStandardParamsWithAI(text);
      setStandardParams(aiParams);
      setAppState(AppState.READY);
    } catch (err: any) {
       console.error(err);
       setAlertMessage("Lỗi phân tích: " + err.message);
       setAppState(AppState.READY);
    }
    e.target.value = ''; // clear textarea
  };
  const addStandardParam = () => setStandardParams([...standardParams, { key: '', value: '' }]);
  const updateStandardParam = (index: number, field: 'key' | 'value', val: string) => {
    const newParams = [...standardParams];
    newParams[index][field] = val;
    setStandardParams(newParams);
  };
  const removeStandardParam = (index: number) => {
    setStandardParams(standardParams.filter((_, i) => i !== index));
  };

  
  const exportPackagingReport = () => {
    if (!packagingCheckResult || !packagingCheckResult.params) return;

    const data: any[] = [];
    
    packagingCheckResult.params.forEach((res: any) => {
        const row: any = {
            'Thông số': res.key,
            'Giá trị chuẩn': res.expected || '-',
            'Khớp (Tổng thể)': res.match ? 'ĐẠT' : 'KHÔNG ĐẠT',
        };

        packagingFiles.forEach((file, fIdx) => {
            let fileResult = (res.fileResults || []).find((fr: any) => {
                if (!fr.fileName) return false;
                const cleanFr = fr.fileName.toLowerCase().trim();
                const cleanF = file.name.toLowerCase().trim();
                return cleanFr === cleanF || cleanFr.includes(cleanF) || cleanF.includes(cleanFr);
            });
            if (!fileResult && (res.fileResults || []).length === packagingFiles.length) {
                fileResult = (res.fileResults || [])[fIdx];
            }

            row[`File: ${file.name} (Thực tế)`] = fileResult ? (fileResult.actual || 'Không tìm thấy') : 'Không có dữ liệu';
            row[`File: ${file.name} (Ghi chú)`] = fileResult ? (fileResult.notes || '') : '';
            row[`File: ${file.name} (Đánh giá)`] = fileResult ? (fileResult.match ? 'ĐẠT' : 'KHÔNG ĐẠT') : '-';
        });

        data.push(row);
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "BaoCaoKiemTra");
    XLSX.writeFile(workbook, `BaoCao_KiemTraBaoBi_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const runPackagingCheck = async () => {
    if (packagingFiles.length === 0) return;
    setAppState(AppState.ANALYZING);
    setLoadingMessage("AI đang quét thiết kế và đối chiếu thông số...");
    
    try {
      // Run AI Check (including QR)
      const result = await analyzePackagingContent(packagingFiles, standardParams);
      
      // Group AI results by standard params to avoid duplicate rows
      const enrichedParams = standardParams.filter(p => p.value.trim() !== '').map(param => {
         // Find the AI result for this param (allow flexible matching if AI slightly alters the key)
         const aiResult = (result.params || []).find((res: any) => 
            res.key && (
              res.key.toLowerCase().trim() === param.key.toLowerCase().trim() ||
              res.key.toLowerCase().trim().includes(param.key.toLowerCase().trim()) ||
              param.key.toLowerCase().trim().includes(res.key.toLowerCase().trim())
            )
         );
         
         if (aiResult) {
            return {
               ...aiResult,
               key: param.key, // Always use the original clean key
               expected: param.value // Always use the original expected value
            };
         } else {
            return {
               key: param.key,
               expected: param.value,
               match: false,
               fileResults: []
            };
         }
      });

      console.log('AI raw result:', result);
      console.log('Enriched params:', enrichedParams);
      setPackagingCheckResult({
        params: enrichedParams
      });
      setPackagingCheckStep(3);
    } catch (e) {
      console.error(e);
      setAlertMessage("Lỗi trong quá trình kiểm tra. Vui lòng thử lại.");
    } finally {
      setAppState(AppState.READY);
    }
  };
  const renderConceptWorkflow = () => (
    <div className="space-y-6">
      <StepIndicator current={conceptStep} total={4} labels={['Dữ liệu', 'Ý tưởng', 'Đạo cụ', 'Xuất bản']} />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={conceptStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {conceptStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-white uppercase mb-2">Thông tin sản phẩm</label>
                <div className="grid grid-cols-3 gap-2">
                  <input type="text" placeholder="Tên sản phẩm..." className="col-span-2 bg-[#242526]  border border-[#3E4042] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#1877F2] transition-colors" value={settings.productName} onChange={e => setSettings({...settings, productName: e.target.value})} />
                  <input type="text" placeholder="Mã sản phẩm..." className="bg-[#242526]  border border-[#3E4042] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#1877F2] transition-colors" value={settings.productCode || ''} onChange={e => setSettings({...settings, productCode: e.target.value})} />
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2">
                   {['length', 'width', 'height'].map(f => (
                     <input key={f} type="number" placeholder={f === 'length' ? 'Dài (mm)' : f === 'width' ? 'Rộng (mm)' : 'Cao (mm)'} className="bg-[#242526]  border border-[#3E4042] rounded-lg p-2 text-xs text-white outline-none focus:border-[#1877F2] transition-colors" value={(settings.dimensions as any)[f]} onChange={e => setSettings({...settings, dimensions: {...settings.dimensions, [f]: e.target.value}})} />
                   ))}
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-white uppercase mb-2">Ảnh sản phẩm (Tải 1-5 ảnh)</label>
                <div className="grid grid-cols-5 gap-2">
                   {settings.productImages.map((img, i) => (
                     <div key={i} className="aspect-square bg-[#242526]  border border-[#3E4042] rounded-lg overflow-hidden relative group">
                       <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                       <button onClick={() => setSettings(s => ({...s, productImages: s.productImages.filter((_, idx) => idx !== i)}))} className="absolute inset-0 bg-red-500/80 opacity-0 group-hover:opacity-100 transition-all text-xs flex items-center justify-center text-white">✕</button>
                     </div>
                   ))}
                   {settings.productImages.length < 5 && (
                     <FileDropzone onFilesDrop={(f) => onImageUpload(f, 'product')} onClick={() => productFilesRef.current?.click()} className="aspect-square border-2 border-dashed border-[#3E4042] rounded-lg text-white/40 flex items-center justify-center hover:border-[#1877F2] hover:text-[#1877F2] transition-all">+</FileDropzone>
                   )}
                </div>
                <input type="file" hidden ref={productFilesRef} accept="image/*" multiple onChange={e => onImageUpload(e, 'product')} />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-white uppercase mb-2">Ảnh mẫu style tham khảo</label>
                <FileDropzone onFilesDrop={(f) => onImageUpload(f, 'reference')} onClick={() => refFileRef.current?.click()} className="h-24 w-full bg-[#242526]  border-2 border-dashed border-[#3E4042] rounded-xl flex items-center justify-center cursor-pointer hover:border-[#1877F2] transition-all overflow-hidden group">
                   {settings.referenceImage ? <img src={settings.referenceImage} className="h-full w-full object-contain" referrerPolicy="no-referrer" /> : <span className="text-white text-[10px] font-bold uppercase group-hover:text-[#1877F2]">+ Thêm ảnh mẫu style</span>}
                </FileDropzone>
                <input type="file" hidden ref={refFileRef} accept="image/*" onChange={e => onImageUpload(e, 'reference')} />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-white uppercase mb-2">Mô tả đặc tính vật liệu (Quan trọng để khử CGI)</label>
                <textarea 
                  rows={3}
                  placeholder="Ví dụ: Inox xước hairline mờ, tay cầm nhựa nhám, nắp kính cường lực..."
                  className="w-full bg-[#242526] border border-[#3E4042] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#1877F2] resize-none transition-all placeholder:text-gray-500"
                  value={settings.whiteBGMaterialsDescription || ''}
                  onChange={e => setSettings({...settings, whiteBGMaterialsDescription: e.target.value})}
                />
              </div>

              <button 
                type="button"
                disabled={settings.productImages.length === 0 || isAnalyzingMaterial} 
                onClick={async (e) => {
                  e.preventDefault();
                  if (settings.productImages.length === 0) return;
                  setIsAnalyzingMaterial(true);
                  try {
                    const result = await analyzeProductMaterials(settings.productImages[0]);
                    setSettings(s => ({
                      ...s,
                      whiteBGSelectedCategories: result.categories,
                      whiteBGMaterialsDescription: result.description
                    }));
                  } catch (err: any) {
                    console.error("Auto analyze failed:", err);
                    setAlertMessage("Lỗi phân tích chất liệu. Vui lòng thử lại.");
                  } finally {
                    setIsAnalyzingMaterial(false);
                  }
                }}
                className="w-full py-2 bg-[#2A2B2C] border border-[#1877F2]/30 text-[#1877F2] font-bold rounded-xl text-xs hover:bg-[#1877F2]/10 transition-all flex items-center justify-center gap-2"
              >
                {isAnalyzingMaterial ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                {isAnalyzingMaterial ? 'Đang phân tích chất liệu...' : '✨ Tự động nhận diện chất liệu bằng AI'}
              </button>

              <button type="button" onClick={handleConceptAnalysis} className="w-full py-4 bg-[#1877F2] text-white font-bold rounded-xl uppercase text-xs shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:brightness-110 transition-all">Tiếp tục</button>
            </div>
          )}

          {conceptStep === 2 && (
            <div className="space-y-4">
               <label className="block text-[9px] font-bold text-white uppercase">Chọn Phối cảnh</label>
               <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                 {suggestions.concepts.map((c, idx) => (
                   <button key={idx} onClick={() => setSettings({...settings, concept: c.prompt, conceptTitle: c.title})} className={`w-full text-left p-4 rounded-xl border transition-all ${settings.concept === c.prompt ? 'bg-[#1877F2] text-white border-[#1877F2]' : 'bg-[#242526] shadow-sm text-white border-[#3E4042] text-white hover:bg-[#3A3B3C]'}`}>
                     <div className="font-bold text-[11px] mb-1">{c.title}</div>
                     <div className="text-[10px] leading-relaxed opacity-80 whitespace-pre-line">{c.prompt}</div>
                   </button>
                 ))}
               </div>
               
               <div className="pt-4 border-t border-[#3E4042] space-y-2">
                  <label className="block text-[9px] font-bold text-white uppercase">Chỉnh sửa hoặc mô tả thêm về phối cảnh</label>
                  <textarea 
                    placeholder="Mô tả chi tiết hơn hoặc chỉnh sửa phối cảnh..." 
                    className="w-full bg-[#242526]  border border-[#3E4042] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#1877F2] resize-none h-24 custom-scrollbar" 
                    value={settings.concept} 
                    onChange={e => setSettings({...settings, concept: e.target.value})} 
                  />
               </div>

               <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setConceptStep(1)} className="flex-1 py-4 border border-[#3E4042] text-white rounded-xl uppercase text-[10px] font-bold hover:bg-[#242526] ">Quay lại</button>
                  <button type="button" onClick={handlePropSuggestion} className="flex-[2] py-4 bg-[#1877F2] text-white font-bold rounded-xl uppercase text-xs">Tiếp tục</button>
               </div>
            </div>
          )}

          {conceptStep === 3 && (
            <div className="space-y-5">
              <div className="bg-[#1877F2]/10 p-3 rounded-xl border border-cyan-500/20">
                 <div className="text-[8px] font-bold text-[#1877F2] uppercase mb-1">Phối cảnh đã chọn:</div>
                 <div className="text-[10px] text-white italic">"{settings.concept}"</div>
              </div>

              <div className="space-y-2">
                 <label className="block text-[9px] font-bold text-white uppercase">Vị trí và tỷ lệ sản phẩm</label>
                 <textarea 
                   className="w-full bg-[#242526]  border border-[#3E4042] rounded-xl p-3 text-xs text-white outline-none focus:border-[#1877F2] min-h-[80px] custom-scrollbar"
                   value={settings.placement}
                   onChange={e => setSettings(prev => ({ ...prev, placement: e.target.value }))}
                   placeholder="Nhập vị trí và tỷ lệ sản phẩm..."
                 />
              </div>

              <div>
                 <label className="block text-[9px] font-bold text-white uppercase mb-2">Gợi ý đạo cụ</label>
                 <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto custom-scrollbar">
                    {suggestions.props.map(p => (
                      <button key={p} onClick={() => toggleProp(p)} className={`px-3 py-2 rounded-lg border text-[9px] font-bold transition-all ${settings.props.some(i => i.name === p) ? 'bg-[#1877F2] text-white border-[#1877F2]' : 'bg-[#242526] shadow-sm text-white border-[#3E4042] text-white hover:text-white'}`}>{p}</button>
                    ))}
                 </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#3E4042]">
                 <label className="block text-[9px] font-bold text-white uppercase">Thêm đạo cụ khác</label>
                 <div className="flex gap-2">
                    <input type="text" placeholder="Nhập tên đạo cụ..." className="flex-1 bg-[#242526]  border border-[#3E4042] rounded-xl px-4 text-xs text-white outline-none focus:border-[#1877F2]" value={customProp} onChange={e => setCustomProp(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustomPropToList()} />
                    <button type="button" onClick={addCustomPropToList} className="px-5 bg-[#3A3B3C] rounded-xl text-white font-bold hover:bg-[#242526]/20 transition-all">+</button>
                 </div>
              </div>

              <div className="flex gap-2">
                  <button type="button" onClick={() => setConceptStep(2)} className="flex-1 py-4 border border-[#3E4042] text-white rounded-xl uppercase text-[10px] font-bold hover:bg-[#242526] ">Quay lại</button>
                  <button type="button" onClick={() => setConceptStep(4)} className="flex-[2] py-4 bg-[#1877F2] text-white font-bold rounded-xl uppercase text-xs">Tiếp tục</button>
              </div>
            </div>
          )}

          {conceptStep === 4 && renderCameraSettings(() => setConceptStep(3))}
        </motion.div>
      </AnimatePresence>
    </div>
  );

  // 2. Xây dựng phối cảnh Workflow (Real Scene Staging)
  const renderStagingWorkflow = () => {
    const displayedProps = Array.from(new Set([...suggestions.props, ...settings.props.map(p => p.name)]));
    return (
      <div className="space-y-6">
        <StepIndicator current={stagingStep} total={5} labels={['Ý tưởng', 'Hiện trạng', 'Style', 'Đạo cụ', 'Xuất bản']} />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={stagingStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {stagingStep === 1 && (
                <div className="space-y-4">
                    <label className="block text-[9px] font-bold text-white uppercase">Mô tả ý tưởng trang trí</label>
                    <textarea className="w-full h-32 bg-[#242526]  border border-[#3E4042] rounded-xl px-4 py-3 text-sm text-white focus:border-[#1877F2] outline-none resize-none transition-colors custom-scrollbar" placeholder="VD: Phòng khách hiện đại với sofa xám, ánh sáng nắng chiều len lỏi qua cửa sổ..." value={settings.concept} onChange={e => setSettings({...settings, concept: e.target.value})} />
                    <button onClick={() => settings.concept ? setStagingStep(2) : setAlertMessage("Thiếu mô tả!")} className="w-full py-4 bg-[#1877F2] text-white font-bold rounded-xl uppercase text-xs shadow-[0_0_20px_rgba(34,211,238,0.2)]">Tiếp tục</button>
                </div>
            )}
            {stagingStep === 2 && (
                <div className="space-y-4">
                    <label className="block text-[9px] font-bold text-white uppercase">Tải lên ảnh hiện trạng</label>
                    <FileDropzone onFilesDrop={(f) => onImageUpload(f, 'product')} onClick={() => productFilesRef.current?.click()} className="aspect-video w-full bg-[#242526]  border-2 border-dashed border-[#3E4042] rounded-xl flex items-center justify-center cursor-pointer overflow-hidden relative group hover:border-[#1877F2] transition-all">
                        {settings.productImages[0] ? <img src={settings.productImages[0]} className="w-full h-full object-contain" referrerPolicy="no-referrer" /> : <span className="text-white font-bold uppercase text-[10px] group-hover:text-[#1877F2]">+ Ảnh thực tế</span>}
                    </FileDropzone>
                    <input type="file" hidden ref={productFilesRef} accept="image/*" onChange={e => onImageUpload(e, 'product')} />

                    <div>
                      <label className="block text-[9px] font-bold text-white uppercase mb-2">Mô tả đặc tính vật liệu (Quan trọng để khử CGI)</label>
                      <textarea 
                        rows={3}
                        placeholder="Ví dụ: Inox xước hairline mờ, tay cầm nhựa nhám, nắp kính cường lực..."
                        className="w-full bg-[#242526] border border-[#3E4042] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#1877F2] resize-none transition-all placeholder:text-gray-500"
                        value={settings.whiteBGMaterialsDescription || ''}
                        onChange={e => setSettings({...settings, whiteBGMaterialsDescription: e.target.value})}
                      />
                    </div>

                    <button 
                      type="button"
                      disabled={settings.productImages.length === 0 || isAnalyzingMaterial} 
                      onClick={async (e) => {
                        e.preventDefault();
                        if (settings.productImages.length === 0) return;
                        setIsAnalyzingMaterial(true);
                        try {
                          const result = await analyzeProductMaterials(settings.productImages[0]);
                          setSettings(s => ({
                            ...s,
                            whiteBGSelectedCategories: result.categories,
                            whiteBGMaterialsDescription: result.description
                          }));
                        } catch (err: any) {
                          console.error("Auto analyze failed:", err);
                          setAlertMessage("Lỗi phân tích chất liệu. Vui lòng thử lại.");
                        } finally {
                          setIsAnalyzingMaterial(false);
                        }
                      }}
                      className="w-full py-2 bg-[#2A2B2C] border border-[#1877F2]/30 text-[#1877F2] font-bold rounded-xl text-xs hover:bg-[#1877F2]/10 transition-all flex items-center justify-center gap-2"
                    >
                      {isAnalyzingMaterial ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                      {isAnalyzingMaterial ? 'Đang phân tích chất liệu...' : '✨ Tự động nhận diện chất liệu bằng AI'}
                    </button>

                    <div className="flex gap-2">
                      <button type="button" onClick={() => setStagingStep(1)} className="flex-1 py-4 border border-[#3E4042] text-white rounded-xl text-[10px] font-bold hover:bg-[#242526] ">Quay lại</button>
                      <button type="button" onClick={() => settings.productImages[0] ? setStagingStep(3) : setAlertMessage("Thiếu ảnh!")} className="flex-[2] py-4 bg-[#1877F2] text-white font-bold rounded-xl uppercase text-xs">Tiếp tục</button>
                    </div>
                </div>
            )}
            {stagingStep === 3 && (
                <div className="space-y-4">
                    <label className="block text-[9px] font-bold text-white uppercase">Ảnh mẫu phong cách tham khảo</label>
                    <FileDropzone onFilesDrop={(f) => onImageUpload(f, 'reference')} onClick={() => refFileRef.current?.click()} className="aspect-video w-full bg-[#242526]  border-2 border-dashed border-[#3E4042] rounded-xl flex items-center justify-center cursor-pointer overflow-hidden relative group hover:border-[#1877F2] transition-all">
                        {settings.referenceImage ? <img src={settings.referenceImage} className="w-full h-full object-contain" referrerPolicy="no-referrer" /> : <span className="text-white font-bold uppercase text-[10px] group-hover:text-[#1877F2]">+ Ảnh mẫu phong cách</span>}
                    </FileDropzone>
                    <input type="file" hidden ref={refFileRef} accept="image/*" onChange={e => onImageUpload(e, 'reference')} />
                    <div className="flex gap-2">
                      <button onClick={() => setStagingStep(2)} className="flex-1 py-4 border border-[#3E4042] text-white rounded-xl text-[10px] font-bold hover:bg-[#242526] ">Quay lại</button>
                      <button onClick={handleStagingAnalysis} className="flex-[2] py-4 bg-[#1877F2] text-white font-bold rounded-xl uppercase text-xs">AI Phân tích</button>
                    </div>
                </div>
            )}
            {stagingStep === 4 && (
                <div className="space-y-4">
                    <label className="block text-[9px] font-bold text-white uppercase">Gợi ý đạo cụ phối cảnh</label>
                    <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                       {displayedProps.map(p => (
                         <button key={p} onClick={() => toggleProp(p)} className={`px-3 py-2 rounded-lg border text-[9px] font-bold transition-all ${settings.props.some(i => i.name === p) ? 'bg-[#1877F2] text-white border-[#1877F2]' : 'bg-[#242526] shadow-sm text-white border-[#3E4042] text-white hover:text-white'}`}>{p}</button>
                       ))}
                    </div>
                    <div className="flex gap-2 mt-4 pt-4 border-t border-[#3E4042]">
                       <input type="text" placeholder="Thêm vật phẩm khác..." className="flex-1 bg-[#242526]  border border-[#3E4042] rounded-xl px-4 text-xs text-white outline-none focus:border-[#1877F2]" value={customProp} onChange={e => setCustomProp(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustomPropToList()} />
                       <button type="button" onClick={addCustomPropToList} className="px-5 bg-[#3A3B3C] rounded-xl text-white font-bold hover:bg-[#242526]/20 transition-all">+</button>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button onClick={() => setStagingStep(3)} className="flex-1 py-4 border border-[#3E4042] text-white rounded-xl text-[10px] font-bold hover:bg-[#242526] ">Quay lại</button>
                      <button onClick={() => setStagingStep(5)} className="flex-[2] py-4 bg-[#1877F2] text-white font-bold rounded-xl uppercase text-xs">Tiếp tục</button>
                    </div>
                </div>
            )}
            {stagingStep === 5 && (
                <div className="space-y-5">
                   <div className="bg-[#242526]  rounded-xl p-4 border border-[#3E4042] space-y-2 text-center">
                       <h3 className="font-bold text-white text-sm">Sẵn sàng dựng phối cảnh</h3>
                       <p className="text-[10px] text-white">Concept: {settings.concept.substring(0, 30)}... | Props: {settings.props.length}</p>
                   </div>
                   {renderModelSelection()}
                   <button onClick={() => startGeneration()} className="w-full py-4 bg-[#1877F2] text-white font-bold rounded-xl uppercase text-xs shadow-xl">Tạo ảnh</button>
                </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  };

  // 3. Ảnh USP công nghệ Workflow (Tech USP Visual)
  const renderTechWorkflow = () => (
    <div className="space-y-6">
      <StepIndicator current={techStep} total={5} labels={['Dữ liệu', 'Kích thước', 'Ý tưởng', 'Visual', 'Xuất bản']} />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={techStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {techStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <input type="text" placeholder="Tên sản phẩm..." className="col-span-2 bg-[#242526]  border border-[#3E4042] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#1877F2] transition-colors" value={settings.productName} onChange={e => setSettings({...settings, productName: e.target.value})} />
                <input type="text" placeholder="Mã sản phẩm..." className="bg-[#242526]  border border-[#3E4042] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#1877F2] transition-colors" value={settings.productCode || ''} onChange={e => setSettings({...settings, productCode: e.target.value})} />
              </div>
              <textarea placeholder="Mô tả tính năng kỹ thuật..." className="w-full h-24 bg-[#242526]  border border-[#3E4042] rounded-xl px-4 py-3 text-sm text-white resize-none outline-none focus:border-[#1877F2] transition-colors custom-scrollbar" value={settings.techDescription} onChange={e => setSettings({...settings, techDescription: e.target.value})} />
              <FileDropzone onFilesDrop={(f) => onImageUpload(f, 'product')} onClick={() => productFilesRef.current?.click()} className="h-32 w-full bg-[#242526]  border-2 border-dashed border-[#3E4042] rounded-xl flex items-center justify-center cursor-pointer overflow-hidden group hover:border-[#1877F2] transition-all">
                {settings.productImages.length > 0 ? <img src={settings.productImages[0]} className="h-full object-contain" referrerPolicy="no-referrer" /> : <span className="text-white text-xs font-bold uppercase group-hover:text-[#1877F2]">+ Ảnh SP</span>}
              </FileDropzone>
              <input type="file" hidden ref={productFilesRef} accept="image/*" multiple onChange={e => onImageUpload(e, 'product')} />
              <button onClick={() => (settings.productName && settings.techDescription) ? setTechStep(2) : setAlertMessage("Thiếu thông tin")} className="w-full py-4 bg-[#1877F2] text-white font-bold rounded-xl uppercase text-xs">Tiếp tục</button>
            </div>
          )}

          {techStep === 2 && (
            <div className="space-y-4">
              <label className="block text-[9px] font-bold text-white uppercase">Kích thước sản phẩm</label>
              <div className="grid grid-cols-3 gap-3">
                 {['length', 'width', 'height'].map(f => (
                   <input key={f} type="number" placeholder={f === 'length' ? 'Dài (mm)' : f === 'width' ? 'Rộng (mm)' : 'Cao (mm)'} className="bg-[#242526]  border border-[#3E4042] rounded-lg p-3 text-xs text-white outline-none focus:border-[#1877F2] transition-colors" value={(settings.dimensions as any)[f]} onChange={e => setSettings({...settings, dimensions: {...settings.dimensions, [f]: e.target.value}})} />
                 ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setTechStep(1)} className="flex-1 py-4 border border-[#3E4042] text-white rounded-xl text-[10px] font-bold hover:bg-[#242526] ">Quay lại</button>
                <button onClick={handleTechAnalysis} className="flex-[2] py-4 bg-[#1877F2] text-white font-bold rounded-xl uppercase text-xs">AI Thiết kế Visual</button>
              </div>
            </div>
          )}

          {techStep === 3 && (
            <div className="space-y-4">
               <label className="block text-[9px] font-bold text-white uppercase">Chọn Tech Concept</label>
               <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                 {suggestions.concepts.map((c, idx) => (
                   <button key={idx} onClick={() => setSettings({...settings, concept: c.prompt})} className={`w-full text-left p-3 rounded-xl border transition-all ${settings.concept === c.prompt ? 'bg-[#1877F2] text-white border-[#1877F2]' : 'bg-[#242526] shadow-sm text-white border-[#3E4042] text-white hover:bg-[#3A3B3C]'}`}>
                     <div className="font-bold text-[11px] mb-1">{c.title}</div>
                     <div className="text-[10px] leading-relaxed opacity-80 whitespace-pre-line">{c.prompt}</div>
                   </button>
                 ))}
               </div>
               <div className="pt-4 border-t border-[#3E4042] space-y-2">
                  <input type="text" placeholder="Tự nhập tech concept..." className="w-full bg-[#242526]  border border-[#3E4042] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#1877F2]" value={customConcept} onChange={e => setCustomConcept(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustomConceptToList()} />
                  <button onClick={addCustomConceptToList} className="w-full py-2 bg-[#3A3B3C] rounded-lg text-white text-[10px] hover:bg-[#242526]/20">Thêm vào danh sách</button>
               </div>
               <div className="flex gap-2">
                 <button onClick={() => setTechStep(2)} className="flex-1 py-4 border border-[#3E4042] text-white rounded-xl text-[10px] font-bold hover:bg-[#242526] ">Quay lại</button>
                 <button onClick={handleTechVisualSuggestion} className="flex-[2] py-4 bg-[#1877F2] text-white font-bold rounded-xl uppercase text-xs">Tiếp tục</button>
               </div>
            </div>
          )}

          {techStep === 4 && (
            <div className="space-y-4">
              <div className="space-y-2">
                 <label className="block text-[9px] font-bold text-white uppercase">Vị trí và tỷ lệ sản phẩm</label>
                 <textarea 
                   className="w-full bg-[#242526]  border border-[#3E4042] rounded-xl p-3 text-xs text-white outline-none focus:border-[#1877F2] min-h-[80px] custom-scrollbar"
                   value={settings.placement}
                   onChange={e => setSettings(prev => ({ ...prev, placement: e.target.value }))}
                   placeholder="Nhập vị trí và tỷ lệ sản phẩm..."
                 />
              </div>

              <label className="block text-[9px] font-bold text-white uppercase">Visual Elements</label>
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                {suggestions.props.map(p => (
                  <button key={p} onClick={() => toggleProp(p)} className={`px-3 py-2 rounded-lg border text-[9px] font-bold transition-all ${settings.props.some(i => i.name === p) ? 'bg-[#1877F2] text-white border-[#1877F2]' : 'bg-[#242526] shadow-sm text-white border-[#3E4042] text-white hover:text-white'}`}>{p}</button>
                ))}
              </div>
              <div className="pt-4 border-t border-[#3E4042] space-y-2">
                 <div className="flex gap-2">
                    <input type="text" placeholder="Thêm visual element..." className="flex-1 bg-[#242526]  border border-[#3E4042] rounded-xl px-4 text-xs text-white outline-none focus:border-[#1877F2]" value={customProp} onChange={e => setCustomProp(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustomPropToList()} />
                    <button type="button" onClick={addCustomPropToList} className="px-5 bg-[#3A3B3C] rounded-xl text-white font-bold hover:bg-[#242526]/20 transition-all">+</button>
                 </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setTechStep(3)} className="flex-1 py-4 border border-[#3E4042] text-white rounded-xl text-[10px] font-bold hover:bg-[#242526] ">Quay lại</button>
                <button onClick={() => setTechStep(5)} className="flex-[2] py-4 bg-[#1877F2] text-white font-bold rounded-xl uppercase text-xs">Tiếp tục</button>
              </div>
            </div>
          )}

          {techStep === 5 && renderCameraSettings(() => setTechStep(4))}
        </motion.div>
      </AnimatePresence>
    </div>
  );

  // 4. Làm màu sản phẩm Workflow
  const renderColorWorkflow = () => (
    <div className="space-y-6">
      <StepIndicator current={colorChangeStep} total={3} labels={['Dữ liệu', 'Màu sắc', 'Xuất bản']} />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={colorChangeStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {colorChangeStep === 1 && (
            <div className="space-y-4">
              <input type="text" placeholder="Tên SP..." className="w-full bg-[#242526]  border border-[#3E4042] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#1877F2] transition-colors" value={settings.productName} onChange={e => setSettings({...settings, productName: e.target.value})} />
              
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-white uppercase">Ảnh sản phẩm gốc</label>
                <FileDropzone onFilesDrop={(f) => onImageUpload(f, 'product')} onClick={() => productFilesRef.current?.click()} className="h-40 w-full bg-[#242526]  border-2 border-dashed border-[#3E4042] rounded-2xl flex items-center justify-center cursor-pointer overflow-hidden group hover:border-[#1877F2] transition-all">
                  {settings.productImages[0] ? <img src={settings.productImages[0]} className="h-full object-contain" referrerPolicy="no-referrer" /> : <span className="text-white font-bold text-xs uppercase group-hover:text-[#1877F2]">+ Ảnh gốc</span>}
                </FileDropzone>
                <input type="file" hidden ref={productFilesRef} accept="image/*" onChange={e => onImageUpload(e, 'product')} />
              </div>
              <button disabled={!settings.productImages[0]} onClick={() => setColorChangeStep(2)} className="w-full py-4 bg-[#1877F2] text-white font-bold rounded-xl uppercase text-xs disabled:opacity-50">Tiếp tục</button>
            </div>
          )}

          {colorChangeStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-white uppercase">Danh sách thay đổi màu</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                    {settings.colorChanges.map((c, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-[#242526]  rounded-xl border border-white/5 text-[10px]">
                        <div className="flex items-center gap-3">
                          {c.sampleImage && <img src={c.sampleImage} className="w-8 h-8 rounded object-cover border border-[#3E4042]" referrerPolicy="no-referrer" />}
                          <div>
                            <div className="font-bold text-white">{c.partName}</div>
                            <div className="text-white">{c.pantoneCode || 'Không có mã Pantone'}</div>
                          </div>
                        </div>
                        <button onClick={()=>setSettings(s=>({...s, colorChanges:s.colorChanges.filter((_,idx)=>idx!==i)}))} className="text-red-400 hover:text-red-300">✕</button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-[#242526]  p-4 rounded-2xl border border-[#3E4042] space-y-3">
                      <div className="text-[9px] font-bold text-[#1877F2] uppercase mb-1">Thêm vị trí đổi màu</div>
                      <input type="text" placeholder="Vị trí (VD: Thân vỏ, Nắp chai...)" className="w-full bg-[#242526] shadow-sm border border-[#3E4042] border border-[#3E4042] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#1877F2]" value={currentColorPart} onChange={e=>setCurrentColorPart(e.target.value)} />
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <label className="block text-[8px] font-bold text-white uppercase">Mã Pantone (Tùy chọn)</label>
                          <input type="text" placeholder="VD: Pantone 18-1662" className="w-full bg-[#242526] shadow-sm border border-[#3E4042] border border-[#3E4042] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#1877F2]" value={currentPantoneCode} onChange={e=>setCurrentPantoneCode(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-[8px] font-bold text-white uppercase">Ảnh mẫu màu</label>
                          <FileDropzone onFilesDrop={(f) => onImageUpload(f, 'color_sample')} onClick={() => colorSampleRef.current?.click()} className="h-[38px] w-full bg-[#242526] shadow-sm border border-[#3E4042] border border-dashed border-[#3E4042] rounded-lg flex items-center justify-center cursor-pointer overflow-hidden group hover:border-[#1877F2] transition-all">
                            {currentSampleImage ? <img src={currentSampleImage} className="h-full object-cover w-full" referrerPolicy="no-referrer" /> : <span className="text-[8px] text-white uppercase group-hover:text-[#1877F2]">+ Tải ảnh</span>}
                          </FileDropzone>
                          <input type="file" hidden ref={colorSampleRef} accept="image/*" onChange={e => onImageUpload(e, 'color_sample')} />
                        </div>
                      </div>

                      <textarea placeholder="Mô tả thêm (VD: Màu đỏ nhám, hiệu ứng kim loại...)" className="w-full bg-[#242526] shadow-sm border border-[#3E4042] border border-[#3E4042] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#1877F2] h-16 resize-none custom-scrollbar" value={currentColorDescription} onChange={e=>setCurrentColorDescription(e.target.value)} />

                      <button 
                        onClick={()=>{
                          if(currentColorPart){
                            setSettings(s=>({...s, colorChanges:[...s.colorChanges, {
                              partName: currentColorPart, 
                              pantoneCode: currentPantoneCode,
                              description: currentColorDescription,
                              sampleImage: currentSampleImage || undefined
                            }]})); 
                            setCurrentColorPart('');
                            setCurrentPantoneCode('');
                            setCurrentColorDescription('');
                            setCurrentSampleImage(null);
                          }
                        }} 
                        className="w-full py-2 bg-[#3A3B3C] hover:bg-[#242526]/20 rounded-lg text-[10px] font-bold text-white transition-all"
                      >
                        + Thêm vào danh sách
                      </button>
                  </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setColorChangeStep(1)} className="flex-1 py-4 border border-[#3E4042] text-white rounded-xl text-[10px] font-bold hover:bg-[#242526] ">Quay lại</button>
                <button onClick={() => setColorChangeStep(3)} className="flex-[2] py-4 bg-[#1877F2] text-white font-bold rounded-xl uppercase text-xs">Tiếp tục</button>
              </div>
            </div>
          )}

          {colorChangeStep === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-white uppercase">Tỉ lệ khung hình</label>
                  <select className="w-full bg-[#242526]  border border-[#3E4042] rounded-lg p-2 text-[10px] text-white outline-none focus:border-[#1877F2]" value={settings.aspectRatio} onChange={e => setSettings({...settings, aspectRatio: e.target.value as AspectRatio})}>
                    {['1:1', '3:4', '4:3', '9:16', '16:9', '1:4', '4:1'].map(r => <option key={r} value={r} className="bg-[#242526]">{r}</option>)}
                  </select>
                </div>
              </div>

              {renderModelSelection()}

              <div className="flex gap-2">
                <button onClick={() => setColorChangeStep(2)} className="flex-1 py-4 border border-[#3E4042] text-white rounded-xl text-[10px] font-bold hover:bg-[#242526] ">Quay lại</button>
                <button onClick={() => startGeneration()} className="flex-[2] py-4 bg-[#1877F2] text-white font-bold rounded-xl uppercase text-xs shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all">Tạo ảnh</button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );

  // 5. Dựng mockup bao bì Workflow (Packaging Mockup)
  const renderPackagingWorkflow = () => (
    <div className="space-y-6">
      <StepIndicator current={packagingStep} total={3} labels={['Dữ liệu', 'Thiết kế', 'Xuất bản']} />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={packagingStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {packagingStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <input type="text" placeholder="Tên sản phẩm..." className="col-span-2 bg-[#242526]  border border-[#3E4042] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#1877F2] transition-colors" value={settings.productName} onChange={e => setSettings({...settings, productName: e.target.value})} />
                <input type="text" placeholder="Mã sản phẩm..." className="bg-[#242526]  border border-[#3E4042] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#1877F2] transition-colors" value={settings.productCode || ''} onChange={e => setSettings({...settings, productCode: e.target.value})} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                 {['length', 'width', 'height'].map(f => (
                   <input key={f} type="number" placeholder={f === 'length' ? 'Dài (mm)' : f === 'width' ? 'Rộng (mm)' : 'Cao (mm)'} className="bg-[#242526]  border border-[#3E4042] rounded-lg p-2 text-xs text-white outline-none focus:border-[#1877F2] transition-colors" value={(settings.dimensions as any)[f]} onChange={e => setSettings({...settings, dimensions: {...settings.dimensions, [f]: e.target.value}})} />
                 ))}
              </div>
              <select className="w-full bg-[#242526]  border border-[#3E4042] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#1877F2]" value={settings.packagingMaterial} onChange={e => setSettings({...settings, packagingMaterial: e.target.value as any})}>
                 <option value="COLOR_BOX" className="bg-[#242526]">Hộp giấy màu</option>
                 <option value="CARTON_BW" className="bg-[#242526]">Thùng Carton</option>
              </select>
              <button onClick={() => setPackagingStep(2)} className="w-full py-4 bg-[#1877F2] text-white font-bold rounded-xl uppercase text-xs">Tiếp tục</button>
            </div>
          )}
          {packagingStep === 2 && (
            <div className="space-y-4">
               <label className="block text-[9px] font-bold text-white uppercase">File thiết kế phẳng</label>
               <FileDropzone onFilesDrop={(f) => { pendingPackagingFace.current = 'flat'; onImageUpload(f, 'packaging'); }} onClick={() => { pendingPackagingFace.current = 'flat'; packagingFileRef.current?.click(); }} className="h-40 bg-[#242526]  border-2 border-dashed border-[#3E4042] rounded-xl flex items-center justify-center cursor-pointer overflow-hidden group hover:border-[#1877F2] transition-all">
                 {settings.packagingFaces.flat ? <img src={settings.packagingFaces.flat} className="h-full object-contain" referrerPolicy="no-referrer" /> : <span className="text-white text-xs font-bold uppercase group-hover:text-[#1877F2]">+ File thiết kế phẳng</span>}
               </FileDropzone>
               <input type="file" hidden ref={packagingFileRef} onChange={e => onImageUpload(e, 'packaging')} />
               <div className="flex gap-2">
                 <button onClick={() => setPackagingStep(1)} className="flex-1 py-4 border border-[#3E4042] text-white rounded-xl text-[10px] font-bold hover:bg-[#242526] ">Quay lại</button>
                 <button onClick={() => setPackagingStep(3)} className="flex-[2] py-4 bg-[#1877F2] text-white font-bold rounded-xl uppercase text-xs">Tiếp tục</button>
               </div>
            </div>
          )}
          {packagingStep === 3 && (
            <div className="space-y-4">
               <label className="block text-[9px] font-bold text-white uppercase">Kiểu xuất bản</label>
               <select className="w-full bg-[#242526]  border border-[#3E4042] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#1877F2]" value={settings.packagingOutputStyle} onChange={e => setSettings({...settings, packagingOutputStyle: e.target.value as any})}>
                 <option value="WHITE_BG_ROTATED" className="bg-[#242526]">Nền trắng xoay</option>
                 <option value="CONTEXTUAL" className="bg-[#242526]">Lifestyle Context</option>
               </select>
               {renderModelSelection()}
               <div className="flex gap-2">
                 <button onClick={() => setPackagingStep(2)} className="flex-1 py-4 border border-[#3E4042] text-white rounded-xl text-[10px] font-bold hover:bg-[#242526] ">Quay lại</button>
                 <button onClick={() => startGeneration()} className="flex-[2] py-4 bg-[#1877F2] text-white font-bold rounded-xl uppercase text-xs">Tạo ảnh</button>
               </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );

  // 6. Xử lý chữ ký hình ảnh Workflow (Tech Effects)
  const renderTechEffectsWorkflow = () => (
    <div className="space-y-6">
      <StepIndicator current={techEffectStep} total={2} labels={['Chế độ', 'Xuất bản']} />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={techEffectStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {techEffectStep === 0 && (
            <div className="space-y-4">
              <label className="block text-[10px] font-bold text-white uppercase">Chọn chế độ xử lý</label>
              <div className="flex gap-2">
                 <button onClick={() => { setSettings({...settings, techEffectType: 'REMOVE_SIGNATURE'}); setTechEffectStep(1); }} className={`flex-1 py-4 rounded-xl text-[10px] font-bold border transition-all ${settings.techEffectType === 'REMOVE_SIGNATURE' ? 'bg-[#1877F2] text-white border-[#1877F2]' : 'bg-[#242526] shadow-sm text-white border-[#3E4042] text-white hover:bg-[#3A3B3C]'}`}>Xóa chữ ký</button>
                 <button onClick={() => { setSettings({...settings, techEffectType: 'SEA_TECH_GENERATION'}); setTechEffectStep(1); }} className={`flex-1 py-4 rounded-xl text-[10px] font-bold border transition-all ${settings.techEffectType === 'SEA_TECH_GENERATION' ? 'bg-[#1877F2] text-white border-[#1877F2]' : 'bg-[#242526] shadow-sm text-white border-[#3E4042] text-white hover:bg-[#3A3B3C]'}`}>Biển đêm</button>
              </div>
            </div>
          )}

          {techEffectStep === 1 && (
            <div className="space-y-4">
              {settings.techEffectType === 'REMOVE_SIGNATURE' ? (
                <div className="space-y-4">
                   <label className="block text-[10px] font-bold text-white uppercase">Ảnh cần xử lý</label>
                   <FileDropzone onFilesDrop={(f) => onImageUpload(f, 'reference')} onClick={() => refFileRef.current?.click()} className="h-48 bg-[#242526]  border-2 border-dashed border-[#3E4042] rounded-xl flex items-center justify-center cursor-pointer overflow-hidden group hover:border-[#1877F2] transition-all">
                     {settings.referenceImage ? <img src={settings.referenceImage} className="h-full w-full object-contain" referrerPolicy="no-referrer" /> : <span className="text-white text-xs font-bold uppercase group-hover:text-[#1877F2]">+ Tải ảnh</span>}
                   </FileDropzone>
                   <input type="file" hidden ref={refFileRef} accept="image/*" onChange={e => onImageUpload(e, 'reference')} />
                   {renderModelSelection()}
                   <div className="flex gap-2">
                     <button onClick={() => setTechEffectStep(0)} className="flex-1 py-4 border border-[#3E4042] text-white rounded-xl text-[10px] font-bold hover:bg-[#242526] ">Quay lại</button>
                     <button onClick={() => startGeneration()} className="flex-[2] py-4 bg-[#1877F2] text-white font-bold rounded-xl uppercase text-xs">Tạo ảnh</button>
                   </div>
                </div>
              ) : (
                <div className="space-y-4">
                   <input type="text" placeholder="Tên SP..." className="w-full bg-[#242526]  border border-[#3E4042] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#1877F2]" value={settings.productName} onChange={e => setSettings({...settings, productName: e.target.value})} />
                   <input type="text" placeholder="Tiêu đề..." className="w-full bg-[#242526]  border border-[#3E4042] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#1877F2]" value={settings.techTitle} onChange={e => setSettings({...settings, techTitle: e.target.value})} />
                   <div className="flex gap-2">
                     <button onClick={() => setTechEffectStep(0)} className="flex-1 py-4 border border-[#3E4042] text-white rounded-xl text-[10px] font-bold hover:bg-[#242526] ">Quay lại</button>
                     <button onClick={handleSeaConceptSuggestion} className="flex-[2] py-4 bg-[#1877F2] text-white font-bold rounded-xl uppercase text-xs">Concept</button>
                   </div>
                </div>
              )}
            </div>
          )}

          {techEffectStep === 3 && (
            <div className="space-y-4">
               <label className="block text-[10px] font-bold text-white uppercase">Chọn Concept</label>
               <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                 {suggestions.concepts.map((c, idx) => (
                   <button key={idx} onClick={() => setSettings({...settings, selectedTechConcept: c.prompt})} className={`w-full text-left p-3 rounded-xl border transition-all ${settings.selectedTechConcept === c.prompt ? 'bg-[#1877F2] text-white border-[#1877F2]' : 'bg-[#242526] shadow-sm text-white border-[#3E4042] text-white hover:bg-[#3A3B3C]'}`}>
                     <div className="font-bold text-[11px] mb-1">{c.title}</div>
                     <div className="text-[10px] leading-relaxed opacity-80 whitespace-pre-line">{c.prompt}</div>
                   </button>
                 ))}
               </div>
               {renderModelSelection()}
               <div className="flex gap-2">
                 <button onClick={() => setTechEffectStep(1)} className="flex-1 py-4 border border-[#3E4042] text-white rounded-xl text-[10px] font-bold hover:bg-[#242526] ">Quay lại</button>
                 <button onClick={() => startGeneration()} className="flex-[2] py-4 bg-[#1877F2] text-white font-bold rounded-xl uppercase text-xs">Tạo ảnh</button>
               </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );

  // 7. Làm ảnh nền trắng Workflow (White BG Retouch)
  const renderWhiteBgRetouchWorkflow = () => (
    <div className="space-y-6">
      <StepIndicator current={whiteBgStep} total={2} labels={['Dữ liệu', 'Thiết lập kích thước & tạo ảnh']} />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={whiteBgStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {whiteBgStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-white uppercase mb-2">Thông tin sản phẩm</label>
                <div className="grid grid-cols-3 gap-2">
                  <input type="text" placeholder="Tên sản phẩm..." className="col-span-2 bg-[#242526]  border border-[#3E4042] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#1877F2] transition-colors" value={settings.productName} onChange={e => setSettings({...settings, productName: e.target.value})} />
                  <input type="text" placeholder="Mã sản phẩm..." className="bg-[#242526]  border border-[#3E4042] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#1877F2] transition-colors" value={settings.productCode || ''} onChange={e => setSettings({...settings, productCode: e.target.value})} />
                </div>
              </div>
              
              <div>
                <label className="block text-[9px] font-bold text-white uppercase mb-2">Các chất liệu có trong sản phẩm (Tích chọn nhiều)</label>
                <div className="grid grid-cols-2 gap-2 bg-[#242526]/50 border border-white/5 p-3 rounded-xl">
                  {[
                    { id: 'METAL', label: 'Kim loại (Inox, Thép, Nhôm...)' },
                    { id: 'PLASTIC', label: 'Nhựa & Polymer (ABS, Silicon...)' },
                    { id: 'GLASS', label: 'Thủy tinh & Trong suốt' },
                    { id: 'CERAMIC', label: 'Gốm sứ & Chống dính' },
                  ].map(item => {
                    const selectedList = settings.whiteBGSelectedCategories || [];
                    const checked = selectedList.includes(item.id);
                    return (
                      <label key={item.id} className="flex items-center gap-2 px-3 py-2 bg-[#242526] hover:bg-[#3A3B3C] border border-[#3E4042] rounded-lg cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            const nextList = checked 
                              ? selectedList.filter(c => c !== item.id)
                              : [...selectedList, item.id];
                            setSettings({...settings, whiteBGSelectedCategories: nextList});
                          }}
                          className="accent-[#1877F2] rounded w-4 h-4 cursor-pointer"
                        />
                        <span className="text-[10px] text-white select-none">{item.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-white uppercase mb-2">Mô tả vị trí & đặc tính các vật liệu</label>
                <textarea 
                  rows={3}
                  placeholder="Ví dụ: Thân ấm làm từ thép không gỉ sáng bóng, quai cầm và nắp dùng nhựa ABS đen mờ, chân dán tem kim loại..."
                  className="w-full bg-[#242526] border border-[#3E4042] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#1877F2] resize-none transition-all placeholder:text-gray-500"
                  value={settings.whiteBGMaterialsDescription || ''}
                  onChange={e => setSettings({...settings, whiteBGMaterialsDescription: e.target.value})}
                />
                <p className="text-[8px] text-gray-400 mt-1">Thông tin bổ sung này giúp AI nhận diện chuẩn hóa bối cảnh ánh sáng phản xạ thích hợp cực kỳ thông minh.</p>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-white uppercase mb-2">Ảnh sản phẩm gốc</label>
                <FileDropzone onFilesDrop={(f) => onImageUpload(f, 'reference')} onClick={() => refFileRef.current?.click()} className="h-48 bg-[#242526]  border-2 border-dashed border-[#3E4042] rounded-xl flex items-center justify-center cursor-pointer overflow-hidden group relative hover:border-[#1877F2] transition-all">
                   {settings.referenceImage ? (
                     <>
                       <img src={settings.referenceImage} className="h-full w-full object-contain" referrerPolicy="no-referrer" />
                       <div className="absolute inset-0 bg-[#242526] shadow-sm opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-xs font-bold">Thay ảnh</div>
                     </>
                   ) : <span className="text-white text-xs font-bold uppercase group-hover:text-[#1877F2]">+ Tải ảnh SP gốc</span>}
                </FileDropzone>
                <input type="file" hidden ref={refFileRef} accept="image/*" onChange={e => onImageUpload(e, 'reference')} />
              </div>
              
              <button 
                type="button"
                disabled={!settings.referenceImage || appState !== AppState.READY || isAnalyzingMaterial} 
                onClick={async (e) => {
                  e.preventDefault();
                  if (!settings.referenceImage) return;
                  setIsAnalyzingMaterial(true);
                  try {
                    const result = await analyzeProductMaterials(settings.referenceImage);
                    setSettings(s => ({
                      ...s,
                      whiteBGSelectedCategories: result.categories,
                      whiteBGMaterialsDescription: result.description
                    }));
                  } catch (err: any) {
                    console.error("Auto analyze failed:", err);
                    setAlertMessage("Lỗi phân tích chất liệu. Vui lòng thử lại.");
                  } finally {
                    setIsAnalyzingMaterial(false);
                  }
                }}
                className="w-full py-2 bg-[#2A2B2C] border border-[#1877F2]/30 text-[#1877F2] font-bold rounded-xl text-xs hover:bg-[#1877F2]/10 transition-all flex items-center justify-center gap-2"
              >
                {isAnalyzingMaterial ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                {isAnalyzingMaterial ? 'Đang phân tích chất liệu...' : '✨ Tự động nhận diện chất liệu bằng AI'}
              </button>
              
              <button 
                type="button"
                disabled={!settings.referenceImage || !settings.productName || isAnalyzingMaterial} 
                onClick={() => setWhiteBgStep(2)} 
                className="w-full py-4 bg-[#1877F2] text-white font-bold rounded-xl uppercase text-xs disabled:opacity-50 hover:brightness-110 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
              >
                Tiếp tục cài đặt kích thước
              </button>
            </div>
          )}

          {whiteBgStep === 2 && (
            <div className="space-y-4">
              <div>
                 <label className="block text-[9px] font-bold text-white uppercase mb-2">Tỷ lệ khung hình</label>
                 <select className="w-full bg-[#242526]  border border-[#3E4042] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#1877F2]" value={settings.aspectRatio} onChange={e => setSettings({...settings, aspectRatio: e.target.value as AspectRatio})}>
                    <option value="1:1" className="bg-[#242526]">1:1 Vuông</option>
                    <option value="4:3" className="bg-[#242526]">4:3 Catalog</option>
                    <option value="3:4" className="bg-[#242526]">3:4 Portrait</option>
                    <option value="16:9" className="bg-[#242526]">16:9 HD</option>
                    <option value="9:16" className="bg-[#242526]">9:16</option>
                    <option value="1:4" className="bg-[#242526]">1:4 Siêu dài</option>
                    <option value="4:1" className="bg-[#242526]">4:1 Siêu rộng</option>
                 </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-white uppercase mb-2">Các chỉnh sửa ưu tiên (Tùy chọn)</label>
                <textarea 
                  placeholder="Ví dụ: Làm sáng phần tay cầm inox, xử lý bề mặt nồi sáng bóng hơn..." 
                  className="w-full bg-[#242526] border border-[#3E4042] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#1877F2] transition-colors resize-none h-20" 
                  value={settings.whiteBGPriorityAdjustments || ''} 
                  onChange={e => setSettings({...settings, whiteBGPriorityAdjustments: e.target.value})} 
                />
              </div>

              {renderModelSelection()}

              <div className="flex gap-2 mb-4">
                <button onClick={() => setWhiteBgStep(1)} className="flex-1 py-4 border border-[#3E4042] text-white rounded-xl text-[10px] font-bold hover:bg-[#242526] ">Quay lại</button>
                <button onClick={() => startGeneration()} className="flex-[2] py-4 bg-[#1877F2] text-white font-bold rounded-xl uppercase text-xs shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all">Tạo ảnh</button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );

  // 3D Render sang Ảnh thật Workflow
  const render3DRenderToPhotoWorkflow = () => (
    <div className="space-y-6">
      <StepIndicator current={render3DStep} total={2} labels={['Dữ liệu & Chất liệu', 'Kích thước & Tạo ảnh']} />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={render3DStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {render3DStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-white uppercase mb-2">Tên Sản Phẩm (Bắt buộc)</label>
                <input type="text" placeholder="Ví dụ: Nồi inox 304, Sofa da..." className="w-full bg-[#242526] border border-[#3E4042] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#1877F2] transition-colors" value={settings.productName} onChange={e => setSettings({...settings, productName: e.target.value})} />
              </div>
              
              <div>
                <label className="block text-[9px] font-bold text-white uppercase mb-2">Mô tả đặc tính vật liệu (Quan trọng để khử CGI)</label>
                <textarea 
                  rows={3}
                  placeholder="Ví dụ: Inox xước hairline mờ, tay cầm nhựa nhám, nắp kính cường lực..."
                  className="w-full bg-[#242526] border border-[#3E4042] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#1877F2] resize-none transition-all placeholder:text-gray-500"
                  value={settings.whiteBGMaterialsDescription || ''}
                  onChange={e => setSettings({...settings, whiteBGMaterialsDescription: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-white uppercase mb-2">Ảnh 3D Render gốc</label>
                <FileDropzone onFilesDrop={(f) => onImageUpload(f, 'reference')} onClick={() => refFileRef.current?.click()} className="h-48 bg-[#242526] border-2 border-dashed border-[#3E4042] rounded-xl flex items-center justify-center cursor-pointer overflow-hidden group relative hover:border-[#1877F2] transition-all">
                   {settings.referenceImage ? (
                     <>
                       <img src={settings.referenceImage} className="h-full w-full object-contain" referrerPolicy="no-referrer" />
                       <div className="absolute inset-0 bg-[#242526] shadow-sm opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-xs font-bold">Thay ảnh</div>
                     </>
                   ) : <span className="text-white text-xs font-bold uppercase group-hover:text-[#1877F2]">+ Tải ảnh 3D gốc</span>}
                </FileDropzone>
                <input type="file" hidden ref={refFileRef} accept="image/*" onChange={e => onImageUpload(e, 'reference')} />
              </div>

              <button 
                type="button"
                disabled={!settings.referenceImage || isAnalyzingMaterial} 
                onClick={async (e) => {
                  e.preventDefault();
                  if (!settings.referenceImage) return;
                  setIsAnalyzingMaterial(true);
                  try {
                    const result = await analyzeProductMaterials(settings.referenceImage);
                    setSettings(s => ({
                      ...s,
                      whiteBGSelectedCategories: result.categories,
                      whiteBGMaterialsDescription: result.description
                    }));
                  } catch (err: any) {
                    console.error("Auto analyze failed:", err);
                    setAlertMessage("Lỗi phân tích chất liệu. Vui lòng thử lại.");
                  } finally {
                    setIsAnalyzingMaterial(false);
                  }
                }}
                className="w-full py-2 bg-[#2A2B2C] border border-[#1877F2]/30 text-[#1877F2] font-bold rounded-xl text-xs hover:bg-[#1877F2]/10 transition-all flex items-center justify-center gap-2"
              >
                {isAnalyzingMaterial ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                {isAnalyzingMaterial ? 'Đang phân tích chất liệu...' : '✨ Tự động nhận diện chất liệu bằng AI'}
              </button>
              
              <button 
                type="button"
                disabled={!settings.referenceImage || !settings.productName} 
                onClick={() => setRender3DStep(2)} 
                className="w-full py-4 bg-[#1877F2] text-white font-bold rounded-xl uppercase text-xs disabled:opacity-50 hover:brightness-110 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
              >
                Tiếp tục
              </button>
            </div>
          )}

          {render3DStep === 2 && (
            <div className="space-y-4">
              <div>
                 <label className="block text-[9px] font-bold text-white uppercase mb-2">Tỷ lệ khung hình</label>
                 <select className="w-full bg-[#242526] border border-[#3E4042] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#1877F2]" value={settings.aspectRatio} onChange={e => setSettings({...settings, aspectRatio: e.target.value as AspectRatio})}>
                    <option value="1:1" className="bg-[#242526]">1:1 Vuông</option>
                    <option value="4:3" className="bg-[#242526]">4:3 Catalog</option>
                    <option value="3:4" className="bg-[#242526]">3:4 Portrait</option>
                    <option value="16:9" className="bg-[#242526]">16:9 HD</option>
                    <option value="9:16" className="bg-[#242526]">9:16</option>
                 </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-white uppercase mb-2">Các chỉnh sửa ưu tiên (Tùy chọn)</label>
                <textarea 
                  placeholder="Ví dụ: Tăng thêm độ xước cho inox, làm ánh sáng gắt hơn..." 
                  className="w-full bg-[#242526] border border-[#3E4042] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#1877F2] transition-colors resize-none h-20" 
                  value={settings.whiteBGPriorityAdjustments || ''} 
                  onChange={e => setSettings({...settings, whiteBGPriorityAdjustments: e.target.value})} 
                />
              </div>

              {renderModelSelection()}

              <div className="flex gap-2 mb-4">
                <button onClick={() => setRender3DStep(1)} className="flex-1 py-4 border border-[#3E4042] text-white rounded-xl text-[10px] font-bold hover:bg-[#242526] ">Quay lại</button>
                <button onClick={() => startGeneration()} className="flex-[2] py-4 bg-[#1877F2] text-white font-bold rounded-xl uppercase text-xs shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all">Tạo ảnh</button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );

  // 7.6 Chuyển thành Line Art
  const renderLineArtWorkflow = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-[9px] font-bold text-white uppercase mb-2">Thông tin sản phẩm</label>
          <div className="grid grid-cols-3 gap-2">
            <input type="text" placeholder="Tên sản phẩm..." className="col-span-2 bg-[#242526]  border border-[#3E4042] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#1877F2] transition-colors" value={settings.productName} onChange={e => setSettings({...settings, productName: e.target.value})} />
            <input type="text" placeholder="Mã sản phẩm..." className="bg-[#242526]  border border-[#3E4042] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#1877F2] transition-colors" value={settings.productCode || ''} onChange={e => setSettings({...settings, productCode: e.target.value})} />
          </div>
        </div>

        <div>
          <label className="block text-[9px] font-bold text-white uppercase mb-2">Ảnh sản phẩm gốc (Nền trắng)</label>
          <FileDropzone onFilesDrop={(f) => onImageUpload(f, 'reference')} onClick={() => refFileRef.current?.click()} className="h-48 bg-[#242526]  border-2 border-dashed border-[#3E4042] rounded-xl flex items-center justify-center cursor-pointer overflow-hidden group relative hover:border-[#1877F2] transition-all">
             {settings.referenceImage ? (
               <>
                 <img src={settings.referenceImage} className="h-full w-full object-contain" referrerPolicy="no-referrer" />
                 <div className="absolute inset-0 bg-[#242526] shadow-sm opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-xs font-bold">Thay ảnh</div>
               </>
             ) : <span className="text-white text-xs font-bold uppercase group-hover:text-[#1877F2]">+ Tải ảnh SP gốc</span>}
          </FileDropzone>
          <input type="file" hidden ref={refFileRef} accept="image/*" onChange={e => onImageUpload(e, 'reference')} />
        </div>

        <div>
           <label className="block text-[9px] font-bold text-white uppercase mb-2">Tỷ lệ</label>
           <select className="w-full bg-[#242526]  border border-[#3E4042] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#1877F2]" value={settings.aspectRatio} onChange={e => setSettings({...settings, aspectRatio: e.target.value as AspectRatio})}>
              <option value="1:1" className="bg-[#242526]">1:1 Vuông</option>
              <option value="4:3" className="bg-[#242526]">4:3 Catalog</option>
              <option value="3:4" className="bg-[#242526]">3:4 Portrait</option>
              <option value="16:9" className="bg-[#242526]">16:9 HD</option>
              <option value="9:16" className="bg-[#242526]">9:16</option>
              <option value="1:4" className="bg-[#242526]">1:4 Siêu dài</option>
              <option value="4:1" className="bg-[#242526]">4:1 Siêu rộng</option>
           </select>
        </div>

        {renderModelSelection()}

        <div className="flex gap-2 pt-2">
          <button disabled={appState !== AppState.READY} onClick={() => { if (!settings.referenceImage) { setAlertMessage("Vui lòng tải ảnh sản phẩm gốc (nền trắng) trước khi tạo ảnh Line Art."); } else { startGeneration(); } }} className="w-full py-4 bg-[#1877F2] text-white font-bold rounded-xl uppercase text-xs shadow-lg hover:brightness-110 transition-all disabled:opacity-50 flex justify-center items-center gap-2">
            {appState === AppState.GENERATING ? <Loader2 size={16} className="animate-spin" /> : null}
            Tạo ảnh Line Art
          </button>
        </div>
      </div>
    </div>
  );

  // 8. Tạo hình ảnh chụp trong studio Workflow
  const renderStudioWorkflow = () => (
    <div className="space-y-6">
      <StepIndicator current={studioStep} total={4} labels={['Dữ liệu', 'Concept', 'Bố cục', 'Xuất bản']} />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={studioStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {studioStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-white uppercase mb-2">Thông tin sản phẩm</label>
                <div className="grid grid-cols-3 gap-2">
                  <input type="text" placeholder="Tên sản phẩm..." className="col-span-2 bg-[#242526]  border border-[#3E4042] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#1877F2] transition-colors" value={settings.productName} onChange={e => setSettings({...settings, productName: e.target.value})} />
                  <input type="text" placeholder="Mã sản phẩm..." className="bg-[#242526]  border border-[#3E4042] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#1877F2] transition-colors" value={settings.productCode || ''} onChange={e => setSettings({...settings, productCode: e.target.value})} />
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2">
                   {['length', 'width', 'height'].map(f => (
                     <input key={f} type="number" placeholder={f === 'length' ? 'Dài (mm)' : f === 'width' ? 'Rộng (mm)' : 'Cao (mm)'} className="bg-[#242526]  border border-[#3E4042] rounded-lg p-2 text-xs text-white outline-none focus:border-[#1877F2]" value={(settings.dimensions as any)[f]} onChange={e => setSettings({...settings, dimensions: {...settings.dimensions, [f]: e.target.value}})} />
                   ))}
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-white uppercase mb-2">Ảnh sản phẩm (Nền trắng hoặc ảnh chụp điện thoại)</label>
                <div className="grid grid-cols-5 gap-2">
                   {settings.productImages.map((img, i) => (
                     <div key={i} className="aspect-square bg-[#242526]  border border-[#3E4042] rounded-lg overflow-hidden relative group">
                       <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                       <button onClick={() => setSettings(s => ({...s, productImages: s.productImages.filter((_, idx) => idx !== i)}))} className="absolute inset-0 bg-red-500/80 opacity-0 group-hover:opacity-100 transition-all text-xs">✕</button>
                     </div>
                   ))}
                   {settings.productImages.length < 5 && (
                     <FileDropzone onFilesDrop={(f) => onImageUpload(f, 'product')} onClick={() => productFilesRef.current?.click()} className="aspect-square border-2 border-dashed border-[#3E4042] rounded-lg text-white flex items-center justify-center hover:border-[#1877F2] transition-all">+</FileDropzone>
                   )}
                </div>
                <input type="file" hidden ref={productFilesRef} accept="image/*" multiple onChange={e => onImageUpload(e, 'product')} />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-white uppercase mb-2">Mô tả đặc tính vật liệu (Quan trọng để khử CGI)</label>
                <textarea 
                  rows={3}
                  placeholder="Ví dụ: Inox xước hairline mờ, tay cầm nhựa nhám, nắp kính cường lực..."
                  className="w-full bg-[#242526] border border-[#3E4042] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#1877F2] resize-none transition-all placeholder:text-gray-500"
                  value={settings.whiteBGMaterialsDescription || ''}
                  onChange={e => setSettings({...settings, whiteBGMaterialsDescription: e.target.value})}
                />
              </div>

              <button 
                type="button"
                disabled={settings.productImages.length === 0 || isAnalyzingMaterial} 
                onClick={async (e) => {
                  e.preventDefault();
                  if (settings.productImages.length === 0) return;
                  setIsAnalyzingMaterial(true);
                  try {
                    const result = await analyzeProductMaterials(settings.productImages[0]);
                    setSettings(s => ({
                      ...s,
                      whiteBGSelectedCategories: result.categories,
                      whiteBGMaterialsDescription: result.description
                    }));
                  } catch (err: any) {
                    console.error("Auto analyze failed:", err);
                    setAlertMessage("Lỗi phân tích chất liệu. Vui lòng thử lại.");
                  } finally {
                    setIsAnalyzingMaterial(false);
                  }
                }}
                className="w-full py-2 bg-[#2A2B2C] border border-[#1877F2]/30 text-[#1877F2] font-bold rounded-xl text-xs hover:bg-[#1877F2]/10 transition-all flex items-center justify-center gap-2"
              >
                {isAnalyzingMaterial ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                {isAnalyzingMaterial ? 'Đang phân tích chất liệu...' : '✨ Tự động nhận diện chất liệu bằng AI'}
              </button>

              <button type="button" onClick={handleStudioAnalysis} className="w-full py-4 bg-[#1877F2] text-white font-bold rounded-xl uppercase text-xs shadow-lg hover:brightness-110 transition-all">Tiếp tục</button>
            </div>
          )}

          {studioStep === 2 && (
            <div className="space-y-4">
               <label className="block text-[9px] font-bold text-white uppercase">Chọn Concept Studio</label>
               <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                 {suggestions.concepts.map((c, idx) => (
                   <button key={idx} onClick={() => setSettings({...settings, concept: c.prompt})} className={`w-full text-left p-4 rounded-xl border transition-all ${settings.concept === c.prompt ? 'bg-[#1877F2]/20 text-[#1877F2] border-[#1877F2] text-white border-[#1877F2]' : 'bg-[#242526]  border-[#3E4042] text-white hover:bg-[#3A3B3C]'}`}>
                     <div className="font-bold text-[11px] mb-1">{c.title}</div>
                     <div className="text-[10px] leading-relaxed opacity-80 whitespace-pre-line">{c.prompt}</div>
                   </button>
                 ))}
               </div>
               
               <div className="pt-4 border-t border-[#3E4042] space-y-2">
                  <label className="block text-[9px] font-bold text-white uppercase">Chỉnh sửa hoặc mô tả thêm về concept</label>
                  <textarea 
                    placeholder="Mô tả chi tiết hơn hoặc chỉnh sửa concept..." 
                    className="w-full bg-[#242526]  border border-[#3E4042] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#1877F2] resize-none h-24 custom-scrollbar" 
                    value={settings.concept} 
                    onChange={e => setSettings({...settings, concept: e.target.value})} 
                  />
               </div>

               <div className="flex gap-2 pt-2">
                  <button onClick={() => setStudioStep(1)} className="flex-1 py-4 border border-[#3E4042] text-white rounded-xl uppercase text-[10px] font-bold hover:bg-[#242526] ">Quay lại</button>
                  <button onClick={handleStudioPropSuggestion} className="flex-[2] bg-[#1877F2] text-white font-bold rounded-xl uppercase text-xs">Tiếp tục</button>
               </div>
            </div>
          )}

          {studioStep === 3 && (
            <div className="space-y-5">
              <div className="bg-[#1877F2]/20 text-[#1877F2] border-[#1877F2]/10 p-3 rounded-xl border border-[#1877F2]/20">
                 <div className="text-[8px] font-bold text-[#1877F2] uppercase mb-1">Concept Studio đã chọn:</div>
                 <div className="text-[10px] text-white italic">"{settings.concept}"</div>
              </div>

              <div className="space-y-2">
                 <label className="block text-[9px] font-bold text-white uppercase">Vị trí và tỷ lệ sản phẩm</label>
                 <textarea 
                   className="w-full bg-[#242526]  border border-[#3E4042] rounded-xl p-3 text-xs text-white outline-none focus:border-[#1877F2] min-h-[80px] custom-scrollbar"
                   value={settings.placement}
                   onChange={e => setSettings(prev => ({ ...prev, placement: e.target.value }))}
                   placeholder="Nhập vị trí và tỷ lệ sản phẩm..."
                 />
              </div>

              <div>
                 <label className="block text-[9px] font-bold text-white uppercase mb-2">Vị trí để trống chèn Text (Chọn nhiều)</label>
                 <div className="grid grid-cols-2 gap-2">
                    {[
                      {id: 'TOP', label: 'Ở trên'},
                      {id: 'BOTTOM', label: 'Ở dưới'},
                      {id: 'LEFT', label: 'Bên trái'},
                      {id: 'RIGHT', label: 'Bên phải'},
                      {id: 'NONE', label: 'Không để trống'}
                    ].map(pos => {
                      const isSelected = settings.emptySpacePosition.includes(pos.id as any);
                      return (
                        <button 
                          key={pos.id} 
                          onClick={() => {
                            if (pos.id === 'NONE') {
                              setSettings({...settings, emptySpacePosition: ['NONE']});
                            } else {
                              const current = settings.emptySpacePosition.filter(p => p !== 'NONE');
                              const next = isSelected ? current.filter(p => p !== pos.id) : [...current, pos.id as any];
                              setSettings({...settings, emptySpacePosition: next.length === 0 ? ['NONE'] : next});
                            }
                          }} 
                          className={`py-2 rounded-lg border text-[9px] font-bold transition-all ${isSelected ? 'bg-[#1877F2]/20 text-[#1877F2] border-[#1877F2] text-white border-[#1877F2]' : 'bg-[#242526]  border-[#3E4042] text-white hover:text-white'}`}
                        >
                          {pos.label}
                        </button>
                      );
                    })}
                 </div>
              </div>

              <div>
                 <label className="block text-[9px] font-bold text-white uppercase mb-2">Gợi ý đạo cụ Studio</label>
                 <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto custom-scrollbar">
                    {suggestions.props.map(p => (
                      <button key={p} onClick={() => toggleProp(p)} className={`px-3 py-2 rounded-lg border text-[9px] font-bold transition-all ${settings.props.some(i => i.name === p) ? 'bg-[#1877F2]/20 text-[#1877F2] border-[#1877F2] text-white border-[#1877F2]' : 'bg-[#242526]  border-[#3E4042] text-white hover:text-white'}`}>{p}</button>
                    ))}
                 </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#3E4042]">
                 <label className="block text-[9px] font-bold text-white uppercase">Thêm đạo cụ khác</label>
                 <div className="flex gap-2">
                    <input type="text" placeholder="Nhập tên đạo cụ..." className="flex-1 bg-[#242526]  border border-[#3E4042] rounded-xl px-4 text-xs text-white outline-none focus:border-[#1877F2]" value={customProp} onChange={e => setCustomProp(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustomPropToList()} />
                <button type="button" onClick={addCustomPropToList} className="px-5 bg-[#3A3B3C] rounded-xl text-white font-bold hover:bg-[#242526]/20 transition-all">+</button>
             </div>
          </div>

          <div className="flex gap-2">
              <button onClick={() => setStudioStep(2)} className="flex-1 py-4 border border-[#3E4042] text-white rounded-xl uppercase text-[10px] font-bold">Quay lại</button>
              <button onClick={() => setStudioStep(4)} className="flex-[2] bg-[#1877F2] text-white font-bold rounded-xl uppercase text-xs">Tiếp tục</button>
          </div>
        </div>
      )}
    </motion.div>
  </AnimatePresence>

  {studioStep === 4 && renderCameraSettings(() => setStudioStep(3))}
</div>
);

// 9. Phối cảnh Thanh ray & Ổ cắm Workflow
const renderTrackSocketWorkflow = () => (
<div className="space-y-6">
  <StepIndicator current={trackSocketStep} total={3} labels={['Dữ liệu', 'Bối cảnh', 'Xuất bản']} />
  
  <AnimatePresence mode="wait">
    <motion.div
      key={trackSocketStep}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {trackSocketStep === 1 && (
        <div className="space-y-4">
          <div className="flex gap-4 mb-2">
             <button onClick={() => setSettings({...settings, trackSocketMode: 'CREATIVE'})} className={`flex-1 p-3 rounded-xl border text-xs font-bold transition-all ${settings.trackSocketMode === 'CREATIVE' || !settings.trackSocketMode ? 'bg-blue-500 text-white border-blue-500' : 'bg-[#242526] shadow-sm text-white text-white border-[#3E4042] hover:text-white'}`}>Tự sáng tạo ảnh</button>
             <button onClick={() => setSettings({...settings, trackSocketMode: 'REFERENCE'})} className={`flex-1 p-3 rounded-xl border text-xs font-bold transition-all ${settings.trackSocketMode === 'REFERENCE' ? 'bg-blue-500 text-white border-blue-500' : 'bg-[#242526] shadow-sm text-white text-white border-[#3E4042] hover:text-white'}`}>Tạo theo mẫu sẵn</button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-[9px] font-bold text-white uppercase">Ảnh Thanh ray (Cố định gắn tường)</label>
              <FileDropzone onFilesDrop={(f) => onImageUpload(f, 'track')} onClick={() => trackFileRef.current?.click()} className="h-24 w-full bg-[#242526]  border-2 border-dashed border-[#3E4042] rounded-2xl flex items-center justify-center cursor-pointer overflow-hidden">
                {settings.trackImage ? <img src={settings.trackImage} className="w-full h-full object-contain" /> : <span className="text-blue-400 font-bold text-[10px] uppercase">+ Tải ảnh Thanh ray</span>}
              </FileDropzone>
              <input type="file" hidden ref={trackFileRef} accept="image/*" onChange={e => onImageUpload(e, 'track')} />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-[9px] font-bold text-white uppercase">Danh sách Ổ cắm</label>
                <FileDropzone onFilesDrop={(f) => onImageUpload(f, 'socket')} onClick={() => socketFileRef.current?.click()} className="text-[10px] text-blue-400 font-bold uppercase hover:text-blue-300">+ Thêm Ổ cắm</FileDropzone>
              </div>
              <input type="file" hidden ref={socketFileRef} accept="image/*" onChange={e => onImageUpload(e, 'socket')} />
              
              <div className="space-y-3">
                {settings.sockets?.map((socket, idx) => (
                  <div key={socket.id} className="bg-[#242526]  border border-[#3E4042] rounded-xl p-3 flex gap-3 items-start">
                    <div className="w-16 h-16 bg-[#242526] shadow-sm border border-[#3E4042] rounded-lg overflow-hidden shrink-0">
                      <img src={socket.image} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white">Loại ổ cắm {idx + 1}</span>
                        <button onClick={() => setSettings(s => ({...s, sockets: s.sockets?.filter(sk => sk.id !== socket.id)}))} className="text-red-400 text-xs hover:text-red-300">Xóa</button>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-[10px] text-white">Số lượng:</label>
                        <input type="number" min="1" value={socket.quantity} onChange={e => {
                          const newSockets = [...(settings.sockets || [])];
                          newSockets[idx].quantity = parseInt(e.target.value) || 1;
                          setSettings({...settings, sockets: newSockets});
                        }} className="w-16 bg-[#242526] shadow-sm border border-[#3E4042] border border-[#3E4042] rounded p-1 text-xs text-white outline-none" />
                      </div>
                      <input type="text" placeholder="Ghi chú thiết bị cắm vào (VD: Tivi, Đèn bàn...)" value={socket.applianceNote} onChange={e => {
                        const newSockets = [...(settings.sockets || [])];
                        newSockets[idx].applianceNote = e.target.value;
                        setSettings({...settings, sockets: newSockets});
                      }} className="w-full bg-[#242526] shadow-sm border border-[#3E4042] border border-[#3E4042] rounded p-2 text-xs text-white outline-none focus:border-blue-400" />
                    </div>
                  </div>
                ))}
                {(!settings.sockets || settings.sockets.length === 0) && (
                  <div className="text-center p-4 border border-dashed border-[#3E4042] rounded-xl text-white text-xs">
                    Chưa có ổ cắm nào. Hãy thêm ít nhất 1 ổ cắm.
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {settings.trackSocketMode === 'REFERENCE' && (
            <div className="space-y-2">
              <label className="block text-[9px] font-bold text-white uppercase">Ảnh Mẫu (Reference Image)</label>
              <FileDropzone onFilesDrop={(f) => onImageUpload(f, 'reference')} onClick={() => refFileRef.current?.click()} className="h-24 w-full bg-[#242526]  border-2 border-dashed border-[#3E4042] rounded-2xl flex items-center justify-center cursor-pointer overflow-hidden">
                {settings.referenceImage ? <img src={settings.referenceImage} className="w-full h-full object-contain" /> : <span className="text-blue-400 font-bold text-[10px] uppercase">+ Tải ảnh mẫu</span>}
              </FileDropzone>
              <input type="file" hidden ref={refFileRef} accept="image/*" onChange={e => onImageUpload(e, 'reference')} />
            </div>
          )}
          
          <div className="grid grid-cols-3 gap-2">
            <input type="text" placeholder="Tên sản phẩm (VD: Thanh ray Chargee V2...)" className="col-span-2 bg-[#242526]  border border-[#3E4042] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-400" value={settings.productName} onChange={e => setSettings({...settings, productName: e.target.value})} />
            <input type="text" placeholder="Mã sản phẩm..." className="bg-[#242526]  border border-[#3E4042] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-400" value={settings.productCode || ''} onChange={e => setSettings({...settings, productCode: e.target.value})} />
          </div>

          <button onClick={() => { 
            if(!settings.trackImage || !settings.sockets?.length) return setAlertMessage("Vui lòng tải đủ ảnh thanh ray và ít nhất 1 ổ cắm."); 
            if(settings.trackSocketMode === 'REFERENCE' && !settings.referenceImage) return setAlertMessage("Vui lòng tải ảnh mẫu.");
            if(settings.trackSocketMode === 'REFERENCE') setTrackSocketStep(3);
            else setTrackSocketStep(2); 
          }} className="w-full py-4 bg-blue-500 text-white font-bold rounded-xl uppercase text-xs shadow-lg hover:brightness-110 transition-all">
            {settings.trackSocketMode === 'REFERENCE' ? 'Tiếp tục' : 'Tiếp tục'}
          </button>
        </div>
      )}

      {trackSocketStep === 2 && (
        <div className="space-y-4">
          <label className="block text-[9px] font-bold text-white uppercase">Chọn bối cảnh ứng dụng</label>
          <div className="grid grid-cols-2 gap-2">
            {['Phòng khách hiện đại', 'Phòng ngủ ấm cúng', 'Bàn làm việc tối giản', 'Khu vực bếp tiện nghi', 'Kệ Tivi sang trọng', 'Văn phòng chuyên nghiệp'].map(loc => (
              <button key={loc} onClick={() => setSettings({...settings, location: loc})} className={`p-3 rounded-xl border text-[10px] transition-all ${settings.location === loc ? 'bg-blue-400 text-white border-blue-400' : 'bg-[#242526]  border-[#3E4042] text-white hover:text-white'}`}>{loc}</button>
            ))}
          </div>
          <textarea placeholder="Mô tả thêm về bối cảnh (Tùy chọn)..." className="w-full bg-[#242526]  border border-[#3E4042] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-blue-400 resize-none h-20" value={settings.concept} onChange={e => setSettings({...settings, concept: e.target.value})} />
          
          <div className="flex gap-2">
            <button onClick={() => setTrackSocketStep(1)} className="flex-1 py-4 border border-[#3E4042] text-white rounded-xl uppercase text-[10px] font-bold">Quay lại</button>
            <button onClick={() => { if(!settings.location) return setAlertMessage("Vui lòng chọn bối cảnh."); setTrackSocketStep(3); }} className="flex-[2] bg-blue-500 text-white font-bold rounded-xl uppercase text-xs">Tiếp tục</button>
          </div>
        </div>
      )}
    </motion.div>
  </AnimatePresence>

  {trackSocketStep === 3 && renderCameraSettings(() => setTrackSocketStep(settings.trackSocketMode === 'REFERENCE' ? 1 : 2))}
</div>
);

  const renderInstructions = () => {
    if (currentStep === 1) {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-lg z-10 space-y-4 px-6"
        >
          <h3 className="text-xl font-bold text-white uppercase tracking-tighter">Bắt đầu quy trình sáng tạo</h3>
          <p className="text-white font-medium text-sm leading-relaxed">Chọn một trong các chế độ phía bên trái để trải nghiệm quy trình làm việc chuyên nghiệp được tối ưu bởi Gemini 3 Pro.</p>
        </motion.div>
      );
    }

    let title = "";
    let steps: string[] = [];

    switch (settings.visualStyle) {
      case 'COLOR_CHANGE':
        title = "Hướng dẫn: Làm màu sản phẩm";
        steps = [
          "Tải lên hình ảnh sản phẩm cần đổi màu.",
          "Nhập màu sắc mong muốn (ví dụ: Đỏ mận, Xanh navy).",
          "Nhấn 'Tạo ảnh' để hệ thống xử lý đổi màu giữ nguyên chất liệu."
        ];
        break;
      case '3D_TO_REAL_WHITE_BG':
        title = "Hướng dẫn: 3D Render sang Ảnh Thật";
        steps = [
          "Tải lên hình ảnh 3D Render của sản phẩm.",
          "Mô tả chất liệu để hệ thống khử CGI và thêm vật liệu thật.",
          "Nhấn 'Tạo ảnh' để nhận kết quả ảnh thật chụp studio."
        ];
        break;
      case 'WHITE_BG_RETOUCH':
        title = "Hướng dẫn: Làm ảnh nền trắng";
        steps = [
          "Tải lên hình ảnh sản phẩm cần tách nền.",
          "Hệ thống sẽ tự động tách nền và tái tạo ánh sáng studio.",
          "Nhấn 'Tạo ảnh' để nhận kết quả nền trắng chuyên nghiệp."
        ];
        break;
      case 'LINE_ART':
        title = "Hướng dẫn: Chuyển thành Line Art";
        steps = [
          "Tải lên hình ảnh sản phẩm trên nền trắng.",
          "Chọn tỷ lệ hình ảnh mong muốn.",
          "Nhấn 'Tạo ảnh Line Art' để chuyển đổi sang dạng nét vẽ (netline) đơn giản."
        ];
        break;
      case 'STUDIO':
        title = "Hướng dẫn: Làm ảnh trong studio";
        steps = [
          "Nhập tên sản phẩm và tải lên hình ảnh sản phẩm gốc.",
          "Hệ thống AI sẽ phân tích và đề xuất các concept chụp ảnh studio phù hợp.",
          "Lựa chọn đạo cụ (props) trang trí đi kèm để làm nổi bật sản phẩm.",
          "Thiết lập góc máy camera và nhấn 'Tạo ảnh' để kết xuất kết quả cuối cùng."
        ];
        break;
      case 'TECH_PS':
        title = "Hướng dẫn: Làm ảnh USP";
        steps = [
          "Nhập tên sản phẩm và mô tả tính năng kỹ thuật nổi bật.",
          "Tải lên ảnh sản phẩm.",
          "Chọn hiệu ứng hình ảnh (Visual Elements) để làm nổi bật USP.",
          "Nhấn 'Tạo ảnh' để hoàn tất."
        ];
        break;
      case 'PACKAGING_MOCKUP':
        title = "Hướng dẫn: Dựng mockup sản phẩm";
        steps = [
          "Tải lên file thiết kế phẳng của bao bì.",
          "Chọn loại hộp và tỷ lệ khung hình.",
          "Chọn góc nhìn và bối cảnh đặt mockup.",
          "Nhấn 'Tạo ảnh' để dựng hình 3D."
        ];
        break;
      case 'TRACK_SOCKET_STAGING':
        title = "Hướng dẫn: Làm ảnh Thanh ray ổ cắm";
        steps = [
          "Chọn chế độ tạo (Dựng phối cảnh AI hoặc Ghép vào ảnh thực tế).",
          "Tải lên ảnh thanh ray và ổ cắm.",
          "Thiết lập bối cảnh và góc máy.",
          "Nhấn 'Tạo ảnh' để render."
        ];
        break;
      case 'SCENE_STAGING':
        title = "Hướng dẫn: Xây dựng phối cảnh";
        steps = [
          "Tải lên ảnh không gian thực tế và ảnh sản phẩm.",
          "Nhập mô tả concept mong muốn.",
          "AI sẽ phân tích và đề xuất các vật dụng trang trí (props).",
          "Nhấn 'Tạo ảnh' để ghép sản phẩm vào không gian."
        ];
        break;
      case 'TECH_EFFECTS':
        title = "Hướng dẫn: Xử lý ảnh có chữ ký";
        steps = [
          "Chọn loại xử lý (Xóa Watermark hoặc Tạo hiệu ứng mặt biển).",
          "Tải lên hình ảnh cần xử lý.",
          "Nhấn 'Tạo ảnh' để hệ thống thực hiện."
        ];
        break;
      case 'CONCEPT':
        title = "Hướng dẫn: Ảnh phối cảnh";
        steps = [
          "Nhập tên sản phẩm và tải lên ảnh sản phẩm.",
          "AI sẽ phân tích và đề xuất các phối cảnh sáng tạo.",
          "Chọn đạo cụ và góc máy phù hợp với phối cảnh.",
          "Nhấn 'Tạo ảnh' để render."
        ];
        break;
      default:
        title = "Hướng dẫn sử dụng";
        steps = ["Vui lòng làm theo các bước ở thanh công cụ bên trái."];
    }

    return (
      <div className="text-left max-w-2xl z-10 space-y-6 px-8 py-8 bg-[#242526] shadow-sm  rounded-3xl border border-[#3E4042] shadow-2xl animate-fade-in">
        <h3 className="text-2xl font-bold text-white uppercase tracking-tighter border-b border-[#3E4042] pb-4">{title}</h3>
        <ul className="space-y-4">
          {steps.map((step, idx) => (
            <li key={idx} className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#caf0f8] to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20">
                <span className="text-white text-sm font-black">{idx + 1}</span>
              </div>
              <span className="text-white font-medium text-[15px] leading-relaxed pt-1">{step}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderBarcodeQrSidebar = () => (
    <div className="space-y-6">
      <div className="bg-[#242526] p-6 rounded-2xl border border-[#3E4042]">
        <h3 className="text-white font-bold text-lg mb-2">Tạo Mã Vạch & QR Code</h3>
        <p className="text-gray-400 text-sm mb-4">
          Sử dụng công cụ ở phần màn hình chính để tạo:
        </p>
        <ul className="space-y-3 text-sm text-gray-300">
          <li className="flex items-center gap-2"><Check size={16} className="text-[#1877F2]"/> Code 128 (Ký tự + Số)</li>
          <li className="flex items-center gap-2"><Check size={16} className="text-[#1877F2]"/> EAN-13 & EAN-14</li>
          <li className="flex items-center gap-2"><Check size={16} className="text-[#1877F2]"/> QR Code chuẩn Vector</li>
        </ul>
      </div>
      <div className="flex gap-2 mb-4">
        <button onClick={() => setCurrentStep(1)} className="w-full py-4 border border-[#3E4042] text-white rounded-xl text-[10px] font-bold hover:bg-[#242526]">Quay lại Menu</button>
      </div>
    </div>
  );

  const renderPackagingCheckSidebar = () => (
    <div className="space-y-6">
      <div className="bg-[#242526] p-6 rounded-2xl border border-[#3E4042]">
        <h3 className="text-white font-bold text-lg mb-2">Kiểm tra Bao Bì</h3>
        <p className="text-gray-400 text-sm mb-4">
          Sử dụng phần màn hình chính để:
        </p>
        <ul className="text-gray-400 text-sm space-y-2 list-disc pl-4">
          <li>Tải lên dữ liệu chuẩn từ file Excel.</li>
          <li>Xem và chỉnh sửa các thông số chuẩn.</li>
          <li>Tải lên file thiết kế dạng ảnh.</li>
          <li>AI sẽ đối chiếu dữ liệu thiết kế với bảng chuẩn và kiểm tra mã QR.</li>
        </ul>
      </div>
    </div>
  );
  const renderSidebar = () => {
    if (currentStep === 1) {
      const modes = [
        { id: '3D_TO_REAL_WHITE_BG', icon: <Box size={20} />, title: '3D Render sang Ảnh Thật', desc: 'Chuyển ảnh 3D thành ảnh chụp thật nền trắng.', color: 'bg-indigo-50 text-indigo-400', hover: 'hover:bg-indigo-100' },
        { id: 'COLOR_CHANGE', icon: <Palette size={20} />, title: 'Làm màu sản phẩm', desc: 'Đổi màu giữ nguyên texture.', color: 'bg-purple-50 text-purple-400', hover: 'hover:bg-purple-100' },
        { id: 'WHITE_BG_RETOUCH', icon: <ImageIcon size={20} />, title: 'Làm ảnh nền trắng', desc: 'Làm sạch & tái tạo ánh sáng studio.', color: 'bg-blue-50 text-blue-400', hover: 'hover:bg-blue-100' },
        { id: 'LINE_ART', icon: <PenTool size={20} />, title: 'Chuyển thành Line Art', desc: 'Chuyển ảnh nền trắng thành nét vẽ.', color: 'bg-gray-100 text-gray-300', hover: 'hover:bg-gray-200' },
        { id: 'CONCEPT', icon: <Layout size={20} />, title: 'Ảnh phối cảnh', desc: 'Sáng tạo phối cảnh, tìm props & không gian.', color: 'bg-cyan-50 text-cyan-400', hover: 'hover:bg-cyan-100' },
        { id: 'STUDIO', icon: <Camera size={20} />, title: 'Làm ảnh trong studio', desc: 'Tạo ảnh sản phẩm nền giấy cùng màu.', color: 'bg-emerald-50 text-emerald-400', hover: 'hover:bg-emerald-100' },
        { id: 'PACKAGING_MOCKUP', icon: <Box size={20} />, title: 'Dựng mockup sản phẩm', desc: 'Dựng hộp 3D từ file phẳng.', color: 'bg-orange-50 text-orange-400', hover: 'hover:bg-orange-100' },
        { id: 'BARCODE_QR_GENERATOR', icon: <QrCode size={20} />, title: 'Tạo QR & Barcode', desc: 'Tạo SVG cho Code 128, EAN, QR.', color: 'bg-teal-50 text-teal-400', hover: 'hover:bg-teal-100' },
        { id: 'PACKAGING_CHECK', icon: <Check size={20} />, title: 'Kiểm tra bao bì', desc: 'Kiểm tra nội dung từ file chuẩn.', color: 'bg-rose-50 text-rose-400', hover: 'hover:bg-rose-100' },
      ];

      return (
        <div className="space-y-6 animate-fade-in pb-4">
          <div className="grid grid-cols-1 gap-2 px-2">
            {modes.map((mode, idx) => (
              <motion.button 
                key={mode.id}
                onClick={() => { 
                  setSettings(s => ({...s, visualStyle: mode.id as VisualStyle})); 
                  // Reset steps for the selected mode
                  setConceptStep(1); setTechStep(1); setPackagingStep(1); setTechEffectStep(1); setWhiteBgStep(1); setRender3DStep(1); setWhiteBgWebStep(1); setStagingStep(1); setStudioStep(1); setTrackSocketStep(1);
                  setCurrentStep(2); 
                }} 
                className={`w-full text-left p-3 rounded-xl bg-[#242526] border border-[#3E4042] ${mode.hover} transition-all group relative overflow-hidden shadow-sm`}
              >
                <div className="flex items-center gap-3 relative z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${mode.color}`}>
                    {mode.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-[15px] group-hover:text-[#1877F2] transition-colors">{mode.title}</h3>
                    <p className="text-[13px] text-white mt-0.5 line-clamp-1">{mode.desc}</p>
                  </div>
                  <ChevronRight size={16} className="text-white group-hover:text-[#1877F2] group-hover:translate-x-1 transition-all" />
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      );
    }
    
    return (
      <div className="animate-fade-in h-full flex flex-col">
         <div className="mb-8 flex items-center justify-between">
           <button 
             onClick={resetMode} 
             className="flex items-center gap-2 text-[10px] font-bold uppercase text-white hover:text-[#1877F2] transition-colors group"
           >
             <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
             Quay lại Menu chính
           </button>
           
           <div className="flex items-center gap-2">
             <button 
               onClick={undoSettings} 
               disabled={!canUndo}
               className="p-1.5 rounded-lg bg-[#242526]  border border-[#3E4042] text-white hover:text-white hover:bg-[#3A3B3C] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
               title="Hoàn tác (Undo)"
             >
               <Undo2 size={14} />
             </button>
             <button 
               onClick={redoSettings} 
               disabled={!canRedo}
               className="p-1.5 rounded-lg bg-[#242526]  border border-[#3E4042] text-white hover:text-white hover:bg-[#3A3B3C] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
               title="Làm lại (Redo)"
             >
               <Redo2 size={14} />
             </button>
           </div>
         </div>
         
         <div className="flex-1">
           <AnimatePresence mode="wait">
             <motion.div
               key={settings.visualStyle}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               transition={{ duration: 0.3 }}
             >
               {settings.visualStyle === 'CONCEPT' && renderConceptWorkflow()}
               {settings.visualStyle === 'SCENE_STAGING' && renderStagingWorkflow()}
               {settings.visualStyle === 'TECH_PS' && renderTechWorkflow()}
               {settings.visualStyle === 'COLOR_CHANGE' && renderColorWorkflow()}
               {settings.visualStyle === 'PACKAGING_MOCKUP' && renderPackagingWorkflow()}
               {settings.visualStyle === 'TECH_EFFECTS' && renderTechEffectsWorkflow()}
               {settings.visualStyle === 'WHITE_BG_RETOUCH' && renderWhiteBgRetouchWorkflow()}
               {settings.visualStyle === '3D_TO_REAL_WHITE_BG' && render3DRenderToPhotoWorkflow()}
               {settings.visualStyle === 'LINE_ART' && renderLineArtWorkflow()}
               {settings.visualStyle === 'STUDIO' && renderStudioWorkflow()}
               {settings.visualStyle === 'TRACK_SOCKET_STAGING' && renderTrackSocketWorkflow()}
               {settings.visualStyle === 'BARCODE_QR_GENERATOR' && renderBarcodeQrSidebar()}
               {settings.visualStyle === 'PACKAGING_CHECK' && renderPackagingCheckSidebar()}
             </motion.div>
           </AnimatePresence>
         </div>
      </div>
    );
  };

  const renderModelSelection = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-[9px] font-bold text-white uppercase mb-1">Chất lượng hình ảnh</label>
        <div className="grid grid-cols-3 gap-2">
          {(['1K', '2K', '4K'] as ImageSize[]).map(size => (
            <button 
              key={size} 
              onClick={() => setSettings({...settings, imageSize: size})} 
              className={`py-2 rounded-lg border text-[9px] font-bold transition-all ${settings.imageSize === size ? 'bg-[#1877F2] text-white border-[#1877F2]' : 'bg-[#242526] shadow-sm text-white border-[#3E4042] text-white hover:text-white'}`}
            >
              {size === '1K' ? '1K Standard' : size === '2K' ? '2K Pro' : '4K Ultra HD'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // 13. Kiểm tra bao bì
  const renderPackagingCheckWorkflow = () => {
    return (
      <div className="space-y-6">
        <button onClick={() => setCurrentStep(1)} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-bold mb-2">
          <ArrowLeft size={16} /> Quay lại Menu
        </button>
        <StepIndicator current={packagingCheckStep} total={3} labels={['Nhập dữ liệu chuẩn', 'Tải thiết kế', 'Kết quả']} />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={packagingCheckStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {packagingCheckStep === 1 && (
              <div className="space-y-4">
                <div className="flex gap-2 p-1 bg-[#242526] rounded-xl border border-[#3E4042]">
                  <button onClick={() => setPackagingInputMode('EXCEL')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${packagingInputMode === 'EXCEL' ? 'bg-[#1877F2] text-white' : 'text-gray-400 hover:text-white'}`}>Nhập từ Excel</button>
                  <button onClick={() => setPackagingInputMode('MANUAL')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${packagingInputMode === 'MANUAL' ? 'bg-[#1877F2] text-white' : 'text-gray-400 hover:text-white'}`}>Nhập thủ công</button>
                </div>

                {packagingInputMode === 'EXCEL' ? (
                  <div className="bg-[#242526] border border-[#3E4042] rounded-xl p-6 text-center">
                    <div className="mb-4 text-white text-sm">Tải lên file Excel (.xlsx) chứa dữ liệu chuẩn của bao bì</div>
                    <input 
                      type="file" 
                      accept=".xlsx, .xls, .csv" 
                      onChange={handleExcelUpload}
                      className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#1877F2]/10 file:text-[#1877F2] hover:file:bg-[#1877F2]/20 cursor-pointer"
                    />
                  </div>
                ) : (
                  <div className="bg-[#242526] border border-[#3E4042] rounded-xl p-4">
                     <span className="text-white text-xs font-bold block mb-2">Dán dữ liệu từ Excel (Copy các cột Tên thông số, Giá trị):</span>
                     <textarea 
                        className="w-full h-24 bg-[#3A3B3C] border border-[#3E4042] rounded-lg p-2 text-white text-xs outline-none focus:border-[#1877F2] resize-none"
                        placeholder="Dán nội dung bảng vào đây..."
                        onChange={handlePastedExcelData}
                     ></textarea>
                     <div className="flex justify-end mt-2">
                        <button onClick={addStandardParam} className="px-3 py-1 bg-[#3A3B3C] hover:bg-[#4A4B4C] text-white rounded-lg text-xs font-bold transition-all border border-[#3E4042]">+ Thêm 1 dòng trống</button>
                     </div>
                  </div>
                )}

                {standardParams.length > 0 && (
                  <div className="bg-[#242526] border border-[#3E4042] rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-[#3E4042] flex justify-between items-center">
                      <h3 className="text-white text-sm font-bold">Dữ liệu chuẩn trích xuất</h3>
                      <button onClick={addStandardParam} className="text-xs text-[#1877F2] hover:underline font-bold">+ Thêm thông số</button>
                    </div>
                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                      <table className="w-full text-left text-xs text-white">
                        <thead className="bg-[#3A3B3C] sticky top-0">
                          <tr>
                            <th className="p-3 font-semibold">Thông số</th>
                            <th className="p-3 font-semibold">Giá trị chuẩn</th>
                            <th className="p-3 w-10"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {standardParams.map((param, index) => (
                            <tr key={index} className="border-b border-[#3E4042]">
                              <td className="p-2">
                                <input 
                                  value={param.key} 
                                  onChange={(e) => updateStandardParam(index, 'key', e.target.value)} 
                                  className="w-full bg-transparent border-none outline-none focus:ring-1 focus:ring-[#1877F2] rounded px-2 py-1"
                                />
                              </td>
                              <td className="p-2">
                                <input 
                                  value={param.value} 
                                  onChange={(e) => updateStandardParam(index, 'value', e.target.value)} 
                                  className="w-full bg-transparent border-none outline-none focus:ring-1 focus:ring-[#1877F2] rounded px-2 py-1"
                                />
                              </td>
                              <td className="p-2 text-center">
                                <button onClick={() => removeStandardParam(index)} className="text-red-400 hover:text-red-300">
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                <button 
                  disabled={standardParams.length === 0} 
                  onClick={() => setPackagingCheckStep(2)} 
                  className="w-full py-4 bg-[#1877F2] text-white font-bold rounded-xl uppercase text-xs shadow-lg disabled:opacity-50 hover:brightness-110 transition-all"
                >
                  Tiếp tục tải thiết kế
                </button>
              </div>
            )}

            {packagingCheckStep === 2 && (
              <div className="space-y-4">
                <label className="block text-[9px] font-bold text-white uppercase mt-4">Tải lên các file thiết kế bao bì (Ảnh hoặc PDF)</label>
                <FileDropzone onFilesDrop={(f) => onImageUpload(f, 'product')} onClick={() => productFilesRef.current?.click()} className="h-32 w-full bg-[#242526] border-2 border-dashed border-[#3E4042] rounded-xl flex items-center justify-center cursor-pointer overflow-hidden relative group hover:border-[#1877F2] transition-all">
                  <span className="text-white font-bold uppercase text-[10px] group-hover:text-[#1877F2]">+ Chọn file thiết kế (Hộp màu, Tem phụ, Thùng carton...)</span>
                </FileDropzone>
                <input type="file" hidden multiple ref={productFilesRef} accept="image/*, application/pdf" onChange={e => {
                  const files = Array.from(e.target.files || []) as File[];
                  if (files.length > 0) {
                    files.forEach(file => {
                      const reader = new FileReader();
                      reader.onload = () => {
                        setPackagingFiles(prev => [...prev, { name: file.name, data: reader.result as string }]);
                      };
                      reader.readAsDataURL(file);
                    });
                  }
                  e.target.value = '';
                }} />

                {packagingFiles.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {packagingFiles.map((f, i) => (
                      <div key={i} className="relative bg-[#242526] border border-[#3E4042] rounded-xl p-2 flex items-center gap-2">
                        {f.data.startsWith('data:application/pdf') ? (
                          <div className="w-10 h-10 bg-gray-800 rounded flex items-center justify-center shrink-0">
                            <Box size={20} className="text-[#1877F2]" />
                          </div>
                        ) : (
                          <img src={f.data} className="w-10 h-10 rounded object-cover shrink-0" referrerPolicy="no-referrer" />
                        )}
                        <span className="text-white text-xs truncate flex-1">{f.name}</span>
                        <button onClick={() => setPackagingFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-300 p-1 shrink-0">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <button onClick={() => setPackagingCheckStep(1)} className="flex-1 py-4 border border-[#3E4042] text-white rounded-xl text-[10px] font-bold hover:bg-[#242526]">Quay lại</button>
                  <button 
                    disabled={packagingFiles.length === 0 || appState !== AppState.READY} 
                    onClick={runPackagingCheck} 
                    className="flex-[2] py-4 bg-[#1877F2] text-white font-bold rounded-xl uppercase text-xs shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {appState === AppState.ANALYZING ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    Bắt đầu AI Kiểm tra
                  </button>
                </div>
              </div>
            )}
            {packagingCheckStep === 3 && packagingCheckResult && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-bold text-sm uppercase">Kết quả kiểm tra AI</h3>
                  <button onClick={exportPackagingReport} className="flex items-center gap-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                    <Download size={14} />
                    Xuất báo cáo
                  </button>
                </div>
                
                {/* Check Results */}
                <div className="overflow-x-auto custom-scrollbar mt-4 border border-[#3E4042] rounded-xl bg-[#1A1A1C] max-h-[500px]">
                  <table className="w-full text-left text-xs text-gray-300 min-w-[600px] relative">
                    <thead className="bg-[#242526] text-gray-400 uppercase text-[10px] tracking-wider sticky top-0 z-10 shadow-md">
                      <tr>
                        <th className="px-4 py-3 min-w-[150px] border-r border-b border-[#3E4042] font-bold">Thông số</th>
                        <th className="px-4 py-3 min-w-[150px] border-r border-b border-[#3E4042] font-bold">Chuẩn</th>
                        {packagingFiles.map((file, idx) => (
                          <th key={idx} className="px-4 py-3 min-w-[200px] border-r border-b border-[#3E4042] last:border-r-0 truncate max-w-[200px]" title={file.name}>
                            <div className="flex items-center gap-1.5 font-bold">
                              <Box size={14} className="text-[#1877F2]" />
                              <span className="truncate">{file.name}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#3E4042]">
                      {packagingCheckResult.params.map((res: any, idx: number) => (
                        <tr key={idx} className={`hover:bg-[#2A2B2D] transition-colors ${!res.match ? 'bg-red-500/5' : ''}`}>
                          <td className="px-4 py-4 border-r border-[#3E4042] align-top">
                            <div className="font-bold text-white mb-1 flex items-start justify-between gap-2">
                              <span>{res.key}</span>
                              {!res.match && <X size={14} className="text-red-400 shrink-0 mt-0.5" />}
                              {res.match && <Check size={14} className="text-green-500 shrink-0 mt-0.5" />}
                            </div>
                          </td>
                          <td className="px-4 py-4 border-r border-[#3E4042] text-white font-medium align-top">
                            {res.expected || '-'}
                          </td>
                          {packagingFiles.map((file, fIdx) => {
                            let fileResult = (res.fileResults || []).find((fr: any) => {
                               if (!fr.fileName) return false;
                               const cleanFr = fr.fileName.toLowerCase().trim();
                               const cleanF = file.name.toLowerCase().trim();
                               return cleanFr === cleanF || cleanFr.includes(cleanF) || cleanF.includes(cleanFr);
                            });
                            if (!fileResult && (res.fileResults || []).length === packagingFiles.length) {
                               fileResult = (res.fileResults || [])[fIdx];
                            }
                            if (!fileResult) {
                              return <td key={fIdx} className="px-4 py-4 border-r border-[#3E4042] last:border-r-0 align-top text-gray-500 text-[11px] italic">Không có dữ liệu</td>;
                            }
                            return (
                              <td key={fIdx} className="px-4 py-4 border-r border-[#3E4042] last:border-r-0 align-top">
                                <div className={`font-medium mb-1 ${fileResult.match ? 'text-green-100' : 'text-red-300'}`}>
                                  {fileResult.actual || 'Không tìm thấy'}
                                </div>
                                {!fileResult.match && fileResult.notes && (
                                  <div className="mt-2 text-[10px] text-red-300 bg-red-500/10 p-2 rounded-lg flex items-start gap-1.5">
                                    <AlertCircle size={12} className="shrink-0 mt-0.5" />
                                    <span className="leading-relaxed">{fileResult.notes}</span>
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex gap-2 pt-2">
                  <button onClick={() => setPackagingCheckStep(1)} className="flex-1 py-4 border border-[#3E4042] text-white rounded-xl text-[10px] font-bold hover:bg-[#242526]">Bắt đầu lại</button>
                  <button onClick={() => setPackagingCheckStep(2)} className="flex-1 py-4 bg-[#242526] border border-[#3E4042] text-white font-bold rounded-xl text-[10px] hover:bg-[#3A3B3C]">Kiểm tra lại thiết kế</button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  };
  const renderCameraSettings = (onBack: () => void) => (
    <div className="space-y-5">
      <div className="bg-[#242526]  rounded-xl p-4 space-y-4 border border-[#3E4042]">
         <div className="space-y-2">
            <div className="flex justify-between text-[9px] font-bold text-white uppercase"><span>Góc chụp</span><span className="text-[#caf0f8]">{settings.camera.angle}°</span></div>
            <input type="range" min="-15" max="90" step="5" className="w-full h-1 bg-[#3A3B3C] rounded-lg appearance-none cursor-pointer" value={settings.camera.angle} onChange={e => setSettings({...settings, camera: {...settings.camera, angle: parseInt(e.target.value)}})} />
         </div>
         <div className="space-y-2">
            <div className="flex justify-between text-[9px] font-bold text-white uppercase"><span>Tiêu cự</span><span className="text-[#caf0f8]">{settings.camera.focalLength}mm</span></div>
            <input type="range" min="12" max="200" step="1" className="w-full h-1 bg-[#3A3B3C] rounded-lg appearance-none cursor-pointer" value={settings.camera.focalLength} onChange={e => setSettings({...settings, camera: {...settings.camera, focalLength: parseInt(e.target.value)}})} />
         </div>
         <div className="grid grid-cols-2 gap-3">
           <div>
              <label className="block text-[8px] font-bold text-white uppercase mb-1">Khẩu độ</label>
              <select className="w-full bg-[#242526]  border border-[#3E4042] rounded-lg p-2 text-[10px] text-white outline-none focus:border-[#caf0f8]" value={settings.camera.aperture} onChange={e => setSettings({...settings, camera: {...settings.camera, aperture: e.target.value}})}>
                {CAMERA_APERTURES.map(a => <option key={a} value={a} className="bg-[#242526]">{a}</option>)}
              </select>
           </div>
           <div>
              <label className="block text-[8px] font-bold text-white uppercase mb-1">ISO</label>
              <select className="w-full bg-[#242526]  border border-[#3E4042] rounded-lg p-2 text-[10px] text-white outline-none focus:border-[#caf0f8]" value={settings.camera.iso} onChange={e => setSettings({...settings, camera: {...settings.camera, iso: e.target.value}})}>
                {CAMERA_ISO.map(i => <option key={i} value={i} className="bg-[#242526]">{i}</option>)}
              </select>
           </div>
         </div>
      </div>
      <div className="grid grid-cols-1 gap-3">
        <div>
           <label className="block text-[9px] font-bold text-white uppercase mb-1">Tỷ lệ</label>
           <select className="w-full bg-[#242526]  border border-[#3E4042] rounded-lg p-2 text-[10px] text-white outline-none" value={settings.aspectRatio} onChange={e => setSettings({...settings, aspectRatio: e.target.value as AspectRatio})}>
              <option value="1:1" className="bg-[#242526]">1:1 Vuông</option><option value="16:9" className="bg-[#242526]">16:9 HD</option><option value="9:16" className="bg-[#242526]">9:16</option><option value="4:3" className="bg-[#242526]">4:3</option><option value="3:4" className="bg-[#242526]">3:4</option><option value="1:4" className="bg-[#242526]">1:4</option><option value="4:1" className="bg-[#242526]">4:1</option>
           </select>
        </div>
      </div>
      {renderModelSelection()}
      <div className="flex gap-2">
        <button onClick={onBack} className="flex-1 py-4 border border-[#3E4042] text-white rounded-xl uppercase text-[10px] font-bold">Quay lại</button>
        <button onClick={() => startGeneration()} className="flex-[2] bg-[#1877F2] text-white font-bold py-4 rounded-xl uppercase text-[12px] shadow-xl">Tạo ảnh</button>
      </div>
    </div>
  );

  if (isLocked) {
    return (
      <div className="fixed inset-0 z-[150] bg-[#242526] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full glass-card p-10 rounded-[40px] border border-white/10">
          <div className="space-y-4">
            <input type="password" placeholder="Mật khẩu..." className="w-full bg-[#242526]/5 border border-white/10 rounded-xl px-4 py-4 text-center text-white tracking-[0.5em] outline-none" value={passwordInput} onChange={(e) => handlePasswordChange(e.target.value)} autoFocus />
            {passwordError && <p className="text-red-400 text-xs font-bold uppercase">{passwordError}</p>}
          </div>
        </div>
      </div>
    );
  }

  const getDownloadFileName = (image: GeneratedImage) => {
    if (image.settings?.visualStyle === 'COLOR_CHANGE') {
      return 'Sản phẩm mới.png';
    }
    const code = image.settings?.productCode?.trim();
    return code ? `${code}.png` : `elmich-ai-${image.id}.png`;
  };

  const handleDownload = (e: React.MouseEvent, image: GeneratedImage) => {
    e.preventDefault();
    setAskFeedbackImage(image);
    
    // Convert base64 to blob to prevent URI length limits in browsers for 4K images
    fetch(image.url)
      .then(res => res.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = getDownloadFileName(image);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      })
      .catch(err => console.error('Download failed:', err));
  };

  const calculateCost = (image: GeneratedImage) => {
    let cost = 0;
    // Image generation cost (using implicitly selected high quality models)
    if (image.settings.imageSize === '4K') cost = 0.151;
    else if (image.settings.imageSize === '2K') cost = 0.101;
    else cost = 0.067;
    
    // Prompt generation cost (Step 1)
    if (image.settings.visualStyle === 'CONCEPT' || image.settings.visualStyle === 'STUDIO') {
      cost += 0.002; // Cost for gemini-2.5-flash
    }
    
    return cost;
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChatSessions(prev => prev.filter(s => s.id !== sessionId));
    if (activeSessionId === sessionId) {
      setActiveSessionId(null);
    }
  };

  const renderChatView = () => (
    <main className="flex-1 flex max-w-[1920px] mx-auto w-full relative bg-[#242526]">
      {/* Session Sidebar */}
      <aside className="w-[300px] border-r border-[#3E4042] bg-[#242526] flex flex-col h-full hidden md:flex shrink-0">
        <div className="p-4 border-b border-[#3E4042] flex items-center justify-between">
          <h2 className="font-bold text-white text-lg">Lịch sử chat</h2>
          <button onClick={handleNewChat} className="p-2 rounded-full hover:bg-[#18191A] text-[#1877F2]">
            <Zap size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar space-y-1">
          {chatSessions.map(s => (
            <div
              key={s.id}
              onClick={() => setActiveSessionId(s.id)}
              className={`w-full text-left p-3 rounded-xl transition-colors cursor-pointer group flex items-start justify-between ${activeSessionId === s.id ? 'bg-[#3A3B3C] font-semibold text-white' : 'text-white hover:bg-[#18191A]'}`}
            >
              <div className="flex-1 overflow-hidden pr-2">
                <div className="text-[15px] truncate">{s.title}</div>
                <div className="text-[11px] text-white mt-1">{new Date(s.timestamp).toLocaleDateString('vi-VN')}</div>
              </div>
              <button 
                onClick={(e) => handleDeleteSession(s.id, e)}
                className={`p-1.5 rounded-full hover:bg-black/10 transition-colors ${activeSessionId === s.id ? 'opacity-100 text-red-400' : 'opacity-0 text-red-400 group-hover:opacity-100'}`}
                title="Xóa đoạn chat này"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        </aside>
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-screen bg-[#242526] text-white">
        <div className="px-6 py-3 border-b border-[#3E4042] flex items-center justify-between bg-[#242526] z-10 shrink-0 shadow-sm">
          <div>
            <h2 className="font-bold text-xl">{activeSessionId ? (chatSessions.find(s => s.id === activeSessionId)?.title || 'Đoạn chat') : 'Đoạn chat mới'}</h2>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-white font-semibold">Chế độ:</span>
                <select 
                  value={chatMode}
                  onChange={e => setChatMode(e.target.value as 'chat' | 'image')}
                  className="bg-[#18191A] border-none rounded-md px-3 py-1.5 text-sm outline-none text-white font-medium focus:ring-1 focus:ring-[#1877F2] cursor-pointer"
                >
                  <option value="chat">Chat & Tư vấn</option>
                  <option value="image">Tạo ảnh AI</option>
                </select>
              </div>
              
              {chatMode === 'image' && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white font-semibold">Tỷ lệ:</span>
                    <select 
                      value={chatImageAspectRatio}
                      onChange={e => setChatImageAspectRatio(e.target.value)}
                      className="bg-[#18191A] border-none rounded-md px-3 py-1.5 text-sm outline-none text-white font-medium focus:ring-1 focus:ring-[#1877F2]"
                    >
                      <option value="1:1">1:1 (Vuông)</option>
                      <option value="16:9">16:9 (Ngang)</option>
                      <option value="9:16">9:16 (Dọc)</option>
                      <option value="4:3">4:3</option>
                      <option value="3:4">3:4</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white font-semibold">Chất lượng:</span>
                    <select 
                      value={chatImageQuality}
                      onChange={e => setChatImageQuality(e.target.value)}
                      className="bg-[#18191A] border-none rounded-md px-3 py-1.5 text-sm outline-none text-white font-medium focus:ring-1 focus:ring-[#1877F2]"
                    >
                      <option value="1K">1K</option>
                      <option value="2K">2K</option>
                      <option value="4K">4K</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:px-24 xl:px-48 flex flex-col gap-6 custom-scrollbar text-[15px]">
            {chatMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-white space-y-4 opacity-50">
                <Wand2 size={48} />
                <p className="text-xl font-medium">Bắt đầu trò chuyện với Trợ lý AI</p>
                <p className="text-sm text-center max-w-lg">
                  Tải lên hình để AI tư vấn thiết kế bằng chữ (chọn model Chat).<br/>
                  Để tạo/sửa ảnh, tải hình lên, viết yêu cầu, và bắt buộc chọn model Image (Imagen 3.0 Fast/3.1 Image).
                </p>
              </div>
            )}
            {chatMessages.map((msg, index) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group max-w-full`}>
                {msg.role === 'model' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1877F2] to-cyan-500 text-white flex-shrink-0 flex items-center justify-center font-bold text-[11px] mr-3 font-sans shadow-md border-2 border-white">
                    AI
                  </div>
                )}
                <div className={`px-4 py-3 rounded-2xl max-w-[85%] break-words flex flex-col gap-3 shadow-sm ${msg.role === 'user' ? 'bg-[#1877F2] text-white rounded-br-sm' : 'bg-[#18191A] text-white rounded-bl-sm border border-[#3A3B3C]'}`}>
                  <span className="leading-relaxed whitespace-pre-wrap">
                    {msg.role === 'model' && index === chatMessages.length - 1 ? (
                      <TypingEffect text={msg.text} />
                    ) : (
                      msg.text
                    )}
                  </span>
                  {msg.uploadedImageUrl && (
                    <img src={msg.uploadedImageUrl} alt="User Upload" className="max-w-[400px] w-full rounded-lg border border-black/10 mx-auto" />
                  )}
                  {msg.imageUrl && (
                    <img src={msg.imageUrl} alt="AI Generated" className="max-w-2xl w-full rounded-xl border border-black/10 mx-auto bg-[#242526]" />
                  )}
                </div>
              </div>
            ))}
            {isChatLoading && (
              <div className="flex justify-start items-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1877F2] to-cyan-500 text-white flex-shrink-0 flex items-center justify-center font-bold text-[11px] mr-3 font-sans shadow-md border-2 border-white">
                  AI
                </div>
                <div className="px-5 py-4 bg-[#18191A] rounded-2xl rounded-bl-sm flex gap-1.5 border border-[#3A3B3C]">
                  <div className="w-2 h-2 bg-[#65676B] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-[#65676B] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-[#65676B] rounded-full animate-bounce"></div>
                </div>
              </div>
            )}
            <div ref={chatMessagesEndRef} />
        </div>

        <div className="p-4 md:p-6 lg:px-24 xl:px-48 border-t border-[#3E4042] bg-[#242526] shrink-0">
          <FileDropzone onFilesDrop={handleImageUploadToChat} className="flex flex-col gap-3 bg-[#18191A] p-3 rounded-2xl border border-[#3E4042] focus-within:border-[#1877F2] focus-within:ring-1 focus-within:ring-[#1877F2] transition-colors shadow-sm">
            {chatInputImageBase64 && (
              <div className="relative inline-block w-20 h-20 bg-[#242526] rounded-lg border border-[#3E4042] p-1 shadow-sm">
                <img src={chatInputImageBase64} alt="Upload preview" className="w-full h-full object-contain rounded-md" />
                <button 
                  onClick={() => setChatInputImageBase64(null)}
                  className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center bg-[#050505] text-white rounded-full shadow-md hover:bg-red-500 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            <div className="flex items-end gap-2">
              <label className="p-2.5 text-white hover:text-[#1877F2] hover:bg-[#3A3B3C] rounded-full cursor-pointer transition-colors" title="Đính kèm ảnh">
                <ImageIcon size={24} />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUploadToChat} />
              </label>
              <textarea 
                placeholder="Hỏi AI về thiết kế sản phẩm, hoặc tải lên một hình ảnh..." 
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={isChatLoading}
                className="flex-1 bg-transparent px-2 py-3 text-[16px] outline-none text-white placeholder-[#65676B] resize-none h-[50px] min-h-[50px] max-h-[200px]"
                rows={1}
              />
              <button 
                onClick={handleSendMessage}
                disabled={(!chatInput.trim() && !chatInputImageBase64) || isChatLoading}
                className="p-3 text-[#1877F2] hover:bg-[#3A3B3C] rounded-full transition-colors disabled:opacity-50 disabled:bg-transparent"
              >
                <Send size={24} className={(chatInput.trim() || chatInputImageBase64) ? "fill-[#1877F2]" : ""} />
              </button>
            </div>
          </FileDropzone>
          <div className="text-center mt-3 text-xs text-white">Gemini AI có thể mắc lỗi. Vui lòng kiểm tra lại những thông tin quan trọng.</div>
        </div>
      </div>
    </main>
  );

  return (
    <div className="min-h-screen bg-[#18191A] text-white font-sans flex flex-col relative animate-fade-in">
      <AnimatePresence>
        {alertMessage && (
          <motion.div initial={{ opacity: 0, y: -20, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: -20, x: '-50%' }} className="fixed top-16 left-1/2 z-[100] bg-gray-900 border border-gray-700 text-white font-semibold px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 min-w-[300px] justify-between">
             <span className="text-[14px] leading-snug">{alertMessage}</span>
             <button onClick={() => setAlertMessage(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-800 transition-colors shrink-0 text-gray-400 hover:text-white"><X size={16} /></button>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {(appState === AppState.GENERATING || appState === AppState.ANALYZING) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-[#000000]/80 backdrop-blur-md pointer-events-auto"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#242526] border border-[#3E4042] rounded-3xl p-8 max-w-sm w-full mx-4 shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col items-center text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#1877F2] to-transparent animate-pulse"></div>
              <div className="relative mb-6">
                <div className="w-16 h-16 border-[4px] border-[#18191A] border-t-[#1877F2] rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles size={20} className="text-[#1877F2] animate-pulse" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Đang xử lý</h3>
              <p className="text-[#B0B3B8] font-medium">{loadingMessage || "AI đang làm việc, vui lòng chờ..."}</p>
              <div className="mt-8 w-full">
                <div className="h-1.5 w-full bg-[#18191A] rounded-full overflow-hidden">
                  <div className="h-full bg-[#1877F2] w-full animate-pulse"></div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      

      {viewMode === 'studio' ? (
      <main className="flex-1 flex flex-col max-w-[1920px] mx-auto w-full relative xl:h-screen bg-[#18191A] xl:bg-[#242526] xl:py-0">
        <div className="flex-1 flex flex-col xl:flex-row overflow-hidden min-h-0">
        {/* Left Sidebar Layout */}
        {settings.visualStyle !== 'PACKAGING_CHECK' && (
        <aside className="w-full xl:w-[480px] shrink-0 xl:h-full xl:overflow-y-auto custom-scrollbar px-2 mb-8 xl:mb-0 xl:pt-4 xl:border-r xl:border-[#3E4042] bg-[#242526] xl:bg-transparent flex flex-col">
          <div className="space-y-1">
             <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#3A3B3C] text-left transition-colors" onClick={() => setCurrentStep(1)}>
                <div className="w-9 h-9 rounded-full bg-[#1877F2] text-white flex items-center justify-center font-bold">AE</div>
                <span className="font-semibold text-[15px] text-white">Ai Image Elmich</span>
             </button>
          </div>
          <div className="mt-4 border-t border-[#3E4042] pt-4 px-2">
            <h3 className="text-white font-semibold text-[17px] mb-2 px-2">Công cụ</h3>
            {renderSidebar()}
          </div>
        
          

        </aside>
        )}

        {/* Center Feed Layout */}
        <section className={`flex-1 w-full mx-auto px-0 sm:px-4 flex flex-col gap-4 pb-20 mt-4 xl:mt-0 xl:h-full xl:overflow-y-auto custom-scrollbar xl:pt-4 bg-[#18191A] xl:bg-transparent ${settings.visualStyle === 'PACKAGING_CHECK' ? 'max-w-[1400px]' : 'max-w-[1000px]'}`}>
          
          {settings.visualStyle === 'BARCODE_QR_GENERATOR' ? (
            <BarcodeGenerator />
          ) : settings.visualStyle === 'PACKAGING_CHECK' ? (
            <div className="bg-[#242526] rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.2)] xl:shadow-none xl:border xl:border-[#3E4042] p-6">
               {renderPackagingCheckWorkflow()}
            </div>
          ) : (
            <div className="bg-[#242526] rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.2)] xl:shadow-none xl:border xl:border-[#3E4042]">
               <div className="border-b border-[#3E4042] p-4 font-semibold text-[17px] text-white flex justify-between items-center">
                   Trạng thái làm việc
               </div>
               {/* Feed / Main Image section */}
             {activeImage ? (
                <div className="flex flex-col">
                  <div className="flex items-center justify-between p-4 px-4">
                     <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center font-bold">AE</div>
                        <div>
                          <p className="font-semibold text-[15px] text-white">{activeImage.settings.productName || 'Ai Image Elmich'} <span className="font-normal text-white text-[13px]">đã tạo ảnh mới.</span></p>
                          <p className="text-[13px] text-white">Phiên bản 0{activeImage.variant} • Chi phí ${calculateCost(activeImage).toFixed(3)}</p>
                        </div>
                     </div>
                  </div>
                  <div className="p-4 pt-0">
     <p className="font-semibold text-[15px] text-white mb-2">{activeImage.settings.conceptTitle || activeImage.settings.techTitle || (activeImage.settings.concept ? `Yêu cầu: ${activeImage.settings.concept.substring(0, 100)}...` : `Chế độ: ${activeImage.settings.visualStyle}`)}</p>
     <details className="bg-[#18191A] p-3 rounded-lg border border-[#3E4042] group cursor-pointer marker:content-[''] outline-none">
       <summary className="text-[11px] font-bold text-white outline-none uppercase flex items-center justify-between select-none">
         <span>Hiện prompt</span>
         <ChevronDown size={14} className="group-open:rotate-180 transition-transform" />
       </summary>
       <div className="mt-2 pt-2 border-t border-[#3E4042] cursor-text">
         <p className="text-[13px] text-white whitespace-pre-wrap font-mono leading-relaxed">{activeImage.prompt}</p>
       </div>
     </details>
  </div>
                  <div className="bg-[#3A3B3C] w-full relative">
                     <img src={activeImage.url} alt="Generated" className="w-full max-h-[70vh] object-contain block mx-auto" />
                  </div>
                  <div className="px-4 py-3 flex items-center justify-between border-b border-[#3E4042]">
                     <div className="flex items-center gap-1 text-white text-[15px]">
                       <div className="w-5 h-5 rounded-full bg-[#1877F2] flex items-center justify-center shadow-sm">
                          <Check size={12} className="text-white" />
                       </div>
                       Tạo thành công
                     </div>
                  </div>
                  <div className="flex px-2 py-1 border-b border-[#3E4042]">
                     <a href="#" onClick={(e) => handleDownload(e, activeImage)} className="flex-1 flex gap-2 items-center justify-center py-2 text-white font-semibold text-[15px] hover:bg-[#18191A] rounded-md mx-1 transition-colors">
                        <Download size={20} /> Tải xuống
                     </a>
                  </div>
                  
                  {/* Edit AI Image Section inside the post (comments area) */}
                  <div className="p-4 bg-[#18191A] rounded-b-lg flex flex-col gap-3">
                    <p className="font-semibold text-[13px] text-white">Chỉnh sửa ảnh với AI</p>
                    <div className="flex flex-col sm:flex-row gap-2">
                       <select 
                         value={editQuality}
                         onChange={e => setEditQuality(e.target.value as ImageSize)}
                         disabled={isEditingImage}
                         className="flex-1 bg-[#242526] border border-[#3E4042] rounded-lg px-3 py-2 text-[14px] outline-none focus:border-[#1877F2]"
                       >
                         <option value="1K">1K Standard</option>
                         <option value="2K">2K Pro</option>
                         <option value="4K">4K Ultra</option>
                       </select>
                    </div>
                    <textarea value={editPrompt} onChange={e => setEditPrompt(e.target.value)} disabled={isEditingImage} placeholder="Viết yêu cầu chỉnh sửa..." className="w-full bg-[#242526] border border-[#3E4042] rounded-lg px-3 py-2 text-[14px] outline-none focus:border-[#1877F2] resize-none h-16" />
                    <button onClick={handleEditImage} disabled={!editPrompt.trim() || isEditingImage} className="w-full py-2 bg-[#1877F2] text-white font-semibold rounded-lg hover:bg-[#166FE5] disabled:opacity-50">
                       {isEditingImage ? 'Đang xử lý...' : 'Chỉnh sửa'}
                    </button>
                  </div>
                </div>
             ) : (
                <div className="p-8 text-center text-white font-semibold">
                   {renderInstructions()}
                </div>
             )}
          </div>
          )}

          </section>
        </div>

      {/* Footer Gallery Rail */}
      {settings.visualStyle !== 'BARCODE_QR_GENERATOR' && settings.visualStyle !== 'PACKAGING_CHECK' && (
      <div className="w-full shrink-0 border-t border-[#3E4042] bg-[#18191A] xl:bg-[#242526] z-10 flex flex-col h-[260px]">
        <div className="p-4 flex items-center justify-between shrink-0">
          <span className="font-semibold text-white text-[17px]">Bộ sưu tập</span>
          <div className="flex items-center gap-4">
            <span className="text-[13px] text-white hidden sm:inline">Ảnh sẽ tự động hết hạn và bị xóa sau 7 ngày. Bạn nhớ lưu ảnh về máy nhé.</span>
            <button title="Làm mới bộ sưu tập" className="text-[#1877F2] font-semibold text-[14px] hover:underline" onClick={() => {
              setGallery([]);
              setActiveImage(null);
            }}>Xóa tất cả</button>
          </div>
        </div>
        
        <div className="flex-1 flex gap-4 overflow-x-auto px-4 pb-6 custom-scrollbar items-center">
          
          {gallery.map(img => (
            <div key={img.id} className="relative h-full aspect-square shrink-0 bg-[#3A3B3C] rounded-lg overflow-hidden group cursor-pointer" onClick={() => setActiveImage(img)}>
               <img src={img.url} className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 object-center ${activeImage?.id === img.id ? 'opacity-50' : ''}`} />
               {activeImage?.id === img.id && (
                 <div className="absolute inset-0 flex items-center justify-center bg-[#1877F2]/20">
                    <Check size={24} className="text-white drop-shadow-md" />
                 </div>
               )}
            </div>
          ))}
          {gallery.length === 0 && (
             <div className="w-full flex justify-center text-white text-[14px]">
               Chưa có ảnh nào được tạo.
             </div>
          )}
        </div>
      </div>
      )}
  
      </main>
      ) : renderChatView()}

      {/* Feedback Modal */}
      <AnimatePresence>
        {askFeedbackImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-black/60 flex items-center justify-center p-4"
            onClick={() => setAskFeedbackImage(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#242526] rounded-xl shadow-2xl max-w-sm w-full overflow-hidden"
            >
              <div className="p-4 border-b border-[#3E4042]">
                <h3 className="font-bold text-lg text-center">Ảnh này có đạt yêu cầu không?</h3>
              </div>
              <div className="p-4 text-center text-white">
                <p>Phản hồi của bạn giúp AI học hỏi và tạo ra kết quả tốt hơn trong những lần sau.</p>
              </div>
              <div className="flex border-t border-[#3E4042]">
                <button 
                  className="flex-1 py-3 font-semibold text-white hover:bg-[#18191A] transition-colors border-r border-[#3E4042]"
                  onClick={() => setAskFeedbackImage(null)}
                >
                  Không hẳn
                </button>
                <button 
                  className="flex-1 py-3 font-bold text-[#1877F2] hover:bg-[#18191A] transition-colors"
                  onClick={() => {
                    const newPrompt: SuccessfulPrompt = {
                      id: Date.now().toString(),
                      imageSettings: askFeedbackImage.settings,
                      timestamp: Date.now()
                    };
                    setSuccessfulPrompts(prev => [...prev, newPrompt]);
                    setAskFeedbackImage(null);
                  }}
                >
                  Rất tốt!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;