const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf-8');

content = content.replace(/gemini-3\.1-pro-preview/g, 'gemini-2.5-pro');
content = content.replace(/gemini-3\.0-flash/g, 'gemini-2.5-flash');
content = content.replace(/gemini-3\.1-flash-lite/g, 'gemini-2.5-flash');

fs.writeFileSync('App.tsx', content);
