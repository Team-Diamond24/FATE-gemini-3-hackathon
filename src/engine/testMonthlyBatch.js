
// Load environment variables from .env file in project root
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

import { generateMonthlyScenarios } from './scenarioGenerator.js';
import { initializeGameState } from './gameEngine.js';

console.log('--- Testing Monthly Scenario Batch Generation ---');

async function testBatchGeneration() {
  console.log('\nInitializing Game State...');
  const state = initializeGameState();
  console.log(`Month: ${state.month}, Balance: ${state.balance}`);

  console.log('\nGenerating Monthly Scenarios (this may take a few seconds)...');
  const startTime = Date.now();
  
  try {
    const batch = await generateMonthlyScenarios(state);
    const duration = Date.now() - startTime;
    
    console.log(`\nGeneration took ${duration}ms`);
    console.log('Batch Result:', JSON.stringify(batch, null, 2));

    if (batch.scenarios && batch.scenarios.length === 5) {
      console.log('\n✅ SUCCESS: Generated exactly 5 scenarios');
      
      // Verify structure of first scenario
      const s1 = batch.scenarios[0];
      if (s1.choices && s1.choices.length === 3) {
        console.log('✅ SUCCESS: Scenario has 3 choices');
        console.log(`   Sample Situation: "${s1.situation}"`);
      } else {
        console.error('❌ FAILURE: Scenario structure incorrect (choices length)');
      }
      
    } else {
      console.error(`❌ FAILURE: Expected 5 scenarios, got ${batch.scenarios ? batch.scenarios.length : 0}`);
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error);
  }
}


async function testFallback() {
  console.log('\n--- Testing Fallback Mechanism (Invalid/Missing Key) ---');
  const state = initializeGameState();
  
  // Pass null as API key to force fallback
  const batch = await generateMonthlyScenarios(state, null);
  
  if (batch && batch.scenarios && batch.scenarios.length >= 4) {
      console.log(`✅ SUCCESS: Fallback returned ${batch.scenarios.length} scenarios (Expected >= 4)`);
      
      const s1 = batch.scenarios[0];
      // Check for insurance in first scenario (month 1)
      if (s1.choices[2].isInsurance) {
          console.log('✅ SUCCESS: Insurance option present in fallback batch');
      } else {
          console.warn('⚠️ WARNING: Insurance option missing in fallback batch');
      }

  } else {
      console.error(`❌ FAILURE: Expected >= 4 scenarios, got ${batch?.scenarios?.length}`);
  }
}

(async () => {
    await testBatchGeneration();
    await testFallback();
})();
