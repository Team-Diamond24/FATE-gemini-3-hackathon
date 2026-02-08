// Load environment variables from .env file in project root
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

import { initializeGameState } from './gameEngine.js';
import { handleChoice } from './gameFlow.js';

async function testDecisions() {
  console.log('=== Testing Decision Question Generator ===\n');

  const state = initializeGameState('test_user_decisions');
  state.month = 1;
  state.balance = 4000;
  state.riskScore = 60;
  state.history = [
    {
      type: 'choice',
      month: 1,
      balanceChange: -1500,
      riskChange: 10,
      description: 'Bought expensive new shoes',
      timestamp: Date.now()
    },
    {
      type: 'choice',
      month: 1,
      balanceChange: -800,
      riskChange: 5,
      description: 'Went to a concert',
      timestamp: Date.now()
    }
  ];

  // Mock a choice that ends the month
  const choice = {
    id: 'last_choice',
    label: 'Finish Month',
    balanceChange: -200,
    riskChange: 0
  };

  console.log('Processing month-end choice...');
  const result = await handleChoice(state, choice);

  console.log('\n--- Analysis (Reflection) ---');
  console.log(result.reflection);

  console.log('\n--- Decision Questions for Next Month ---');
  console.log(result.nextMonthDecisions);

  if (result.nextMonthDecisions && result.nextMonthDecisions.includes('A)') && result.nextMonthDecisions.includes('B)')) {
    console.log('\n✅ SUCCESS: Decisions generated with A/B options.');
  } else {
    console.error('\n❌ FAILURE: Decisions format incorrect.');
  }
}

testDecisions().catch(console.error);
