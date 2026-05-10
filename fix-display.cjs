const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf-8');

// Update handleConceptAnalysis
content = content.replace(
  /setSettings\(prev => \(\{ \.\.\.prev, camera: result\.suggestedCamera, concept: result\.concepts\[0\]\?\.prompt \|\| '' \}\)\);/,
  "setSettings(prev => ({ ...prev, camera: result.suggestedCamera, concept: result.concepts[0]?.prompt || '', conceptTitle: result.concepts[0]?.title || '' }));"
);

// Update step 2 button
content = content.replace(
  /onClick=\{\(\) => setSettings\(\{\.\.\.settings, concept: c\.prompt\}\)\}/,
  "onClick={() => setSettings({...settings, concept: c.prompt, conceptTitle: c.title})}"
);

// Update Feed and activeImage
content = content.replace(
  /\{activeImage\.settings\.concept \? `Yêu cầu: \$\{activeImage\.settings\.concept\}` : `Chế độ: \$\{activeImage\.settings\.visualStyle\}`\}/,
  "{activeImage.settings.conceptTitle || activeImage.settings.techTitle || (activeImage.settings.concept ? `Yêu cầu: ${activeImage.settings.concept.substring(0, 100)}...` : `Chế độ: ${activeImage.settings.visualStyle}`)}"
);

content = content.replace(
  /\{img\.settings\.concept \? `\$\{img\.settings\.concept\}` : `Bộ lọc: \$\{img\.settings\.visualStyle\}`\}/g,
  "{img.settings.conceptTitle || img.settings.techTitle || (img.settings.concept ? `${img.settings.concept.substring(0, 100)}...` : `Bộ lọc: ${img.settings.visualStyle}`)}"
);

fs.writeFileSync('App.tsx', content);
