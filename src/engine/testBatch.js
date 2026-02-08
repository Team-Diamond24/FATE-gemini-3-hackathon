
import { initializeMonthlyBatch } from './gameEngine.js';

console.log('--- Testing Monthly Scenario Batch ---');

// Test Case 1: Initialization
console.log('\nTest 1: Initialization');
const month = 5;
const batch = initializeMonthlyBatch(month);

console.log('Batch created:', batch);

if (batch.month === month && batch.scenarios.length === 0 && batch.currentIndex === 0) {
  console.log('✅ Batch initialized correctly');
} else {
  console.error('❌ Batch initialization failed');
}

// Test Case 2: Structure Check (Manual Verification)
console.log('\nTest 2: Structure Verification');
console.log('Expected: { month: number, scenarios: [], currentIndex: 0 }');
console.log('Actual:  ', JSON.stringify(batch));

// Test Case 3: Adding a dummy scenario to verify structure
console.log('\nTest 3: Adding Dummy Scenario');
const dummyScenario = {
  id: 'scenario_1',
  situation: 'Test Situation',
  choices: [
    { id: 'c1', label: 'Choice 1', balanceChange: -100, riskChange: 0 },
    { id: 'c2', label: 'Choice 2', balanceChange: 0, riskChange: 5 },
    { id: 'c3', label: 'Choice 3', balanceChange: -50, riskChange: -2 }
  ]
};

batch.scenarios.push(dummyScenario);
console.log('Batch with scenario:', JSON.stringify(batch, null, 2));

if (batch.scenarios.length === 1 && batch.scenarios[0].choices.length === 3) {
  console.log('✅ Scenario added correctly');
} else {
  console.error('❌ Scenario addition failed');
}
