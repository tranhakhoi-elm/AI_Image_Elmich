const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

const oldRegex = /\{appState === AppState\.GENERATING \|\| appState === AppState\.ANALYZING \? \([\s\S]*?<\/div>\s*<\/div>\s*\) : activeImage \? \(/;
content = content.replace(oldRegex, "{activeImage ? (");
fs.writeFileSync('App.tsx', content);
