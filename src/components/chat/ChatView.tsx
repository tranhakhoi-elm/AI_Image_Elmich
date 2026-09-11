import React, { useState, useRef, useEffect } from 'react';
import { 
  Zap, 
  Trash2, 
  Wand2, 
  Send, 
  X, 
  Image as ImageIcon,
  MessageSquare,
  Plus,
  Menu
} from 'lucide-react';
import { ChatMessage, ChatSession } from '../../../types';
import { generateImageForChat, chatWithAI } from '../../../services/geminiService';
import { logChatSession, logGeneratedImage } from '../../../services/historyService';

const TypingEffect: React.FC<{ text: string }> = ({ text }) => {
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
      {displayedText.split('\n').map((line, i, arr) => (
        <React.Fragment key={i}>
          {line}
          {i !== arr.length - 1 && <br />}
        </React.Fragment>
      ))}
    </span>
  );
};

interface ChatViewProps {
  chatSessions: ChatSession[];
  setChatSessions: React.Dispatch<React.SetStateAction<ChatSession[]>>;
  activeSessionId: string | null;
  setActiveSessionId: (id: string | null) => void;
  handleDeleteSession: (sessionId: string, e: React.MouseEvent) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  chatSessions,
  setChatSessions,
  activeSessionId,
  setActiveSessionId,
  handleDeleteSession
}) => {
  const currentSession = chatSessions.find(s => s.id === activeSessionId);
  const chatMessages = currentSession?.messages || [];
  
  const [chatInput, setChatInput] = useState('');
  const [chatInputImageBase64, setChatInputImageBase64] = useState<string | null>(null);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatMode, setChatMode] = useState<'chat' | 'image'>('chat');
  const [chatImageAspectRatio, setChatImageAspectRatio] = useState('1:1');
  const [chatImageQuality, setChatImageQuality] = useState('1K');
  
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleSendMessage = async () => {
    if ((!chatInput.trim() && !chatInputImageBase64) || isChatLoading) return;
    
    const newUserMsg: ChatMessage = { 
      id: Date.now().toString(), 
      role: 'user', 
      text: chatInput, 
      uploadedImageUrl: chatInputImageBase64 || undefined 
    };
    
    let targetSessionId = activeSessionId;
    let currentSessionTitle = 'Đoạn chat mới';

    if (!targetSessionId) {
      targetSessionId = Date.now().toString();
      currentSessionTitle = chatInput.trim().slice(0, 30) || 'Đoạn chat mới';
      setActiveSessionId(targetSessionId);
      const newSession: ChatSession = { 
        id: targetSessionId, 
        title: currentSessionTitle, 
        messages: [newUserMsg], 
        timestamp: Date.now() 
      };
      setChatSessions(prev => [newSession, ...prev]);
    } else {
      const existing = chatSessions.find(s => s.id === targetSessionId);
      if (existing) currentSessionTitle = existing.title;
      setChatSessions(prev => prev.map(s => s.id === targetSessionId ? { 
        ...s, 
        messages: [...s.messages, newUserMsg], 
        timestamp: Date.now() 
      } : s));
    }

    setChatInput('');
    setChatInputImageBase64(null);
    setIsChatLoading(true);

    try {
      let newModelMsg: ChatMessage;
      if (chatMode === 'image') {
        const fullPrompt = `${chatInput}`;
        const defaultImageModel = 'gemini-3.1-flash-image';
        const imageUrl = await generateImageForChat(
          fullPrompt, 
          defaultImageModel, 
          chatImageAspectRatio, 
          chatInputImageBase64 || undefined, 
          chatImageQuality
        );
        newModelMsg = { 
          id: Date.now().toString() + 'm', 
          role: 'model', 
          text: 'Đây là hình ảnh của bạn:', 
          imageUrl 
        };

        // Also log image to shared history
        logGeneratedImage({
          url: imageUrl,
          prompt: fullPrompt,
          productName: 'Trợ lý Chat AI',
          visualStyle: 'CONCEPT',
          aspectRatio: chatImageAspectRatio,
          imageSize: chatImageQuality,
          timestamp: Date.now()
        }).catch(err => console.warn('Could not log chat image:', err));
      } else {
        const currentMsgs = targetSessionId ? (chatSessions.find(s => s.id === targetSessionId)?.messages || []) : [];
        const messagesToSend = [...currentMsgs, newUserMsg];
        const defaultChatModel = 'gemini-2.5-flash';
        const replyText = await chatWithAI(messagesToSend, defaultChatModel);
        newModelMsg = { 
          id: Date.now().toString() + 'm', 
          role: 'model', 
          text: replyText 
        };
      }

      const currentMsgs = (chatSessions.find(s => s.id === targetSessionId)?.messages || []);
      const finalMessages = [...currentMsgs, newUserMsg, newModelMsg];
      const updatedSessionRecord = {
        id: targetSessionId,
        title: currentSessionTitle,
        messages: finalMessages,
        timestamp: Date.now()
      };

      setChatSessions(prev => prev.map(s => s.id === targetSessionId ? updatedSessionRecord : s));

      // Persist to shared backend
      logChatSession(updatedSessionRecord).catch(err => {
        console.warn('Could not persist chat session to server:', err);
      });
    } catch (e: any) {
      const errorMsg: ChatMessage = { 
        id: Date.now().toString() + 'e', 
        role: 'model', 
        text: `⚠️ Lỗi: ${e.message || 'Đã xảy ra lỗi trong quá trình xử lý.'}` 
      };
      setChatSessions(prev => prev.map(s => s.id === targetSessionId ? { 
        ...s, 
        messages: [...s.messages, errorMsg], 
        timestamp: Date.now() 
      } : s));
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleImageUploadToChat = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setChatInputImageBase64(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleNewChat = () => {
    setActiveSessionId(null);
  };

  return (
    <main className="flex-1 flex max-w-[1920px] mx-auto w-full relative bg-[#242526]">
      {/* Mobile Drawer Backdrop */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Session Sidebar (Desktop & Mobile Drawer) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-[300px] bg-[#242526] border-r border-[#3E4042] flex flex-col h-full shrink-0 transition-transform duration-300
        md:static md:translate-x-0
        ${isMobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 border-b border-[#3E4042] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-[#1877F2]" />
            <h2 className="font-bold text-white text-base">Lịch sử chat</h2>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => {
                handleNewChat();
                setIsMobileSidebarOpen(false);
              }} 
              className="p-2 rounded-full hover:bg-[#18191A] text-[#1877F2] transition-colors" 
              title="Tạo đoạn chat mới"
            >
              <Plus size={20} />
            </button>
            <button 
              onClick={() => setIsMobileSidebarOpen(false)} 
              className="p-2 rounded-full hover:bg-[#18191A] text-gray-400 hover:text-white md:hidden transition-colors" 
              title="Đóng menu"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar space-y-1">
          {chatSessions.length === 0 ? (
            <div className="p-4 text-center text-xs text-gray-400">
              Chưa có đoạn chat nào. Bắt đầu nhắn tin để lưu lịch sử!
            </div>
          ) : (
            chatSessions.map(s => (
              <div
                key={s.id}
                onClick={() => {
                  setActiveSessionId(s.id);
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full text-left p-3 rounded-xl transition-colors cursor-pointer group flex items-start justify-between ${
                  activeSessionId === s.id ? 'bg-[#3A3B3C] font-semibold text-white' : 'text-white hover:bg-[#18191A]'
                }`}
              >
                <div className="flex-1 overflow-hidden pr-2">
                  <div className="text-[14px] truncate">{s.title}</div>
                  <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-2">
                    <span>{new Date(s.timestamp).toLocaleDateString('vi-VN')}</span>
                    <span>•</span>
                    <span>{s.messages?.length || 0} tin nhắn</span>
                  </div>
                </div>
                <button 
                  onClick={(e) => handleDeleteSession(s.id, e)}
                  className={`p-1.5 rounded-full hover:bg-black/10 transition-colors ${
                    activeSessionId === s.id ? 'opacity-100 text-red-400' : 'opacity-0 text-red-400 group-hover:opacity-100'
                  }`}
                  title="Xóa đoạn chat này"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          )}
        </div>
      </aside>
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-screen bg-[#242526] text-white min-w-0">
        <div className="px-4 md:px-6 py-3 border-b border-[#3E4042] flex items-center justify-between bg-[#242526] z-10 shrink-0 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl bg-[#18191A] border border-[#3E4042] text-gray-300 hover:text-white shrink-0"
              title="Xem danh sách chat"
            >
              <Menu size={18} />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base md:text-xl truncate">
                  {activeSessionId ? (chatSessions.find(s => s.id === activeSessionId)?.title || 'Đoạn chat') : 'Đoạn chat mới'}
                </h2>
                <button
                  onClick={handleNewChat}
                  className="hidden sm:inline-flex items-center gap-1 text-[11px] bg-[#18191A] border border-[#3E4042] hover:border-[#1877F2] text-gray-300 hover:text-white px-2.5 py-1 rounded-lg transition-colors shrink-0"
                  title="Tạo đoạn chat mới"
                >
                  <Plus size={12} className="text-[#1877F2]" />
                  <span>Đoạn chat mới</span>
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 font-semibold">Chế độ:</span>
                  <select 
                    value={chatMode}
                    onChange={e => setChatMode(e.target.value as 'chat' | 'image')}
                    className="bg-[#18191A] border border-[#3E4042] rounded-md px-2.5 py-1 text-xs outline-none text-white font-medium focus:ring-1 focus:ring-[#1877F2] cursor-pointer"
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
      </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:px-24 xl:px-48 flex flex-col gap-6 custom-scrollbar text-[15px]">
          {chatMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-white space-y-4 opacity-50">
              <Wand2 size={48} />
              <p className="text-xl font-medium">Bắt đầu trò chuyện với Trợ lý AI</p>
              <p className="text-sm text-center max-w-lg">
                Tải lên hình để AI tư vấn thiết kế bằng chữ (chế độ Chat & Tư vấn).<br/>
                Để tạo hoặc sửa ảnh bằng prompt tự nhiên, chuyển sang chế độ Tạo ảnh AI.
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
              <div className={`px-4 py-3 rounded-2xl max-w-[85%] break-words flex flex-col gap-3 shadow-sm ${
                msg.role === 'user' ? 'bg-[#1877F2] text-white rounded-br-sm' : 'bg-[#18191A] text-white rounded-bl-sm border border-[#3A3B3C]'
              }`}>
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
          <div className="flex flex-col gap-3 bg-[#18191A] p-3 rounded-2xl border border-[#3E4042] focus-within:border-[#1877F2] focus-within:ring-1 focus-within:ring-[#1877F2] transition-colors shadow-sm">
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
          </div>
          <div className="text-center mt-3 text-xs text-gray-400">Gemini AI có thể mắc lỗi. Vui lòng kiểm tra lại những thông tin quan trọng.</div>
        </div>
      </div>
    </main>
  );
};
