const fs = require('fs');

let serviceCode = fs.readFileSync('services/geminiService.ts', 'utf8');

serviceCode = serviceCode.replace(
`  if (settings.productImages.length > 0 && settings.visualStyle !== "SCENE_STAGING") {
    settings.productImages.forEach(img => parts.push({ inlineData: { data: img.split(',')[1], mimeType: 'image/png' } }));
  }`,
`  const productImagesVisualStyles = ["CONCEPT", "TECH_PS", "COLOR_CHANGE", "STUDIO"];
  if (settings.productImages.length > 0 && productImagesVisualStyles.includes(settings.visualStyle)) {
    settings.productImages.forEach(img => parts.push({ inlineData: { data: img.split(',')[1], mimeType: 'image/png' } }));
  }`
);

fs.writeFileSync('services/geminiService.ts', serviceCode);
console.log('Fixed product images logic.');
