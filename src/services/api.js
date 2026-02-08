/**
 * API Service Layer
 * Bridges UI components to the game engine's scenario generator
 */

import { generateMonthlyScenarios, generateReflection, generateDecisionQuestions } from '../engine/scenarioGenerator'

/**
 * Fetches a batch of scenarios for the current month
 * Uses the Gemini-powered scenario generator with fallback
 * 
 * @param {Object} gameState - Current game state
 * @returns {Promise<Object>} MonthlyScenarioBatch object
 */
export async function fetchMonthlyScenarios(gameState) {
  try {
    const batch = await generateMonthlyScenarios(gameState)
    return batch
  } catch (error) {
    console.error('Failed to fetch scenarios:', error)
    throw error
  }
}

/**
 * Generates a monthly reflection/analysis based on the game state
 * 
 * @param {Object} gameState - Current game state
 * @returns {Promise<string>} Reflection text
 */
export async function fetchMonthlyReflection(gameState) {
  try {
    const reflection = await generateReflection(gameState)
    return reflection
  } catch (error) {
    console.error('Failed to fetch reflection:', error)
    throw error
  }
}

/**
 * Generates behavioral decision questions for the next month
 * 
 * @param {Object} gameState - Current game state
 * @param {string} analysisText - The monthly analysis text
 * @returns {Promise<string>} Decision questions text
 */
export async function fetchDecisionQuestions(gameState, analysisText) {
  try {
    const questions = await generateDecisionQuestions(gameState, analysisText)
    return questions
  } catch (error) {
    console.error('Failed to fetch decision questions:', error)
    throw error
  }
}

/**
 * Legacy test function - kept for backward compatibility
 */
export const testGemini = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("Hello from Gemini! (Mock Response)")
    }, 1000)
  })
}
