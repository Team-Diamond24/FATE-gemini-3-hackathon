/**
 * Persistence Module
 * 
 * Handles saving and loading game state.
 * - In Node.js environment: Saves to src/data/userData.json
 * - In Browser environment: Saves to localStorage
 */

const IS_NODE = typeof process !== 'undefined' && process.versions && process.versions.node;

// Helper to get data file path dynamically in Node
async function getDataFilePath() {
  if (!IS_NODE) return null;
  const path = await import('path');
  const url = await import('url');
  
  const __filename = url.fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  
  // Resolve to src/data/userData.json from src/engine/persistence.js
  return path.join(__dirname, '../../src/data/userData.json');
}

/**
 * Saves user data to persistent storage
 * @param {string} userId - Unique identifier for the user
 * @param {Object} data - Game state data to save
 * @returns {Promise<boolean>} - True if successful
 */
export async function saveUserData(userId, data) {
  if (IS_NODE) {
    try {
      const fs = await import('fs/promises');
      const filePath = await getDataFilePath();
      
      // Ensure directory exists
      // (assuming src/data exists as checked, but good practice)
      
      let allData = {};
      try {
        const content = await fs.readFile(filePath, 'utf8');
        allData = JSON.parse(content);
      } catch (e) {
        // File doesn't exist or invalid JSON, start fresh
      }
      
      // Update specific user data
      allData[userId] = {
        ...data,
        lastUpdated: new Date().toISOString()
      };
      
      await fs.writeFile(filePath, JSON.stringify(allData, null, 2));
      console.log(`[Persistence] Saved data for user ${userId} to ${filePath}`);
      return true;
    } catch (error) {
      console.error('[Persistence] Failed to save to file:', error);
      return false;
    }
  } else {
    // Browser Environment
    try {
      localStorage.setItem(`user_${userId}`, JSON.stringify(data));
      console.log(`[Persistence] Saved data for user ${userId} to localStorage`);
      return true;
    } catch (error) {
      console.error('[Persistence] Failed to save to localStorage:', error);
      return false;
    }
  }
}

/**
 * Loads user data from persistent storage
 * @param {string} userId - Unique identifier for the user
 * @returns {Promise<Object|null>} - User data or null if not found
 */
export async function loadUserData(userId) {
  if (IS_NODE) {
    try {
      const fs = await import('fs/promises');
      const filePath = await getDataFilePath();
      
      try {
        const content = await fs.readFile(filePath, 'utf8');
        const allData = JSON.parse(content);
        return allData[userId] || null;
      } catch (e) {
        return null; // File missing or user not found
      }
    } catch (error) {
      console.error('[Persistence] Failed to load from file:', error);
      return null;
    }
  } else {
    // Browser Environment
    try {
      const data = localStorage.getItem(`user_${userId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('[Persistence] Failed to load from localStorage:', error);
      return null;
    }
  }
}
