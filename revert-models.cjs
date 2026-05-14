const fs = require('fs');
let code = fs.readFileSync('services/geminiService.ts', 'utf8');

// The lines we want to change back are in these functions:
// getAiSuggestions, analyzeImage, describeImage, suggestPropsForConcept, analyzeTechConcept, generateOceanPrompts, extractTrackSocketInfo, enhancePrompt

// To be safe, we just replace the first 8 occurrences of "gemini-2.5-pro" that are inside ai.models.generateContent calls with "gemini-2.5-flash".
let count = 0;
code = code.replace(/model:\s*"gemini-2\.5-pro"/g, (match, offset) => {
  count++;
  if (count <= 8) {
    return 'model: "gemini-2.5-flash"';
  }
  return match;
});

fs.writeFileSync('services/geminiService.ts', code);
console.log('Reverted initial analysis to gemini-2.5-flash');
