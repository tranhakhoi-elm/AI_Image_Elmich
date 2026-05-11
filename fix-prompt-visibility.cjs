const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf-8');

// For activeImage
content = content.replace(
  /<div className="bg-\[#F0F2F5\] p-3 rounded-lg border border-\[#CED0D4\]">\n?\s*<p className="text-\[11px\] font-bold text-\[#65676B\] uppercase mb-1">Prompt đã gửi cho AI:<\/p>\n?\s*<p className="text-\[13px\] text-\[#050505\] whitespace-pre-wrap font-mono leading-relaxed">\{activeImage\.prompt\}<\/p>\n?\s*<\/div>/g,
  `<details className="bg-[#F0F2F5] p-3 rounded-lg border border-[#CED0D4] group cursor-pointer marker:content-[''] outline-none">
       <summary className="text-[11px] font-bold text-[#65676B] outline-none uppercase flex items-center justify-between select-none">
         <span>Hiện prompt</span>
         <ChevronDown size={14} className="group-open:rotate-180 transition-transform" />
       </summary>
       <div className="mt-2 pt-2 border-t border-[#CED0D4] cursor-text">
         <p className="text-[13px] text-[#050505] whitespace-pre-wrap font-mono leading-relaxed">{activeImage.prompt}</p>
       </div>
     </details>`
);

// For gallery list
content = content.replace(
  /<div className="bg-\[#F0F2F5\] p-3 rounded-lg border border-\[#CED0D4\] mt-2 mb-2">\n?\s*<p className="text-\[11px\] font-bold text-\[#65676B\] uppercase mb-1">Prompt đã gửi cho AI:<\/p>\n?\s*<p className="text-\[13px\] text-\[#050505\] whitespace-pre-wrap font-mono leading-relaxed">\{img\.prompt\}<\/p>\n?\s*<\/div>/g,
  `<details className="bg-[#F0F2F5] p-3 rounded-lg border border-[#CED0D4] mt-2 mb-2 group cursor-pointer marker:content-[''] outline-none">
       <summary className="text-[11px] font-bold text-[#65676B] outline-none uppercase flex items-center justify-between select-none">
         <span>Hiện prompt</span>
         <ChevronDown size={14} className="group-open:rotate-180 transition-transform" />
       </summary>
       <div className="mt-2 pt-2 border-t border-[#CED0D4] cursor-text">
         <p className="text-[13px] text-[#050505] whitespace-pre-wrap font-mono leading-relaxed">{img.prompt}</p>
       </div>
     </details>`
);

fs.writeFileSync('App.tsx', content);
