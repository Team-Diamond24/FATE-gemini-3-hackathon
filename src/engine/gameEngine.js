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
 */

/**
 * Creates a new game state with sensible defaults
 * @returns {GameState}
 */
export function initializeGameState() {
  return {
    month: 1,
    balance: 1000,
    savings: 500,
    insuranceOpted: false,
    riskScore: 50,
    history: [],
  };
}

// ============================================
// CORE GAME FUNCTIONS
// ============================================

/**
 * Advances the game by one month
 * Saves current state to history before advancing
 * @param {GameState} state - Current game state
 * @returns {GameState} - Updated game state
 */
export function advanceMonth(state) {
  // Save current state snapshot to history
  const snapshot = {
    month: state.month,
    balance: state.balance,
    savings: state.savings,
    riskScore: state.riskScore,
  };

  return {
    ...state,
    month: state.month + 1,
    history: [...state.history, snapshot],
  };
}

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
 */

/**
 * Applies a player's choice/decision to the game state
 * @param {GameState} state - Current game state
 * @param {Choice} choice - The choice to apply
 * @returns {GameState} - Updated game state
 */
export function applyChoice(state, choice) {
  const { balanceChange, savingsChange = 0, riskChange, description = '' } = choice;

  // Calculate new balance, prevent going below zero
  const newBalance = Math.max(0, state.balance + balanceChange);

  // Calculate new savings, prevent going below zero
  const newSavings = Math.max(0, state.savings + savingsChange);

  // Calculate new risk score, clamp between 0 and 100
  const newRiskScore = Math.max(0, Math.min(100, state.riskScore + riskChange));

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
