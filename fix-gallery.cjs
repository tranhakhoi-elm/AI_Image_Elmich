const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf-8');

// The block to extract
const galleryRegex = /\{\/\* Bộ Sưu Tập \(Moved down\) \*\/\}[\s\S]*?<\/div>\n\s*<\/div>/;
const match = content.match(galleryRegex);

if (match) {
  // Remove it from the current position
  content = content.replace(galleryRegex, '');
  
  // Also remove the empty line or trailing spaces before </aside>
  content = content.replace(/\n\s*<\/aside>/, '\n        </aside>');

  // The new gallery html (Horizontal Rail)
  const bottomGallery = `
      {/* Footer Gallery Rail */}
      <div className="w-full shrink-0 border-t border-[#CED0D4] bg-[#F0F2F5] xl:bg-white z-10 flex flex-col h-[260px]">
        <div className="p-4 flex items-center justify-between shrink-0">
          <span className="font-semibold text-[#65676B] text-[17px]">Bộ sưu tập</span>
          <div className="flex items-center gap-4">
            <span className="text-[13px] text-[#65676B] hidden sm:inline">Ảnh sẽ tự động hết hạn và bị xóa sau 7 ngày. Bạn nhớ lưu ảnh về máy nhé.</span>
            <button title="Làm mới bộ sưu tập" className="text-[#1877F2] font-semibold text-[14px] hover:underline" onClick={() => {
              setGallery([]);
              setActiveImage(null);
            }}>Xóa tất cả</button>
          </div>
        </div>
        
        <div className="flex-1 flex gap-4 overflow-x-auto px-4 pb-6 custom-scrollbar items-center">
          {gallery.filter(img => img.id !== activeImage?.id).length === 0 && gallery.length > 0 && activeImage && (
             <div className="w-full flex justify-center text-[#65676B] text-[14px]">
               Chưa có ảnh nào khác được tạo.
             </div>
          )}
          {gallery.filter(img => img.id !== activeImage?.id).map(img => (
            <div key={img.id} className="relative h-full aspect-square shrink-0 bg-[#E4E6EB] rounded-lg overflow-hidden group cursor-pointer" onClick={() => setActiveImage(img)}>
               <img src={img.url} className={\`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 object-center \${activeImage?.id === img.id ? 'opacity-50' : ''}\`} />
               {activeImage?.id === img.id && (
                 <div className="absolute inset-0 flex items-center justify-center bg-[#1877F2]/20">
                    <Check size={24} className="text-white drop-shadow-md" />
                 </div>
               )}
            </div>
          ))}
          {gallery.length === 0 && (
             <div className="w-full flex justify-center text-[#65676B] text-[14px]">
               Chưa có ảnh nào được tạo.
             </div>
          )}
        </div>
      </div>
  `;

  content = content.replace(
    /<main className="flex-1 flex flex-col xl:flex-row max-w-\[1920px\] mx-auto w-full relative xl:h-\[calc\(100vh-56px\)\] xl:overflow-hidden bg-\[#F0F2F5\] xl:bg-white xl:py-0">/,
    '<main className="flex-1 flex flex-col max-w-[1920px] mx-auto w-full relative xl:h-[calc(100vh-56px)] bg-[#F0F2F5] xl:bg-white xl:py-0">\n        <div className="flex-1 flex flex-col xl:flex-row overflow-hidden min-h-0">'
  );
  
  content = content.replace(
    /<\/section>\n\s*<\/main>/,
    `</section>\n        </div>\n${bottomGallery}\n      </main>`
  );

  // Now, what about the older gallery view embedded in the Center Feed?
  // Let's remove the "Render past gallery as separate posts" part out of the Center feed to reduce duplicate display and keep it clean.
  // Wait, right now `gallery.filter(...).map(...)` might still be at the bottom of the Center feed.
  const oldCenterGalleryRegex = /\{\/\* Render past gallery as separate posts \*\/\}[\s\S]*?(<\/section>)/;
  if(content.match(oldCenterGalleryRegex)) {
    content = content.replace(oldCenterGalleryRegex, '$1');
  }

  fs.writeFileSync('App.tsx', content);
  console.log("Success");
} else {
  console.log("No match found for gallery");
}
