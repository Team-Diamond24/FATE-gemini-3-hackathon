/**
 * Financial Life Simulation - Game Engine
 * Pure game logic, no UI or framework dependencies
 */

// ============================================
// CONSTANTS
// ============================================

const DEFAULT_MONTHLY_INCOME = 5000;
const TAX_RATE = 0.20; // 20% flat tax

// ============================================
// GAME STATE
// ============================================

/**
 * @typedef {Object} GameState
 * @property {number} month - Current month in the simulation
 * @property {number} balance - Current account balance
 * @property {number} savings - Amount in savings account
 * @property {boolean} insuranceOpted - Whether player has insurance
 * @property {number} riskScore - Player's financial risk score (0-100)
 * @property {Array} history - Array of past state snapshots
 * @property {MonthlyScenarioBatch|null} currentBatch - Current month's scenario batch
 * @property {string} userId - Unique identifier for the user
 */

/**
 * Creates a new game state with sensible defaults
 * @param {string} [userId='default_user'] - Unique identifier for the user
 * @returns {GameState}
 */
export function initializeGameState(userId = 'default_user') {
  return {
    userId,
    month: 0,
    balance: 1000,
    savings: 500,
    insuranceOpted: false,
    riskScore: 50,
    history: [],
    currentBatch: null,
  };
}

// ============================================
// CORE GAME FUNCTIONS
// ============================================

/**
 * Finalizes the month by saving state to history
 * Does NOT increment month (handled by startMonth now)
 * @param {GameState} state - Current game state
 * @returns {GameState} - Updated game state with history snapshot
 */
export function finalizeMonth(state) {
  // Save current state snapshot to history
  const snapshot = {
    month: state.month,
    balance: state.balance,
    savings: state.savings,
    riskScore: state.riskScore,
  };

  return {
    ...state,
    history: [...state.history, snapshot],
  };
}

// Deprecated: Alias for backward compatibility if needed, but logic changed
export const advanceMonth = finalizeMonth;

/**
 * Applies monthly income after tax deduction
 * @param {GameState} state - Current game state
 * @param {number} [income=DEFAULT_MONTHLY_INCOME] - Gross monthly income
 * @returns {GameState} - Updated game state with income applied
 */
export function applyIncome(state, income = DEFAULT_MONTHLY_INCOME) {
  const taxDeduction = income * TAX_RATE;
  const netIncome = income - taxDeduction;

  return {
    ...state,
    balance: state.balance + netIncome,
  };
}

/**
 * @typedef {Object} Choice
 * @property {number} balanceChange - Amount to add/subtract from balance
 * @property {number} [savingsChange=0] - Amount to add/subtract from savings (optional)
 * @property {number} riskChange - Amount to add/subtract from riskScore
 * @property {string} [description] - Optional description of the choice
 * @property {boolean} [isInsurance] - Whether this choice triggers insurance mechanic
 */

/**
 * Applies a player's choice/decision to the game state
 * @param {GameState} state - Current game state
 * @param {Choice} choice - The choice to apply
 * @returns {GameState} - Updated game state
 */
export function applyChoice(state, choice) {
  const { balanceChange, savingsChange = 0, riskChange, description = '', isInsurance = false } = choice;

  // Calculate new balance, prevent going below zero
  const newBalance = Math.max(0, state.balance + balanceChange);

  // Calculate new savings, prevent going below zero
  const newSavings = Math.max(0, state.savings + savingsChange);

  // Calculate new risk score, clamp between 0 and 100
  const newRiskScore = Math.max(0, Math.min(100, state.riskScore + riskChange));

  // Update insurance status if this choice is for insurance
  const newInsuranceOpted = state.insuranceOpted || isInsurance;

  // Create history entry for this choice
  const historyEntry = {
    type: 'choice',
    month: state.month,
    balanceChange,
    savingsChange,
    riskChange,
    description,
    timestamp: Date.now(),
  };

  return {
    ...state,
    balance: newBalance,
    savings: newSavings,
    riskScore: newRiskScore,
    insuranceOpted: newInsuranceOpted,
    history: [...state.history, historyEntry],
  };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Creates a deep copy of the game state
 * @param {GameState} state - Current game state
 * @returns {GameState} - Deep copy of the state
 */
export function cloneState(state) {
  return {
    ...state,
    history: [...state.history],
  };
}

/**
 * Gets the net worth (balance + savings)
 * @param {GameState} state - Current game state
 * @returns {number} - Total net worth
 */
export function getNetWorth(state) {
  return state.balance + state.savings;
}

/**
 * @typedef {Object} ScenarioChoice
 * @property {string} id
 * @property {string} label
 * @property {number} balanceChange
 * @property {number} riskChange
 */

/**
 * @typedef {Object} Scenario
 * @property {string} id
 * @property {string} situation
 * @property {ScenarioChoice[]} choices
 */

/**
 * @typedef {Object} MonthlyScenarioBatch
 * @property {number} month
 * @property {Scenario[]} scenarios
 * @property {number} currentIndex
 */

/**
 * Initializes a new monthly scenario batch with empty scenarios
 * @param {number} month - The month number for this batch
 * @returns {MonthlyScenarioBatch} - A new empty batch object
 */
export function initializeMonthlyBatch(month) {
  return {
    month: month,
    scenarios: [],
    currentIndex: 0
  };
}

// ============================================
// BATCH CONSUMPTION LOGIC
// ============================================

/**
 * Gets the current scenario from the batch based on currentIndex
 * @param {MonthlyScenarioBatch} batch - The scenario batch
 * @returns {Object|null} - The current scenario or null if batch is finished/invalid
 */
export function getCurrentScenario(batch) {
  if (!batch || !batch.scenarios || batch.currentIndex >= batch.scenarios.length) {
    return null;
  }
  return batch.scenarios[batch.currentIndex];
}

/**
 * Advances the batch index by one
 * @param {MonthlyScenarioBatch} batch - The scenario batch
 * @returns {MonthlyScenarioBatch} - New batch object with incremented index or same batch if null
 */
export function advanceScenarioIndex(batch) {
  if (!batch) return batch;
  return {
    ...batch,
    currentIndex: batch.currentIndex + 1
  };
}

/**
 * Checks if the month's scenarios are all completed
 * @param {MonthlyScenarioBatch} batch - The scenario batch
 * @returns {boolean} - True if all scenarios consumed or batch invalid
 */
export function isMonthComplete(batch) {
  if (!batch || !batch.scenarios) return true;
  return batch.currentIndex >= batch.scenarios.length;
}
