const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

code = code.replace(/text-gray-700/g, 'text-gray-300');
code = code.replace(/text-blue-600/g, 'text-blue-400');
code = code.replace(/text-purple-600/g, 'text-purple-400');
code = code.replace(/text-cyan-600/g, 'text-cyan-400');
code = code.replace(/text-emerald-600/g, 'text-emerald-400');
code = code.replace(/text-orange-600/g, 'text-orange-400');
code = code.replace(/text-red-500/g, 'text-red-400');
code = code.replace(/text-gray-500/g, 'text-gray-400');

fs.writeFileSync('App.tsx', code);
