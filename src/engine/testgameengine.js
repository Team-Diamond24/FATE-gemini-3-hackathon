// Load environment variables from .env file in project root
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

import {
  initializeGameState,
  advanceMonth,
  applyIncome
} from "./gameEngine.js";
let state = initializeGameState();
state = applyIncome(state);
console.log(state);

state= advanceMonth(state);
console.log(state);

const state1 = initializeGameState();
const state2 = applyIncome(state1);

console.log(state1 === state2);

import {applyChoice } from './gameEngine.js';


// Player opts for insurance
state = applyChoice(state, {
  balanceChange: -200,
  riskChange: -15,
  description: "Purchased health insurance"
});
console.log(state);
// Player makes risky investment
state = applyChoice(state, {
  balanceChange: -1000,
  riskChange: 20,
  description: "Invested in volatile stocks"
});
console.log(state);

import { generateScenario} from './scenarioGenerator.js';


// Use environment variable only (no hardcoded fallback)
const apiKey = process.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error('ERROR: VITE_GEMINI_API_KEY not found in environment!');
  console.error('Make sure .env file exists and contains VITE_GEMINI_API_KEY');
  console.error('For Node.js scripts, you may need to use dotenv package.');
  process.exit(1);
}

console.log('Using API key from environment:', apiKey.slice(0, 10) + '...');
const scenario = await generateScenario(state, apiKey);
console.log('\n=== Generated Scenario ===');
console.log('Situation:', scenario.situation);
console.log('Choices:');
scenario.choices.forEach((c, i) => {
  console.log(`  ${i + 1}. ${c.label} (₹${c.balanceChange}, risk: ${c.riskChange})`);
});