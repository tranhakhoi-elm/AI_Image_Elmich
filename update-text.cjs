const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

code = code.replace(/text-\[#050505\]/ig, 'text-white');
code = code.replace(/text-\[#65676B\]/ig, 'text-[#E4E6EB]');
code = code.replace(/text-\[#E4E6EB\]/g, 'text-white'); // if any were replaced before
code = code.replace(/text-\[#B0B3B8\]/g, 'text-[#E4E6EB]');

fs.writeFileSync('App.tsx', code);
console.log('App.tsx text colors updated');
