const fs = require('fs');
let code = fs.readFileSync('services/geminiService.ts', 'utf8');

code = code.replace(
  /if \(finalModelName === 'imagen-3.0-generate-002' \|\| imageSize === '2K' \|\| imageSize === '4K'\) {/g,
  "if (finalModelName === 'imagen-3.0-generate-002' || imageSize === '4K') {"
);

fs.writeFileSync('services/geminiService.ts', code);
console.log("Updated generated image size forcing");
