const fs = require('fs');
let code = fs.readFileSync('services/geminiService.ts', 'utf8');

code = code.replace(
  /\${config\?\.color \|\| 'Minimalist White'}/g,
  ""
);

fs.writeFileSync('services/geminiService.ts', code);
console.log('geminiService.ts updated');
