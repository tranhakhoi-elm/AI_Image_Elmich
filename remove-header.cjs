const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const headerRegex = /<header className="h-\[56px\][\s\S]*?<\/header>/;

if (headerRegex.test(code)) {
  code = code.replace(headerRegex, '');
  code = code.replace(/xl:h-\[calc\(100vh-56px\)\]/g, 'xl:h-screen');
  code = code.replace(/h-\[calc\(100vh-56px\)\]/g, 'h-screen');
  fs.writeFileSync('App.tsx', code);
  console.log('Header removed successfully.');
} else {
  console.log('Header not found.');
}
