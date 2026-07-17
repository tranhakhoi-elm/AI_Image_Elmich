const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

const importStr = "import { analyzePackagingContent, extractStandardParamsWithAI } from './services/geminiService';";
content = content.replace("import { analyzePackagingContent } from './services/geminiService';", importStr);

// I will manually replace the two functions.
const startPasted = content.indexOf('const handlePastedExcelData =');
const endPasted = content.indexOf('const addStandardParam =', startPasted);
const startExcel = content.indexOf('const handleExcelUpload =');
const endExcel = content.indexOf('const handlePastedExcelData =', startExcel);

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
`;

const newPastedHandler = `
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
  };
`;

content = content.substring(0, startExcel) + newExcelHandler + "\\n" + newPastedHandler + "\\n  " + content.substring(endPasted);

fs.writeFileSync('App.tsx', content);
console.log("Handlers updated.");
