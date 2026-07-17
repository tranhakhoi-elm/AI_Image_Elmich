const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');
console.log("Includes import?:", content.includes('extractStandardParamsWithAI } from'));
