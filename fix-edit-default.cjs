const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

code = code.replace(
  /const \[editModel, setEditModel\] = useState\('imagen-3\.0-generate-002'\);/g,
  "const [editModel, setEditModel] = useState('gemini-3.5-flash');"
);

fs.writeFileSync('App.tsx', code);
console.log("Fixed editModel default state");
