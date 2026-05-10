const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf-8');

// For activeImage
content = content.replace(
  /<div className="p-4 pt-0">\n?\s*<p className="text-\[15px\] text-\[#050505\]">\{activeImage\.settings\.conceptTitle \|\| activeImage\.settings\.techTitle \|\| \(activeImage\.settings\.concept \? `Yêu cầu: \$\{activeImage\.settings\.concept\.substring\(0, 100\)\}\.\.\.` : `Chế độ: \$\{activeImage\.settings\.visualStyle\}`\)\}<\/p>\n?\s*<\/div>/g,
  `<div className="p-4 pt-0">
     <p className="font-semibold text-[15px] text-[#050505] mb-2">{activeImage.settings.conceptTitle || activeImage.settings.techTitle || (activeImage.settings.concept ? \`Yêu cầu: \${activeImage.settings.concept.substring(0, 100)}...\` : \`Chế độ: \${activeImage.settings.visualStyle}\`)}</p>
     <div className="bg-[#F0F2F5] p-3 rounded-lg border border-[#CED0D4]">
       <p className="text-[11px] font-bold text-[#65676B] uppercase mb-1">Prompt đã gửi cho AI:</p>
       <p className="text-[13px] text-[#050505] whitespace-pre-wrap font-mono leading-relaxed">{activeImage.prompt}</p>
     </div>
  </div>`
);

// For gallery list
content = content.replace(
  /<div className="px-4 pb-2">\n?\s*<p className="text-\[15px\] text-\[#050505\]">\{img\.settings\.conceptTitle \|\| img\.settings\.techTitle \|\| \(img\.settings\.concept \? `\$\{img\.settings\.concept\.substring\(0, 100\)\}\.\.\.` : `Bộ lọc: \$\{img\.settings\.visualStyle\}`\)\}<\/p>\n?\s*<\/div>/g,
  `<div className="px-4 pb-2">
     <p className="font-semibold text-[15px] text-[#050505] mb-2">{img.settings.conceptTitle || img.settings.techTitle || (img.settings.concept ? \`\${img.settings.concept.substring(0, 100)}...\` : \`Bộ lọc: \${img.settings.visualStyle}\`)}</p>
     <div className="bg-[#F0F2F5] p-3 rounded-lg border border-[#CED0D4] mt-2 mb-2">
       <p className="text-[11px] font-bold text-[#65676B] uppercase mb-1">Prompt đã gửi cho AI:</p>
       <p className="text-[13px] text-[#050505] whitespace-pre-wrap font-mono leading-relaxed">{img.prompt}</p>
     </div>
  </div>`
);

fs.writeFileSync('App.tsx', content);
