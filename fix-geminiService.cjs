const fs = require('fs');
let content = fs.readFileSync('services/geminiService.ts', 'utf-8');

content = content.replace(/gemini-3\.0-flash/g, 'gemini-2.5-flash');
content = content.replace(/gemini-3-flash-latest/g, 'gemini-2.5-flash');
content = content.replace(/gemini-3\.1-flash-lite/g, 'gemini-2.5-flash');
content = content.replace(/gemini-3\.1-pro-preview/g, 'gemini-2.5-pro');

fs.writeFileSync('services/geminiService.ts', content);
