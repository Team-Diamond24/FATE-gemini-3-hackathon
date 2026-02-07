
import { applyIncome, applyChoice, finalizeMonth, getCurrentScenario, advanceScenarioIndex, isMonthComplete } from './gameEngine.js';
import { generateMonthlyScenarios, generateReflection } from './scenarioGenerator.js';
import { saveUserData } from './persistence.js';

/**
 * Starts a new month by incrementing month, applying income, and generating a batch.
 * Checks if batch already exists for current month (caching).
 * @param {Object} gameState - Current game state
 * @param {string} [apiKey] - Optional API key
 * @returns {Promise<Object>} - { gameState, scenario } (First scenario of batch)
 */
export async function startMonth(gameState, apiKey) {
  // Check if we are resuming an active month (Caching)
  // If batch exists and belongs to current month (or next month if we already inc?), assume current.
  // Actually, if we are mid-month, gameState.month is N. currentBatch.month should be N.
  if (gameState.currentBatch && gameState.currentBatch.month === gameState.month && !isMonthComplete(gameState.currentBatch)) {
    return {
      gameState: gameState,
      scenario: getCurrentScenario(gameState.currentBatch)
    };
  }

  // Determine new month
  // If we are at Month 0, next is 1.
  // If we are at Month 1 (finished), next is 2.
  const newMonth = gameState.month + 1;
  const stateNewMonth = { ...gameState, month: newMonth };

  // 1. Apply monthly income
  const stateWithIncome = applyIncome(stateNewMonth);
  
  // 2. Generate batch of scenarios
  const batch = await generateMonthlyScenarios(stateWithIncome, apiKey);
  
  // 3. Attach batch to state
  const stateWithBatch = {
    ...stateWithIncome,
    currentBatch: batch
  };
  
  // Auto-save state
  await saveUserData(stateWithBatch.userId || 'default', stateWithBatch);
  
  // Return first scenario
  return {
    gameState: stateWithBatch,
    scenario: getCurrentScenario(batch)
  };
}

/**
 * Processes a player's choice. 
 * If conflicts remain in batch, returns next scenario.
 * If batch complete, generates reflection and advances month.
 * @param {Object} gameState - Current game state
 * @param {Object} choice - The choice object selected by user
 * @param {string} [apiKey] - Optional API key
 * @returns {Promise<Object>} - { gameState, reflection?, scenario?, isMonthEnd: boolean }
 */
export async function handleChoice(gameState, choice, apiKey) {
  // 1. Apply choice effects
  let currentState = applyChoice(gameState, choice);
  
  // 2. Check batch progress
  if (currentState.currentBatch) {
    // Advance index using helper
    const updatedBatch = advanceScenarioIndex(currentState.currentBatch);
    currentState = { ...currentState, currentBatch: updatedBatch };
    
    // If not complete, return next scenario
    if (!isMonthComplete(updatedBatch)) {
      // Auto-save mid-month progress
      await saveUserData(currentState.userId || 'default', currentState);
      
      return {
        gameState: currentState,
        scenario: getCurrentScenario(updatedBatch),
        isMonthEnd: false
      };
    }
  }
  
  // 3. Month End: Generate reflection based on full month history
  const reflection = await generateReflection(currentState, apiKey);
  
  // 4. Finalize Month (save history)
  let finalState = finalizeMonth(currentState);
  finalState.currentBatch = null; // Clear batch for next startMonth
  
  // Auto-save end of month state
  await saveUserData(finalState.userId || 'default', finalState);
  
  return {
    gameState: finalState,
    reflection,
    isMonthEnd: true
  };
}

// Deprecated alias for backward compatibility (if needed)
export const endMonth = handleChoice;
