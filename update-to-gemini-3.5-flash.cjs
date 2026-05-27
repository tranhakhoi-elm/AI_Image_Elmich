const fs = require('fs');

// Update App.tsx options
let appCode = fs.readFileSync('App.tsx', 'utf8');
appCode = appCode.replace(/imagen-3\.0-fast-generate-001/g, 'gemini-3.5-flash');
appCode = appCode.replace(/Standard \(Tiết kiệm\)/g, 'Gemini 3.5 Flash (Fast)');
fs.writeFileSync('App.tsx', appCode);

// Update types.ts
let typesCode = fs.readFileSync('types.ts', 'utf8');
if (typesCode.includes('AIModel =')) {
  typesCode = typesCode.replace(/AIModel = ".*"/, 'AIModel = "gemini-3.5-flash" | "imagen-3.0-generate-002" | "gemini-2.5-flash-image" | "gemini-3.1-flash-image-preview"');
  fs.writeFileSync('types.ts', typesCode);
}

// Update geminiService.ts fallback
let srvCode = fs.readFileSync('services/geminiService.ts', 'utf8');
srvCode = srvCode.replace(/fallbackModel = 'gemini-2\.5-flash-image';/g, "fallbackModel = 'gemini-3.5-flash';");
// also change the initial analysis models (which were using gemini-2.5-flash) to gemini-3.5-flash if they mean the textual analysis AI!
// Let's replace 'gemini-2.5-flash' with 'gemini-3.5-flash' in the AI services (except the prompt engineer which is gemini-2.5-pro)
srvCode = srvCode.replace(/model: "gemini-2\.5-flash"/g, 'model: "gemini-3.5-flash"');

fs.writeFileSync('services/geminiService.ts', srvCode);
console.log("Updated AI models to gemini-3.5-flash");
