const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

const oldLogic = `      setPackagingCheckResult({
        params: enrichedParams
      });`;

const newLogic = `      console.log('AI raw result:', result);
      console.log('Enriched params:', enrichedParams);
      setPackagingCheckResult({
        params: enrichedParams
      });`;

content = content.replace(oldLogic, newLogic);
fs.writeFileSync('App.tsx', content);
