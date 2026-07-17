const file = { name: "TP 4021617 TEST.PDF" };
const fr = { fileName: "TP 4021617 TEST.PDF" };
const cleanFr = fr.fileName.toLowerCase().trim();
const cleanF = file.name.toLowerCase().trim();
console.log(cleanFr === cleanF || cleanFr.includes(cleanF) || cleanF.includes(cleanFr));
