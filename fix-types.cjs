const fs = require('fs');
let code = fs.readFileSync('types.ts', 'utf8');

code = code.replace(
  "whiteBGPlasticConfig?: { type: string, color: string, lighting: string };",
  "whiteBGPlasticConfig?: { type: string, color?: string, lighting: string };"
);

fs.writeFileSync('types.ts', code);
console.log('types.ts updated');
