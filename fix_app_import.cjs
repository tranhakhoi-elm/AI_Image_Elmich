const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

const regex = /import \{([^}]*)analyzePackagingContent([^}]*)\} from '\.\/services\/geminiService';/;
if (regex.test(content)) {
    content = content.replace(regex, "import { analyzePackagingContent, extractStandardParamsWithAI } from './services/geminiService';");
    fs.writeFileSync('App.tsx', content);
    console.log("Import fixed");
} else {
    console.log("Could not find the import statement");
}
