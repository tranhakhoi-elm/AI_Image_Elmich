import React, { useCallback, useEffect, useState } from 'react';
import { Image as ImageIcon, MessageCircle, Loader2, X, RefreshCw } from 'lucide-react';
import {
  fetchImageHistory,
  fetchChatHistory,
  ImageHistoryRecord,
  ChatHistorySession,
} from '../../../services/historyService';

type HistoryTab = 'images' | 'chats';

const LoadingState: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
    <Loader2 size={28} className="animate-spin text-[#1877F2]" />
    <span className="text-sm">Đang tải lịch sử...</span>
  </div>
);

const EmptyState: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex flex-col items-center justify-center py-16 text-gray-500 gap-2">
    <ImageIcon size={32} className="text-gray-600" />
    <span className="text-sm">{text}</span>
  </div>
);

const HistoryErrorState: React.FC<{ message: string }> = ({ message }) => (
  <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-xs rounded-xl p-4 mb-4">
    <div className="font-bold mb-1">Chưa thể tải Lịch sử dùng chung</div>
    <div>{message}</div>
    <div className="mt-2 text-yellow-400/80">
      Nếu bạn là quản trị hệ thống: kiểm tra biến môi trường{' '}
      <code className="bg-black/30 px-1 rounded">GCS_BUCKET_NAME</code> và quyền Firestore/Storage của
      Service Account — xem <code className="bg-black/30 px-1 rounded">ARCHITECTURE.md</code>.
    </div>
  </div>
);

export const HistoryView: React.FC = () => {
  const [tab, setTab] = useState<HistoryTab>('images');

  const [images, setImages] = useState<ImageHistoryRecord[]>([]);
  const [imagesCursor, setImagesCursor] = useState<string | null>(null);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [imagesError, setImagesError] = useState<string | null>(null);
  const [imagesLoadedOnce, setImagesLoadedOnce] = useState(false);
  const [activeImage, setActiveImage] = useState<ImageHistoryRecord | null>(null);

  const [chats, setChats] = useState<ChatHistorySession[]>([]);
  const [chatsCursor, setChatsCursor] = useState<string | null>(null);
  const [chatsLoading, setChatsLoading] = useState(false);
  const [chatsError, setChatsError] = useState<string | null>(null);
  const [chatsLoadedOnce, setChatsLoadedOnce] = useState(false);
  const [expandedChatId, setExpandedChatId] = useState<string | null>(null);

  const loadImages = useCallback(async (cursor?: string) => {
    setImagesLoading(true);
    setImagesError(null);
    const res = await fetchImageHistory(cursor);
    if (res.success) {
      setImages(prev => (cursor ? [...prev, ...(res.items || [])] : res.items || []));
      setImagesCursor(res.nextCursor || null);
    } else {
      setImagesError(res.error || 'Không tải được lịch sử ảnh.');
    }
    setImagesLoading(false);
    setImagesLoadedOnce(true);
  }, []);

  const loadChats = useCallback(async (cursor?: string) => {
    setChatsLoading(true);
    setChatsError(null);
    const res = await fetchChatHistory(cursor);
    if (res.success) {
      setChats(prev => (cursor ? [...prev, ...(res.items || [])] : res.items || []));
      setChatsCursor(res.nextCursor || null);
    } else {
      setChatsError(res.error || 'Không tải được lịch sử chat.');
    }
    setChatsLoading(false);
    setChatsLoadedOnce(true);
  }, []);

  useEffect(() => {
    if (tab === 'images' && !imagesLoadedOnce) loadImages();
    if (tab === 'chats' && !chatsLoadedOnce) loadChats();
  }, [tab, imagesLoadedOnce, chatsLoadedOnce, loadImages, loadChats]);

  return (
    <main className="flex-1 flex flex-col max-w-[1400px] mx-auto w-full p-4 md:p-6 gap-4 text-white overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Lịch sử dùng chung</h1>
          <p className="text-xs text-gray-400 mt-1">
            Ảnh và đoạn chat được lưu trên máy chủ chung của team — xem được ở bất kỳ máy/trình duyệt nào.
          </p>
        </div>
        <button
          onClick={() => (tab === 'images' ? loadImages() : loadChats())}
          className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-[#3A3B3C] transition-colors shrink-0"
        >
          <RefreshCw size={14} className={imagesLoading || chatsLoading ? 'animate-spin' : ''} />
          <span>Làm mới</span>
        </button>
      </div>

      <div className="flex items-center bg-[#18191A] p-1 rounded-xl border border-[#3E4042] w-fit">
        <button
          onClick={() => setTab('images')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            tab === 'images' ? 'bg-[#1877F2] text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <ImageIcon size={14} /> Ảnh đã tạo
        </button>
        <button
          onClick={() => setTab('chats')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            tab === 'chats' ? 'bg-[#1877F2] text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <MessageCircle size={14} /> Lịch sử Chat
        </button>
      </div>

      <div className="flex-1">
        {tab === 'images' && (
          <>
            {imagesError && <HistoryErrorState message={imagesError} />}
            {!imagesError && imagesLoadedOnce && images.length === 0 && (
              <EmptyState text="Chưa có ảnh nào được ghi vào lịch sử dùng chung." />
            )}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                {images.map(img => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(img)}
                    className="text-left bg-[#242526] border border-[#3E4042] rounded-xl overflow-hidden hover:border-[#1877F2] transition-colors group"
                  >
                    <div className="aspect-square bg-[#18191A] overflow-hidden">
                      {img.imageUrl ? (
                        <img
                          src={img.imageUrl}
                          alt={img.productName || img.visualStyle}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs text-center p-2">
                          Link xem đã hết hạn
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <div className="text-xs font-semibold text-white truncate">
                        {img.productName || img.visualStyle || 'Không tên'}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {new Date(img.timestamp).toLocaleString('vi-VN')}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {imagesCursor && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => loadImages(imagesCursor)}
                  disabled={imagesLoading}
                  className="px-4 py-2 bg-[#3A3B3C] hover:bg-[#4E4F50] rounded-lg text-xs font-bold disabled:opacity-50 flex items-center gap-2"
                >
                  {imagesLoading && <Loader2 size={14} className="animate-spin" />}
                  Tải thêm
                </button>
              </div>
            )}
            {imagesLoading && images.length === 0 && <LoadingState />}
          </>
        )}

        {tab === 'chats' && (
          <>
            {chatsError && <HistoryErrorState message={chatsError} />}
            {!chatsError && chatsLoadedOnce && chats.length === 0 && (
              <EmptyState text="Chưa có đoạn chat nào được ghi vào lịch sử dùng chung." />
            )}
            <div className="space-y-3">
              {chats.map(session => (
                <div key={session.id} className="bg-[#242526] border border-[#3E4042] rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedChatId(prev => (prev === session.id ? null : session.id))}
                    className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-[#2f3031] transition-colors"
                  >
                    <div>
                      <div className="text-sm font-semibold text-white">{session.title || 'Đoạn chat'}</div>
                      <div className="text-[11px] text-gray-400">
                        {new Date(session.timestamp).toLocaleString('vi-VN')} · {session.messages.length} tin nhắn
                      </div>
                    </div>
                  </button>
                  {expandedChatId === session.id && (
                    <div className="border-t border-[#3E4042] p-4 space-y-3 max-h-[420px] overflow-y-auto custom-scrollbar">
                      {session.messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`px-3 py-2 rounded-2xl max-w-[80%] text-sm break-words flex flex-col gap-2 ${
                              msg.role === 'user'
                                ? 'bg-[#1877F2] text-white'
                                : 'bg-[#18191A] text-white border border-[#3A3B3C]'
                            }`}
                          >
                            {msg.text && <span className="whitespace-pre-wrap">{msg.text}</span>}
                            {msg.uploadedImageUrl && (
                              <img src={msg.uploadedImageUrl} className="max-w-[280px] rounded-lg" referrerPolicy="no-referrer" />
                            )}
                            {msg.imageUrl && (
                              <img src={msg.imageUrl} className="max-w-[280px] rounded-lg" referrerPolicy="no-referrer" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {chatsCursor && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => loadChats(chatsCursor)}
                  disabled={chatsLoading}
                  className="px-4 py-2 bg-[#3A3B3C] hover:bg-[#4E4F50] rounded-lg text-xs font-bold disabled:opacity-50 flex items-center gap-2"
                >
                  {chatsLoading && <Loader2 size={14} className="animate-spin" />}
                  Tải thêm
                </button>
              </div>
            )}
            {chatsLoading && chats.length === 0 && <LoadingState />}
          </>
        )}
      </div>

      {activeImage && (
        <div
          className="fixed inset-0 z-[260] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActiveImage(null)}
        >
          <div
            className="bg-[#242526] border border-[#3E4042] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-[#3E4042]">
              <div className="font-bold text-white">{activeImage.productName || activeImage.visualStyle}</div>
              <button
                onClick={() => setActiveImage(null)}
                className="p-1.5 rounded-lg hover:bg-[#3A3B3C] text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {activeImage.imageUrl && (
                <img src={activeImage.imageUrl} alt="" className="w-full rounded-xl" referrerPolicy="no-referrer" />
              )}
              <div className="grid grid-cols-2 gap-3 text-xs text-gray-300">
                <div>
                  <span className="text-gray-500">Workflow:</span> {activeImage.visualStyle}
                </div>
                <div>
                  <span className="text-gray-500">Kích thước:</span> {activeImage.imageSize} · {activeImage.aspectRatio}
                </div>
                <div>
                  <span className="text-gray-500">Chi phí ước tính:</span> ${(activeImage.costUSD || 0).toFixed(4)}
                </div>
                <div>
                  <span className="text-gray-500">Thời gian:</span> {new Date(activeImage.timestamp).toLocaleString('vi-VN')}
                </div>
              </div>
              {activeImage.prompt && (
                <div className="bg-[#18191A] border border-[#3E4042] rounded-lg p-3 text-xs text-gray-300 whitespace-pre-wrap">
                  {activeImage.prompt}
                </div>
              )}
              {activeImage.imageUrl && (
                <a
                  href={activeImage.imageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block px-4 py-2 bg-[#1877F2] hover:bg-blue-600 rounded-lg text-xs font-bold text-white"
                >
                  Mở ảnh gốc
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
