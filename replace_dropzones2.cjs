const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

const regexMap = [
  // productFilesRef with 'product'
  {
    regex: /<div onClick=\{\(\) => productFilesRef\.current\?\.click\(\)\} className="([^"]*)">([\s\S]*?)<\/div>/g,
    repl: '<FileDropzone onFilesDrop={(f) => onImageUpload(f, \'product\')} onClick={() => productFilesRef.current?.click()} className="$1">$2</FileDropzone>'
  },
  // button with productFilesRef (in staging)
  {
    regex: /<button onClick=\{\(\) => productFilesRef\.current\?\.click\(\)\} className="([^"]*)">([\s\S]*?)<\/button>/g,
    repl: '<FileDropzone onFilesDrop={(f) => onImageUpload(f, \'product\')} onClick={() => productFilesRef.current?.click()} className="$1">$2</FileDropzone>'
  },
  // refFileRef with 'reference'
  {
    regex: /<div onClick=\{\(\) => refFileRef\.current\?\.click\(\)\} className="([^"]*)">([\s\S]*?)<\/div>/g,
    repl: '<FileDropzone onFilesDrop={(f) => onImageUpload(f, \'reference\')} onClick={() => refFileRef.current?.click()} className="$1">$2</FileDropzone>'
  },
  // colorSampleRef with 'color_sample'
  {
    regex: /<div onClick=\{\(\) => colorSampleRef\.current\?\.click\(\)\} className="([^"]*)">([\s\S]*?)<\/div>/g,
    repl: '<FileDropzone onFilesDrop={(f) => onImageUpload(f, \'color_sample\')} onClick={() => colorSampleRef.current?.click()} className="$1">$2</FileDropzone>'
  },
  // trackFileRef with 'track'
  {
    regex: /<div onClick=\{\(\) => trackFileRef\.current\?\.click\(\)\} className="([^"]*)">([\s\S]*?)<\/div>/g,
    repl: '<FileDropzone onFilesDrop={(f) => onImageUpload(f, \'track\')} onClick={() => trackFileRef.current?.click()} className="$1">$2</FileDropzone>'
  },
  // socketFileRef with 'socket' (this is a button)
  {
    regex: /<button onClick=\{\(\) => socketFileRef\.current\?\.click\(\)\} className="([^"]*)">([\s\S]*?)<\/button>/g,
    repl: '<FileDropzone onFilesDrop={(f) => onImageUpload(f, \'socket\')} onClick={() => socketFileRef.current?.click()} className="$1">$2</FileDropzone>'
  },
  // packagingFileRef with 'packaging'
  {
    regex: /<div onClick=\{\(\) => \{ pendingPackagingFace\.current = 'flat'; packagingFileRef\.current\?\.click\(\); \}\} className="([^"]*)">([\s\S]*?)<\/div>/g,
    repl: '<FileDropzone onFilesDrop={(f) => { pendingPackagingFace.current = \'flat\'; onImageUpload(f, \'packaging\'); }} onClick={() => { pendingPackagingFace.current = \'flat\'; packagingFileRef.current?.click(); }} className="$1">$2</FileDropzone>'
  }
];

regexMap.forEach(({regex, repl}) => {
  content = content.replace(regex, repl);
});

fs.writeFileSync('App.tsx', content);
