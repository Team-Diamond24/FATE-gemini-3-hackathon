
// Load environment variables from .env file in project root
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

import { initializeGameState } from './gameEngine.js';
import { startMonth, endMonth } from './gameFlow.js';

async function runTest() {
  console.log('--- Testing Game Flow Controller ---');
  
  // 1. Initialize Game
  console.log('\n--- Initializing Game ---');
  let gameState = initializeGameState();
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
  
  // 3. Simulate User Choice (pick first option)
  const choice = scenario.choices[0];
  console.log(`\nUser selected Choice 1: "${choice.label}"`);
  
  // 4. End Month 1
  console.log('\n--- Ending Month 1 ---');
  const endResult = await endMonth(gameState, choice);
  
  gameState = endResult.gameState;
  const reflection = endResult.reflection;
  
  console.log('\nReflection Generated:');
  console.log(reflection);
  
  console.log(`\nNew State: Month ${gameState.month}, Balance: ${gameState.balance}`);
  
  if (gameState.month === 2) {
    console.log('\n✅ Successfully advanced to Month 2');
  } else {
    console.error('\n❌ Failed to advance month correctly');
  }
  
  console.log('\n✅ Game Flow Simulation Complete!');
}

runTest().catch(console.error);
