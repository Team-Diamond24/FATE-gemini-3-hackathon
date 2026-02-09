/**
 * API Key Rotation Manager
 * Distributes API requests across multiple keys to prevent exhaustion
 */

class APIKeyManager {
    constructor() {
        this.keys = []
        this.currentIndex = 0
        this.requestCounts = new Map()
        this.lastUsedTimes = new Map()
        this.cooldownPeriod = 60000 // 1 minute cooldown between uses
        this.initialized = false
    }

    /**
     * Initialize with API keys from environment
     */
    initialize() {
        if (this.initialized) return

        // Load keys from environment
        const keys = []
        
        // Try to get keys from import.meta.env (Vite)
        try {
            if (import.meta && import.meta.env) {
                for (let i = 1; i <= 5; i++) {
                    const key = import.meta.env[`VITE_GEMINI_API_KEY_${i}`] || 
                               (i === 1 ? import.meta.env.VITE_GEMINI_API_KEY : null)
                    if (key) keys.push(key)
                }
            }
        } catch (e) {
            // Fallback to process.env
            if (typeof process !== 'undefined' && process.env) {
                for (let i = 1; i <= 5; i++) {
                    const key = process.env[`VITE_GEMINI_API_KEY_${i}`] || 
                               (i === 1 ? process.env.VITE_GEMINI_API_KEY : null)
                    if (key) keys.push(key)
                }
            }
        }

        if (keys.length === 0) {
            console.warn('No API keys found in environment')
            return
        }

        this.keys = keys
        
        // Initialize tracking for each key
        this.keys.forEach((key, index) => {
            this.requestCounts.set(index, 0)
            this.lastUsedTimes.set(index, 0)
        })

        this.initialized = true
        console.log(`✅ API Key Manager initialized with ${this.keys.length} key(s)`)
    }

    /**
     * Get the next available API key using round-robin with cooldown
     * @returns {string|null} API key or null if none available
     */
    getNextKey() {
        if (!this.initialized) {
            this.initialize()
        }

        if (this.keys.length === 0) {
            console.error('No API keys available')
            return null
        }

        // If only one key, return it
        if (this.keys.length === 1) {
            this.requestCounts.set(0, this.requestCounts.get(0) + 1)
            this.lastUsedTimes.set(0, Date.now())
            return this.keys[0]
        }

        const now = Date.now()
        let attempts = 0
        const maxAttempts = this.keys.length

        // Try to find a key that's not in cooldown
        while (attempts < maxAttempts) {
            const lastUsed = this.lastUsedTimes.get(this.currentIndex)
            const timeSinceLastUse = now - lastUsed

            // If key is available (past cooldown or never used)
            if (timeSinceLastUse >= this.cooldownPeriod || lastUsed === 0) {
                const selectedKey = this.keys[this.currentIndex]
                const selectedIndex = this.currentIndex

                // Update tracking
                this.requestCounts.set(selectedIndex, this.requestCounts.get(selectedIndex) + 1)
                this.lastUsedTimes.set(selectedIndex, now)

                // Move to next key for next request
                this.currentIndex = (this.currentIndex + 1) % this.keys.length

                console.log(`🔑 Using API Key #${selectedIndex + 1} (Used ${this.requestCounts.get(selectedIndex)} times)`)
                
                return selectedKey
            }

            // Try next key
            this.currentIndex = (this.currentIndex + 1) % this.keys.length
            attempts++
        }

        // All keys in cooldown, use the one with longest cooldown
        console.warn('⚠️ All keys in cooldown, using least recently used')
        let oldestIndex = 0
        let oldestTime = this.lastUsedTimes.get(0)

        for (let i = 1; i < this.keys.length; i++) {
            const time = this.lastUsedTimes.get(i)
            if (time < oldestTime) {
                oldestTime = time
                oldestIndex = i
            }
        }

        this.requestCounts.set(oldestIndex, this.requestCounts.get(oldestIndex) + 1)
        this.lastUsedTimes.set(oldestIndex, now)
        this.currentIndex = (oldestIndex + 1) % this.keys.length

        console.log(`🔑 Using API Key #${oldestIndex + 1} (Forced, used ${this.requestCounts.get(oldestIndex)} times)`)
        
        return this.keys[oldestIndex]
    }

    /**
     * Get specific key by type for different API calls
     * @param {string} type - 'scenario', 'reflection', or 'questions'
     * @returns {string|null} API key
     */
    getKeyForType(type) {
        if (!this.initialized) {
            this.initialize()
        }

        if (this.keys.length === 0) return null

        // If we have 5 keys, distribute by type
        if (this.keys.length >= 5) {
            switch (type) {
                case 'scenario':
                    // Use keys 1, 2, 3 for scenarios (rotate between them)
                    return this.getKeyFromPool([0, 1, 2])
                case 'reflection':
                    // Use key 4 for reflections
                    return this.getKeyFromPool([3])
                case 'questions':
                    // Use key 5 for questions
                    return this.getKeyFromPool([4])
                default:
                    return this.getNextKey()
            }
        }

        // If fewer keys, use round-robin
        return this.getNextKey()
    }

    /**
     * Get key from a specific pool of indices
     * @param {number[]} poolIndices - Array of key indices to choose from
     * @returns {string|null} API key
     */
    getKeyFromPool(poolIndices) {
        if (poolIndices.length === 0) return this.getNextKey()

        const now = Date.now()
        
        // Find available key in pool
        for (const index of poolIndices) {
            const lastUsed = this.lastUsedTimes.get(index)
            const timeSinceLastUse = now - lastUsed

            if (timeSinceLastUse >= this.cooldownPeriod || lastUsed === 0) {
                this.requestCounts.set(index, this.requestCounts.get(index) + 1)
                this.lastUsedTimes.set(index, now)
                
                console.log(`🔑 Using API Key #${index + 1} from pool (Used ${this.requestCounts.get(index)} times)`)
                
                return this.keys[index]
            }
        }

        // All in cooldown, use least recently used from pool
        let oldestIndex = poolIndices[0]
        let oldestTime = this.lastUsedTimes.get(oldestIndex)

        for (const index of poolIndices) {
            const time = this.lastUsedTimes.get(index)
            if (time < oldestTime) {
                oldestTime = time
                oldestIndex = index
            }
        }

        this.requestCounts.set(oldestIndex, this.requestCounts.get(oldestIndex) + 1)
        this.lastUsedTimes.set(oldestIndex, now)

        console.log(`🔑 Using API Key #${oldestIndex + 1} from pool (Forced, used ${this.requestCounts.get(oldestIndex)} times)`)
        
        return this.keys[oldestIndex]
    }

    /**
     * Get statistics about key usage
     * @returns {Object} Usage statistics
     */
    getStats() {
        const stats = {
            totalKeys: this.keys.length,
            keys: []
        }

        this.keys.forEach((_, index) => {
            stats.keys.push({
                keyNumber: index + 1,
                requestCount: this.requestCounts.get(index),
                lastUsed: this.lastUsedTimes.get(index),
                timeSinceLastUse: Date.now() - this.lastUsedTimes.get(index),
                available: (Date.now() - this.lastUsedTimes.get(index)) >= this.cooldownPeriod
            })
        })

        return stats
    }

    /**
     * Reset all counters (useful for testing)
     */
    reset() {
        this.currentIndex = 0
        this.keys.forEach((_, index) => {
            this.requestCounts.set(index, 0)
            this.lastUsedTimes.set(index, 0)
        })
        console.log('🔄 API Key Manager reset')
    }
}

// Singleton instance
const apiKeyManager = new APIKeyManager()

export default apiKeyManager
