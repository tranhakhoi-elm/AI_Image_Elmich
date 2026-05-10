const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();
async function run() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: 'hi' });
    console.log('gemini-2.5-flash works');
  } catch (e) { console.error('gemini-2.5-flash fails', e.message); }
  try {
    await ai.models.generateContent({ model: 'gemini-3.0-flash', contents: 'hi' });
    console.log('gemini-3.0-flash works');
  } catch (e) { console.error('gemini-3.0-flash fails', e.message); }
  try {
    await ai.models.generateContent({ model: 'gemini-3.1-flash-lite', contents: 'hi' });
    console.log('gemini-3.1-flash-lite works');
  } catch (e) { console.error('gemini-3.1-flash-lite fails', e.message); }
}
run();
