const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');
content = content.replace(/catch \(err\) {/g, 'catch (err: any) {');
fs.writeFileSync('App.tsx', content);
