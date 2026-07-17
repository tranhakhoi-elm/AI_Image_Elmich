const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

content = content.replace("};\\n\\n  const handlePastedExcelData =", "};\n  const handlePastedExcelData =");
fs.writeFileSync('App.tsx', content);
