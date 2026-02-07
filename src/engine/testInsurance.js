// Load environment variables from .env file in project root
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

import { initializeGameState, applyChoice } from './gameEngine.js';
import { generateScenario } from './scenarioGenerator.js';

console.log('=== Testing Insurance Mechanic ===');

// Test 1: applyChoice handles isInsurance
console.log('\nTest 1: applyChoice updates insuranceOpted');
let state = initializeGameState();
console.log('Initial insuranceOpted:', state.insuranceOpted); // Should be false

const insuranceChoice = {
  label: "Test Insurance",
  balanceChange: -500,
  riskChange: -5,
  isInsurance: true
};

state = applyChoice(state, insuranceChoice);
console.log('After choice insuranceOpted:', state.insuranceOpted); // Should be true

if (state.insuranceOpted === true) {
  console.log('PASS: Insurance flag set correctly');
} else {
  console.log('FAIL: Insurance flag NOT set');
}

// Test 2: generateScenario injects option in Month 1
console.log('\nTest 2: Insurance injection in Month 1');
state = initializeGameState(); // Month 1, not opted
// We don't need API key for fallback logic injection, passing null to force fallback
const scenarioM1 = await generateScenario(state, null);
const hasInsuranceM1 = scenarioM1.choices.some(c => c.isInsurance);
console.log('Month 1 has insurance option:', hasInsuranceM1);

if (hasInsuranceM1) {
    console.log('PASS: Insurance option injected in Month 1');
} else {
    console.log('FAIL: Insurance option NOT injected in Month 1');
}

// Test 3: generateScenario injects option in Month 2
console.log('\nTest 3: Insurance injection in Month 2');
state = initializeGameState();
state.month = 2;
const scenarioM2 = await generateScenario(state, null);
const hasInsuranceM2 = scenarioM2.choices.some(c => c.isInsurance);
console.log('Month 2 has insurance option:', hasInsuranceM2);

if (hasInsuranceM2) {
    console.log('PASS: Insurance option injected in Month 2');
} else {
    console.log('FAIL: Insurance option NOT injected in Month 2');
}

// Test 4: generateScenario DOES NOT inject in Month 3
console.log('\nTest 4: No injection in Month 3');
state = initializeGameState();
state.month = 3;
const scenarioM3 = await generateScenario(state, null);
const hasInsuranceM3 = scenarioM3.choices.some(c => c.isInsurance);
console.log('Month 3 has insurance option:', hasInsuranceM3);

if (!hasInsuranceM3) {
    console.log('PASS: Insurance option correctly omitted in Month 3');
} else {
    console.log('FAIL: Insurance option injected in Month 3 (Should not happen)');
}

// Test 5: generateScenario DOES NOT inject if already opted
console.log('\nTest 5: No injection if already opted');
state = initializeGameState();
state.month = 1;
state.insuranceOpted = true;
const scenarioOpted = await generateScenario(state, null);
const hasInsuranceOpted = scenarioOpted.choices.some(c => c.isInsurance);
console.log('Already opted has insurance option:', hasInsuranceOpted);

if (!hasInsuranceOpted) {
    console.log('PASS: Insurance option correctly omitted when already opted');
} else {
    console.log('FAIL: Insurance option injected when already opted (Should not happen)');
}
