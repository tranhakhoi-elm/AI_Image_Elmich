const fs = require('fs');

let serviceCode = fs.readFileSync('services/geminiService.ts', 'utf8');
serviceCode = serviceCode.replace(/gemini-3\.1-flash-image-preview/g, 'imagen-3.0-generate-002');
serviceCode = serviceCode.replace(/gemini-2\.5-flash-image/g, 'imagen-3.0-fast-generate-001');
fs.writeFileSync('services/geminiService.ts', serviceCode);

let appCode = fs.readFileSync('App.tsx', 'utf8');
appCode = appCode.replace(/gemini-3\.1-flash-image-preview/g, 'imagen-3.0-generate-002');
appCode = appCode.replace(/gemini-2\.5-flash-image/g, 'imagen-3.0-fast-generate-001');
appCode = appCode.replace(/Gemini 3\.1 Image/g, 'Imagen 3.0 Generate');
appCode = appCode.replace(/Gemini 2\.5 Image/g, 'Imagen 3.0 Fast');
appCode = appCode.replace(/Gemini 3\.1/g, 'Imagen 3.0');
appCode = appCode.replace(/Gemini 2\.5/g, 'Imagen 3.0 Fast');
fs.writeFileSync('App.tsx', appCode);

console.log("Replaced model names");
