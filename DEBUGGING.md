# FATE - Debugging & Data Inspection Guide

## Viewing localStorage Data

### Method 1: Browser Console (Easiest)

The app automatically loads debug tools. Open your browser console (F12) and use these commands:

```javascript
// View all FATE data
viewFateData()

// View current user's session and game state
viewCurrentSession()

// View specific user's game state
viewUserGameState('your-user-id')

// View user preferences
viewUserPreferences('your-user-id')

// Export user data as JSON file
exportFateData('your-user-id')

// Clear all FATE data (CAUTION!)
clearFateData()
```

### Method 2: Visual Data Viewer Component

Add the DataViewer component to any page:

```jsx
import DataViewer from './components/DataViewer'

function YourPage() {
  return (
    <div>
      {/* Your page content */}
      <DataViewer />
    </div>
  )
}
```

This adds a "VIEW DATA" button in the bottom-right corner.

### Method 3: Browser DevTools

1. Open DevTools (F12)
2. Go to "Application" tab (Chrome) or "Storage" tab (Firefox)
3. Click "Local Storage" → Your domain
4. Look for keys starting with `fate_`

## localStorage Keys

The app uses these localStorage keys:

- `fate_userId` - Current user ID
- `fate_username` - Current username
- `fate_usernameSet` - Whether username is set (true/false)
- `fate_gameState_{userId}` - User's game state (JSON)
- `fate_preferences_{userId}` - User's preferences (JSON)

## Game State Structure

```json
{
  "userId": "string",
  "month": 1,
  "balance": 4000,
  "savings": 500,
  "insuranceOpted": false,
  "riskScore": 50,
  "history": [
    {
      "type": "choice",
      "month": 1,
      "balanceChange": -800,
      "riskChange": 5,
      "description": "Got phone screen repaired",
      "timestamp": 1234567890
    }
  ],
  "currentBatch": {
    "month": 1,
    "scenarios": [...],
    "currentIndex": 0
  },
  "modifiers": {
    "riskSensitivity": 1.0,
    "insuranceLikelihood": 1.0,
    "difficultyModifier": 1.0
  }
}
```

## User Flow & Data Flow

### 1. Signup → Preferences
- User signs up
- Preferences saved to `fate_preferences_{userId}`
- Behavioral modifiers applied to game state

### 2. Simulation (5 scenarios)
- Each choice saved to `history` array
- Game state auto-saved after each choice
- Data includes: description, balanceChange, riskChange

### 3. Dashboard (Month End)
- Gemini receives ALL user choices from history
- Generates reflection based on actual choices
- Generates 3 questions with A/B options
- User answers saved as behavioral modifiers

### 4. Next Month
- Previous month data compacted in history
- New scenarios generated based on:
  - Previous choices
  - Current balance/risk
  - Behavioral modifiers
  - User's answers to questions

## Debugging Gemini Prompts

To see what data is being sent to Gemini, add console.logs in:

### scenarioGenerator.js

```javascript
// In generateMonthlyScenarios()
console.log('Context sent to Gemini:', context)

// In generateReflection()
const analysisData = extractMonthAnalysisData(gameState)
console.log('Analysis data:', analysisData)

// In generateDecisionQuestions()
const contextData = extractDecisionContextData(gameState, analysisText)
console.log('Decision context:', contextData)
```

## Common Issues

### Issue: Questions don't have A) B) format
**Solution**: Check the DECISION_PROMPT in scenarioGenerator.js - it now enforces the format

### Issue: Gemini not receiving user choices
**Solution**: Check that choices are being saved to history with proper structure:
```javascript
{
  type: 'choice',
  month: currentMonth,
  balanceChange: -800,
  riskChange: 5,
  description: 'User-readable description',
  timestamp: Date.now()
}
```

### Issue: Data not persisting
**Solution**: Check browser console for persistence errors. Game state auto-saves after every action.

## Testing Data Flow

Run the test script:

```bash
node src/engine/testDataFlow.js
```

This simulates a full month with choices and shows what data is sent to Gemini.
