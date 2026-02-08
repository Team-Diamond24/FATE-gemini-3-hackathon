# FATE - Financial Life Simulator

> **Play the game of money before it plays you.**

A narrative-driven financial simulation game built for the Gemini 3 Hackathon, targeting Indian college students. Experience real-world financial decisions with permanent consequences, powered by Google Gemini AI.

![FATE Banner](https://img.shields.io/badge/Built%20with-Gemini%20AI-orange?style=for-the-badge)
![React](https://img.shields.io/badge/React-19.2-blue?style=for-the-badge)
![Vite](https://img.shields.io/badge/Vite-7.2-purple?style=for-the-badge)

---

## 🎮 What is FATE?

FATE is an immersive financial literacy game where every choice matters. Players navigate month-by-month financial scenarios, making decisions that affect their balance, risk score, and future opportunities. No rewinds, no saves—just like real life.

### Key Features

- 🤖 **AI-Powered Scenarios**: Gemini generates personalized financial scenarios based on your choices
- 📊 **Real-Time Analytics**: Track your spending behavior, risk exposure, and decision patterns
- 💰 **Indian Context**: Scenarios relevant to Indian students (₹ currency, local situations)
- 🎯 **Behavioral Learning**: Your answers shape future scenarios and difficulty
- 🔒 **Permanent Choices**: No rewinds—learn from consequences
- 📈 **Progress Tracking**: Detailed history of all financial decisions

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Google Gemini API key
- Firebase account (for authentication)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd FATE-gemini-3-hackathon

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your API keys

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Gemini AI
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## 🎯 How to Play

### 1. Sign Up & Set Preferences
- Create an account or sign in with Google
- Answer 3 behavioral questions that shape your gameplay
- Get assigned a unique user ID (e.g., `FATE-A7K2`)

### 2. Monthly Simulation
- Start with ₹1,000 balance and ₹500 savings
- Receive ₹5,000 monthly income (₹4,000 after 20% tax)
- Face 5 AI-generated scenarios per month
- Make choices that affect balance and risk score (0-100)

### 3. Month-End Review
- View AI-generated analysis of your spending behavior
- Answer strategic questions for next month
- Your answers influence future scenario difficulty

### 4. Repeat & Learn
- Progress through months
- Build financial literacy through experience
- Track your decision patterns over time

---

## 🏗️ Architecture

### Tech Stack

**Frontend**
- React 19.2 with Hooks
- Vite 7.2 for blazing-fast builds
- Tailwind CSS for styling
- Framer Motion for animations
- Lucide React for icons

**AI & Backend**
- Google Gemini API (`gemini-robotics-er-1.5-preview`)
- Firebase Authentication
- localStorage for persistence

**State Management**
- React Context + useReducer
- Immutable state updates
- Auto-save on every action

### Project Structure

```
FATE-gemini-3-hackathon/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── AuthGate.jsx     # Authentication routing
│   │   ├── DataManager.jsx  # Export/import game data
│   │   ├── Header.jsx       # Navigation header
│   │   └── ...
│   ├── pages/               # Route pages
│   │   ├── Dashboard.jsx    # Month-end summary
│   │   ├── Simulation.jsx   # Scenario gameplay
│   │   ├── PreferencesSetup.jsx
│   │   └── ...
│   ├── engine/              # Pure game logic
│   │   ├── gameEngine.js    # Core game mechanics
│   │   ├── scenarioGenerator.js  # Gemini AI integration
│   │   ├── gameFlow.js      # Month progression
│   │   └── persistence.js   # Data storage
│   ├── context/             # React Context
│   │   └── GameContext.jsx  # Global game state
│   ├── services/            # API layer
│   │   └── api.js           # Service functions
│   ├── utils/               # Utilities
│   │   ├── session.js       # User session management
│   │   ├── userIdGenerator.js  # Short ID generation
│   │   └── debugLocalStorage.js  # Debug tools
│   └── config/              # Configuration
│       └── firebaseConfig.js
├── public/                  # Static assets
└── .env                     # Environment variables
```

---

## 🎨 Game Mechanics

### Financial System

**Starting State**
- Balance: ₹1,000
- Savings: ₹500
- Risk Score: 50/100
- Insurance: Not opted

**Monthly Income**
- Gross: ₹5,000
- Tax (20%): ₹1,000
- Net: ₹4,000

**Risk Score**
- 0-30: Low risk (green)
- 31-70: Medium risk (orange)
- 71-100: High risk (red)

**Insurance**
- Cost: ₹200-500
- Effect: Reduces risk score
- Offered strategically (100% in months 1-2, then probability-based)

### AI Integration

**Scenario Generation**
```javascript
// Gemini receives:
- Current balance and savings
- Risk score
- Previous month's choices
- Behavioral modifiers
- Insurance status

// Gemini generates:
- 5 contextual scenarios
- 3 choices per scenario
- Balance and risk impacts
```

**Monthly Reflection**
```javascript
// Gemini analyzes:
- All choices made this month
- Spending patterns
- Risk behavior
- Tax impact

// Generates:
- Spending behavior analysis
- Tax impact summary
- Risk & protection status
```

**Strategic Questions**
```javascript
// Gemini creates:
- 3 behavioral questions
- Based on month's performance
- A/B format choices
- Influences next month's scenarios
```

---

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start dev server (http://localhost:5173)

# Build
npm run build        # Production build

# Preview
npm run preview      # Preview production build

# Lint
npm run lint         # Run ESLint
```

### Debug Tools

Open browser console and use:

```javascript
// View all game data
viewFateData()

// View current user session
viewCurrentSession()

// View specific user's game state
viewUserGameState('FATE-A7K2')

// Export user data as JSON
exportFateData('FATE-A7K2')

// Clear all data (CAUTION!)
clearFateData()
```

### Data Management

**Export Game Data**
1. Click "DATA" button in header
2. Select "Export Game Data (JSON)"
3. File downloads as `fate_user_{userId}_{timestamp}.json`

**Import Game Data**
1. Click "DATA" button in header
2. Select "Import Game Data (JSON)"
3. Choose previously exported JSON file
4. Page refreshes with restored data

---

## 🎯 User Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. SIGNUP                                                   │
│    - Create account or Google sign-in                       │
│    - Get unique ID (FATE-XXXX)                             │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. PREFERENCES                                              │
│    - Answer 3 behavioral questions                          │
│    - Sets initial modifiers                                 │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. SIMULATION (5 Scenarios)                                 │
│    - Make financial choices                                 │
│    - Each choice affects balance & risk                     │
│    - All choices saved to history                           │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. DASHBOARD (Month End)                                    │
│    - AI-generated reflection                                │
│    - 3 strategic questions                                  │
│    - Answer shapes next month                               │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. NEXT MONTH                                               │
│    - Apply income                                           │
│    - Generate new scenarios (based on history)              │
│    - Repeat cycle                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow

### Choice → Storage → AI

```javascript
// 1. User makes choice in Simulation
const choice = {
    balanceChange: -800,
    riskChange: 5,
    description: 'Got phone screen repaired'
}

// 2. Saved to game state history
history: [{
    type: 'choice',
    month: 1,
    balanceChange: -800,
    riskChange: 5,
    description: 'Got phone screen repaired',
    timestamp: 1234567890
}]

// 3. Sent to Gemini for analysis
const reflection = await generateReflection(gameState)
// Gemini receives ALL choices with descriptions

// 4. Used for next month's scenarios
const scenarios = await generateMonthlyScenarios(gameState)
// Gemini considers previous choices and patterns
```

---

## 🎨 UI/UX Features

### Dashboard Layout

**Fixed Header**
- Logo and title
- Month badge
- Data manager dropdown
- Home and settings buttons

**Left Sidebar** (Scrollable)
- User profile card
- Balance display (highlighted)
- Savings and risk stats
- Risk progress bar
- Insurance status
- Quick stats

**Center Content** (Scrollable)
- Month completion badge
- AI-generated analysis
- Strategic questions with A/B choices
- Proceed to next month button

**Right Sidebar** (Scrollable)
- Impact logs (all decisions)
- View archive button

### Custom Scrollbars
- Thin, styled scrollbars
- Orange highlight on hover
- Independent scroll per section

### User IDs
- Format: `FATE-XXXX` (e.g., `FATE-A7K2`)
- Short, memorable, professional
- Consistent per user
- No confusing characters

---

## 🔐 Security & Privacy

- Firebase Authentication for secure login
- API keys stored in environment variables
- User data stored locally (localStorage)
- No server-side storage
- Export/import for data portability

---

## 🐛 Troubleshooting

### Gemini API Issues

**Problem**: Scenarios not generating
**Solution**: 
1. Check API key in `.env`
2. Verify API quota
3. Check browser console for errors
4. Fallback scenarios will be used automatically

### Data Not Saving

**Problem**: Progress lost on refresh
**Solution**:
1. Check browser console for persistence errors
2. Verify localStorage is enabled
3. Export data as backup
4. Clear browser cache and reimport

### Questions Not Showing A/B Options

**Problem**: Questions display without choices
**Solution**:
1. Gemini prompt enforces format
2. Parser handles multiple formats
3. Fallback questions provided
4. Check console for parsing errors

---

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

Output in `dist/` folder.

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

### Environment Variables

Remember to set environment variables in your hosting platform:
- Vercel: Project Settings → Environment Variables
- Netlify: Site Settings → Build & Deploy → Environment

---

## 📝 License

This project was created for the Gemini 3 Hackathon.

---

## 🙏 Acknowledgments

- **Google Gemini AI** for powering the scenario generation
- **Firebase** for authentication
- **Vite** for the amazing dev experience
- **Tailwind CSS** for rapid styling
- **Framer Motion** for smooth animations

---

## 📧 Contact

For questions or feedback about this project, please open an issue on GitHub.

---

**Built with ❤️ for the Gemini 3 Hackathon**
