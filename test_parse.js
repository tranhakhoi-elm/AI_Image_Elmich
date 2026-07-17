const rows = [
  ["I", "Thông tin chung", undefined, undefined],
  [1, "Tên sản phẩm", "Nồi chiên không dầu Elmich", undefined],
  [2, "Mã sản phẩm", "4021617", undefined],
  ["II", "Thông tin chi tiết", undefined, undefined],
  [1, "Thời gian bảo hành", "24 tháng", undefined],
  [2, "Thông tin tem phụ", "Tên sản phẩm/model", "Nồi chiên không dầu Elmich 8L"],
  [3, undefined, "Mã sản phẩm", "4021617"],
  [28, "Hướng dẫn sử dụng", undefined, "Theo file đính kèm"]
];

const extractedParams = [];
for (let i = 0; i < rows.length; i++) {
  const row = rows[i];
  
  // Filter out undefined/null/empty strings
  const validCells = row.filter(cell => cell !== undefined && cell !== null && String(cell).trim() !== "");
  
  if (validCells.length < 2) continue; // Skip empty rows or category headers
  
  // If the first cell looks like an STT (number or roman numeral), drop it
  let cellsToProcess = [...validCells];
  const firstCellStr = String(cellsToProcess[0]).trim();
  if (/^(\d+|[IVXLCDM]+)$/i.test(firstCellStr)) {
    cellsToProcess.shift();
  }
  
  if (cellsToProcess.length < 2) continue;
  
  // The last cell is the value
  const value = String(cellsToProcess.pop()).trim();
  
  // The remaining cells form the key. We can join them or just take the last one.
  const key = cellsToProcess.map(c => String(c).trim()).join(" - ");
  
  extractedParams.push({ key, value });
}

console.log(extractedParams);
