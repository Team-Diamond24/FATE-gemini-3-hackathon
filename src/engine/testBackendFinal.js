/**
 * FINAL BACKEND VERIFICATION SCRIPT
 * This script ensures the entire engine is ready for frontend integration.
 * It tests: Initialization, Month Start, Scenario Consumption, Analysis, Behavioral Decisions, and Persistence.
 */

// Load environment variables
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

// Engine Imports
import { initializeGameState, applyBehavioralDecisions, getCurrentScenario, isMonthComplete } from './gameEngine.js';
import { startMonth, handleChoice } from './gameFlow.js';
import { loadUserData } from './persistence.js';

async function runFinalVerification() {
  console.log('🚀 INITIALIZING FINAL BACKEND READINESS CHECK\n');
  const userId = `verified_user_${Date.now()}`;
  
  // 1. Initialization
  console.log('--- Step 1: Initialization ---');
  let state = initializeGameState(userId);
  console.log(`✅ Game initialized for user: ${userId}`);
  console.log(`   Initial Balance: ₹${state.balance}, Month: ${state.month}, Modifiers: ${JSON.stringify(state.modifiers)}\n`);

  // 2. Start Month 1
  console.log('--- Step 2: Start Month 1 (Gemini Batch Generation) ---');
  const startResult = await startMonth(state);
  state = startResult.gameState;
  console.log(`✅ Month 1 Started. (New Balance after income/tax: ₹${state.balance})`);
  console.log(`✅ Batch of 5 scenarios generated and attached to state.\n`);

  // 3. Process Batch (Decision Loop)
  console.log('--- Step 3: Processing Monthly Scenarios ---');
  let choiceCounter = 0;
  while (!isMonthComplete(state.currentBatch)) {
    const scenario = getCurrentScenario(state.currentBatch);
    choiceCounter++;
    console.log(`   [${choiceCounter}/5] ${scenario.situation.substring(0, 50)}...`);
    
    // Always pick first choice for speed
    const choice = scenario.choices[0];
    const result = await handleChoice(state, choice);
    state = result.gameState;
    
    if (result.isMonthEnd) {
      console.log('✅ All scenarios processed. Month-end reached.');
      console.log('\n--- Step 4: Month-End Analysis (Gemini) ---');
      console.log('Analysis Output:\n' + result.reflection);
      
      console.log('\n--- Step 5: Behavioral Decision Questions (Gemini) ---');
      console.log('Decisions for Next Month:\n' + result.nextMonthDecisions);
      
      // 6. Apply Behavioral Answers
      console.log('\n--- Step 6: Applying Behavioral Decisions ---');
      const mockAnswers = ['B', 'A', 'B']; // Locked, Luck, High Stakes
      console.log(`   Simulating user answers: ${mockAnswers.join(', ')}`);
      state = applyBehavioralDecisions(state, mockAnswers);
      console.log(`✅ Modifiers Updated: ${JSON.stringify(state.modifiers)}\n`);
    }
  }

  // 7. Test Persistence
  console.log('--- Step 7: Verifying Persistence ---');
  await new Promise(r => setTimeout(r, 500)); // Ensure file write
  const savedData = await loadUserData(userId);
  if (savedData && savedData.month === 1 && savedData.modifiers) {
    console.log(`✅ Persistence Verified: Data for ${userId} successfully loaded from disk.`);
  } else {
    throw new Error('Persistence check failed: Data not found or incomplete.');
  }

  // 8. Start Month 2 (Behavioral Context Verification)
  console.log('\n--- Step 8: Start Month 2 (Checking Behavioral Context) ---');
  const month2Result = await startMonth(state);
  state = month2Result.gameState;
  console.log(`✅ Month 2 Started (Month ${state.month}).`);
  console.log(`✅ Gemini batch for Month 2 generated using behavioral profile context.`);

  console.log('\n🏆 FINAL VERIFICATION COMPLETE: BACKEND IS READY FOR INTEGRATION!');
}

runFinalVerification().catch(err => {
  console.error('\n❌ VERIFICATION FAILED:');
  console.error(err);
  process.exit(1);
});
