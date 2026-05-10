const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf-8');
content = content.replace(/alert\(([^)]+)\)/g, 'setAlertMessage($1)');
fs.writeFileSync('App.tsx', content);
