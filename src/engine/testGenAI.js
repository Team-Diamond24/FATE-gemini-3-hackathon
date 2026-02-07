// Load environment variables from .env file in project root
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

import { GoogleGenAI } from "@google/genai";

const key = process.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: key });

console.log('Testing Gemini 3 Flash Preview...');

async function test() {
  try {
    const result = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        { role: 'user', parts: [{ text: 'Hello, say hi.' }] }
      ]
    });
    
    // Log structure for confirmation
    // console.log('Result Object:', JSON.stringify(result, null, 2));

    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      console.log('Success - Extracted Text:', text);
    } else {
      console.error('Failed to extract text. Result structure mismatch.');
      console.log('Result keys:', Object.keys(result));
    }
  } catch (e) {
    console.error('Error Message:', e.message);
    console.error('Stack:', e.stack);
    console.error('Full Error:', JSON.stringify(e, Object.getOwnPropertyNames(e), 2));
  }
}

test();
