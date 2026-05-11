const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf-8');

// 1. Expand left sidebar from 360px to 480px or 500px
content = content.replace(
  /<aside className="w-full xl:w-\[360px\] shrink-0 xl:h-full xl:overflow-y-auto custom-scrollbar px-2 mb-8 xl:mb-0 xl:pt-4 xl:border-r xl:border-\[#CED0D4\] bg-white xl:bg-transparent">/,
  '<aside className="w-full xl:w-[480px] shrink-0 xl:h-full xl:overflow-y-auto custom-scrollbar px-2 mb-8 xl:mb-0 xl:pt-4 xl:border-r xl:border-[#CED0D4] bg-white xl:bg-transparent flex flex-col">'
);

// 2. Expand Center feed from max-w-[680px] to max-w-[800px] or larger since right sidebar is gone
content = content.replace(
  /<section className="flex-1 max-w-\[680px\] w-full mx-auto px-0 sm:px-4 flex flex-col gap-4 pb-20 mt-4 xl:mt-0 xl:h-full xl:overflow-y-auto custom-scrollbar xl:pt-4 bg-\[#F0F2F5\] xl:bg-transparent">/,
  '<section className="flex-1 max-w-[880px] w-full mx-auto px-0 sm:px-4 flex flex-col gap-4 pb-20 mt-4 xl:mt-0 xl:h-full xl:overflow-y-auto custom-scrollbar xl:pt-4 bg-[#F0F2F5] xl:bg-transparent">'
);

// 3. Right Sidebar
const rightSidebarMatch = content.match(/\{\/\* Right Sidebar \*\/\}[\s\S]*?<\/aside>/);
if (rightSidebarMatch) {
  const rightSidebarContent = rightSidebarMatch[0]
     .replace(/\{\/\* Right Sidebar \*\/\}/, '{/* Bộ Sưu Tập (Moved down) */}')
     .replace(/<aside className="[^"]*">/, '<div className="w-full mt-8 border-t border-[#CED0D4] pt-4 xl:bg-transparent shrink-0">')
     .replace(/<\/aside>/, '</div>')
     .replace(/grid-cols-2/, 'grid-cols-3'); // adjust grid for 480px width
     
  // Remove it from current position
  content = content.replace(rightSidebarMatch[0], '');
  
  // Insert at the bottom of the left sidebar
  content = content.replace(
    /\{\renderSidebar\(\)\}\n\s*<\/div>\n\s*<\/aside>/,
    `{renderSidebar()}\n          </div>\n          ${rightSidebarContent}\n        </aside>`
  );
}

fs.writeFileSync('App.tsx', content);
