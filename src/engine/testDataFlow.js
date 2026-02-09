/**
 * Test script to verify user data flows correctly to Gemini prompts
 * Run with: node src/engine/testDataFlow.js
 */

import { initializeGameState, applyChoice, applyIncome } from './gameEngine.js';
import { generateMonthlyScenarios, generateReflection, generateDecisionQuestions } from './scenarioGenerator.js';

async function testDataFlow() {
  console.log('=== Testing Data Flow to Gemini ===\n');

  // 1. Create a game state with some choices
  let state = initializeGameState('test_user');
  console.log('Initial State:', {
    month: state.month,
    balance: state.balance,
    savings: state.savings,
    riskScore: state.riskScore
  });

  // 2. Simulate Month 1 - Apply income
  state = applyIncome(state);
  console.log('\nAfter income:', { balance: state.balance });

  // 3. Make some choices
  const choice1 = {
    balanceChange: -800,
    riskChange: 5,
    description: 'Got phone screen repaired at local shop'
  };
  state = applyChoice(state, choice1);
  console.log('\nAfter choice 1:', { balance: state.balance, riskScore: state.riskScore });

  const choice2 = {
    balanceChange: -1500,
    riskChange: 10,
    description: 'Joined friends for weekend trip to hill station'
  };
  state = applyChoice(state, choice2);
  console.log('After choice 2:', { balance: state.balance, riskScore: state.riskScore });

  const choice3 = {
    balanceChange: 1500,
    riskChange: 10,
    description: 'Accepted part-time tutoring job'
  };
  state = applyChoice(state, choice3);
  console.log('After choice 3:', { balance: state.balance, riskScore: state.riskScore });

  // 4. Test Monthly Reflection Generation
  console.log('\n=== Testing Monthly Reflection ===');
  console.log('Generating reflection with user choices...\n');
  
  try {
    const reflection = await generateReflection(state);
    console.log('Generated Reflection:');
    console.log(reflection);
  } catch (error) {
    console.error('Reflection generation failed:', error.message);
  }

  // 5. Test Decision Questions Generation
  console.log('\n=== Testing Decision Questions ===');
  console.log('Generating questions based on user behavior...\n');
  
  try {
    const questions = await generateDecisionQuestions(state, 'Test analysis text');
    console.log('Generated Questions:');
    console.log(questions);
  } catch (error) {
    console.error('Questions generation failed:', error.message);
  }

  // 6. Test Next Month Scenario Generation
  console.log('\n=== Testing Next Month Scenarios ===');
  state.month = 2; // Move to month 2
  console.log('Generating scenarios for Month 2 based on Month 1 choices...\n');
  
  try {
    const batch = await generateMonthlyScenarios(state);
    console.log('Generated Batch:');
    console.log(JSON.stringify(batch, null, 2));
  } catch (error) {
    console.error('Scenario generation failed:', error.message);
  }

  console.log('\n=== Test Complete ===');
}

// Run the test
testDataFlow().catch(console.error);
