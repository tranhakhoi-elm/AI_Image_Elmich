const fs = require('fs');
const fixFile = (file) => {
  let content = fs.readFileSync(file, 'utf-8');
  content = content.replace(/gemini-3\.1-flash-lite-preview/g, 'gemini-3.1-flash-lite');
  content = content.replace(/gemini-[0-9\.]+-flash-preview/g, 'gemini-3.0-flash');
  fs.writeFileSync(file, content);
};
fixFile('services/geminiService.ts');
fixFile('App.tsx');
