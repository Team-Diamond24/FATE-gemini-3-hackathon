
// Load environment variables from .env file in project root
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

import { initializeGameState } from './gameEngine.js';
import { startMonth, endMonth } from './gameFlow.js';
import { loadUserData } from './persistence.js';

async function runTest() {
  console.log('--- Testing Game Flow Controller & Persistence ---');
  const userId = `test_user_${Date.now()}`;
  
  // 1. Initialize Game
  console.log('\n--- Initializing Game ---');
  let gameState = initializeGameState(userId);
  console.log(`Initial State: Month ${gameState.month}, Balance: ${gameState.balance}`);
  
  // 2. Start Month 1
  console.log('\n--- Starting Month 1 ---');
  const startResult = await startMonth(gameState);
  
  // Update local state tracking
  gameState = startResult.gameState;
  const scenario = startResult.scenario;
  
  console.log(`\nMonth ${gameState.month} started.`);
  console.log('Scenario Situation:', scenario.situation);
  console.log('Choices:');
  scenario.choices.forEach((c, i) => {
    console.log(`  ${i + 1}. ${c.label} (Costs: ${c.balanceChange})`);
  });
  
  // 3. Process Batch Scenarios
  let currentScenario = scenario;
  let processingResult = { gameState, isMonthEnd: false };
  let step = 0;

  console.log('\n--- Processing Month 1 Scenarios ---');
  
  // Loop until month ends (should process 5 scenarios)
  while (!processingResult.isMonthEnd && step < 10) { // Safety break
    step++;
    console.log(`\n[Scenario ${step}/5] Situation: "${currentScenario.situation}"`);
    
    // Select first choice
    const choice = currentScenario.choices[0];
    console.log(`User selected: "${choice.label}"`);
    
    // Submit choice (handleChoice/endMonth)
    // pass current gameState (from startMonth or previous iteration)
    const stateToProcess = processingResult.gameState || gameState;
    
    processingResult = await endMonth(stateToProcess, choice);
    
    if (processingResult.scenario) {
        currentScenario = processingResult.scenario;
        console.log('-> Next scenario loaded.');
    } else if (processingResult.isMonthEnd) {
        console.log('-> Month completed.');
    }
  }
  
  gameState = processingResult.gameState;
  const reflection = processingResult.reflection;
  
  console.log('\n--- Month End ---');
  console.log('Reflection Generated:');
  console.log(reflection);
  
  console.log(`\nNew State: Month ${gameState.month}, Balance: ${gameState.balance}`);
  
  // With new logic, endMonth/handleChoice snapshots but does NOT increment month
  if (gameState.month === 1) {
    console.log('\n✅ Successfully finalized Month 1 (Ready for Month 2)');
  } else {
    console.error(`\n❌ Incorrect month after finalization: ${gameState.month} (Expected 1)`);
  }
  
  // 5. Start Month 2
  console.log('\n--- Starting Month 2 ---');
  const month2Result = await startMonth(gameState);
  gameState = month2Result.gameState;
  
  if (gameState.month === 2) {
      console.log('✅ Successfully advanced to Month 2 via startMonth');
      // Verify batch generated
      if (gameState.currentBatch && gameState.currentBatch.scenarios.length === 5) {
          console.log('✅ Month 2 batch generated');
      }
  } else {
      console.error(`❌ Failed to start Month 2. State month: ${gameState.month}`);
  }
  
  console.log('\n--- Verifying Persistence ---');
  await new Promise(r => setTimeout(r, 500)); // wait for async write
  const savedData = await loadUserData(userId);
  if (savedData && savedData.month === 2) {
      console.log(`✅ SUCCESS: User data saved to file for ${userId}\n   (Month: ${savedData.month})`);
  } else {
      console.error('❌ FAILURE: User data not saved or incorrect', savedData);
  }
  
  console.log('\n✅ Game Flow Simulation Complete!');
}

runTest().catch(console.error);
