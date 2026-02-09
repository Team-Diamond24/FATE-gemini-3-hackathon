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
 * @property {Object} modifiers - Behavioral modifiers influencing gameplay
 * @property {number} modifiers.riskSensitivity - Multiplier for risk/reward magnitude (0.5-2.5)
 * @property {number} modifiers.insuranceLikelihood - Weight for insurance offering (0.5-2.5)
 * @property {number} modifiers.difficultyModifier - Frequency of complex scenarios (0.5-2.5)
 * @property {number} modifiers.marketVolatility - Economic volatility affecting balance changes (0.5-2.5)
 * @property {number} modifiers.strategyMomentum - Cumulative effect from monthly strategy choices (-1.0 to 1.0)
 * @property {Object} investments - Investment portfolio
 * @property {Object} investments.insurance - Insurance details
 * @property {Array} investments.fixedDeposits - Active fixed deposits
 * @property {Array} investments.mutualFunds - Active mutual funds
 */

// Modifier clamping constants
const MODIFIER_MIN = 0.5;
const MODIFIER_MAX = 2.5;
const MOMENTUM_MIN = -1.0;
const MOMENTUM_MAX = 1.0;

/**
 * Clamp a value between min and max
 */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

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
    modifiers: {
      riskSensitivity: 1.0,
      insuranceLikelihood: 1.0,
      difficultyModifier: 1.0,
      marketVolatility: 1.0,
      strategyMomentum: 0.0  // Neutral starting point
    },
    investments: {
      insurance: { active: false, monthlyPremium: 0, coverage: 0 },
      fixedDeposits: [],
      mutualFunds: []
    }
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
 * @property {string} [concept] - Financial concept being taught (e.g., "Tax Optimization", "Emergency Fund", "Debt Management")
 */

/**
 * Applies a player's choice/decision to the game state
 * @param {GameState} state - Current game state
 * @param {Choice} choice - The choice to apply
 * @returns {GameState} - Updated game state
 */
export function applyChoice(state, choice) {
  const { balanceChange, savingsChange = 0, riskChange, description = '', isInsurance = false, concept = null } = choice;

  // Calculate new balance, prevent going below zero
  const newBalance = Math.max(0, state.balance + balanceChange);

  // Calculate new savings, prevent going below zero
  const newSavings = Math.max(0, state.savings + savingsChange);

  // Calculate new risk score, clamp between 0 and 100
  const newRiskScore = Math.max(0, Math.min(100, state.riskScore + riskChange));

  // Update insurance status if this choice is for insurance
  const newInsuranceOpted = state.insuranceOpted || isInsurance;

  // Create history entry for this choice - includes concept for educational tracking
  const historyEntry = {
    type: 'choice',
    month: state.month,
    balanceChange,
    savingsChange,
    riskChange,
    description,
    concept,  // Track the financial concept being taught
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
 * Deposits money from balance to savings
 * @param {GameState} state - Current game state
 * @param {number} amount - Amount to deposit
 * @returns {GameState} - Updated game state
 */
export function depositToSavings(state, amount) {
  if (amount <= 0 || amount > state.balance) {
    return state; // Invalid amount
  }

  return {
    ...state,
    balance: state.balance - amount,
    savings: state.savings + amount,
    history: [...state.history, {
      type: 'savings',
      month: state.month,
      balanceChange: -amount,
      savingsChange: amount,
      description: `Deposited ₹${amount} to savings`,
      timestamp: Date.now()
    }]
  };
}

/**
 * Withdraws money from savings to balance
 * @param {GameState} state - Current game state
 * @param {number} amount - Amount to withdraw
 * @returns {GameState} - Updated game state
 */
export function withdrawFromSavings(state, amount) {
  if (amount <= 0 || amount > state.savings) {
    return state; // Invalid amount
  }

  return {
    ...state,
    balance: state.balance + amount,
    savings: state.savings - amount,
    history: [...state.history, {
      type: 'savings',
      month: state.month,
      balanceChange: amount,
      savingsChange: -amount,
      description: `Withdrew ₹${amount} from savings`,
      timestamp: Date.now()
    }]
  };
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

// ============================================
// BEHAVIORAL LOGIC
// ============================================

/**
 * Initializes modifiers based on initial preferences (sets the floor/ceiling for the game)
 * Called ONCE during PreferencesSetup to calibrate the game difficulty
 * @param {GameState} state - Current game state
 * @param {Object} preferences - User preferences from setup
 * @param {string} preferences.primaryDrive - 'security', 'growth', or 'experience'
 * @param {string} preferences.riskLevel - 'low', 'medium', or 'high'
 * @returns {GameState} - Updated game state with calibrated modifiers
 */
export function initializeModifiers(state, preferences) {
  const { primaryDrive, riskLevel } = preferences;

  // Base modifiers
  const modifiers = {
    riskSensitivity: 1.0,
    insuranceLikelihood: 1.0,
    difficultyModifier: 1.0,
    marketVolatility: 1.0,
    strategyMomentum: 0.0
  };

  // Primary Drive calibration - sets baseline personality
  switch (primaryDrive) {
    case 'security':
      modifiers.riskSensitivity = 0.7;      // Lower risk exposure
      modifiers.insuranceLikelihood = 1.5;  // More insurance prompts
      modifiers.marketVolatility = 0.8;     // Calmer market
      modifiers.difficultyModifier = 0.8;   // Easier scenarios
      break;
    case 'growth':
      modifiers.riskSensitivity = 1.3;      // Higher risk exposure
      modifiers.insuranceLikelihood = 0.8;  // Fewer insurance prompts
      modifiers.marketVolatility = 1.2;     // More volatile market
      modifiers.difficultyModifier = 1.2;   // Harder scenarios
      break;
    case 'experience':
      modifiers.riskSensitivity = 1.0;      // Balanced
      modifiers.insuranceLikelihood = 1.0;
      modifiers.marketVolatility = 1.0;
      modifiers.difficultyModifier = 1.0;
      break;
  }

  // Risk Level calibration - adjusts the volatility floor/ceiling
  switch (riskLevel) {
    case 'low':
      modifiers.riskSensitivity -= 0.2;
      modifiers.marketVolatility -= 0.2;
      modifiers.difficultyModifier -= 0.1;
      break;
    case 'medium':
      // No adjustment - balanced
      break;
    case 'high':
      modifiers.riskSensitivity += 0.3;
      modifiers.marketVolatility += 0.3;
      modifiers.difficultyModifier += 0.2;
      break;
  }

  // Clamp all modifiers to valid ranges
  modifiers.riskSensitivity = clamp(modifiers.riskSensitivity, MODIFIER_MIN, MODIFIER_MAX);
  modifiers.insuranceLikelihood = clamp(modifiers.insuranceLikelihood, MODIFIER_MIN, MODIFIER_MAX);
  modifiers.difficultyModifier = clamp(modifiers.difficultyModifier, MODIFIER_MIN, MODIFIER_MAX);
  modifiers.marketVolatility = clamp(modifiers.marketVolatility, MODIFIER_MIN, MODIFIER_MAX);
  modifiers.strategyMomentum = clamp(modifiers.strategyMomentum, MOMENTUM_MIN, MOMENTUM_MAX);

  return {
    ...state,
    modifiers
  };
}

/**
 * Applies the impact of monthly strategy decisions (cumulative effects)
 * Called each month based on "Next Month's Strategy" answers
 * @param {GameState} state - Current game state
 * @param {Array<string>} answers - Array of answers ('A' or 'B') for decision questions
 * @returns {GameState} - Updated game state with adjusted modifiers
 */
export function applyBehavioralDecisions(state, answers) {
  if (!answers || !Array.isArray(answers)) return state;

  const newModifiers = {
    ...state.modifiers || {
      riskSensitivity: 1.0,
      insuranceLikelihood: 1.0,
      difficultyModifier: 1.0,
      marketVolatility: 1.0,
      strategyMomentum: 0.0
    }
  };

  // Monthly strategy adjustments - smaller increments for gradual momentum
  // Question 1: Stability vs Flexibility
  // A = Conservative (steady), B = Flexible (adaptive)
  if (answers[0] === 'A') {
    newModifiers.riskSensitivity -= 0.03;
    newModifiers.marketVolatility -= 0.02;
    newModifiers.strategyMomentum -= 0.1;  // Trending conservative
  } else if (answers[0] === 'B') {
    newModifiers.riskSensitivity += 0.03;
    newModifiers.marketVolatility += 0.02;
    newModifiers.strategyMomentum += 0.1;  // Trending aggressive
  }

  // Question 2: Protection Strategy
  // A = Self-reliance, B = Safety nets
  if (answers[1] === 'A') {
    newModifiers.insuranceLikelihood -= 0.05;
    newModifiers.difficultyModifier += 0.03;  // Harder without protection
  } else if (answers[1] === 'B') {
    newModifiers.insuranceLikelihood += 0.08;
    newModifiers.difficultyModifier -= 0.02;  // Easier with safety nets
  }

  // Question 3: Ambition Level
  // A = Steady growth, B = High stakes
  if (answers[2] === 'A') {
    newModifiers.difficultyModifier -= 0.03;
    newModifiers.marketVolatility -= 0.02;
    newModifiers.strategyMomentum -= 0.05;
  } else if (answers[2] === 'B') {
    newModifiers.difficultyModifier += 0.08;
    newModifiers.marketVolatility += 0.05;
    newModifiers.riskSensitivity += 0.05;
    newModifiers.strategyMomentum += 0.15;  // Strong aggressive signal
  }

  // Clamp all modifiers to valid ranges
  newModifiers.riskSensitivity = clamp(newModifiers.riskSensitivity, MODIFIER_MIN, MODIFIER_MAX);
  newModifiers.insuranceLikelihood = clamp(newModifiers.insuranceLikelihood, MODIFIER_MIN, MODIFIER_MAX);
  newModifiers.difficultyModifier = clamp(newModifiers.difficultyModifier, MODIFIER_MIN, MODIFIER_MAX);
  newModifiers.marketVolatility = clamp(newModifiers.marketVolatility, MODIFIER_MIN, MODIFIER_MAX);
  newModifiers.strategyMomentum = clamp(newModifiers.strategyMomentum, MOMENTUM_MIN, MOMENTUM_MAX);

  return {
    ...state,
    modifiers: newModifiers
  };
}

/**
 * Gets a human-readable strategy status based on current modifiers
 * @param {Object} modifiers - Current game modifiers
 * @returns {Object} - Strategy status with label and color
 */
export function getStrategyStatus(modifiers) {
  if (!modifiers) return { label: 'Balanced', color: 'yellow' };

  // Calculate overall aggression score based on modifiers
  const aggressionScore =
    (modifiers.riskSensitivity - 1.0) * 2 +
    (modifiers.difficultyModifier - 1.0) * 1.5 +
    (modifiers.marketVolatility - 1.0) * 1.5 +
    (modifiers.strategyMomentum || 0);

  if (aggressionScore > 0.8) {
    return { label: 'Aggressive', color: 'red', description: 'High risk, high reward' };
  } else if (aggressionScore > 0.3) {
    return { label: 'Growth-focused', color: 'orange', description: 'Moderate risk appetite' };
  } else if (aggressionScore < -0.8) {
    return { label: 'Conservative', color: 'green', description: 'Safety first' };
  } else if (aggressionScore < -0.3) {
    return { label: 'Cautious', color: 'teal', description: 'Measured approach' };
  } else {
    return { label: 'Balanced', color: 'yellow', description: 'Steady progression' };
  }
}

/**
 * Applies market volatility to a balance change
 * Higher volatility = larger swings in both directions
 * @param {number} baseChange - Original balance change
 * @param {number} volatility - Market volatility modifier
 * @returns {number} - Adjusted balance change
 */
export function applyVolatility(baseChange, volatility = 1.0) {
  // Volatility amplifies both gains and losses
  const amplification = 0.5 + (volatility * 0.5); // 0.75x to 1.75x at extremes
  return Math.round(baseChange * amplification);
}

// ============================================
// INVESTMENT FUNCTIONS
// ============================================

/**
 * Starts insurance with monthly premium deduction
 * @param {GameState} state - Current game state
 * @param {Object} insuranceData - Insurance details
 * @returns {GameState} - Updated game state
 */
export function startInsurance(state, insuranceData) {
  const { monthlyPremium, coverage } = insuranceData;

  if (monthlyPremium > state.balance) {
    return state; // Insufficient balance
  }

  return {
    ...state,
    balance: state.balance - monthlyPremium,
    insuranceOpted: true,
    investments: {
      ...state.investments,
      insurance: { active: true, monthlyPremium, coverage }
    },
    history: [...state.history, {
      type: 'insurance',
      month: state.month,
      balanceChange: -monthlyPremium,
      description: `Started insurance with ₹${monthlyPremium}/month premium`,
      timestamp: Date.now()
    }]
  };
}

/**
 * Cancels active insurance
 * @param {GameState} state - Current game state
 * @returns {GameState} - Updated game state
 */
export function cancelInsurance(state) {
  return {
    ...state,
    insuranceOpted: false,
    investments: {
      ...state.investments,
      insurance: { active: false, monthlyPremium: 0, coverage: 0 }
    },
    history: [...state.history, {
      type: 'insurance',
      month: state.month,
      description: 'Cancelled insurance',
      timestamp: Date.now()
    }]
  };
}

/**
 * Deducts monthly insurance premium (called at month start)
 * @param {GameState} state - Current game state
 * @returns {GameState} - Updated game state
 */
export function deductInsurancePremium(state) {
  if (!state.investments?.insurance?.active) {
    return state;
  }

  const premium = state.investments.insurance.monthlyPremium;

  if (premium > state.balance) {
    // Auto-cancel if can't afford
    return cancelInsurance(state);
  }

  return {
    ...state,
    balance: state.balance - premium,
    history: [...state.history, {
      type: 'insurance',
      month: state.month,
      balanceChange: -premium,
      description: `Insurance premium deducted: ₹${premium}`,
      timestamp: Date.now()
    }]
  };
}

/**
 * Starts a fixed deposit
 * @param {GameState} state - Current game state
 * @param {Object} fdData - FD details
 * @returns {GameState} - Updated game state
 */
export function startFixedDeposit(state, fdData) {
  const { amount, tenure, source, interestRate } = fdData;

  const availableAmount = source === 'savings' ? state.savings : state.balance;

  if (amount > availableAmount) {
    return state; // Insufficient funds
  }

  const maturityAmount = Math.round(amount * (1 + interestRate / 100 * tenure / 12));

  const newFD = {
    amount,
    tenure,
    remainingMonths: tenure,
    interestRate,
    maturityAmount,
    startMonth: state.month,
    source
  };

  const newState = {
    ...state,
    investments: {
      ...state.investments,
      fixedDeposits: [...state.investments.fixedDeposits, newFD]
    },
    history: [...state.history, {
      type: 'investment',
      month: state.month,
      description: `Started FD: ₹${amount} for ${tenure} months`,
      timestamp: Date.now()
    }]
  };

  // Deduct from source
  if (source === 'savings') {
    newState.savings = state.savings - amount;
  } else {
    newState.balance = state.balance - amount;
  }

  return newState;
}

/**
 * Starts a mutual fund investment
 * @param {GameState} state - Current game state
 * @param {Object} mfData - MF details
 * @returns {GameState} - Updated game state
 */
export function startMutualFund(state, mfData) {
  const { amount, type, source } = mfData;

  const availableAmount = source === 'savings' ? state.savings : state.balance;

  if (amount > availableAmount) {
    return state; // Insufficient funds
  }

  const newMF = {
    amount,
    type,
    currentValue: amount,
    startMonth: state.month,
    source
  };

  const newState = {
    ...state,
    investments: {
      ...state.investments,
      mutualFunds: [...state.investments.mutualFunds, newMF]
    },
    history: [...state.history, {
      type: 'investment',
      month: state.month,
      description: `Invested ₹${amount} in ${type} mutual fund`,
      timestamp: Date.now()
    }]
  };

  // Deduct from source
  if (source === 'savings') {
    newState.savings = state.savings - amount;
  } else {
    newState.balance = state.balance - amount;
  }

  return newState;
}

/**
 * Updates investment values at month end (FD maturity, MF returns)
 * @param {GameState} state - Current game state
 * @returns {GameState} - Updated game state
 */
export function updateInvestments(state) {
  let newState = { ...state };
  const newHistory = [...state.history];

  // Update FDs
  const updatedFDs = [];
  state.investments.fixedDeposits.forEach(fd => {
    const newRemainingMonths = fd.remainingMonths - 1;

    if (newRemainingMonths <= 0) {
      // FD matured - add to balance
      newState.balance += fd.maturityAmount;
      newHistory.push({
        type: 'investment',
        month: state.month,
        balanceChange: fd.maturityAmount,
        description: `FD matured: ₹${fd.maturityAmount} credited`,
        timestamp: Date.now()
      });
    } else {
      // FD still active
      updatedFDs.push({ ...fd, remainingMonths: newRemainingMonths });
    }
  });

  // Update MFs with market returns
  const updatedMFs = state.investments.mutualFunds.map(mf => {
    let returnRate = 0;
    switch (mf.type) {
      case 'equity':
        returnRate = (Math.random() * 0.03 - 0.01); // -1% to +2% monthly
        break;
      case 'debt':
        returnRate = (Math.random() * 0.01); // 0% to +1% monthly
        break;
      case 'hybrid':
        returnRate = (Math.random() * 0.02 - 0.005); // -0.5% to +1.5% monthly
        break;
    }

    const newValue = Math.round(mf.currentValue * (1 + returnRate));
    return { ...mf, currentValue: newValue };
  });

  newState.investments = {
    ...newState.investments,
    fixedDeposits: updatedFDs,
    mutualFunds: updatedMFs
  };

  newState.history = newHistory;

  return newState;
}
