import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BookOpen, Layers, CheckCircle2, Cpu, FileText, Code2, Sparkles, AlertTriangle } from 'lucide-react';

interface HandbookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HandbookModal: React.FC<HandbookModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'workflows' | 'prompts' | 'architecture'>('overview');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[250] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-[#242526] border border-[#3E4042] rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#3E4042] flex items-center justify-between bg-[#18191A]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#1877F2]/20 border border-[#1877F2]/30 flex items-center justify-center text-[#1877F2]">
                <BookOpen size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Elmich AI Design Suite — Handbook & Kỹ năng (Skill)</h2>
                <p className="text-xs text-gray-400">Tài liệu chuẩn hóa kiến trúc, hướng dẫn 15 chế độ đồ họa và nguyên tắc prompt</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[#3A3B3C] text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Nav Tabs */}
          <div className="flex items-center gap-1 px-4 py-2 bg-[#242526] border-b border-[#3E4042] overflow-x-auto text-xs font-bold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${activeTab === 'overview' ? 'bg-[#1877F2] text-white' : 'text-gray-400 hover:text-white hover:bg-[#3A3B3C]'}`}
            >
              1. Tổng quan & Chi phí
            </button>
            <button
              onClick={() => setActiveTab('workflows')}
              className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${activeTab === 'workflows' ? 'bg-[#1877F2] text-white' : 'text-gray-400 hover:text-white hover:bg-[#3A3B3C]'}`}
            >
              2. 15 Workflow Chuyên Biệt
            </button>
            <button
              onClick={() => setActiveTab('prompts')}
              className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${activeTab === 'prompts' ? 'bg-[#1877F2] text-white' : 'text-gray-400 hover:text-white hover:bg-[#3A3B3C]'}`}
            >
              3. Prompt Engineering & Skills
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${activeTab === 'architecture' ? 'bg-[#1877F2] text-white' : 'text-gray-400 hover:text-white hover:bg-[#3A3B3C]'}`}
            >
              4. Kiến trúc Hệ thống & API
            </button>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar text-sm text-gray-200 leading-relaxed space-y-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="bg-[#18191A] p-5 rounded-xl border border-[#3E4042]">
                  <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                    <Sparkles size={18} className="text-[#1877F2]" />
                    Sứ mệnh hệ thống Elmich AI Image Studio
                  </h3>
                  <p className="text-gray-300 text-xs sm:text-sm">
                    Bộ công cụ tích hợp giải quyết toàn diện quy trình sáng tạo hình ảnh sản phẩm Elmich: từ nghiên cứu concept lifestyle, dựng phối cảnh phòng bếp hiện đại, giả lập hiệu ứng kỹ thuật, tách phông chụp studio thương mại điện tử, đến đối chiếu và kiểm duyệt bao bì tự động với file Excel thông số kỹ thuật.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[#18191A] p-4 rounded-xl border border-[#3E4042]">
                    <div className="text-xs font-bold text-[#1877F2] uppercase mb-1">Mô hình AI Tối tân</div>
                    <div className="text-white font-bold text-base mb-2">Gemini 3.1 & 2.5 Flash</div>
                    <p className="text-xs text-gray-400">Tạo ảnh độ phân giải 1K - 4K sắc nét bằng Imagen 3.0 & Gemini Flash Image, tái hiện kim loại Inox 304, lớp chống dính và thủy tinh borosilicate chân thực.</p>
                  </div>

                  <div className="bg-[#18191A] p-4 rounded-xl border border-[#3E4042]">
                    <div className="text-xs font-bold text-emerald-400 uppercase mb-1">Kiểm duyệt Bao bì</div>
                    <div className="text-white font-bold text-base mb-2">Đối chiếu Excel & AI OCR</div>
                    <p className="text-xs text-gray-400">Đọc bảng thông số kỹ thuật chuẩn, quét qua từng file thiết kế (hộp màu, tem phụ, thùng carton) và báo cáo lỗi sai lệch thông tin ngay lập tức.</p>
                  </div>

                  <div className="bg-[#18191A] p-4 rounded-xl border border-[#3E4042]">
                    <div className="text-xs font-bold text-purple-400 uppercase mb-1">Dịch bao bì tự động</div>
                    <div className="text-white font-bold text-base mb-2">Chuyển đổi EN ➔ VN 1K</div>
                    <p className="text-xs text-gray-400">Giữ nguyên 100% đường bế dieline, layout và màu sắc nhận diện; chuyển ngữ toàn bộ tiếng Anh sang tiếng Việt mượt mà cho đội ngũ Content.</p>
                  </div>
                </div>

                <div className="bg-[#18191A] p-5 rounded-xl border border-[#3E4042]">
                  <h4 className="font-bold text-white text-sm mb-3">Bảng dự toán chi phí API mỗi ảnh:</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#242526] text-gray-400 border-b border-[#3E4042]">
                        <tr>
                          <th className="p-2.5">Độ phân giải</th>
                          <th className="p-2.5">Mô hình xử lý</th>
                          <th className="p-2.5">Chi phí tạo ảnh ($)</th>
                          <th className="p-2.5">Phí phân tích Gemini ($)</th>
                          <th className="p-2.5">Tổng chi phí ước tính</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#3E4042]">
                        <tr>
                          <td className="p-2.5 font-bold text-white">1K (1024x1024)</td>
                          <td className="p-2.5">gemini-3.1-flash-image</td>
                          <td className="p-2.5 text-emerald-400">$0.067</td>
                          <td className="p-2.5 text-gray-400">$0.002</td>
                          <td className="p-2.5 font-bold text-white">~$0.069 (~1.750 VNĐ)</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-white">2K (2048x2048)</td>
                          <td className="p-2.5">gemini-3.1-flash-image</td>
                          <td className="p-2.5 text-emerald-400">$0.101</td>
                          <td className="p-2.5 text-gray-400">$0.002</td>
                          <td className="p-2.5 font-bold text-white">~$0.103 (~2.600 VNĐ)</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-white">4K (4096x4096)</td>
                          <td className="p-2.5">gemini-3.1-flash-image</td>
                          <td className="p-2.5 text-emerald-400">$0.151</td>
                          <td className="p-2.5 text-gray-400">$0.002</td>
                          <td className="p-2.5 font-bold text-white">~$0.153 (~3.900 VNĐ)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'workflows' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white">Chi tiết 15 Workflow Chuyên Biệt</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-[#18191A] rounded-xl border border-[#3E4042]">
                    <div className="text-xs font-bold text-[#1877F2]">1. Concept Lifestyle (CONCEPT)</div>
                    <p className="text-xs text-gray-400 mt-1">Gợi ý 5 ý tưởng bối cảnh sinh động (bếp gia đình ấm cúng, bàn ăn sáng, phòng khách hiện đại), điều chỉnh tiêu cự ống kính (24mm - 100mm) và đạo cụ hài hòa.</p>
                  </div>

                  <div className="p-3 bg-[#18191A] rounded-xl border border-[#3E4042]">
                    <div className="text-xs font-bold text-[#1877F2]">2. Phối cảnh Thực tế (SCENE_STAGING)</div>
                    <p className="text-xs text-gray-400 mt-1">Ghép sản phẩm vào không gian nội thất có sẵn, tự động tính toán góc chiếu sáng và đổ bóng vật lý để sản phẩm hòa nhập tự nhiên.</p>
                  </div>

                  <div className="p-3 bg-[#18191A] rounded-xl border border-[#3E4042]">
                    <div className="text-xs font-bold text-[#1877F2]">3. Minh họa Kỹ thuật (TECH_PS)</div>
                    <p className="text-xs text-gray-400 mt-1">Làm nổi bật các điểm mạnh kỹ thuật (đáy từ 5 lớp, công nghệ chống dính Teflon Platinum, động cơ DC êm ái) bằng hiệu ứng đồ họa bắt mắt.</p>
                  </div>

                  <div className="p-3 bg-[#18191A] rounded-xl border border-[#3E4042]">
                    <div className="text-xs font-bold text-[#1877F2]">4. Đổi Màu Theo Pantone (COLOR_CHANGE)</div>
                    <p className="text-xs text-gray-400 mt-1">Thay đổi màu sắc các bộ phận (nắp, tay cầm, thân nồi) theo mã Pantone chuẩn hoặc ảnh mẫu màu mà vẫn giữ bóng kim loại.</p>
                  </div>

                  <div className="p-3 bg-[#18191A] rounded-xl border border-[#3E4042]">
                    <div className="text-xs font-bold text-[#1877F2]">5. Mockup Bao Bì 3D (PACKAGING_MOCKUP)</div>
                    <p className="text-xs text-gray-400 mt-1">Dựng hộp 3D từ file bình bản 2D hoặc từng mặt riêng biệt (mặt trước, hông, nắp) trên phông trắng hoặc trong bối cảnh quầy kệ.</p>
                  </div>

                  <div className="p-3 bg-[#18191A] rounded-xl border border-[#3E4042]">
                    <div className="text-xs font-bold text-[#1877F2]">6. Hiệu ứng Công nghệ (TECH_EFFECTS)</div>
                    <p className="text-xs text-gray-400 mt-1">Tạo dòng khí nóng đối lưu, luồng xoáy chân không, tia nhiệt hồng ngoại hoặc bọt khí siêu âm mô phỏng tính năng vận hành.</p>
                  </div>

                  <div className="p-3 bg-[#18191A] rounded-xl border border-[#3E4042]">
                    <div className="text-xs font-bold text-[#1877F2]">7. Retouch Phông Trắng TMĐT (WHITE_BG_RETOUCH)</div>
                    <p className="text-xs text-gray-400 mt-1">Tách nền trắng tuyệt đối (#FFFFFF), tái tạo ánh sáng rim-light trên mép kính, xử lý vân xước Inox 304 chuẩn catalogue sàn TMĐT.</p>
                  </div>

                  <div className="p-3 bg-[#18191A] rounded-xl border border-[#3E4042]">
                    <div className="text-xs font-bold text-[#1877F2]">8. Render 3D sang Ảnh Chụp Thật (3D_TO_REAL_WHITE_BG)</div>
                    <p className="text-xs text-gray-400 mt-1">Biến file render 3D dạng khối thô thành ảnh chụp studio có chất cảm bề mặt, phản xạ quang học và bóng đổ chân thực.</p>
                  </div>

                  <div className="p-3 bg-[#18191A] rounded-xl border border-[#3E4042]">
                    <div className="text-xs font-bold text-[#1877F2]">9. Trợ lý Đồ Lại Nét (TRACING_ASSISTANT)</div>
                    <p className="text-xs text-gray-400 mt-1">Hỗ trợ vẽ nét outline vector hóa sản phẩm và hướng dẫn thao tác chi tiết.</p>
                  </div>

                  <div className="p-3 bg-[#18191A] rounded-xl border border-[#3E4042]">
                    <div className="text-xs font-bold text-[#1877F2]">10. Bản vẽ Nét & Bóc tách Kỹ thuật (LINE_ART)</div>
                    <p className="text-xs text-gray-400 mt-1">Vẽ sơ đồ cấu tạo, bóc tách linh kiện (exploded view) phục vụ sách hướng dẫn sử dụng và tài liệu đăng ký chất lượng.</p>
                  </div>

                  <div className="p-3 bg-[#18191A] rounded-xl border border-[#3E4042]">
                    <div className="text-xs font-bold text-[#1877F2]">11. Chụp Studio Sáng Tạo (STUDIO)</div>
                    <p className="text-xs text-gray-400 mt-1">Tạo concept chụp studio nghệ thuật cao cấp với bục podium, hình khối hình học tối giản, ánh sáng tương phản nghệ thuật.</p>
                  </div>

                  <div className="p-3 bg-[#18191A] rounded-xl border border-[#3E4042]">
                    <div className="text-xs font-bold text-[#1877F2]">12. Thanh Ray Ổ Cắm Đa Năng (TRACK_SOCKET_STAGING)</div>
                    <p className="text-xs text-gray-400 mt-1">Dựng thanh ray trượt và cắm các thiết bị gia dụng Elmich (ấm siêu tốc, máy nướng bánh mỳ, máy xay) lên mặt đá bếp cao cấp.</p>
                  </div>

                  <div className="p-3 bg-[#18191A] rounded-xl border border-[#3E4042]">
                    <div className="text-xs font-bold text-[#1877F2]">13. Tạo Mã Vạch & QR Code (BARCODE_QR_GENERATOR)</div>
                    <p className="text-xs text-gray-400 mt-1">Tạo mã vạch Code 128, EAN-13 (tính check-digit tự động) và mã QR Elmich xuất SVG vector độ sắc nét tuyệt đối để in ấn bao bì.</p>
                  </div>

                  <div className="p-3 bg-[#18191A] rounded-xl border border-[#3E4042]">
                    <div className="text-xs font-bold text-[#1877F2]">14. Dịch Bao Bì Tự Động (TRANSLATE_PACKAGING)</div>
                    <p className="text-xs text-gray-400 mt-1">Chuyển ngữ bao bì tiếng Anh sang tiếng Việt, giữ nguyên kết cấu bế, xuất ảnh 1K chuẩn cho đội ngũ Content không cần phần mềm đồ họa.</p>
                  </div>

                  <div className="p-3 bg-[#18191A] rounded-xl border border-[#3E4042]">
                    <div className="text-xs font-bold text-[#1877F2]">15. Kiểm Duyệt Bao Bì Đối Chiếu Excel (PACKAGING_CHECK)</div>
                    <p className="text-xs text-gray-400 mt-1">Tải file Excel thông số chuẩn, tải nhiều ảnh/PDF thiết kế bao bì (hộp màu, tem phụ, carton), AI tự động soi lỗi và xuất file Excel đối chiếu ĐẠT/KHÔNG ĐẠT.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'prompts' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white">Quy chuẩn Prompt Engineering cho Elmich</h3>
                <div className="bg-[#18191A] p-4 rounded-xl border border-[#3E4042] space-y-3 text-xs">
                  <div className="font-bold text-emerald-400 text-sm">Cấu trúc Prompt Chuẩn:</div>
                  <code className="block bg-[#242526] p-3 rounded-lg font-mono text-gray-300">
                    [Loại ảnh] + [Chủ thể Elmich chính xác] + [Chất liệu & Chi tiết bề mặt] + [Bối cảnh & Đạo cụ] + [Ánh sáng & Camera] + [Quy định bảo toàn nhận diện thương hiệu]
                  </code>
                  <ul className="list-disc list-inside space-y-1 text-gray-300">
                    <li><strong>Chất liệu kim loại:</strong> Luôn ghi rõ &ldquo;304 stainless steel with fine brushed satin texture, sharp realistic longitudinal specular highlights&rdquo;.</li>
                    <li><strong>Lớp chống dính:</strong> Ghi rõ &ldquo;matte textured black non-stick coating with subtle micro-granite sparkle&rdquo;.</li>
                    <li><strong>Thủy tinh:</strong> &ldquo;Ultra-clear borosilicate high-temperature glass with refractive edge caustics&rdquo;.</li>
                    <li><strong>Quy tắc cấm (Negative):</strong> Tuyệt đối không biến dạng quai cầm, không làm mất logo dập nổi hoặc in laser Elmich, không làm mờ vạch chia dung tích.</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'architecture' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white">Kiến trúc Toàn diện & Tích hợp Doanh nghiệp</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-[#18191A] p-4 rounded-xl border border-[#3E4042] space-y-2">
                    <div className="font-bold text-white text-sm flex items-center gap-2">
                      <Cpu size={16} className="text-[#1877F2]" />
                      Frontend & Local Engine
                    </div>
                    <p className="text-gray-400">React 19, Vite, Tailwind CSS, Motion animations.</p>
                    <p className="text-gray-400">Lưu trữ lịch sử chat và bộ sưu tập ảnh bằng <strong>LocalForage (IndexedDB)</strong> để không lo tràn dung lượng localStorage.</p>
                    <p className="text-gray-400">Tạo mã vạch và QR cục bộ với <strong>JsBarcode</strong> và <strong>qrcode-svg</strong>, giải mã QR với <strong>jsQR</strong>.</p>
                  </div>

                  <div className="bg-[#18191A] p-4 rounded-xl border border-[#3E4042] space-y-2">
                    <div className="font-bold text-white text-sm flex items-center gap-2">
                      <Code2 size={16} className="text-[#1877F2]" />
                      Backend & Corporate Sync
                    </div>
                    <p className="text-gray-400">Express server (`server.ts`) chạy cổng 3000 kết hợp Vite middleware.</p>
                    <p className="text-gray-400">Tích hợp <strong>Google Sheets API</strong> qua Service Account ghi nhật ký tạo ảnh và chi phí token.</p>
                    <p className="text-gray-400">Tích hợp <strong>Lark Suite Bitable API</strong> đồng bộ theo dõi dự án tự động.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[#3E4042] bg-[#18191A] flex items-center justify-between">
            <span className="text-xs text-gray-500">Tài liệu lưu hành nội bộ — Ban Truyền thông & Thiết kế Elmich Vietnam</span>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-[#1877F2] hover:bg-blue-600 text-white font-bold rounded-xl text-xs transition-colors"
            >
              Đóng Handbook
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
