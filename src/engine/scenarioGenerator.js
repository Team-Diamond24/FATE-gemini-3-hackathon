/**
 * Gemini-Powered Scenario Generator
 * Generates financial life scenarios for Indian student simulator
 */

import { GoogleGenAI } from '@google/genai';
import { initializeMonthlyBatch } from './gameEngine.js';

// ============================================
// SYSTEM PROMPT
// ============================================

// SYSTEM_PROMPT removed (replaced by MONTHLY_BATCH_PROMPT)

// ============================================
// FALLBACK SCENARIOS
// ============================================

const FALLBACK_SCENARIOS = [
  {
    situation: "Your phone screen cracked and you need to decide what to do.",
    choices: [
      { id: "choice_1", label: "Get it repaired at the local shop", balanceChange: -800, riskChange: 5 },
      { id: "choice_2", label: "Use a screen protector and ignore it", balanceChange: -100, riskChange: 0 },
      { id: "choice_3", label: "Ask parents for help with repair cost", balanceChange: 0, riskChange: -10 }
    ]
  },
  {
    situation: "Your friends are planning a weekend trip to a nearby hill station.",
    choices: [
      { id: "choice_1", label: "Join the trip and split costs", balanceChange: -1500, riskChange: 10 },
      { id: "choice_2", label: "Skip the trip and study instead", balanceChange: 0, riskChange: -5 },
      { id: "choice_3", label: "Go for just one day to save money", balanceChange: -600, riskChange: 5 }
    ]
  },
  {
    situation: "The semester books list is out and you need study materials.",
    choices: [
      { id: "choice_1", label: "Buy new books from the store", balanceChange: -2000, riskChange: -5 },
      { id: "choice_2", label: "Get second-hand books from seniors", balanceChange: -500, riskChange: 0 },
      { id: "choice_3", label: "Use library copies and photocopies", balanceChange: -200, riskChange: 5 }
    ]
  },
  {
    situation: "A senior offers you a part-time tutoring job for school students.",
    choices: [
      { id: "choice_1", label: "Accept the job for extra income", balanceChange: 1500, riskChange: 10 },
      { id: "choice_2", label: "Decline to focus on studies", balanceChange: 0, riskChange: -5 },
      { id: "choice_3", label: "Try it for one month first", balanceChange: 800, riskChange: 5 }
    ]
  },
  {
    situation: "Your laptop is running slow and affecting your assignments.",
    choices: [
      { id: "choice_1", label: "Buy a new budget laptop", balanceChange: -25000, riskChange: 5 },
      { id: "choice_2", label: "Get RAM upgrade from local shop", balanceChange: -2000, riskChange: 0 },
      { id: "choice_3", label: "Use college computer lab instead", balanceChange: 0, riskChange: -5 }
    ]
  }
];

// ============================================
// VALIDATION
// ============================================

/**
 * Validates that the scenario matches expected format
 * @param {Object} scenario - Scenario object to validate
 * @returns {boolean} - True if valid
 */
function validateScenario(scenario) {
  // Check top-level structure
  if (!scenario || typeof scenario !== 'object') {
    return false;
  }

  // Check situation
  if (typeof scenario.situation !== 'string' || scenario.situation.length === 0) {
    return false;
  }

  // Check choices array
  if (!Array.isArray(scenario.choices) || scenario.choices.length !== 3) {
    return false;
  }

  // Validate each choice
  for (const choice of scenario.choices) {
    if (typeof choice.id !== 'string' || choice.id.length === 0) {
      return false;
    }
    if (typeof choice.label !== 'string' || choice.label.length === 0) {
      return false;
    }
    if (typeof choice.balanceChange !== 'number') {
      return false;
    }
    if (typeof choice.riskChange !== 'number') {
      return false;
    }
  }

  return true;
}

/**
 * Validates that the monthly scenario batch has valid scenarios
 * @param {Object} batch - Batch object containing scenarios array
 * @returns {boolean} - True if valid
 */
function validateBatch(batch) {
  // Check scenarios array exists and length >= 4
  if (!batch || !Array.isArray(batch.scenarios) || batch.scenarios.length < 4) {
    return false;
  }
  
  // Validate each scenario
  return batch.scenarios.every(validateScenario);
}

/**
 * Attempts to parse JSON from Gemini response, handling potential issues
 * @param {string} text - Raw text response from Gemini
 * @returns {Object|null} - Parsed object or null if invalid
 */
function parseGeminiResponse(text) {
  try {
    // Try direct parse first
    return JSON.parse(text);
  } catch {
    // Try to extract JSON from response (in case of extra text)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

/**
 * Gets a random fallback scenario
 * @returns {Object} - A fallback scenario
 */
function getFallbackScenario() {
  const index = Math.floor(Math.random() * FALLBACK_SCENARIOS.length);
  return { ...FALLBACK_SCENARIOS[index] };
}

/**
 * Gets a fallback batch of 4 scenarios
 * @param {number} month - Current month
 * @returns {Object} - MonthlyScenarioBatch with fallback scenarios
 */
function getFallbackBatch(month) {
  const batch = initializeMonthlyBatch(month);
  
  // Use first 4 fallback scenarios
  batch.scenarios = FALLBACK_SCENARIOS.slice(0, 4).map((s, index) => ({
    ...s,
    id: `fallback_${month}_${index}_${Date.now()}`,
    choices: s.choices.map((c, cIndex) => ({
      ...c,
      id: `fb_choice_${index}_${cIndex}`
    }))
  }));
  
  return batch;
}

// ============================================
// INSURANCE MECHANIC
// ============================================

const INSURANCE_OPTIONS = [
  {
    label: "Pay small fee for campus security fund",
    balanceChange: -500,
    riskChange: -5,
    isInsurance: true
  },
  {
    label: "Join student welfare scheme",
    balanceChange: -500,
    riskChange: 0,
    isInsurance: true
  },
  {
    label: "Subscribe to health emergency fund",
    balanceChange: -500,
    riskChange: -2,
    isInsurance: true
  }
];

/**
 * Injects insurance option into scenario if conditions met
 * @param {Object} scenario - The generated scenario
 * @param {Object} gameState - Current game state
 * @returns {Object} - Modified scenario
 */
function injectInsuranceChoice(scenario, gameState) {
  // If already opted, don't offer again
  if (gameState.insuranceOpted) return scenario;

  const likelihood = gameState.modifiers?.insuranceLikelihood || 1.0;
  
  // Base probability: 100% in months 1-2, then lower base but scaled by likelihood
  const baseProb = 0.4;
  const effectiveProb = (gameState.month <= 2) ? 1.0 : baseProb * likelihood;

  if (Math.random() <= effectiveProb) {
    const insuranceOption = INSURANCE_OPTIONS[Math.floor(Math.random() * INSURANCE_OPTIONS.length)];
    
    // Replace the 3rd choice (index 2) with insurance option
    if (scenario.choices && scenario.choices.length >= 3) {
      scenario.choices[2] = {
        ...insuranceOption,
        id: `choice_insurance_${Date.now()}` // Unique ID
      };
    }
  }
  return scenario;
}

// generateScenario removed (use generateMonthlyScenarios)

// ============================================
// MONTHLY REFLECTION GENERATOR
// ============================================

const ANALYSIS_PROMPT = `You are a financial analysis generator for a simulation game for Indian college students.
Your task is to generate a short, structured analysis of the player's month based on their ACTUAL choices and financial data.

SECTIONS (You MUST use these exact headers):
1. Spending behaviour: Analyze where the money went based on the specific choices made.
2. Tax impact: State the tax deducted neutrally.
3. Risk & protection: Note if insurance was kept or not and current risk level.

RULES:
- You MUST include all 3 headers as numbered sections.
- Use the provided data only - reference specific choices the user made.
- NO generic explanations.
- NO advice or recommendations.
- NO judgement or scolding.
- Use simple, direct language.
- Max 6–8 lines total.
- Return ONLY the analysis text.

INPUT DATA:
Month: {month}
Monthly Income: ₹{income}
Total Spending: ₹{spending}
Total Earnings (from choices): ₹{earnings}
Tax Deducted: ₹{tax}
Insurance Status: {insurance}
Current Balance: ₹{balance}
Current Savings: ₹{savings}
Current Risk Score: {riskScore}/100

CHOICES MADE THIS MONTH:
{choices}

Number of decisions: {numChoices}`;

const DECISION_PROMPT = `You are a behavioral strategist for a financial simulation game for Indian college students.
Your task is to generate exactly 3 short questions for the "Next Month's Plan" based on the player's ACTUAL performance and choices this month.

CRITICAL FORMAT REQUIREMENT:
Each question MUST follow this EXACT format:
1. [Question text]?
A) [First option - brief, 5-8 words max]
B) [Second option - brief, 5-8 words max]

EXAMPLE:
1. How will you approach spending next month?
A) Continue being cautious with expenses
B) Allow some flexibility in budget

RULES:
- Generate exactly 3 questions.
- Each question MUST have the format shown above with A) and B) options on separate lines.
- Questions must be based on the provided month summary, choices made, and current financial state.
- The choices should represent different behavioral approaches (e.g., proactive vs reactive, saving vs spending).
- Reference specific patterns from their choices when relevant.
- Keep options SHORT - maximum 8 words each.
- NO correct or incorrect answers.
- NO quizzes.
- NO scoring.
- NO judgement, advice, or scolding.
- Use simple, direct, conversational language.
- Return ONLY the questions in the exact format specified.

INPUT DATA:
Month: {month}
Summary of this month: {summary}
User's behavioral patterns: {patterns}
Tax/Insurance status: {status}
Current Balance: ₹{balance}
Current Risk Score: {riskScore}/100

CHOICES MADE THIS MONTH:
{choices}

Number of decisions: {numChoices}`;

/**
 * Extracts relevant data for monthly analysis
 */
function extractMonthAnalysisData(gameState) {
  const currentMonth = gameState.month;
  const history = gameState.history || [];
  
  // Get entries from the current month
  const monthEntries = history.filter(entry => entry.month === currentMonth);
  
  // Get all choices made this month with details
  const choicesMade = monthEntries
    .filter(e => e.type === 'choice')
    .map(e => ({
      description: e.description || 'Unknown choice',
      balanceChange: e.balanceChange || 0,
      riskChange: e.riskChange || 0,
      savingsChange: e.savingsChange || 0
    }));
  
  // Total spending (sum of negative balanceChange from choices)
  const totalSpending = choicesMade
    .filter(c => c.balanceChange < 0)
    .reduce((sum, c) => sum + Math.abs(c.balanceChange), 0);
  
  // Total earnings (sum of positive balanceChange from choices)
  const totalEarnings = choicesMade
    .filter(c => c.balanceChange > 0)
    .reduce((sum, c) => sum + c.balanceChange, 0);
    
  // Fixed values for now as per game rules (5000 income, 20% tax)
  const income = 5000;
  const tax = 1000;
  
  // Format choices for Gemini
  const choicesFormatted = choicesMade.map((c, idx) => 
    `${idx + 1}. ${c.description} (Balance: ${c.balanceChange >= 0 ? '+' : ''}₹${c.balanceChange}, Risk: ${c.riskChange >= 0 ? '+' : ''}${c.riskChange})`
  ).join('\n');

  return {
    month: currentMonth,
    income,
    spending: totalSpending,
    earnings: totalEarnings,
    tax,
    insurance: gameState.insuranceOpted ? "Opted In" : "Not Opted",
    currentBalance: gameState.balance,
    currentSavings: gameState.savings,
    currentRiskScore: gameState.riskScore,
    choicesMade: choicesFormatted || "No choices made this month",
    numberOfChoices: choicesMade.length
  };
}

/**
 * Extracts behavioral patterns and context for next month's decisions
 */
function extractDecisionContextData(gameState, analysisText) {
  const history = gameState.history || [];
  const monthEntries = history.filter(entry => entry.month === gameState.month);
  
  // Get all choices made this month
  const choicesMade = monthEntries
    .filter(e => e.type === 'choice')
    .map(e => ({
      description: e.description || 'Unknown choice',
      balanceChange: e.balanceChange || 0,
      riskChange: e.riskChange || 0
    }));
  
  // Risk trend
  const riskChange = choicesMade.reduce((sum, c) => sum + (c.riskChange || 0), 0);
    
  let patterns = [];
  if (riskChange > 5) patterns.push("Willing to take on higher financial risks");
  if (riskChange < -5) patterns.push("Highly cautious and risk-averse behavior");
  
  // Balance trend
  const heavySpending = choicesMade.filter(c => c.balanceChange < -1000).length;
  if (heavySpending > 0) patterns.push("Inclination towards high-value one-time purchases");
  
  const smallSpending = choicesMade.filter(c => c.balanceChange < 0 && c.balanceChange > -500).length;
  if (smallSpending >= 3) patterns.push("Frequent small expenditures");
  
  // Income-generating choices
  const incomeChoices = choicesMade.filter(c => c.balanceChange > 0).length;
  if (incomeChoices > 0) patterns.push("Actively seeking income opportunities");
  
  // Format choices for context
  const choicesFormatted = choicesMade.map((c, idx) => 
    `${idx + 1}. ${c.description} (₹${c.balanceChange >= 0 ? '+' : ''}${c.balanceChange})`
  ).join('\n');

  return {
    month: gameState.month,
    summary: analysisText,
    patterns: patterns.length > 0 ? patterns.join(', ') : "Moderate/Balanced approach",
    status: `Tax deducted: ₹1000, Insurance: ${gameState.insuranceOpted ? 'Active' : 'Not active'}`,
    currentBalance: gameState.balance,
    currentRiskScore: gameState.riskScore,
    choicesMade: choicesFormatted || "No choices made",
    numberOfChoices: choicesMade.length
  };
}

/**
 * Builds context string for decision questions generation
 */
function buildDecisionContext(data) {
  return DECISION_PROMPT
    .replace('{month}', data.month)
    .replace('{summary}', data.summary)
    .replace('{patterns}', data.patterns)
    .replace('{status}', data.status)
    .replace('{balance}', data.currentBalance)
    .replace('{riskScore}', data.currentRiskScore)
    .replace('{choices}', data.choicesMade)
    .replace('{numChoices}', data.numberOfChoices);
}

/**
 * Builds context string for analysis generation
 */
function buildAnalysisContext(data) {
  return ANALYSIS_PROMPT
    .replace('{month}', data.month)
    .replace('{income}', data.income)
    .replace('{spending}', data.spending)
    .replace('{earnings}', data.earnings)
    .replace('{tax}', data.tax)
    .replace('{insurance}', data.insurance)
    .replace('{balance}', data.currentBalance)
    .replace('{savings}', data.currentSavings)
    .replace('{riskScore}', data.currentRiskScore)
    .replace('{choices}', data.choicesMade)
    .replace('{numChoices}', data.numberOfChoices);
}

/**
 * Fallback reflection when API fails
 */
function getFallbackReflection(gameState) {
  const reflections = [
    "Another month passed. You made your choices.\nSome worked out, some didn't.\nThat's how it goes.",
    
    "This month had its ups and downs.\nYou're learning as you go.\nEvery choice teaches you something.",
    
    "Money came and went this month.\nYou handled what came your way.\nOn to the next one.",
    
    "You navigated through another month.\nThe balance shifted, as it does.\nKeep moving forward."
  ];
  
  return reflections[Math.floor(Math.random() * reflections.length)];
}

/**
 * Generates a monthly financial analysis using Gemini AI
 * @param {Object} gameState - Current game state
 * @param {string} apiKey - Optional API key (uses env if not provided)
 * @returns {Promise<string>} - Generated analysis text
 */
async function generateReflection(gameState, apiKey) {
  // Use provided key or fallback to environment variable
  let envKey;
  try {
    if (import.meta && import.meta.env) {
      envKey = import.meta.env.VITE_GEMINI_API_KEY;
    }
  } catch (e) {
    // Ignore
  }
  
  if (!envKey && typeof process !== 'undefined' && process.env) {
    envKey = process.env.VITE_GEMINI_API_KEY;
  }

  const key = apiKey || envKey;

  if (!key) {
    console.warn('No API key provided for reflection generation');
    return getFallbackReflection(gameState);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: key });
    
    // Build context from game state
    const analysisData = extractMonthAnalysisData(gameState);
    const context = buildAnalysisContext(analysisData);

    const result = await ai.models.generateContent({
      model: 'gemini-robotics-er-1.5-preview',
      contents: [
        {
          role: 'user',
          parts: [{ text: context }]
        }
      ]
    });

    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.warn('Invalid analysis response from Gemini');
      return getFallbackReflection(gameState);
    }

    return text.trim();

  } catch (error) {
    console.error('Analysis generation error:', error.message);
    return getFallbackReflection(gameState);
  }
}

/**
 * Generates 3 behavioral questions for the next month using Gemini AI
 * @param {Object} gameState - Current game state
 * @param {string} analysisText - The financial analysis generated earlier
 * @param {string} apiKey - Optional API key
 * @returns {Promise<string>} - Generated questions text
 */
async function generateDecisionQuestions(gameState, analysisText, apiKey) {
  // Use provided key or fallback to environment variable
  let envKey;
  try {
    if (import.meta && import.meta.env) {
      envKey = import.meta.env.VITE_GEMINI_API_KEY;
    }
  } catch (e) {}
  
  if (!envKey && typeof process !== 'undefined' && process.env) {
    envKey = process.env.VITE_GEMINI_API_KEY;
  }

  const key = apiKey || envKey;

  if (!key) {
    console.warn('No API key provided for decision questions generation');
    return "Next month, do you want to:\nA) Save more\nB) Spend more"; // Very basic fallback
  }

  try {
    const ai = new GoogleGenAI({ apiKey: key });
    
    // Build context
    const contextData = extractDecisionContextData(gameState, analysisText);
    const context = buildDecisionContext(contextData);

    const result = await ai.models.generateContent({
      model: 'gemini-robotics-er-1.5-preview',
      contents: [
        {
          role: 'user',
          parts: [{ text: context }]
        }
      ]
    });

    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.warn('Invalid decision questions response from Gemini');
      return "Next month, do you want to:\nA) Keep it steady\nB) Try new things";
    }

    return text.trim();

  } catch (error) {
    console.error('Decision questions generation error:', error.message);
    return "Next month, do you want to:\nA) Be cautious\nB) Be adventurous";
  }
}

// ============================================
// MONTHLY BATCH GENERATOR
// ============================================

const MONTHLY_BATCH_PROMPT = `You are a scenario generator for a financial life simulation game aimed at Indian college students.

Your task is to generate 5 realistic financial scenarios for ONE month of the student's life based on their previous choices and current financial state.

RULES:
- Generate exactly 5 scenarios
- Target user: Indian student
- Scenarios should feel like everyday life
- Mix small decisions and one stressful situation
- Consider the user's previous choices and current financial state when generating scenarios
- Make scenarios contextually relevant to their situation
- No advice
- No explanations
- No emojis
- No markdown

SCENARIO STRUCTURE:
Each scenario must have:
- A unique ID
- A brief situation description
- Exactly 3 choices
- Each choice has a label, balanceChange (negative for expense, positive for income), and riskChange (-20 to +20)

OUTPUT FORMAT (strict JSON only):
{
  "scenarios": [
    {
      "id": "scenario_1",
      "situation": "Description of situation 1",
      "choices": [
        {
          "id": "c1",
          "label": "Option 1",
          "balanceChange": -500,
          "riskChange": 5
        },
        {
          "id": "c2",
          "label": "Option 2",
          "balanceChange": -200,
          "riskChange": 0
        },
        {
          "id": "c3",
          "label": "Option 3",
          "balanceChange": 0,
          "riskChange": -5
        }
      ]
    },
    ... (4 more scenarios)
  ]
}`;

/**
 * Generates a batch of 5 scenarios for a month
 * @param {Object} gameState - Current game state
 * @param {string} [apiKey] - Optional API key
 * @returns {Promise<Object>} - MonthlyScenarioBatch object
 */
async function generateMonthlyScenarios(gameState, apiKey) {
  // Use provided key or fallback to environment variable
  let envKey;
  try {
    if (import.meta && import.meta.env) {
      envKey = import.meta.env.VITE_GEMINI_API_KEY;
    }
  } catch (e) {
    // Ignore
  }
  
  if (!envKey && typeof process !== 'undefined' && process.env) {
    envKey = process.env.VITE_GEMINI_API_KEY;
  }

  const key = apiKey || envKey;

  // Helper to inject insurance
  const injectInsurance = (targetBatch) => {
    if (targetBatch.scenarios.length > 0) {
      targetBatch.scenarios[0] = injectInsuranceChoice(targetBatch.scenarios[0], gameState);
    }
    return targetBatch;
  };

  if (!key) {
    console.warn('No API key provided for batch generation, using fallback');
    return injectInsurance(getFallbackBatch(gameState.month));
  }

  try {
    const ai = new GoogleGenAI({ apiKey: key });
    
    // Build behavioral context
    const modifiers = gameState.modifiers || { riskSensitivity: 1.0, difficultyModifier: 1.0 };
    let behaviorDesc = "Balanced behavioral approach.";
    if (modifiers.riskSensitivity > 1.1) behaviorDesc = "Player is showing high risk tolerance.";
    if (modifiers.riskSensitivity < 0.9) behaviorDesc = "Player is very risk-averse.";
    if (modifiers.difficultyModifier > 1.1) behaviorDesc += " Scenarios should be more challenging with higher stakes.";

    // Get previous month's choices for context
    const history = gameState.history || [];
    const previousMonthChoices = history
      .filter(e => e.type === 'choice' && e.month === gameState.month - 1)
      .map(e => `- ${e.description} (Balance: ${e.balanceChange >= 0 ? '+' : ''}₹${e.balanceChange}, Risk: ${e.riskChange >= 0 ? '+' : ''}${e.riskChange})`)
      .join('\n');
    
    const currentMonthChoices = history
      .filter(e => e.type === 'choice' && e.month === gameState.month)
      .map(e => `- ${e.description} (Balance: ${e.balanceChange >= 0 ? '+' : ''}₹${e.balanceChange}, Risk: ${e.riskChange >= 0 ? '+' : ''}${e.riskChange})`)
      .join('\n');

    // Build context
    const context = `
CURRENT GAME STATE:
- Month: ${gameState.month}
- Current Balance: ₹${gameState.balance}
- Current Savings: ₹${gameState.savings}
- Risk Score: ${gameState.riskScore}/100
- Insurance Status: ${gameState.insuranceOpted ? 'Active' : 'Not Active'}
- Behavioral Profile: ${behaviorDesc}

${previousMonthChoices ? `PREVIOUS MONTH'S CHOICES (Month ${gameState.month - 1}):\n${previousMonthChoices}\n` : ''}
${currentMonthChoices ? `CURRENT MONTH'S CHOICES SO FAR (Month ${gameState.month}):\n${currentMonthChoices}\n` : ''}

INSTRUCTIONS:
Generate 5 scenarios for Month ${gameState.month}. 
- Consider their current financial state (balance: ₹${gameState.balance}, risk: ${gameState.riskScore}/100)
- Reference or build upon their previous choices when relevant
- Adjust difficulty based on their behavioral profile
- Make scenarios feel like natural consequences or continuations of their financial journey`;

    const result = await ai.models.generateContent({
      model: 'gemini-robotics-er-1.5-preview',
      contents: [
        {
          role: 'user',
          parts: [{ text: MONTHLY_BATCH_PROMPT + "\n\n" + context }]
        }
      ]
    });

    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.warn('Invalid batch response from Gemini (empty text)');
      return injectInsurance(getFallbackBatch(gameState.month));
    }

    // Parse JSON
    const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
    const data = parseGeminiResponse(cleanText);

    if (data && validateBatch(data)) {
      // Create proper batch structure
      const batch = initializeMonthlyBatch(gameState.month);
      batch.scenarios = data.scenarios.map((s, index) => ({
        ...s,
        id: s.id || `scenario_${gameState.month}_${index}_${Date.now()}`,
        choices: s.choices.map((c, cIndex) => ({
          ...c,
          id: c.id || `choice_${index}_${cIndex}`
        }))
      }));
      
      return injectInsurance(batch);
    } else {
      console.warn('Invalid batch format from Gemini, using fallback');
      return injectInsurance(getFallbackBatch(gameState.month));
    }

  } catch (error) {
    console.error('Batch generation error:', error.message);
    return injectInsurance(getFallbackBatch(gameState.month));
  }
}

// Export for testing
export { 
  validateScenario, 
  parseGeminiResponse, 
  getFallbackScenario, 
  FALLBACK_SCENARIOS, 
  MONTHLY_BATCH_PROMPT,
  generateReflection,
  generateDecisionQuestions,
  generateMonthlyScenarios
};
