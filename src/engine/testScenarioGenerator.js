/**
 * Test for Scenario Generator
 */
import { 
  initializeGameState 
} from './gameEngine.js';
import { 
  validateScenario, 
  getFallbackScenario,
  FALLBACK_SCENARIOS 
} from './scenarioGenerator.js';

// Test 1: Validate fallback scenarios
console.log('=== Testing Fallback Scenarios ===');
FALLBACK_SCENARIOS.forEach((scenario, index) => {
  const isValid = validateScenario(scenario);
  console.log(`Fallback ${index + 1}: ${isValid ? 'VALID' : 'INVALID'}`);
});

// Test 2: Get random fallback
console.log('\n=== Testing getFallbackScenario ===');
const fallback = getFallbackScenario();
console.log('Situation:', fallback.situation);
console.log('Choices:', fallback.choices.length);
fallback.choices.forEach(c => {
  console.log(`  - ${c.label}: ₹${c.balanceChange}, risk: ${c.riskChange}`);
});

// Test 3: Validate a correct scenario
console.log('\n=== Testing Validation (valid) ===');
const validScenario = {
  situation: "Test scenario",
  choices: [
    { id: "a", label: "Option A", balanceChange: -100, riskChange: 5 },
    { id: "b", label: "Option B", balanceChange: 0, riskChange: 0 },
    { id: "c", label: "Option C", balanceChange: 50, riskChange: -5 }
  ]
};
console.log('Valid scenario test:', validateScenario(validScenario) ? 'PASS' : 'FAIL');

// Test 4: Validate incorrect scenarios
console.log('\n=== Testing Validation (invalid) ===');
const invalidCases = [
  { name: 'null', data: null },
  { name: 'no situation', data: { choices: [] } },
  { name: 'wrong choices count', data: { situation: "test", choices: [{ id: "a", label: "b", balanceChange: 0, riskChange: 0 }] } },
  { name: 'missing balanceChange', data: { situation: "test", choices: [{ id: "a", label: "b", riskChange: 0 }, { id: "b", label: "c", riskChange: 0 }, { id: "c", label: "d", riskChange: 0 }] } }
];
invalidCases.forEach(({ name, data }) => {
  const isValid = validateScenario(data);
  console.log(`${name}: ${!isValid ? 'PASS (correctly rejected)' : 'FAIL'}`);
});

// Test 5 (generateScenario) removed as migrated to batch scenarios

console.log('\n=== All sync tests completed ===');
