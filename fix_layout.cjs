const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

const oldLayout = `        {/* Center Feed Layout */}
        <section className="flex-1 max-w-[880px] w-full mx-auto px-0 sm:px-4 flex flex-col gap-4 pb-20 mt-4 xl:mt-0 xl:h-full xl:overflow-y-auto custom-scrollbar xl:pt-4 bg-[#18191A] xl:bg-transparent">`;

const newLayout = `        {/* Center Feed Layout */}
        <section className={\`flex-1 w-full mx-auto px-0 sm:px-4 flex flex-col gap-4 pb-20 mt-4 xl:mt-0 xl:h-full xl:overflow-y-auto custom-scrollbar xl:pt-4 bg-[#18191A] xl:bg-transparent \${settings.visualStyle === 'PACKAGING_CHECK' ? 'max-w-[1400px]' : 'max-w-[880px]'}\`}>`;

content = content.replace(oldLayout, newLayout);
fs.writeFileSync('App.tsx', content);
