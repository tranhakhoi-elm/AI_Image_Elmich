const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf-8');

const galleryContent = `
          {/* Bộ Sưu Tập (Moved down) */}
          <div className="w-full mt-8 border-t border-[#CED0D4] pt-4 xl:bg-transparent shrink-0">
           <div className="p-4 flex items-center justify-between">
             <span className="font-semibold text-[#65676B] text-[17px]">Bộ sưu tập</span>
             <button title="Làm mới bộ sưu tập" className="text-[#1877F2] text-[13px] hover:underline" onClick={() => {
                 setGallery([]);
                 setActiveImage(null);
             }}>Xóa tất cả</button>
           </div>
           <div className="px-4 pb-4 text-[13px] text-[#65676B] border-b border-[#CED0D4] mb-4">
             Ảnh sẽ tự động hết hạn và bị xóa sau 7 ngày. Bạn nhớ lưu ảnh về máy nhé.
           </div>
           
           <div className="grid grid-cols-3 gap-2 px-2 pb-20">
             {gallery.map(img => (
                <div key={img.id} className="relative aspect-square bg-[#E4E6EB] rounded-lg overflow-hidden group cursor-pointer" onClick={() => setActiveImage(img)}>
                   <img src={img.url} className={\`w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 object-center \${activeImage?.id === img.id ? 'opacity-50' : ''}\`} />
                   {activeImage?.id === img.id && (
                     <div className="absolute inset-0 flex items-center justify-center bg-[#1877F2]/20">
                        <Check size={24} className="text-white drop-shadow-md" />
                     </div>
                   )}
                </div>
             ))}
             {gallery.length === 0 && (
                <div className="col-span-3 py-8 text-center text-[#65676B] text-[14px]">
                  Chưa có ảnh nào được tạo.
                </div>
             )}
           </div>
          </div>
`;

content = content.replace(
  /(\{\s*renderSidebar\(\)\s*\}\n\s*<\/div>\n\s*)(<\/aside>)/,
  `$1${galleryContent}\n        $2`
);

fs.writeFileSync('App.tsx', content);
