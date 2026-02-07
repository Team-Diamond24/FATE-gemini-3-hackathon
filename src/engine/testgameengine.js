import {
  initializeGameState,
  advanceMonth,
  applyIncome
} from "./gameEngine.js";
let state = initializeGameState();
state = applyIncome(state);
console.log(state);

state= advanceMonth(state);
console.log(state);

const state1 = initializeGameState();
const state2 = applyIncome(state1);

console.log(state1 === state2);

import {applyChoice } from './gameEngine.js';


// Player opts for insurance
state = applyChoice(state, {
  balanceChange: -200,
  riskChange: -15,
  description: "Purchased health insurance"
});
console.log(state);
// Player makes risky investment
state = applyChoice(state, {
  balanceChange: -1000,
  savingsChange: -500,
  riskChange: 20,
  description: "Invested in volatile stocks"
});
console.log(state);