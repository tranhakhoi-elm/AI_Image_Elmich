const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const replacements = [
  { from: /\bbg-\[#F0F2F5\]\b/g, to: 'bg-[#18191A]' },
  { from: /\bbg-white\b/g, to: 'bg-[#242526]' },
  { from: /\bbg-\[#E4E6EB\]\b/g, to: 'bg-[#3A3B3C]' },
  { from: /\bbg-\[#D8DADF\]\b/g, to: 'bg-[#4E4F50]' },
  { from: /\bborder-\[#CED0D4\]\b/g, to: 'border-[#3E4042]' },
  { from: /\bborder-\[#F0F2F5\]\b/g, to: 'border-[#18191A]' },
  { from: /\bborder-\[#E4E6EB\]\b/g, to: 'border-[#3A3B3C]' },
  { from: /\btext-\[#050505\]\b/g, to: 'text-[#E4E6EB]' },
  { from: /\btext-\[#65676B\]\b/g, to: 'text-[#B0B3B8]' },
  { from: /\bbg-\[#E8F0FE\]\b/g, to: 'bg-[#1877F2]/20' },
];

for (const rule of replacements) {
  code = code.replace(rule.from, rule.to);
}

fs.writeFileSync('App.tsx', code);
console.log('Colors replaced successfully in App.tsx');
