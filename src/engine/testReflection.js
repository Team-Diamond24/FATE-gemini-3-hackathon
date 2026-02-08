// Load environment variables from .env file in project root
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

import { generateReflection } from './scenarioGenerator.js';

console.log('=== Testing Monthly Reflection Generator ===\n');

// Test Case 1: Positive Month
console.log('Test 1: Positive Month (Good choices, balance increase)');
const positiveState = {
  month: 2,
  balance: 6500,
  savings: 1000,
  riskScore: 35,
  history: [
    {
      type: 'income',
      month: 2,
      balanceChange: 3000,
      description: 'Monthly stipend received',
      timestamp: Date.now()
    },
    {
      type: 'choice',
      month: 2,
      balanceChange: -500,
      savingsChange: 500,
      riskChange: -5,
      description: 'Put money into savings',
      timestamp: Date.now()
    },
    {
      type: 'choice',
      month: 2,
      balanceChange: -200,
      savingsChange: 0,
      riskChange: 0,
      description: 'Bought second-hand textbooks',
      timestamp: Date.now()
    }
  ]
};

const reflection1 = await generateReflection(positiveState);
console.log('Reflection:');
console.log(reflection1);
console.log('\n---\n');

// Test Case 2: Negative Month
console.log('Test 2: Negative Month (Risky choices, balance decrease)');
const negativeState = {
  month: 3,
  balance: 2000,
  savings: 200,
  riskScore: 75,
  history: [
    {
      type: 'income',
      month: 3,
      balanceChange: 3000,
      description: 'Monthly stipend received',
      timestamp: Date.now()
    },
    {
      type: 'choice',
      month: 3,
      balanceChange: -2500,
      savingsChange: 0,
      riskChange: 20,
      description: 'Bought expensive new phone',
      timestamp: Date.now()
    },
    {
      type: 'choice',
      month: 3,
      balanceChange: -1500,
      savingsChange: 0,
      riskChange: 15,
      description: 'Went on weekend trip with friends',
      timestamp: Date.now()
    }
  ]
};

const reflection2 = await generateReflection(negativeState);
console.log('Reflection:');
console.log(reflection2);
console.log('\n---\n');

// Test Case 3: Mixed Month
console.log('Test 3: Mixed Month (Some good, some bad)');
const mixedState = {
  month: 4,
  balance: 4200,
  savings: 800,
  riskScore: 50,
  history: [
    {
      type: 'income',
      month: 4,
      balanceChange: 3000,
      description: 'Monthly stipend received',
      timestamp: Date.now()
    },
    {
      type: 'choice',
      month: 4,
      balanceChange: -800,
      savingsChange: 0,
      riskChange: 10,
      description: 'Treated friends to dinner',
      timestamp: Date.now()
    },
    {
      type: 'choice',
      month: 4,
      balanceChange: 1000,
      savingsChange: 0,
      riskChange: 5,
      description: 'Did freelance work',
      timestamp: Date.now()
    },
    {
      type: 'choice',
      month: 4,
      balanceChange: -500,
      savingsChange: 500,
      riskChange: -10,
      description: 'Started emergency fund',
      timestamp: Date.now()
    }
  ]
};

const reflection3 = await generateReflection(mixedState);
console.log('Reflection:');
console.log(reflection3);
console.log('\n---\n');

console.log('✅ All reflection tests completed!');
