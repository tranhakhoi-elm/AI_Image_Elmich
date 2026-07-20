const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

content = content.replace(
  /<div className="flex flex-col gap-3 bg\[#18191A\] p-3 rounded-2xl border border\[#3E4042\] focus-within:border\[#1877F2\] focus-within:ring-1 focus-within:ring\[#1877F2\] transition-colors shadow-sm">([\s\S]*?)([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/,
  '<FileDropzone onFilesDrop={handleImageUploadToChat} className="flex flex-col gap-3 bg-[#18191A] p-3 rounded-2xl border border-[#3E4042] focus-within:border-[#1877F2] focus-within:ring-1 focus-within:ring-[#1877F2] transition-colors shadow-sm">$1$2</FileDropzone>\n        </div>\n      </div>\n    </div>'
);

fs.writeFileSync('App.tsx', content);
