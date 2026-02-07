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
  // Only offer in month 1 & 2, if not already opted
  if (gameState.month <= 2 && !gameState.insuranceOpted) {
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
Your task is to generate a short, structured analysis of the player's month.

SECTIONS (You MUST use these exact headers):
1. Spending behaviour: Analyze where the money went based on the spending data.
2. Tax impact: State the tax deducted neutrally.
3. Risk & protection: Note if insurance was kept or not.

RULES:
- You MUST include all 3 headers as numbered sections.
- Use the provided data only.
- NO generic explanations.
- NO advice or recommendations.
- NO judgement or scolding.
- Use simple, direct language.
- Max 6–8 lines total.
- Return ONLY the analysis text.

INPUT DATA:
Month: {month}
Income: ₹{income}
Spending: ₹{spending}
Tax: ₹{tax}
Insurance Opted: {insurance}
Events: {events}`;

/**
 * Extracts relevant data for monthly analysis
 */
function extractMonthAnalysisData(gameState) {
  const currentMonth = gameState.month;
  const history = gameState.history || [];
  
  // Get entries from the current month
  const monthEntries = history.filter(entry => entry.month === currentMonth);
  
  // Total spending (sum of negative balanceChange from choices)
  const totalSpending = monthEntries
    .filter(e => e.type === 'choice' && e.balanceChange < 0)
    .reduce((sum, e) => sum + Math.abs(e.balanceChange), 0);
    
  // Fixed values for now as per game rules (5000 income, 20% tax)
  const income = 5000;
  const tax = 1000;
  
  const events = monthEntries
    .filter(e => e.type === 'choice' && e.description)
    .map(e => e.description);

  return {
    month: currentMonth,
    income,
    spending: totalSpending,
    tax,
    insurance: gameState.insuranceOpted ? "Opted In" : "Not Opted",
    events: events.length > 0 ? events.join(', ') : "No major events"
  };
}

/**
 * Builds context string for analysis generation
 */
function buildAnalysisContext(data) {
  return ANALYSIS_PROMPT
    .replace('{month}', data.month)
    .replace('{income}', data.income)
    .replace('{spending}', data.spending)
    .replace('{tax}', data.tax)
    .replace('{insurance}', data.insurance)
    .replace('{events}', data.events);
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
export async function generateReflection(gameState, apiKey) {
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
      model: 'gemini-2.5-flash',
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

// ============================================
// MONTHLY BATCH GENERATOR
// ============================================

const MONTHLY_BATCH_PROMPT = `You are a scenario generator for a financial life simulation game aimed at Indian college students.

Your task is to generate 5 realistic financial scenarios for ONE month of the student's life.

RULES:
- Generate exactly 5 scenarios
- Target user: Indian student
- Scenarios should feel like everyday life
- Mix small decisions and one stressful situation
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
export async function generateMonthlyScenarios(gameState, apiKey) {
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
    
    // Build context
    const context = `
Current game state:
- Month: ${gameState.month}
- Balance: ₹${gameState.balance}
- Savings: ₹${gameState.savings}
- Risk Score: ${gameState.riskScore}/100

Generate 5 scenarios for Month ${gameState.month}.`;

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
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
export { validateScenario, parseGeminiResponse, getFallbackScenario, FALLBACK_SCENARIOS, MONTHLY_BATCH_PROMPT };
