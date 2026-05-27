const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

// 1. Remove the "Chọn Model AI" block entirely
const modelUIBlockRegex = /<div className="space-y-2">\s*<label className="block text-\[9px\] font-bold text-white uppercase mb-1">Chọn Model AI \(Tối ưu chi phí\)<\/label>[\s\S]*?<\/div>\s*<\/div>/;
if (modelUIBlockRegex.test(code)) {
    code = code.replace(modelUIBlockRegex, '');
    console.log("Removed \"Chọn Model AI\" main section");
} else {
    console.log("Could not find main model selection block");
}

// 2. Update the ImageSize setter in main UI
const imageSizeRegex = /onClick=\{\(\) => setSettings\(\{\.\.\.settings, imageSize: size\}\)\}/g;
if (imageSizeRegex.test(code)) {
    code = code.replace(imageSizeRegex, "onClick={() => setSettings({...settings, imageSize: size, aiModel: size === '4K' ? 'imagen-3.0-generate-002' : 'gemini-3.5-flash'})}");
    console.log("Updated imageSize setter in main section");
}

// 3. Remove editModel select box from the edit image modal
const editModelSelectRegex = /<select[\s\S]*?value=\{editModel\}[\s\S]*?onChange=\{e => setEditModel\(e\.target\.value\)\}[\s\S]*?<\/select>/;
if (editModelSelectRegex.test(code)) {
    code = code.replace(editModelSelectRegex, '');
    console.log("Removed editModel select box");
} else {
    // maybe try simpler regex
    console.log("Could not find editModel select box");
}

// 4. Update the editQuality setter to also set editModel
const editQualityRegex = /onChange=\{e => setEditQuality\(e\.target\.value as ImageSize\)\}/;
if (editQualityRegex.test(code)) {
    code = code.replace(editQualityRegex, "onChange={e => { const size = e.target.value as ImageSize; setEditQuality(size); setEditModel(size === '4K' ? 'imagen-3.0-generate-002' : 'gemini-3.5-flash'); }}");
    console.log("Updated editQuality setter to also set editModel");
}

fs.writeFileSync('App.tsx', code);
