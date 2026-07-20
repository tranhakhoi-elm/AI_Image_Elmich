const fs = require('fs');

let content = fs.readFileSync('App.tsx', 'utf8');

// Pattern for <div onClick={() => ...Ref.current?.click()} className="...">
// We will replace it with <FileDropzone onFilesDrop={(files) => onImageUpload(files, 'type')} onClick={() => ...Ref.current?.click()} className="...">

// Let's replace the one in Packaging Check Excel:
// <div className="bg-[#242526] border border-[#3E4042] rounded-xl p-6 text-center">
// becomes <FileDropzone onFilesDrop={handleExcelUpload} ...
content = content.replace(
  /<div className="bg\[#242526\] border border\[#3E4042\] rounded-xl p-6 text-center">([\s\S]*?)<\/div>/g,
  '<FileDropzone onFilesDrop={handleExcelUpload} className="bg-[#242526] border border-[#3E4042] rounded-xl p-6 text-center">$1</FileDropzone>'
);

// Packaging files:
content = content.replace(
  /<div onClick=\{\(\) => productFilesRef\.current\?\.click\(\)\} className="h-32 w-full bg\[#242526\] border-2 border-dashed border\[#3E4042\] rounded-xl flex items-center justify-center cursor-pointer overflow-hidden relative group hover:border\[#1877F2\] transition-all">([\s\S]*?)<\/div>/g,
  '<FileDropzone onFilesDrop={handlePackagingFilesUpload} onClick={() => productFilesRef.current?.click()} className="h-32 w-full bg-[#242526] border-2 border-dashed border-[#3E4042] rounded-xl flex items-center justify-center cursor-pointer overflow-hidden relative group hover:border-[#1877F2] transition-all">$1</FileDropzone>'
);

// also need to change <input type="file" ... onChange={e => { ... }}> to use handlePackagingFilesUpload
content = content.replace(
  /onChange=\{e => \{\s*const files = Array\.from\(e\.target\.files \|\| \[\]\) as File\[\];\s*if \(files\.length > 0\) \{\s*setPackagingFiles\(prev => \[\.\.\.prev, \.\.\.files\]\);\s*\}\s*\}\}/g,
  'onChange={handlePackagingFilesUpload}'
);

fs.writeFileSync('App.tsx', content);
