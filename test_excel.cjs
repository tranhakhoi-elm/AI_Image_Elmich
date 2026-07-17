const XLSX = require('xlsx');
const fs = require('fs');

const data = fs.readFileSync('test.xlsx');
try {
    const workbook = XLSX.read(data, { type: 'buffer' });
    let textData = "";
    workbook.SheetNames.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      jsonData.forEach(row => {
          textData += row.join(" \t ") + "\n";
      });
    });
    console.log(textData);
} catch (e) {
    console.error(e);
}
