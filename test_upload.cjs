const XLSX = require('xlsx');
const fs = require('fs');

const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet([["Tên sản phẩm", "Chảo Elmich"], ["Model", "EL-1234"]]);
XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
XLSX.writeFile(wb, "test.xlsx");
