import {
  initializeGameState,
  advanceMonth,
  applyIncome
} from "./gameEngine.js";
let state = initializeGameState();
state = applyIncome(state);
console.log(state);

state = advanceMonth(state);
console.log(state);

const state1 = initializeGameState();
const state2 = applyIncome(state1);

console.log(state1 === state2);
