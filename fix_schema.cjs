const fs = require('fs');
let content = fs.readFileSync('services/geminiService.ts', 'utf8');

const oldSchemaStr = `                  match: { type: Type.BOOLEAN },
                  fileResults: {
                    type: Type.ARRAY,
                    items: {
                       type: Type.OBJECT,
                       properties: {
                          fileName: { type: Type.STRING },
                          actual: { type: Type.STRING },
                          match: { type: Type.BOOLEAN },
                          notes: { type: Type.STRING }
                       }
                    }
                  }
                }
              }`;

const newSchemaStr = `                  match: { type: Type.BOOLEAN },
                  fileResults: {
                    type: Type.ARRAY,
                    items: {
                       type: Type.OBJECT,
                       properties: {
                          fileName: { type: Type.STRING },
                          actual: { type: Type.STRING },
                          match: { type: Type.BOOLEAN },
                          notes: { type: Type.STRING }
                       },
                       required: ["fileName", "actual", "match", "notes"]
                    }
                  }
                },
                required: ["key", "expected", "match", "fileResults"]
              }`;

content = content.replace(oldSchemaStr, newSchemaStr);
fs.writeFileSync('services/geminiService.ts', content);
