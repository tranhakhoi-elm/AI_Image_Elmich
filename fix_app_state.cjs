const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');
content = content.replace(/AppState\.IDLE/g, 'AppState.READY');
fs.writeFileSync('App.tsx', content);
