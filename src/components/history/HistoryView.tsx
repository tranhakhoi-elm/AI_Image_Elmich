import React, { useState, useEffect } from 'react';
import { 
  Images, 
  MessageSquare, 
  Search, 
  RefreshCw, 
  Download, 
  ExternalLink, 
  Clock, 
  Tag, 
  DollarSign, 
  Copy, 
  Check, 
  X, 
  Sparkles, 
  Filter,
  Layers,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchImageHistory, fetchChatHistory, ImageHistoryItem, ChatHistoryItem } from '../../../services/historyService';

const STYLE_NAMES: Record<string, string> = {
  'CONCEPT': 'Concept Lifestyle',
  'SCENE_STAGING': 'Phối cảnh Thực tế',
  'TECH_PS': 'Điểm mạnh Kỹ thuật',
  'COLOR_CHANGE': 'Đổi màu Pantone',
  'PACKAGING_MOCKUP': 'Mockup Bao bì 3D',
  'TECH_EFFECTS': 'Hiệu ứng Công nghệ',
  'WHITE_BG_RETOUCH': 'Retouch Phông trắng',
  '3D_TO_REAL_WHITE_BG': 'Render 3D sang Ảnh thật',
  'TRACING_ASSISTANT': 'Trợ lý Đồ nét',
  'LINE_ART': 'Bản vẽ Kỹ thuật',
  'STUDIO': 'Chụp Studio Nghệ thuật',
  'TRACK_SOCKET_STAGING': 'Ray Ổ Cắm',
  'TRANSLATE_PACKAGING': 'Dịch Bao bì',
  'PACKAGING_CHECK': 'Kiểm duyệt Bao bì'
};

export const HistoryView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'images' | 'chats'>('images');
  const [images, setImages] = useState<ImageHistoryItem[]>([]);
  const [chats, setChats] = useState<ChatHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<string>('ALL');
  
  // Lightbox / Detail modal state
  const [selectedImage, setSelectedImage] = useState<ImageHistoryItem | null>(null);
  const [selectedChat, setSelectedChat] = useState<ChatHistoryItem | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'images') {
        const res = await fetchImageHistory({ limit: 60 });
        setImages(res.items || []);
      } else {
        const res = await fetchChatHistory({ limit: 40 });
        setChats(res.items || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const filteredImages = images.filter(img => {
    const query = searchQuery.toLowerCase().trim();
    const matchQuery = !query || 
      (img.productName && img.productName.toLowerCase().includes(query)) ||
      (img.productCode && img.productCode.toLowerCase().includes(query)) ||
      (img.prompt && img.prompt.toLowerCase().includes(query));
    const matchStyle = selectedStyle === 'ALL' || img.visualStyle === selectedStyle;
    return matchQuery && matchStyle;
  });

  const filteredChats = chats.filter(c => {
    const query = searchQuery.toLowerCase().trim();
    return !query || (c.title && c.title.toLowerCase().includes(query));
  });

  return (
    <main className="flex-1 flex flex-col max-w-[1920px] mx-auto w-full min-h-[calc(100vh-56px)] bg-[#18191A] text-white">
      {/* Top Controls Bar */}
      <div className="border-b border-[#3E4042] bg-[#242526] px-6 py-4 sticky top-14 z-20 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-[#18191A] p-1 rounded-xl border border-[#3E4042] self-start">
            <button
              onClick={() => setActiveTab('images')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'images'
                  ? 'bg-[#1877F2] text-white shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-[#242526]'
              }`}
            >
              <Images size={15} />
              <span>Ảnh đã tạo ({images.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('chats')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'chats'
                  ? 'bg-[#1877F2] text-white shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-[#242526]'
              }`}
            >
              <MessageSquare size={15} />
              <span>Lịch sử Chat ({chats.length})</span>
            </button>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[240px] flex-1 md:flex-none">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={activeTab === 'images' ? "Tìm theo tên sản phẩm, mã, prompt..." : "Tìm đoạn chat..."}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#18191A] border border-[#3E4042] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#1877F2]"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                  <X size={12} />
                </button>
              )}
            </div>

            {activeTab === 'images' && (
              <div className="flex items-center gap-1.5 bg-[#18191A] border border-[#3E4042] rounded-xl px-2.5 py-1.5">
                <Filter size={13} className="text-gray-400" />
                <select
                  value={selectedStyle}
                  onChange={e => setSelectedStyle(e.target.value)}
                  className="bg-transparent text-xs text-white outline-none cursor-pointer pr-1"
                >
                  <option value="ALL">Tất cả phong cách</option>
                  {Object.entries(STYLE_NAMES).map(([code, name]) => (
                    <option key={code} value={code} className="bg-[#242526] text-white">{name}</option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#3A3B3C] hover:bg-[#4E4F50] text-xs font-semibold text-gray-200 transition-colors border border-[#3E4042] disabled:opacity-50"
              title="Làm mới danh sách"
            >
              <RefreshCw size={13} className={loading ? "animate-spin text-[#1877F2]" : ""} />
              <span className="hidden sm:inline">Làm mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-80 text-gray-400">
            <RefreshCw size={32} className="animate-spin text-[#1877F2] mb-3" />
            <p className="text-sm font-medium">Đang tải lịch sử dùng chung từ máy chủ...</p>
          </div>
        ) : activeTab === 'images' ? (
          filteredImages.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredImages.map((img) => (
                <div
                  key={img.id}
                  onClick={() => setSelectedImage(img)}
                  className="group relative bg-[#242526] rounded-xl overflow-hidden border border-[#3E4042] hover:border-[#1877F2] transition-all duration-200 cursor-pointer flex flex-col shadow-sm"
                >
                  {/* Image Aspect Box */}
                  <div className="relative aspect-square w-full bg-[#18191A] overflow-hidden">
                    <img
                      src={img.url}
                      alt={img.productName || 'Generated Image'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <span className="text-xs bg-[#1877F2] text-white px-2.5 py-1 rounded-full font-bold shadow-md flex items-center gap-1">
                        <Sparkles size={11} /> Xem chi tiết
                      </span>
                    </div>

                    {/* Style Tag Badge */}
                    {img.visualStyle && (
                      <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-[10px] text-white font-semibold px-2 py-0.5 rounded-md border border-white/10">
                        {STYLE_NAMES[img.visualStyle] || img.visualStyle}
                      </div>
                    )}
                  </div>

                  {/* Info Box */}
                  <div className="p-3 flex flex-col gap-1 flex-1 justify-between text-xs">
                    <div>
                      <div className="font-bold text-white truncate" title={img.productName || 'Sản phẩm Elmich'}>
                        {img.productName || 'Sản phẩm Elmich'}
                      </div>
                      {img.productCode && (
                        <div className="text-[11px] text-[#1877F2] font-semibold truncate">
                          #{img.productCode}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-gray-400 mt-2 pt-2 border-t border-[#3E4042]">
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(img.timestamp).toLocaleDateString('vi-VN')}
                      </span>
                      {img.costUSD ? (
                        <span className="text-emerald-400 font-semibold">
                          ${img.costUSD.toFixed(3)}
                        </span>
                      ) : (
                        <span className="text-gray-500">{img.imageSize || '1K'}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-96 text-center max-w-md mx-auto p-6 bg-[#242526] rounded-2xl border border-[#3E4042]">
              <div className="w-14 h-14 rounded-2xl bg-[#18191A] border border-[#3E4042] flex items-center justify-center text-gray-400 mb-4">
                <Images size={28} className="text-[#1877F2]" />
              </div>
              <h3 className="font-bold text-white text-base mb-1">Chưa có ảnh nào trong lịch sử</h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                Mọi hình ảnh được tạo hoặc chỉnh sửa trong Studio sẽ tự động được ghi lại tại đây để cả đội ngũ cùng xem và tái sử dụng.
              </p>
              <div className="text-[11px] text-left bg-[#18191A] p-3.5 rounded-xl border border-[#3E4042] text-gray-400 w-full space-y-1">
                <span className="font-bold text-gray-300 block mb-1">Lưu ý cấu hình Cloud:</span>
                <p>• Dữ liệu ảnh được đồng bộ qua Cloud Storage & Firestore khi khai báo <code className="text-blue-400">GCS_BUCKET_NAME</code> trong file <code className="text-blue-400">.env</code>.</p>
                <p>• Nếu chưa kết nối Cloud, hệ thống tự động lưu vào bộ nhớ tạm trong phiên làm việc.</p>
              </div>
            </div>
          )
        ) : (
          /* Chats List */
          filteredChats.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredChats.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedChat(c)}
                  className="bg-[#242526] rounded-xl p-4 border border-[#3E4042] hover:border-[#1877F2] transition-all cursor-pointer flex flex-col justify-between group shadow-sm"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-white text-sm group-hover:text-[#1877F2] transition-colors line-clamp-2">
                        {c.title || 'Đoạn chat không tên'}
                      </h4>
                      <ChevronRight size={16} className="text-gray-500 group-hover:text-white shrink-0 mt-0.5" />
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2">
                      {c.messages && c.messages.length > 0 
                        ? (c.messages[c.messages.length - 1].text || '[Hình ảnh]') 
                        : 'Không có nội dung tin nhắn'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-400 pt-3 mt-3 border-t border-[#3E4042]">
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {new Date(c.timestamp).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="bg-[#18191A] px-2 py-0.5 rounded-full border border-[#3E4042] text-gray-300">
                      {c.messages ? c.messages.length : 0} tin nhắn
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-80 text-center max-w-md mx-auto p-6 bg-[#242526] rounded-2xl border border-[#3E4042]">
              <MessageSquare size={32} className="text-[#1877F2] mb-3" />
              <h3 className="font-bold text-white text-base mb-1">Chưa có đoạn chat nào được lưu</h3>
              <p className="text-xs text-gray-400">
                Các đoạn hội thoại tư vấn thiết kế và tạo ảnh từ Trợ lý Chat AI sẽ hiển thị ở đây.
              </p>
            </div>
          )
        )}
      </div>

      {/* Image Detail Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#242526] border border-[#3E4042] rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Image Preview */}
              <div className="flex-1 bg-[#18191A] flex items-center justify-center p-4 min-h-[300px] max-h-[60vh] md:max-h-none overflow-hidden relative">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.productName || 'Preview'}
                  className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-lg"
                />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-3 right-3 md:hidden w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Details Sidebar */}
              <div className="w-full md:w-[380px] p-6 flex flex-col justify-between border-t md:border-t-0 md:border-l border-[#3E4042] overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-white text-lg">
                        {selectedImage.productName || 'Sản phẩm Elmich'}
                      </h3>
                      {selectedImage.productCode && (
                        <p className="text-xs text-[#1877F2] font-semibold">
                          Mã: #{selectedImage.productCode}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedImage(null)}
                      className="hidden md:flex w-8 h-8 rounded-full bg-[#18191A] hover:bg-[#3A3B3C] text-gray-400 hover:text-white items-center justify-center transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-[#18191A] p-2.5 rounded-xl border border-[#3E4042]">
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">Chế độ</span>
                      <span className="text-white font-medium">
                        {STYLE_NAMES[selectedImage.visualStyle || ''] || selectedImage.visualStyle || 'N/A'}
                      </span>
                    </div>

                    <div className="bg-[#18191A] p-2.5 rounded-xl border border-[#3E4042]">
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">Tỷ lệ & Size</span>
                      <span className="text-white font-medium">
                        {selectedImage.aspectRatio || '1:1'} • {selectedImage.imageSize || '1K'}
                      </span>
                    </div>

                    <div className="bg-[#18191A] p-2.5 rounded-xl border border-[#3E4042]">
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">Thời gian</span>
                      <span className="text-white font-medium">
                        {new Date(selectedImage.timestamp).toLocaleDateString('vi-VN')}
                      </span>
                    </div>

                    <div className="bg-[#18191A] p-2.5 rounded-xl border border-[#3E4042]">
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">Chi phí ước tính</span>
                      <span className="text-emerald-400 font-bold">
                        ${(selectedImage.costUSD || 0).toFixed(3)} USD
                      </span>
                    </div>
                  </div>

                  {/* Prompt Box */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400 font-bold uppercase text-[10px]">Prompt sinh ảnh</span>
                      <button
                        onClick={() => handleCopyPrompt(selectedImage.prompt)}
                        className="text-[#1877F2] hover:underline flex items-center gap-1 text-[11px] font-semibold"
                      >
                        {copiedPrompt ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                        {copiedPrompt ? 'Đã sao chép' : 'Sao chép'}
                      </button>
                    </div>
                    <div className="bg-[#18191A] p-3 rounded-xl border border-[#3E4042] text-xs text-gray-300 max-h-48 overflow-y-auto custom-scrollbar font-mono leading-relaxed whitespace-pre-wrap select-all">
                      {selectedImage.prompt || 'Không có thông tin prompt.'}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 mt-4 border-t border-[#3E4042] flex gap-2">
                  <a
                    href={selectedImage.url}
                    download={`elmich_${selectedImage.productCode || 'image'}_${Date.now()}.png`}
                    className="flex-1 py-3 bg-[#1877F2] hover:bg-blue-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-md"
                  >
                    <Download size={14} /> Tải ảnh về máy
                  </a>
                  {selectedImage.url.startsWith('http') && (
                    <a
                      href={selectedImage.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-3 bg-[#18191A] hover:bg-[#3A3B3C] text-gray-200 rounded-xl border border-[#3E4042] flex items-center justify-center transition-colors"
                      title="Mở ảnh gốc trong tab mới"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Detail Modal */}
      <AnimatePresence>
        {selectedChat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
            onClick={() => setSelectedChat(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#242526] border border-[#3E4042] rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-4 border-b border-[#3E4042] flex items-center justify-between bg-[#242526]">
                <div>
                  <h3 className="font-bold text-white text-base">{selectedChat.title}</h3>
                  <span className="text-xs text-gray-400">
                    {new Date(selectedChat.timestamp).toLocaleString('vi-VN')}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedChat(null)}
                  className="w-8 h-8 rounded-full bg-[#18191A] text-gray-400 hover:text-white flex items-center justify-center"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Messages list */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar bg-[#18191A]">
                {selectedChat.messages && selectedChat.messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-[#1877F2] text-white rounded-br-sm'
                          : 'bg-[#242526] text-gray-200 border border-[#3E4042] rounded-bl-sm'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                      {msg.uploadedImageUrl && (
                        <img
                          src={msg.uploadedImageUrl}
                          alt="Uploaded"
                          className="mt-2 max-h-48 rounded-lg border border-black/20"
                        />
                      )}
                      {msg.imageUrl && (
                        <img
                          src={msg.imageUrl}
                          alt="AI Generated"
                          className="mt-2 max-h-64 rounded-lg border border-black/20"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};
