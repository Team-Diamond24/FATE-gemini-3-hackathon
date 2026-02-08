/**
 * User ID Generator
 * Creates short, memorable user IDs
 */

/**
 * Generates a short, meaningful user ID
 * Format: FATE-XXXX (e.g., FATE-A7K2)
 * @returns {string} - Short user ID
 */
export function generateShortUserId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars (I, O, 0, 1)
  let id = 'FATE-';
  
  for (let i = 0; i < 4; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return id;
}

/**
 * Converts Firebase UID to short ID
 * Uses first 4 chars + last 4 chars of hash
 * @param {string} firebaseUid - Firebase user ID
 * @returns {string} - Short user ID
 */
export function convertToShortId(firebaseUid) {
  if (!firebaseUid) return generateShortUserId();
  
  // Create a simple hash from the Firebase UID
  let hash = 0;
  for (let i = 0; i < firebaseUid.length; i++) {
    const char = firebaseUid.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Convert to base36 and take first 4 chars
  const hashStr = Math.abs(hash).toString(36).toUpperCase();
  const shortId = hashStr.substring(0, 4).padEnd(4, '0');
  
  return `FATE-${shortId}`;
}

/**
 * Gets or creates a short user ID for a Firebase user
 * Stores mapping in localStorage
 * @param {string} firebaseUid - Firebase user ID
 * @returns {string} - Short user ID
 */
export function getShortUserId(firebaseUid) {
  if (!firebaseUid) return generateShortUserId();
  
  // Check if we already have a short ID for this user
  const mappingKey = `fate_shortId_${firebaseUid}`;
  let shortId = localStorage.getItem(mappingKey);
  
  if (!shortId) {
    // Generate new short ID
    shortId = convertToShortId(firebaseUid);
    localStorage.setItem(mappingKey, shortId);
  }
  
  return shortId;
}
