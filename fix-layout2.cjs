const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf-8');

const rightSidebarMatch = content.match(/\{\/\* Right Sidebar \*\/\}[\s\S]*?<\/aside>/);
if (rightSidebarMatch) {
  const rightSidebarContent = rightSidebarMatch[0]
     .replace(/\{\/\* Right Sidebar \*\/\}/, '{/* Bộ Sưu Tập (Moved down) */}')
     .replace(/<aside className="[^"]*">/, '<div className="w-full mt-8 border-t border-[#CED0D4] pt-4 xl:bg-transparent shrink-0">')
     .replace(/<\/aside>/, '</div>')
     .replace(/grid-cols-2/, 'grid-cols-3'); // adjust grid for 480px width
     
  content = content.replace(rightSidebarMatch[0], '');
  content = content.replace(
    /(\s*\{renderSidebar\(\)\}\n\s*<\/div>\n\s*)(<\/aside>)/,
    `$1${rightSidebarContent}\n        $2`
  );
  
  fs.writeFileSync('App.tsx', content);
} else {
  console.log("No right sidebar match found!");
}
