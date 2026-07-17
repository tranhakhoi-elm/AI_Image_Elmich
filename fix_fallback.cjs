const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

const oldLogic = `                            const fileResult = (res.fileResults || []).find((fr: any) => {
                               if (!fr.fileName) return false;
                               const cleanFr = fr.fileName.toLowerCase().trim();
                               const cleanF = file.name.toLowerCase().trim();
                               return cleanFr === cleanF || cleanFr.includes(cleanF) || cleanF.includes(cleanFr);
                            });
                            if (!fileResult) {`;

const newLogic = `                            let fileResult = (res.fileResults || []).find((fr: any) => {
                               if (!fr.fileName) return false;
                               const cleanFr = fr.fileName.toLowerCase().trim();
                               const cleanF = file.name.toLowerCase().trim();
                               return cleanFr === cleanF || cleanFr.includes(cleanF) || cleanF.includes(cleanFr);
                            });
                            if (!fileResult && (res.fileResults || []).length === packagingFiles.length) {
                               fileResult = (res.fileResults || [])[fIdx];
                            }
                            if (!fileResult) {`;

content = content.replace(oldLogic, newLogic);
fs.writeFileSync('App.tsx', content);
