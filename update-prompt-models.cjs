const fs = require('fs');
let code = fs.readFileSync('services/geminiService.ts', 'utf8');

// Replace all instances of gemini-2.5-flash with gemini-2.5-pro for the concept analysis and thinking processes
// since gemini-2.5-pro is better at following complex instructions
code = code.replace(/model: "gemini-2.5-flash"/g, 'model: "gemini-2.5-pro"');

fs.writeFileSync('services/geminiService.ts', code);
console.log('Updated to use gemini-2.5-pro');
