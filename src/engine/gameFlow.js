
import { applyIncome, applyChoice, advanceMonth } from './gameEngine.js';
import { generateScenario, generateReflection } from './scenarioGenerator.js';

/**
 * Starts a new month by applying income and generating a scenario.
 * @param {Object} gameState - Current game state
 * @param {string} [apiKey] - Optional API key
 * @returns {Promise<Object>} - { gameState, scenario }
 */
export async function startMonth(gameState, apiKey) {
  // 1. Apply monthly income
  const stateWithIncome = applyIncome(gameState);
  
  // 2. Generate scenario based on new state
  const scenario = await generateScenario(stateWithIncome, apiKey);
  
  return {
    gameState: stateWithIncome,
    scenario
  };
}

/**
 * Ends the month by applying player choice, generating reflection, and advancing month.
 * @param {Object} gameState - State from startMonth (with income applied)
 * @param {Object} choice - The choice object selected by user
 * @param {string} [apiKey] - Optional API key
 * @returns {Promise<Object>} - { gameState, reflection }
 */
export async function endMonth(gameState, choice, apiKey) {
  // 1. Apply choice effects
  let stateAfterChoice = applyChoice(gameState, choice);
  
  // 2. Generate reflection for the month that just passed
  // We generate reflection BEFORE advancing month so it reflects current month's actions
  const reflection = await generateReflection(stateAfterChoice, apiKey);
  
  // 3. Advance to next month
  const finalState = advanceMonth(stateAfterChoice);
  
  return {
    gameState: finalState,
    reflection
  };
}
