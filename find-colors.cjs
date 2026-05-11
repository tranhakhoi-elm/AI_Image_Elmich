const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const colors = [...code.matchAll(/(bg-|text-|border-)\[(#[A-F0-9]{6})\]/ig)].map(m => m[0]);
const unique = [...new Set(colors)];
console.log(unique.join('\n'));
