const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const replacements = [
  { from: /bg-\[#F0F2F5\]/g, to: 'bg-[#18191A]' },
  { from: /bg-white/g, to: 'bg-[#242526]' },
  { from: /bg-\[#E4E6EB\]/g, to: 'bg-[#3A3B3C]' },
  { from: /bg-\[#D8DADF\]/g, to: 'bg-[#4E4F50]' },
  { from: /border-\[#CED0D4\]/g, to: 'border-[#3E4042]' },
  { from: /border-\[#F0F2F5\]/g, to: 'border-[#18191A]' },
  { from: /border-\[#E4E6EB\]/g, to: 'border-[#3A3B3C]' },
  { from: /bg-\[#E8F0FE\]/g, to: 'bg-[#1877F2]/20' },
  { from: /bg-\[#051610\]/g, to: 'bg-[#242526]' },
];

for (const rule of replacements) {
  code = code.replace(rule.from, rule.to);
}

fs.writeFileSync('App.tsx', code);
console.log('Colors replaced correctly');
