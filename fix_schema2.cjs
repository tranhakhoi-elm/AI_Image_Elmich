const fs = require('fs');
let content = fs.readFileSync('services/geminiService.ts', 'utf8');

const oldSchemaStr = `                       required: ["fileName", "actual", "match", "notes"]`;
const newSchemaStr = `                       required: ["fileName", "actual", "match"]`;

content = content.replace(oldSchemaStr, newSchemaStr);
fs.writeFileSync('services/geminiService.ts', content);
