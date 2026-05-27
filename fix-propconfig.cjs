const fs = require('fs');
let code = fs.readFileSync('services/geminiService.ts', 'utf8');

code = code.replace(
  /p\.amount \? ' \(' \+ p\.amount \+ '\)' : ''/g,
  "p.size && p.size !== 'auto' ? ' (' + p.size + ' size)' : ''"
);

fs.writeFileSync('services/geminiService.ts', code);
console.log("Fixed PropConfig usage in geminiService");
