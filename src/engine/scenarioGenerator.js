/**
 * Gemini-Powered Scenario Generator
 * Generates financial life scenarios for Indian student simulator
 */

import { GoogleGenAI } from '@google/genai';
import { initializeMonthlyBatch } from './gameEngine.js';
import apiKeyManager from '../utils/apiKeyManager.js';

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
    concept: "Emergency Fund",
    choices: [
      { id: "choice_1", label: "Get it repaired at the local shop", balanceChange: -800, riskChange: 5, concept: "Emergency Fund" },
      { id: "choice_2", label: "Use a screen protector and ignore it", balanceChange: -100, riskChange: 0, concept: "Cost Deferral" },
      { id: "choice_3", label: "Ask parents for help with repair cost", balanceChange: 0, riskChange: -10, concept: "Financial Support" }
    ]
  },
  {
    situation: "A senior offers you a part-time tutoring job for school students. This could help build your savings.",
    concept: "Income Generation",
    choices: [
      { id: "choice_1", label: "Accept the job for extra income", balanceChange: 1500, riskChange: 10, concept: "Active Income" },
      { id: "choice_2", label: "Decline to focus on studies", balanceChange: 0, riskChange: -5, concept: "Opportunity Cost" },
      { id: "choice_3", label: "Try it for one month first", balanceChange: 800, riskChange: 5, concept: "Risk Management" }
    ]
  },
  {
    situation: "Your college offers a tax-saving investment scheme for students. Understanding ₹80C deductions could save you money in the future.",
    concept: "Tax Optimization",
    choices: [
      { id: "choice_1", label: "Invest ₹1000 in ELSS for tax learning", balanceChange: -1000, riskChange: 5, concept: "Tax-saving Investments" },
      { id: "choice_2", label: "Skip and save the money instead", balanceChange: 0, riskChange: 0, concept: "Liquidity vs Tax Benefits" },
      { id: "choice_3", label: "Research more before investing", balanceChange: 0, riskChange: -5, concept: "Financial Literacy" }
    ]
  },
  {
    situation: "The hostel offers two insurance options: basic health coverage or comprehensive coverage with accident protection.",
    concept: "Insurance Planning",
    choices: [
      { id: "choice_1", label: "Get comprehensive coverage", balanceChange: -800, riskChange: -15, concept: "Risk Mitigation", isInsurance: true },
      { id: "choice_2", label: "Get basic health coverage only", balanceChange: -400, riskChange: -8, concept: "Insurance Basics", isInsurance: true },
      { id: "choice_3", label: "Skip insurance for now", balanceChange: 0, riskChange: 10, concept: "Self-Insurance Risk" }
    ]
  },
  {
    situation: "You have ₹500 extra this month. Your friend owes you ₹300 and keeps delaying payment.",
    concept: "Debt vs Savings",
    choices: [
      { id: "choice_1", label: "Add full ₹500 to savings", balanceChange: 0, savingsChange: 500, riskChange: -5, concept: "Emergency Fund Building" },
      { id: "choice_2", label: "Spend on needs and write off debt", balanceChange: -200, riskChange: 5, concept: "Opportunity Cost" },
      { id: "choice_3", label: "Give friend deadline, save ₹500", balanceChange: 0, savingsChange: 500, riskChange: 0, concept: "Debt Recovery" }
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

const ANALYSIS_PROMPT = `You are a Financial Mentor for a financial education simulation game for Indian college students.
Your task is to generate a structured, educational reflection using the "Feedback Sandwich" approach - acknowledge what was done, explain WHY it matters financially, and provide actionable wisdom.

SECTIONS (You MUST use these EXACT headers with brackets):

[ANALYSIS]
Objectively describe what happened this month. Reference specific choices made and their financial impact.
- What decisions were made?
- How did balance/savings/risk change?
- Note any patterns (spending, saving, risk-taking).

[THE LESSON]
This is the TEACHING moment - explain the financial principle or concept behind their choices.
- WHY did certain choices impact them positively or negatively?
- Connect to real financial concepts: compound interest, emergency funds, opportunity cost, risk diversification, tax planning, insurance coverage.
- Use Indian context examples where relevant (₹80C deductions, PPF, health insurance, UPI habits).

[STRATEGY]
Provide a forward-looking "Pro-Tip" for next month.
- One specific, actionable piece of financial wisdom.
- Make it relevant to their current situation.
- Keep it encouraging, not preachy.

RULES:
- Use the provided data only - reference specific choices.
- Focus on the "WHY" behind the numbers, not just the numbers.
- NO generic explanations - be specific to their choices.
- NO judgement or scolding - be a supportive mentor.
- Use simple, conversational language.
- Total length: 10-15 lines across all sections.
- Return ONLY the structured text with the three headers.

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
  // Use API key manager if no specific key provided
  const key = apiKey || apiKeyManager.getKeyForType('reflection');

  if (!key) {
    console.warn('No API key available for reflection generation');
    return getFallbackReflection(gameState);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: key });

    // Build context from game state
    const analysisData = extractMonthAnalysisData(gameState);
    const context = buildAnalysisContext(analysisData);

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
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
  // Use API key manager if no specific key provided
  const key = apiKey || apiKeyManager.getKeyForType('questions');

  if (!key) {
    console.warn('No API key available for decision questions generation');
    return "Next month, do you want to:\nA) Save more\nB) Spend more"; // Very basic fallback
  }

  try {
    const ai = new GoogleGenAI({ apiKey: key });

    // Build context
    const contextData = extractDecisionContextData(gameState, analysisText);
    const context = buildDecisionContext(contextData);

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
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

const MONTHLY_BATCH_PROMPT = `You are an educational scenario generator for a financial life simulation game aimed at Indian college students.

Your task is to generate 5 realistic financial scenarios for ONE month that TEACH financial concepts through choices.

EDUCATIONAL MANDATE - At least 2 scenarios MUST focus on these financial mechanics:
1. TAX: Choices about tax-saving instruments (₹80C, ELSS, PPF) or understanding deductions
2. INSURANCE: Differentiating coverage types (Health vs Life vs Asset protection)
3. SAVINGS/DEBT: Opportunity costs of high-interest debt vs emergency funds vs investments

RULES:
- Generate exactly 5 scenarios
- At least 2 must be "Financial Concept" scenarios (marked with concept field)
- Target user: Indian college student
- Scenarios should feel like everyday life with embedded learning
- Mix: 2-3 concept-teaching scenarios + 2-3 everyday decisions
- Choices should represent DIFFERENT FINANCIAL STRATEGIES, not just "good/bad"
- Include a "concept" field for each scenario and choice (e.g., "Tax Optimization", "Emergency Fund", "Risk Diversification")
- No advice or explanations in the scenario text
- No emojis or markdown

SCENARIO STRUCTURE:
Each scenario must have:
- id: unique identifier
- situation: brief description (mention the financial concept naturally)
- concept: the main financial concept being taught
- choices: exactly 3 options, each representing a different strategy

CHOICE STRUCTURE:
Each choice must have:
- id: unique identifier
- label: the action (5-10 words)
- balanceChange: negative for expense, positive for income
- riskChange: -20 to +20
- concept: the specific financial principle this choice demonstrates

OUTPUT FORMAT (strict JSON only):
{
  "scenarios": [
    {
      "id": "scenario_1",
      "situation": "Your college offers a tax-saving investment workshop...",
      "concept": "Tax Optimization",
      "choices": [
        {
          "id": "c1",
          "label": "Invest ₹1000 in ELSS fund",
          "balanceChange": -1000,
          "riskChange": 5,
          "concept": "Tax-saving Investments"
        },
        {
          "id": "c2",
          "label": "Keep money liquid for emergencies",
          "balanceChange": 0,
          "riskChange": 0,
          "concept": "Liquidity Management"
        },
        {
          "id": "c3",
          "label": "Start a PPF account instead",
          "balanceChange": -500,
          "riskChange": -5,
          "concept": "Safe Tax Instruments"
        }
      ]
    }
  ]
}`;

/**
 * Generates a batch of 5 scenarios for a month
 * @param {Object} gameState - Current game state
 * @param {string} [apiKey] - Optional API key
 * @returns {Promise<Object>} - MonthlyScenarioBatch object
 */
async function generateMonthlyScenarios(gameState, apiKey) {
  // Use API key manager if no specific key provided
  const key = apiKey || apiKeyManager.getKeyForType('scenario');

  // Helper to inject insurance
  const injectInsurance = (targetBatch) => {
    if (targetBatch.scenarios.length > 0) {
      targetBatch.scenarios[0] = injectInsuranceChoice(targetBatch.scenarios[0], gameState);
    }
    return targetBatch;
  };

  if (!key) {
    console.warn('No API key available for batch generation, using fallback');
    return injectInsurance(getFallbackBatch(gameState.month));
  }

  try {
    const ai = new GoogleGenAI({ apiKey: key });

    // Build behavioral context and narrative directives based on modifiers
    const modifiers = gameState.modifiers || {
      riskSensitivity: 1.0,
      difficultyModifier: 1.0,
      marketVolatility: 1.0,
      insuranceLikelihood: 1.0,
      strategyMomentum: 0.0
    };

    // Build dynamic narrative directives based on modifiers
    const narrativeDirectives = [];

    // Difficulty-based directives
    if (modifiers.difficultyModifier > 1.5) {
      narrativeDirectives.push("HARSH ECONOMIC CLIMATE: Include scenarios involving sudden inflation, unexpected tax audits, or mandatory compliance costs. At least 2 scenarios should have unavoidable expenses.");
    } else if (modifiers.difficultyModifier > 1.2) {
      narrativeDirectives.push("CHALLENGING ENVIRONMENT: Include one scenario with a complex financial decision like tax optimization or investment timing.");
    } else if (modifiers.difficultyModifier < 0.7) {
      narrativeDirectives.push("STABLE ENVIRONMENT: Focus on straightforward choices with predictable outcomes. Fewer emergency situations.");
    }

    // Risk sensitivity directives
    if (modifiers.riskSensitivity > 1.5) {
      narrativeDirectives.push("HIGH RISK APPETITE: Provide high-reward/high-consequence investment opportunities. Include crypto, stocks, or speculative ventures as options.");
    } else if (modifiers.riskSensitivity > 1.2) {
      narrativeDirectives.push("MODERATE RISK TOLERANCE: Include one scenario with an investment or side-income opportunity with meaningful upside.");
    } else if (modifiers.riskSensitivity < 0.7) {
      narrativeDirectives.push("RISK-AVERSE PROFILE: Focus on security and stability. Savings-focused options should be prominent.");
    }

    // Market volatility directives
    if (modifiers.marketVolatility > 1.3) {
      narrativeDirectives.push("VOLATILE MARKET: Balance changes should be more extreme (larger gains AND losses possible). Include scenarios affected by market conditions.");
    } else if (modifiers.marketVolatility < 0.8) {
      narrativeDirectives.push("CALM MARKET: Keep balance changes moderate and predictable. Fewer sudden windfalls or losses.");
    }

    // Insurance likelihood directives
    if (modifiers.insuranceLikelihood > 1.3) {
      narrativeDirectives.push("PROTECTION FOCUS: Include scenarios where insurance/protection products are relevant or would have helped.");
    }

    // Strategy momentum directives
    if ((modifiers.strategyMomentum || 0) > 0.5) {
      narrativeDirectives.push("AGGRESSIVE TRAJECTORY: The player is trending aggressive. Scenarios should reflect higher-stakes financial situations.");
    } else if ((modifiers.strategyMomentum || 0) < -0.5) {
      narrativeDirectives.push("CONSERVATIVE TRAJECTORY: The player is trending conservative. Scenarios should offer safe, steady progression options.");
    }

    const behaviorDesc = narrativeDirectives.length > 0
      ? "NARRATIVE DIRECTIVES:\\n" + narrativeDirectives.join("\\n")
      : "Balanced behavioral approach with standard scenario distribution.";

    // Get previous month's choices for context
    const history = gameState.history || [];
    const previousMonthChoices = history
      .filter(e => e.type === 'choice' && e.month === gameState.month - 1)
      .map(e => `- ${e.description} (Balance: ${e.balanceChange >= 0 ? '+' : ''}₹${e.balanceChange}, Risk: ${e.riskChange >= 0 ? '+' : ''}${e.riskChange})`)
      .join('\\n');

    const currentMonthChoices = history
      .filter(e => e.type === 'choice' && e.month === gameState.month)
      .map(e => `- ${e.description} (Balance: ${e.balanceChange >= 0 ? '+' : ''}₹${e.balanceChange}, Risk: ${e.riskChange >= 0 ? '+' : ''}${e.riskChange})`)
      .join('\\n');

    // Build context with modifier values
    const context = `
CURRENT GAME STATE:
- Month: ${gameState.month}
- Current Balance: ₹${gameState.balance}
- Current Savings: ₹${gameState.savings}
- Risk Score: ${gameState.riskScore}/100
- Insurance Status: ${gameState.insuranceOpted ? 'Active' : 'Not Active'}

MODIFIER VALUES (for balanceChange calibration):
- Risk Sensitivity: ${modifiers.riskSensitivity.toFixed(2)}x (multiply risk-related balance changes)
- Market Volatility: ${modifiers.marketVolatility.toFixed(2)}x (amplify gains and losses)
- Difficulty: ${modifiers.difficultyModifier.toFixed(2)}x

${behaviorDesc}

${previousMonthChoices ? `PREVIOUS MONTH'S CHOICES (Month ${gameState.month - 1}):\\n${previousMonthChoices}\\n` : ''}
${currentMonthChoices ? `CURRENT MONTH'S CHOICES SO FAR (Month ${gameState.month}):\\n${currentMonthChoices}\\n` : ''}

INSTRUCTIONS:
Generate 5 scenarios for Month ${gameState.month}. 
- Apply the modifier values to calibrate balanceChange amounts (e.g., if riskSensitivity is 1.5, make risk-reward choices 50% more impactful)
- Consider their current financial state (balance: ₹${gameState.balance}, risk: ${gameState.riskScore}/100)
- Reference or build upon their previous choices when relevant
- Follow the narrative directives above closely`;

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
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
