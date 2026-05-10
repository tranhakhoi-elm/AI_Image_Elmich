const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');
content = content.replace(/onClick=\{startGeneration\}/g, 'onClick={() => startGeneration()}');
fs.writeFileSync('App.tsx', content);
