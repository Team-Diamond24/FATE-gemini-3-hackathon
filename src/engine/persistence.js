/**
 * Persistence Module
 * 
 * Handles saving and loading game state.
 * - In Browser environment: Saves individual JSON files per user in src/data/users/
 * - Falls back to localStorage if file system access fails
 */

const IS_BROWSER = typeof window !== 'undefined';

/**
 * Saves user data to persistent storage
 * @param {string} userId - Unique identifier for the user
 * @param {Object} data - Game state data to save
 * @returns {Promise<boolean>} - True if successful
 */
export async function saveUserData(userId, data) {
  try {
    // Save to localStorage with consistent key format
    const key = `fate_gameState_${userId}`;
    const dataToSave = {
      ...data,
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem(key, JSON.stringify(dataToSave));
    console.log(`[Persistence] Saved data for user ${userId} to localStorage`);
    
    // Also save to a downloadable JSON file for backup
    // This creates a file that user can download
    if (IS_BROWSER && data.month > 0) {
      try {
        const blob = new Blob([JSON.stringify(dataToSave, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Store the backup URL in localStorage
        localStorage.setItem(`fate_backup_url_${userId}`, url);
      } catch (e) {
        // Backup creation failed, not critical
        console.warn('[Persistence] Backup creation failed:', e);
      }
    }
    
    return true;
  } catch (error) {
    console.error('[Persistence] Failed to save:', error);
    return false;
  }
}

/**
 * Loads user data from persistent storage
 * @param {string} userId - Unique identifier for the user
 * @returns {Promise<Object|null>} - User data or null if not found
 */
export async function loadUserData(userId) {
  try {
    const key = `fate_gameState_${userId}`;
    const data = localStorage.getItem(key);
    
    if (data) {
      const parsed = JSON.parse(data);
      console.log(`[Persistence] Loaded data for user ${userId} from localStorage`);
      return parsed;
    }
    
    // Try old key format for backward compatibility
    const oldKey = `user_${userId}`;
    const oldData = localStorage.getItem(oldKey);
    if (oldData) {
      const parsed = JSON.parse(oldData);
      console.log(`[Persistence] Migrated data for user ${userId} from old format`);
      // Save in new format
      await saveUserData(userId, parsed);
      // Remove old key
      localStorage.removeItem(oldKey);
      return parsed;
    }
    
    console.log(`[Persistence] No data found for user ${userId}`);
    return null;
  } catch (error) {
    console.error('[Persistence] Failed to load:', error);
    return null;
  }
}

/**
 * Exports user data as a downloadable JSON file
 * @param {string} userId - Unique identifier for the user
 * @returns {boolean} - True if successful
 */
export function exportUserDataToFile(userId) {
  try {
    const key = `fate_gameState_${userId}`;
    const data = localStorage.getItem(key);
    
    if (!data) {
      console.error('[Persistence] No data to export for user:', userId);
      return false;
    }
    
    const parsed = JSON.parse(data);
    const blob = new Blob([JSON.stringify(parsed, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fate_user_${userId}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log(`[Persistence] Exported data for user ${userId}`);
    return true;
  } catch (error) {
    console.error('[Persistence] Failed to export:', error);
    return false;
  }
}

/**
 * Imports user data from a JSON file
 * @param {File} file - JSON file to import
 * @param {string} userId - User ID to import data for
 * @returns {Promise<boolean>} - True if successful
 */
export async function importUserDataFromFile(file, userId) {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    
    // Validate data structure
    if (!data.userId || !data.month !== undefined) {
      throw new Error('Invalid game state file');
    }
    
    // Save imported data
    await saveUserData(userId, data);
    console.log(`[Persistence] Imported data for user ${userId}`);
    return true;
  } catch (error) {
    console.error('[Persistence] Failed to import:', error);
    return false;
  }
}

/**
 * Clears all data for a specific user
 * @param {string} userId - User ID to clear
 * @returns {boolean} - True if successful
 */
export function clearUserData(userId) {
  try {
    const key = `fate_gameState_${userId}`;
    localStorage.removeItem(key);
    localStorage.removeItem(`fate_backup_url_${userId}`);
    console.log(`[Persistence] Cleared data for user ${userId}`);
    return true;
  } catch (error) {
    console.error('[Persistence] Failed to clear data:', error);
    return false;
  }
}
