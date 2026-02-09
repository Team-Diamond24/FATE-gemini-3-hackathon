// Session management utilities
import { getShortUserId, generateShortUserId } from './userIdGenerator'

/**
 * Generate a random guest ID (short format)
 */
function generateGuestId() {
    return generateShortUserId()
}

/**
 * Get or create user session
 * @returns {{ userId: string, displayId: string, isGuest: boolean }}
 */
export function getUserSession() {
    let userId = localStorage.getItem('fate_userId')
    let isGuest = true

    if (!userId) {
        userId = generateGuestId()
        localStorage.setItem('fate_userId', userId)
    } else if (!userId.startsWith('FATE-') && !userId.startsWith('guest-')) {
        // Convert old Firebase UID to short ID
        const shortId = getShortUserId(userId)
        localStorage.setItem('fate_userId', shortId)
        userId = shortId
        isGuest = false
    } else if (!userId.startsWith('guest-')) {
        isGuest = false
    }

    // Display ID is always the short format
    const displayId = userId.startsWith('FATE-') ? userId : userId.substring(0, 9)

    return { userId, displayId, isGuest }
}

/**
 * Save user preferences
 * @param {string} userId 
 * @param {object} preferences 
 */
export function savePreferences(userId, preferences) {
    localStorage.setItem(`preferences_${userId}`, JSON.stringify(preferences))
}

/**
 * Get user preferences
 * @param {string} userId 
 * @returns {object|null}
 */
export function getPreferences(userId) {
    const prefs = localStorage.getItem(`preferences_${userId}`)
    return prefs ? JSON.parse(prefs) : null
}

/**
 * Save game state
 * @param {string} userId 
 * @param {object} gameState 
 */
export function saveGameState(userId, gameState) {
    localStorage.setItem(`gameState_${userId}`, JSON.stringify(gameState))
}

/**
 * Get game state
 * @param {string} userId 
 * @returns {object|null}
 */
export function getGameState(userId) {
    const state = localStorage.getItem(`gameState_${userId}`)
    return state ? JSON.parse(state) : null
}

/**
 * Clear all user data (for testing/reset)
 * @param {string} userId 
 */
export function clearUserData(userId) {
    localStorage.removeItem(`preferences_${userId}`)
    localStorage.removeItem(`gameState_${userId}`)
}
