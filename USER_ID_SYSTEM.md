# User ID System

## ✅ Short, Meaningful User IDs

### Format
```
FATE-XXXX
```

Examples:
- `FATE-A7K2`
- `FATE-M9P4`
- `FATE-Z3H8`

### Features

1. **Short & Memorable**
   - Only 9 characters total
   - Easy to read and share
   - No confusing characters (I, O, 0, 1 removed)

2. **Consistent**
   - Firebase UIDs are converted to same short ID every time
   - Mapping stored in localStorage
   - Guest users get random short IDs

3. **Display vs Storage**
   - `userId`: Full ID used for storage (can be Firebase UID or short ID)
   - `displayId`: Short format shown to users (always FATE-XXXX)

### Implementation

**Generator** (`src/utils/userIdGenerator.js`):
```javascript
generateShortUserId()        // Random: FATE-A7K2
convertToShortId(firebaseUid) // Consistent hash
getShortUserId(firebaseUid)   // Get or create mapping
```

**Session** (`src/utils/session.js`):
```javascript
const { userId, displayId } = getUserSession()
// userId: Full ID for storage
// displayId: Short ID for display
```

### Migration

Old Firebase UIDs are automatically converted:
```javascript
// Old: d121tVM5ZvYHrOUcg2Yb37UFlx73
// New: FATE-D1VM (consistent hash)
```

### Where It's Used

1. **Dashboard Header** - Shows displayId
2. **Profile Card** - Shows displayId
3. **Data Manager** - Shows displayId
4. **localStorage Keys** - Uses full userId
5. **File Exports** - Uses full userId

### Benefits

✅ **User-Friendly**: Easy to remember and share
✅ **Professional**: Looks like a real product ID
✅ **Consistent**: Same user = same ID
✅ **Backward Compatible**: Old IDs still work
✅ **Privacy**: Doesn't expose Firebase UID

## Data Manager Integration

### Location
Now in **header** (top-right), next to HOME and Settings buttons

### Features
- Dropdown menu (click to open)
- Export game data as JSON
- Import game data from JSON
- Clear all data (with confirmation)
- Shows short user ID

### Usage
1. Click "DATA" button in header
2. Choose action:
   - **Export**: Downloads `fate_user_{userId}_{timestamp}.json`
   - **Import**: Upload previously exported JSON
   - **Clear**: Deletes all game data (requires confirmation)

### File Format
```json
{
  "userId": "FATE-A7K2",
  "month": 2,
  "balance": 3500,
  "savings": 500,
  "history": [...],
  "lastUpdated": "2026-02-08T..."
}
```
