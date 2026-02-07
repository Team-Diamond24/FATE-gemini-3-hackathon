/**
 * Gemini-Powered Scenario Generator
 * Generates financial life scenarios for Indian student simulator
 */

import { GoogleGenAI } from '@google/genai';

// ============================================
// SYSTEM PROMPT
// ============================================

const SYSTEM_PROMPT = `You are a scenario generator for a financial life simulation game aimed at Indian college students.

Your task is to create realistic financial situations that Indian students commonly face.

RULES:
- Generate exactly ONE scenario with exactly 3 choices
- Use simple, clear language
- Keep monetary values realistic for Indian students (in INR, values between 100-5000)
- Balance changes should be small and realistic
- Risk changes should be between -20 and +20
- Do NOT give financial advice
- Do NOT add explanations or commentary
- Do NOT use emojis or markdown
- Return ONLY valid JSON, nothing else

CONTEXT TO CONSIDER:
- Current month in simulation
- Player's current balance
- Player's current savings
- Player's risk score (0-100, higher = riskier behavior)

SCENARIO THEMES (rotate between these):
- Food choices (canteen vs cooking vs ordering)
- Transport decisions (bus vs auto vs walk)
- Study materials (new books vs second-hand vs pirated)
- Entertainment (movies, subscriptions, outings)
- Part-time work opportunities
- Unexpected expenses (phone repair, medical, fees)
- Peer pressure spending (treats, gifts, group activities)
- Savings opportunities (FD, chit fund, piggy bank)

OUTPUT FORMAT (strict JSON only):
{
  "situation": "A brief description of the scenario the student faces",
  "choices": [
    {
      "id": "choice_1",
      "label": "Short description of first option",
      "balanceChange": -500,
      "riskChange": 5
    },
    {
      "id": "choice_2", 
      "label": "Short description of second option",
      "balanceChange": -200,
      "riskChange": 0
    },
    {
      "id": "choice_3",
      "label": "Short description of third option",
      "balanceChange": 0,
      "riskChange": -5
    }
  ]
}`;

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

// ============================================
// MAIN GENERATOR FUNCTION
// ============================================

/**
 * Generates a scenario using Gemini AI (via @google/genai SDK)
 * @param {Object} gameState - Current game state
 * @param {string} apiKey - Google Gemini API key
 * @returns {Promise<Object>} - Generated scenario
 */
export async function generateScenario(gameState, apiKey) {
  // Use provided key or fallback to environment variable (works in Vite and Node)
  let envKey;
  try {
    // Try Vite env
    if (import.meta && import.meta.env) {
      envKey = import.meta.env.VITE_GEMINI_API_KEY;
    }
  } catch (e) {
    // Ignore error if import.meta is not available
  }
  
  // Fallback to process.env for Node.js (testing)
  if (!envKey && typeof process !== 'undefined' && process.env) {
    envKey = process.env.VITE_GEMINI_API_KEY;
  }

  const key = apiKey || envKey;

  // If no API key, return fallback
  if (!key) {
    console.warn('No API key provided, using fallback scenario');
    return injectInsuranceChoice(getFallbackScenario(), gameState);
  }

  try {
    // Initialize Google GenAI Client
    const ai = new GoogleGenAI({ apiKey: key });
    
    // Use gemini-3-flash-preview model as requested
    const modelName = 'gemini-3-flash-preview';

    // Build context from game state
    const context = `
Current game state:
- Month: ${gameState.month}
- Balance: ₹${gameState.balance}
- Savings: ₹${gameState.savings}
- Risk Score: ${gameState.riskScore}/100

Generate a new financial scenario for this Indian college student.`;

    // Generate content
    const result = await ai.models.generateContent({
      model: modelName,
      contents: [
        {
          role: 'user',
          parts: [
            { text: SYSTEM_PROMPT + "\n\n" + context }
          ]
        }
      ]
    });

    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.warn(`Invalid response format from ${modelName}`);
      return injectInsuranceChoice(getFallbackScenario(), gameState);
    }

    // Parse and validate
    const scenario = parseGeminiResponse(text);
    
    if (scenario && validateScenario(scenario)) {
      console.log(`✓ Using model: ${modelName}`);
      return injectInsuranceChoice(scenario, gameState);
    } else {
      console.warn(`Invalid scenario format from ${modelName}`);
      return injectInsuranceChoice(getFallbackScenario(), gameState);
    }

  } catch (error) {
    console.error('Gemini API error:', JSON.stringify(error, null, 2));
    // If usage limit or other error, fallback
    return injectInsuranceChoice(getFallbackScenario(), gameState);
  }
}

// Export for testing
export { validateScenario, parseGeminiResponse, getFallbackScenario, FALLBACK_SCENARIOS, SYSTEM_PROMPT };
