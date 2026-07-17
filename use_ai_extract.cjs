const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

const importStr = "import { analyzePackagingContent, extractStandardParamsWithAI";
if (!content.includes('extractStandardParamsWithAI')) {
    content = content.replace("import { analyzePackagingContent", importStr);
}

const oldExcelHandler = `
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      
      let allRows: any[][] = [];
      workbook.SheetNames.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
        allRows = allRows.concat(jsonData);
      });
      
      const finalParams = processRawRows(allRows);
      setStandardParams(finalParams);
    } catch (err) {
      console.error(err);
      setAlertMessage("Lỗi khi đọc file Excel.");
    }
    e.target.value = '';
  };

  const handlePastedExcelData = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (!text.trim()) return;
    
    const rows = text.split('\\n').map(row => row.split('\\t'));
    const finalParams = processRawRows(rows);
    setStandardParams(finalParams);
    
    e.target.value = ''; // clear textarea
  };`;

const newExcelHandler = `
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoadingMessage("AI đang phân tích dữ liệu Excel...");
    setAppState(AppState.ANALYZING);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      
      let textData = "";
      workbook.SheetNames.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
        jsonData.forEach(row => {
            textData += row.join(" \\t ") + "\\n";
        });
      });
      
      const aiParams = await extractStandardParamsWithAI(textData);
      setStandardParams(aiParams);
      setAppState(AppState.IDLE);
    } catch (err) {
      console.error(err);
      setAlertMessage("Lỗi khi đọc file Excel.");
      setAppState(AppState.IDLE);
    }
    e.target.value = '';
  };

  const handlePastedExcelData = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (!text.trim()) return;
    
    setLoadingMessage("AI đang phân tích dữ liệu văn bản...");
    setAppState(AppState.ANALYZING);
    try {
      const aiParams = await extractStandardParamsWithAI(text);
      setStandardParams(aiParams);
      setAppState(AppState.IDLE);
    } catch (err) {
       console.error(err);
       setAlertMessage("Lỗi phân tích.");
       setAppState(AppState.IDLE);
    }
    e.target.value = ''; // clear textarea
  };`;

content = content.replace(oldExcelHandler, newExcelHandler);
fs.writeFileSync('App.tsx', content);
console.log("App.tsx updated");
