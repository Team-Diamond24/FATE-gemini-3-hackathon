/**
 * Debug utility to view and manage localStorage data
 * Open browser console and run: window.viewFateData()
 */

// View all FATE-related data
export function viewAllFateData() {
    console.log('=== FATE Game Data ===\n');

    const keys = Object.keys(localStorage).filter(key => key.startsWith('fate_'));

    if (keys.length === 0) {
        console.log('No FATE data found in localStorage');
        return;
    }

    keys.forEach(key => {
        const value = localStorage.getItem(key);
        console.log(`\n${key}:`);
        try {
            const parsed = JSON.parse(value);
            console.log(JSON.stringify(parsed, null, 2));
        } catch {
            console.log(value);
        }
    });

    console.log('\n=== End of FATE Data ===');
}

// View specific user's game state
export function viewUserGameState(userId) {
    const key = `fate_gameState_${userId}`;
    const data = localStorage.getItem(key);

    if (!data) {
        console.log(`No game state found for user: ${userId}`);
        console.log(`Looking for key: ${key}`);
        console.log('Available FATE keys:', Object.keys(localStorage).filter(k => k.startsWith('fate_')));
        return null;
    }

    try {
        const parsed = JSON.parse(data);
        console.log('Game State for', userId);
        console.log(JSON.stringify(parsed, null, 2));
        return parsed;
    } catch (error) {
        console.error('Failed to parse game state:', error);
        return null;
    }
}

// View current user's session
export function viewCurrentSession() {
    const userId = localStorage.getItem('fate_userId');
    const username = localStorage.getItem('fate_username');
    const usernameSet = localStorage.getItem('fate_usernameSet');

    console.log('Current Session:');
    console.log({
        userId,
        username,
        usernameSet: usernameSet === 'true'
    });

    if (userId) {
        return viewUserGameState(userId);
    }
}

// View user preferences
export function viewUserPreferences(userId) {
    const key = `fate_preferences_${userId}`;
    const data = localStorage.getItem(key);

    if (!data) {
        console.log(`No preferences found for user: ${userId}`);
        return null;
    }

    try {
        const parsed = JSON.parse(data);
        console.log('Preferences for', userId);
        console.log(JSON.stringify(parsed, null, 2));
        return parsed;
    } catch (error) {
        console.error('Failed to parse preferences:', error);
        return null;
    }
}

// Clear all FATE data (use with caution!)
export function clearAllFateData() {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('fate_'));
    keys.forEach(key => localStorage.removeItem(key));
    console.log(`Cleared ${keys.length} FATE data entries`);
}

// Export specific user data as JSON file
export function exportUserData(userId) {
    const gameState = localStorage.getItem(`fate_gameState_${userId}`);
    const preferences = localStorage.getItem(`fate_preferences_${userId}`);

    const data = {
        userId,
        gameState: gameState ? JSON.parse(gameState) : null,
        preferences: preferences ? JSON.parse(preferences) : null,
        exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fate_user_${userId}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    console.log('User data exported');
}

// Make functions available globally in browser console
if (typeof window !== 'undefined') {
    window.viewFateData = viewAllFateData;
    window.viewCurrentSession = viewCurrentSession;
    window.viewUserGameState = viewUserGameState;
    window.viewUserPreferences = viewUserPreferences;
    window.clearFateData = clearAllFateData;
    window.exportFateData = exportUserData;

    console.log('FATE Debug Tools loaded. Available commands:');
    console.log('- viewFateData() - View all FATE data');
    console.log('- viewCurrentSession() - View current user session');
    console.log('- viewUserGameState(userId) - View specific user game state');
    console.log('- viewUserPreferences(userId) - View user preferences');
    console.log('- exportFateData(userId) - Export user data as JSON');
    console.log('- clearFateData() - Clear all FATE data (CAUTION!)');
}
