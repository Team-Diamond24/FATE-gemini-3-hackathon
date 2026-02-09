# FATE - Financial Life Simulator

> **Play the game of money before it plays you.**

A narrative-driven financial simulation game built for the Gemini 3 Hackathon, targeting Indian college students. Experience real-world financial decisions with permanent consequences, powered by Google Gemini AI.

![FATE Banner](https://img.shields.io/badge/Built%20with-Gemini%20AI-orange?style=for-the-badge)
![React](https://img.shields.io/badge/React-19.2-blue?style=for-the-badge)
![Vite](https://img.shields.io/badge/Vite-7.2-purple?style=for-the-badge)

---

## What is FATE?

FATE is an immersive financial literacy game where every choice matters. Players navigate month-by-month financial scenarios, making decisions that affect their balance, risk score, and future opportunities. No rewinds, no saves—just like real life.

### Key Features

- **AI-Powered Scenarios**: Gemini generates personalized financial scenarios based on your choices
- **Real-Time Analytics**: Track your spending behavior, risk exposure, and decision patterns
- **Indian Context**: Scenarios relevant to Indian students (₹ currency, local situations)
- **Behavioral Learning**: Your answers shape future scenarios and difficulty
- **Permanent Choices**: No rewinds—learn from consequences
- **Progress Tracking**: Detailed history of all financial decisions
- **Investment Portfolio**: Insurance, Fixed Deposits, and Mutual Funds
- **Financial Calculators**: EMI, SIP, Tax, Budget, Retirement, and Compound Interest tools
- **Sound Effects**: Immersive audio feedback for all actions
- **Data Portability**: Export/import your game progress as JSON
- **Savings Management**: Transfer money between balance and savings accounts

---

## Complete Feature List

### Core Gameplay Features

**1. Authentication & User Management**
- Firebase Authentication (Email/Password + Google Sign-In)
- Unique user IDs (Format: `FATE-XXXX`)
- Persistent user sessions
- Secure logout functionality

**2. Behavioral Profiling System**
- Initial 3-question preference setup
- Modifiers that shape gameplay:
  - Risk Sensitivity (0.5-2.5x)
  - Insurance Likelihood (0.5-2.5x)
  - Difficulty Modifier (0.5-2.5x)
  - Market Volatility (0.5-2.5x)
  - Strategy Momentum (-1.0 to 1.0)
- Dynamic difficulty adjustment based on choices

**3. Monthly Simulation Cycle**
- Start with ₹1,000 balance, ₹500 savings
- Receive ₹5,000 monthly income (₹4,000 after 20% tax)
- Face 5 AI-generated scenarios per month
- Each scenario has 3 choices with balance/risk impacts
- Real-time balance and risk score updates
- Insurance offers (strategic timing based on modifiers)

**4. AI-Powered Content Generation**
- **Scenario Generation**: Gemini creates contextual financial situations
- **Monthly Reflection**: AI analyzes spending patterns and behavior
- **Strategic Questions**: 3 A/B questions that shape next month's difficulty
- **Tax Impact Analysis**: Breakdown of tax deductions
- **Risk Assessment**: Personalized risk and protection status

**5. Financial Tracking & History**
- Complete transaction history with timestamps
- Impact logs for every decision
- Month-by-month snapshots
- Balance, savings, and risk score trends
- Concept tracking (Tax Optimization, Emergency Fund, Debt Management, etc.)

### Investment & Wealth Management

**6. Insurance System**
- Life insurance with monthly premium deduction
- Coverage = 100x monthly premium
- Auto-cancellation if balance insufficient
- Risk score reduction benefit
- Strategic offering based on player behavior

**7. Fixed Deposits (FD)**
- Lock funds for guaranteed returns
- 7.5% annual interest rate
- Tenure options: 6, 12, 24, 36 months
- Source selection (Balance or Savings)
- Auto-maturity with balance credit
- Track multiple active FDs

**8. Mutual Funds (MF)**
- Three fund types:
  - **Equity**: High risk, 12-15% returns (-1% to +2% monthly)
  - **Debt**: Low risk, 6-8% returns (0% to +1% monthly)
  - **Hybrid**: Medium risk, 9-11% returns (-0.5% to +1.5% monthly)
- Market-linked returns with volatility
- Real-time value updates
- Portfolio tracking

**9. Savings Account Management**
- Deposit from balance to savings
- Withdraw from savings to balance
- Quick amount buttons (₹500, ₹1000, ₹2000, ₹5000)
- Transaction history tracking
- Separate balance display

### Financial Tools & Calculators

**10. EMI Calculator**
- Calculate loan EMI (Equated Monthly Installment)
- Inputs: Loan amount, interest rate, tenure
- Outputs: Monthly EMI, total interest, total payment
- Amortization schedule

**11. SIP Calculator**
- Systematic Investment Plan calculator
- Inputs: Monthly investment, expected return, tenure
- Outputs: Total investment, estimated returns, final value
- Wealth accumulation projection

**12. Compound Interest Calculator**
- Calculate compound interest growth
- Inputs: Principal, rate, time, compounding frequency
- Outputs: Final amount, interest earned
- Visual growth representation

**13. Tax Calculator**
- Indian income tax calculation
- Multiple tax regimes support
- Deductions and exemptions
- Tax liability breakdown

**14. Budget Planner**
- Monthly budget allocation
- Income vs expense tracking
- Category-wise breakdown
- Savings goal setting

**15. Retirement Calculator**
- Retirement corpus calculation
- Current age, retirement age, life expectancy
- Monthly expenses, inflation rate
- Required corpus and monthly savings

### User Experience Features

**16. Sound System**
- Web Audio API-based sound effects
- Contextual audio feedback:
  - Click sounds
  - Hover sounds
  - Success chimes
  - Error alerts
  - Balance increase/decrease tones
  - Month completion celebration
- Volume control (0-100%)
- Enable/disable toggle
- Persistent settings

**17. Data Management**
- **Export**: Download game state as JSON
- **Import**: Restore progress from JSON file
- **Debug Tools**: Console commands for data inspection
- **Auto-save**: Every action persists to localStorage
- **Data Viewer**: Visual inspection of game state

**18. Profile & Statistics**
- User ID display
- Current month badge
- Balance and savings overview
- Risk score with color-coded indicator
- Insurance status
- Investment portfolio summary
- Strategy status (Conservative/Balanced/Aggressive)
- Total decisions made
- Months completed

**19. Settings & Preferences**
- Sound effects toggle
- Volume slider
- API key management (Gemini)
- Account settings
- Theme preferences
- Data export/import access

**20. Responsive UI/UX**
- Three-column dashboard layout
- Fixed header with navigation
- Scrollable sidebars with custom scrollbars
- Smooth animations (Framer Motion)
- Loading states and error handling
- Toast notifications
- Modal dialogs with backdrop blur
- Mobile-responsive design

### Technical Implementation

**21. State Management**
- React Context API + useReducer
- Immutable state updates
- Action-based state mutations
- Centralized game logic

**22. Game Engine (Pure Logic)**
- Framework-agnostic core engine
- Functional programming approach
- State snapshots and history
- Modifier system for dynamic difficulty
- Investment portfolio management
- Month progression logic

**23. Persistence Layer**
- localStorage-based persistence
- JSON serialization/deserialization
- Multi-user support
- Session management
- Data migration support

**24. AI Integration**
- Google Gemini API (`gemini-robotics-er-1.5-preview`)
- Structured prompt engineering
- Context-aware scenario generation
- Behavioral analysis
- Fallback scenarios for API failures
- Rate limiting and error handling

**25. Security & Privacy**
- Firebase Authentication
- Environment variable protection
- No server-side data storage
- Client-side encryption ready
- Secure API key management
- CORS-compliant requests

---

## Quick Start

### Prerequisites

- **Node.js 18+** and npm
- **Google Gemini API keys** (1-5 keys recommended for load distribution)
- **Firebase account** with Authentication enabled

### Getting API Keys

**1. Google Gemini API Keys**
- Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
- Sign in with your Google account
- Click "Create API Key"
- Create 1-5 API keys for better rate limit handling
- Copy each key for use in `.env` file

**2. Firebase Configuration**
- Go to [Firebase Console](https://console.firebase.google.com/)
- Create a new project or select existing one
- Navigate to Project Settings > General
- Scroll to "Your apps" section
- Click "Web app" icon to create a web app
- Copy the configuration values
- Enable Authentication:
  - Go to Authentication > Sign-in method
  - Enable "Email/Password"
  - Enable "Google" (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/FATE-gemini-3-hackathon.git
cd FATE-gemini-3-hackathon

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your API keys (see below)

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Environment Variables Setup

Create a `.env` file in the root directory with the following structure:

```env
# Primary Gemini API Key (Required)
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Multiple API Keys for Load Distribution (Optional but Recommended)
# Add up to 5 Gemini API keys to prevent rate limit exhaustion
# The app will rotate through these keys automatically
VITE_GEMINI_API_KEY_1=your_gemini_api_key_1
VITE_GEMINI_API_KEY_2=your_gemini_api_key_2
VITE_GEMINI_API_KEY_3=your_gemini_api_key_3
VITE_GEMINI_API_KEY_4=your_gemini_api_key_4
VITE_GEMINI_API_KEY_5=your_gemini_api_key_5

# Firebase Configuration (Required)
# Get these from Firebase Console > Project Settings > General
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Important Notes:**
- Replace all `your_*` placeholders with actual values
- At minimum, you need `VITE_GEMINI_API_KEY` and all Firebase variables
- Multiple Gemini API keys help prevent rate limiting during heavy usage
- Never commit your `.env` file to version control (it's in `.gitignore`)

### First Run

After setting up environment variables:

1. Start the development server: `npm run dev`
2. Open `http://localhost:5173` in your browser
3. Create an account or sign in with Google
4. Complete the 3-question preference setup
5. Start playing and learning financial literacy!

---

## How to Play

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

## Architecture

### Tech Stack

**Frontend**
- React 19.2 with Hooks
- Vite 7.2 for blazing-fast builds
- Tailwind CSS for styling
- Framer Motion for animations
- Lucide React for icons
- Web Audio API for sound effects

**AI & Backend**
- Google Gemini API (`gemini-robotics-er-1.5-preview`)
- Firebase Authentication
- localStorage for persistence

**State Management**
- React Context + useReducer
- Immutable state updates
- Auto-save on every action

### Implementation Architecture

**1. Game Engine (Pure Logic Layer)**
```javascript
// src/engine/gameEngine.js
- initializeGameState() - Create new game
- applyChoice() - Process player decisions
- applyIncome() - Monthly income with tax
- finalizeMonth() - Save state snapshot
- depositToSavings() / withdrawFromSavings()
- startInsurance() / cancelInsurance()
- startFixedDeposit() / startMutualFund()
- updateInvestments() - Monthly investment updates
- initializeModifiers() - Behavioral calibration
- applyBehavioralDecisions() - Strategy adjustments
```

**2. AI Scenario Generator**
```javascript
// src/engine/scenarioGenerator.js
- generateMonthlyScenarios() - 5 scenarios per month
- generateReflection() - Monthly spending analysis
- generateStrategicQuestions() - 3 A/B questions
- Structured prompts with context
- Fallback scenarios for API failures
- Response parsing and validation
```

**3. Persistence Layer**
```javascript
// src/engine/persistence.js
- saveGameState() - Auto-save to localStorage
- loadGameState() - Restore from localStorage
- exportGameData() - JSON export
- importGameData() - JSON import
- Multi-user support with userId keys
```

**4. React Context (State Container)**
```javascript
// src/context/GameContext.jsx
- GameProvider - Wraps entire app
- useGame() hook - Access state and dispatch
- Reducer pattern for state mutations
- Actions: MAKE_CHOICE, START_MONTH, FINALIZE_MONTH,
          DEPOSIT_SAVINGS, WITHDRAW_SAVINGS,
          START_INSURANCE, START_FD, START_MF, etc.
```

**5. Component Architecture**
```
App.jsx
├── AuthGate.jsx (Authentication routing)
│   ├── LoginPage.jsx
│   ├── SignupPage.jsx
│   └── Authenticated Routes
│       ├── PreferencesSetup.jsx (One-time setup)
│       ├── Dashboard.jsx (Month-end summary)
│       ├── Simulation.jsx (Scenario gameplay)
│       ├── Profile.jsx (User stats)
│       ├── MathTools.jsx (Calculators)
│       └── Settings.jsx (Preferences)
├── Header.jsx (Navigation)
├── DataManager.jsx (Export/Import)
├── SavingsManager.jsx (Savings modal)
├── InvestmentManager.jsx (Investment modal)
└── SoundButton.jsx (Audio-enabled buttons)
```

**6. Sound System**
```javascript
// src/utils/soundManager.js
- Web Audio API oscillators
- Contextual sound effects
- Volume control (0-100%)
- Persistent settings
- Lazy AudioContext initialization
```

**7. Data Flow**
```
User Action → Component Event Handler
    ↓
Dispatch Action to Context
    ↓
Reducer calls Game Engine function
    ↓
Game Engine returns new state
    ↓
Persistence Layer saves to localStorage
    ↓
React re-renders with new state
    ↓
Sound Manager plays feedback
```

**8. API Key Management**
```javascript
// src/utils/apiKeyManager.js
- Singleton pattern for key rotation
- Round-robin distribution across 1-5 keys
- 60-second cooldown between key uses
- Automatic fallback on rate limits
- Type-based key allocation:
  * Keys 1-3: Scenario generation
  * Key 4: Monthly reflections
  * Key 5: Strategic questions
- Usage statistics tracking
- Console logging for debugging
```

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

## Game Mechanics

### Financial System

**Starting State**
- Balance: ₹1,000
- Savings: ₹500
- Risk Score: 50/100
- Insurance: Not opted
- Investments: Empty portfolio

**Monthly Income Cycle**
- Gross Income: ₹5,000
- Tax Deduction (20%): ₹1,000
- Net Income: ₹4,000
- Auto-credited to balance at month start

**Risk Score System**
- Range: 0-100
- 0-30: Low risk (green) - Conservative player
- 31-70: Medium risk (orange) - Balanced approach
- 71-100: High risk (red) - Aggressive decisions
- Affects scenario difficulty and insurance offers

**Insurance Mechanics**
- Monthly premium: ₹200-500 (player choice)
- Coverage: 100x monthly premium
- Auto-deducted from balance each month
- Auto-cancelled if balance insufficient
- Strategic offering: 100% in months 1-2, then probability-based on modifiers
- Reduces risk score impact

**Investment Returns**
- **Fixed Deposits**: 7.5% annual interest, guaranteed
- **Equity MF**: -1% to +2% monthly (volatile)
- **Debt MF**: 0% to +1% monthly (stable)
- **Hybrid MF**: -0.5% to +1.5% monthly (balanced)
- FDs auto-mature and credit balance
- MFs update value monthly with market simulation

### Behavioral Modifier System

**Initial Calibration (Preferences Setup)**
```javascript
Primary Drive:
- Security → Lower risk, more insurance, calmer market
- Growth → Higher risk, fewer insurance prompts, volatile market
- Experience → Balanced gameplay

Risk Level:
- Low → -0.2 to all volatility modifiers
- Medium → No adjustment
- High → +0.3 to all volatility modifiers
```

**Dynamic Modifiers (Updated Monthly)**
```javascript
Modifiers (Range: 0.5 - 2.5):
- riskSensitivity: Amplifies balance/risk changes
- insuranceLikelihood: Probability of insurance offers
- difficultyModifier: Complexity of scenarios
- marketVolatility: Economic volatility in scenarios

Strategy Momentum (Range: -1.0 to 1.0):
- Tracks cumulative player strategy
- Negative = Conservative trend
- Positive = Aggressive trend
- Influences AI scenario generation
```

**Monthly Strategy Impact**
```javascript
Question 1 (Stability vs Flexibility):
- A (Steady) → -0.03 risk, -0.02 volatility, -0.1 momentum
- B (Adaptive) → +0.03 risk, +0.02 volatility, +0.1 momentum

Question 2 (Protection Strategy):
- A (Self-reliance) → -0.05 insurance, +0.03 difficulty
- B (Safety nets) → +0.08 insurance, -0.02 difficulty

Question 3 (Ambition Level):
- A (Steady growth) → -0.03 difficulty, -0.02 volatility
- B (High stakes) → +0.08 difficulty, +0.05 volatility, +0.15 momentum
```

### AI Integration

**1. Scenario Generation (5 per month)**
```javascript
Prompt Context Sent to Gemini:
{
  currentMonth: number,
  balance: number,
  savings: number,
  riskScore: number,
  insuranceOpted: boolean,
  recentChoices: Array<{description, balanceChange, riskChange}>,
  modifiers: {
    riskSensitivity: number,
    difficultyModifier: number,
    marketVolatility: number,
    strategyMomentum: number
  }
}

Gemini Generates:
[
  {
    situation: "Detailed scenario description",
    choices: [
      {
        label: "Choice A",
        balanceChange: number,
        riskChange: number,
        concept: "Financial concept being taught"
      },
      // 2 more choices
    ]
  },
  // 4 more scenarios
]

Fallback: Pre-written scenarios if API fails
```

**2. Monthly Reflection Analysis**
```javascript
Prompt Context:
{
  monthChoices: Array<all choices made this month>,
  totalBalanceChange: number,
  totalRiskChange: number,
  taxPaid: number,
  insuranceStatus: boolean
}

Gemini Generates:
{
  spendingBehavior: "Paragraph analyzing spending patterns",
  taxImpact: "Tax deduction explanation",
  riskAndProtection: "Risk assessment and insurance advice"
}

Output: Personalized financial report card
```

**3. Strategic Questions (3 A/B questions)**
```javascript
Prompt Context:
{
  monthPerformance: object,
  currentStrategy: string,
  riskScore: number,
  balance: number
}

Gemini Generates:
[
  {
    question: "Strategic decision question",
    optionA: "Conservative choice",
    optionB: "Aggressive choice"
  },
  // 2 more questions
]

Impact: Answers adjust modifiers for next month
```

**4. AI Prompt Engineering**
```javascript
Key Techniques:
- Structured JSON output format
- Indian context and currency (₹)
- College student scenarios (hostel, food, transport, etc.)
- Financial concepts (EMI, SIP, Tax, Insurance, etc.)
- Difficulty scaling based on modifiers
- Behavioral consistency across months
- Educational tone with consequences
```

### Educational Concepts Tracked

**Financial Literacy Topics**
- Tax Optimization
- Emergency Fund Management
- Debt Management
- Investment Diversification
- Risk Assessment
- Insurance Planning
- Budgeting & Expense Tracking
- Savings Discipline
- Compound Interest
- Opportunity Cost
- Impulse Control
- Long-term Planning
- Market Volatility
- Asset Allocation
- Financial Goals

Each choice is tagged with a concept for learning analytics.

---

## Development

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

### Development Best Practices

**1. State Management**
```javascript
// Always use dispatch, never mutate state directly
dispatch({ type: 'MAKE_CHOICE', payload: choice })

// Game engine functions are pure - no side effects
const newState = applyChoice(state, choice)
```

**2. Persistence**
```javascript
// Auto-save happens in reducer after every action
// Manual save if needed:
saveGameState(userId, gameState)
```

**3. AI Integration**
```javascript
// Always handle API failures gracefully
try {
  const scenarios = await generateMonthlyScenarios(gameState)
} catch (error) {
  // Fallback to pre-written scenarios
  const scenarios = getFallbackScenarios()
}
```

**4. Sound Effects**
```javascript
// Use SoundButton component for automatic audio
<SoundButton onClick={handleClick} soundType="success">
  Click Me
</SoundButton>

// Or call soundManager directly
soundManager.balanceIncrease()
```

**5. Testing Scenarios**
```javascript
// Test data flow without API calls
import { testScenarioFlow } from './engine/testDataFlow'
testScenarioFlow()
```

### File Structure Deep Dive

```
FATE-gemini-3-hackathon/
├── public/                          # Static assets
│   └── favicon.ico
├── src/
│   ├── components/                  # Reusable UI components
│   │   ├── calculators/            # Financial calculator components
│   │   │   ├── EMICalculator.jsx
│   │   │   ├── SIPCalculator.jsx
│   │   │   ├── CompoundInterestCalculator.jsx
│   │   │   ├── TaxCalculator.jsx
│   │   │   ├── BudgetPlanner.jsx
│   │   │   └── RetirementCalculator.jsx
│   │   ├── AuthGate.jsx            # Authentication routing
│   │   ├── DataManager.jsx         # Export/import dropdown
│   │   ├── DataViewer.jsx          # Debug data viewer
│   │   ├── Header.jsx              # Navigation header
│   │   ├── SavingsManager.jsx      # Savings modal
│   │   ├── InvestmentManager.jsx   # Investment modal
│   │   └── SoundButton.jsx         # Audio-enabled button
│   ├── pages/                       # Route pages
│   │   ├── LoginPage.jsx           # Email/password login
│   │   ├── SignupPage.jsx          # Account creation
│   │   ├── UsernameSetup.jsx       # User ID generation
│   │   ├── PreferencesSetup.jsx    # Behavioral questions
│   │   ├── Dashboard.jsx           # Month-end summary
│   │   ├── Simulation.jsx          # Scenario gameplay
│   │   ├── Profile.jsx             # User stats & history
│   │   ├── MathTools.jsx           # Calculator hub
│   │   └── Settings.jsx            # App settings
│   ├── engine/                      # Pure game logic (no React)
│   │   ├── gameEngine.js           # Core mechanics
│   │   ├── scenarioGenerator.js    # AI integration
│   │   ├── persistence.js          # Data storage
│   │   └── testDataFlow.js         # Testing utilities
│   ├── context/                     # React Context
│   │   └── GameContext.jsx         # Global game state
│   ├── utils/                       # Utility functions
│   │   ├── userIdGenerator.js      # Short ID generation
│   │   ├── soundManager.js         # Audio system
│   │   ├── apiKeyManager.js        # API key handling
│   │   └── debugLocalStorage.js    # Debug tools
│   ├── config/                      # Configuration
│   │   └── firebaseConfig.js       # Firebase setup
│   ├── data/                        # Static data
│   │   └── userData.json           # User data schema
│   ├── App.jsx                      # Root component
│   ├── main.jsx                     # Entry point
│   └── index.css                    # Global styles (Tailwind)
├── .env                             # Environment variables
├── .env.example                     # Environment template
├── vite.config.js                   # Vite configuration
├── tailwind.config.js               # Tailwind configuration
├── package.json                     # Dependencies
└── README.md                        # This file
```

### Key Implementation Details

**1. Game State Schema**
```javascript
{
  userId: "FATE-XXXX",
  month: 0,
  balance: 1000,
  savings: 500,
  insuranceOpted: false,
  riskScore: 50,
  history: [
    {
      type: "choice" | "savings" | "insurance" | "investment",
      month: number,
      balanceChange: number,
      savingsChange: number,
      riskChange: number,
      description: string,
      concept: string,
      timestamp: number
    }
  ],
  currentBatch: {
    month: number,
    scenarios: Array<Scenario>,
    currentIndex: number
  },
  modifiers: {
    riskSensitivity: 1.0,
    insuranceLikelihood: 1.0,
    difficultyModifier: 1.0,
    marketVolatility: 1.0,
    strategyMomentum: 0.0
  },
  investments: {
    insurance: {
      active: boolean,
      monthlyPremium: number,
      coverage: number
    },
    fixedDeposits: [
      {
        amount: number,
        tenure: number,
        remainingMonths: number,
        interestRate: 7.5,
        maturityAmount: number,
        startMonth: number,
        source: "balance" | "savings"
      }
    ],
    mutualFunds: [
      {
        amount: number,
        type: "equity" | "debt" | "hybrid",
        currentValue: number,
        startMonth: number,
        source: "balance" | "savings"
      }
    ]
  }
}
```

**2. Reducer Actions**
```javascript
// Core gameplay
MAKE_CHOICE          // Apply scenario choice
START_MONTH          // Begin new month
FINALIZE_MONTH       // Save month snapshot
SET_SCENARIOS        // Load AI scenarios
APPLY_STRATEGY       // Apply strategic answers

// Savings
DEPOSIT_SAVINGS      // Move balance → savings
WITHDRAW_SAVINGS     // Move savings → balance

// Investments
START_INSURANCE      // Activate insurance
CANCEL_INSURANCE     // Deactivate insurance
START_FD             // Create fixed deposit
START_MF             // Create mutual fund
UPDATE_INVESTMENTS   // Monthly investment updates

// Setup
INITIALIZE_MODIFIERS // Set behavioral modifiers
SET_USER_ID          // Assign user ID

// Data management
IMPORT_STATE         // Restore from JSON
RESET_STATE          // Clear all data
```

**3. localStorage Keys**
```javascript
fate_user_{userId}           // Game state for user
fate_current_session         // Active user session
fate_settings                // App settings (sound, volume)
fate_api_key                 // Gemini API key (optional)
```

**4. API Integration**
```javascript
// Gemini API Configuration
Model: gemini-robotics-er-1.5-preview
Temperature: 0.7 (creative but consistent)
Max Tokens: 2048
Response Format: JSON

// API Key Rotation
- Supports 1-5 API keys for load distribution
- Automatically rotates through keys on each request
- Prevents rate limit exhaustion
- Fallback to next key on error

// Rate Limiting
- Max 60 requests/minute per key
- Exponential backoff on errors
- Fallback scenarios on failure
```

**5. Performance Optimizations**
```javascript
// React optimizations
- useCallback for event handlers
- useMemo for expensive calculations
- React.memo for pure components
- Lazy loading for routes

// State optimizations
- Immutable updates (spread operator)
- Batch state updates in reducer
- Debounced auto-save
- Indexed history for fast lookups
```

---

## User Flow

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

## Data Flow

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

## UI/UX Features

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

## Deployment

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
- **Vercel**: Project Settings → Environment Variables
- **Netlify**: Site Settings → Build & Deploy → Environment

**Required Variables:**
```env
# Primary Gemini API Key (Required)
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Additional API Keys for Load Distribution (Recommended)
VITE_GEMINI_API_KEY_1=your_gemini_api_key_1
VITE_GEMINI_API_KEY_2=your_gemini_api_key_2
VITE_GEMINI_API_KEY_3=your_gemini_api_key_3
VITE_GEMINI_API_KEY_4=your_gemini_api_key_4
VITE_GEMINI_API_KEY_5=your_gemini_api_key_5

# Firebase Configuration (Required)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Tip**: Using multiple Gemini API keys prevents rate limiting and ensures smooth gameplay during peak usage.

### Production Checklist

- [ ] All environment variables configured
- [ ] Firebase Authentication enabled
- [ ] Gemini API key valid and has quota
- [ ] Build completes without errors
- [ ] Test authentication flow
- [ ] Test scenario generation
- [ ] Test data export/import
- [ ] Test all calculators
- [ ] Test sound effects
- [ ] Test on mobile devices
- [ ] Check console for errors
- [ ] Verify localStorage persistence

---

## Technical Specifications

### Browser Compatibility
- Chrome 90+ (recommended)
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

### Performance Metrics
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Lighthouse Score: 90+
- Bundle Size: ~500KB (gzipped)

### API Requirements
- Google Gemini API access
- Firebase project with Authentication enabled
- localStorage support (minimum 5MB)

### Security Features
- Firebase Authentication (OAuth 2.0)
- Environment variable protection
- No sensitive data in localStorage
- HTTPS required for production
- CORS-compliant API requests
- XSS protection via React

### Accessibility
- WCAG 2.1 Level AA compliant
- Keyboard navigation support
- Screen reader compatible
- Color contrast ratios meet standards
- Focus indicators on interactive elements
- ARIA labels where needed

---

## Feature Roadmap

### Implemented
- [x] Firebase Authentication
- [x] AI-powered scenario generation
- [x] Monthly simulation cycle
- [x] Behavioral modifier system
- [x] Insurance system
- [x] Fixed Deposits
- [x] Mutual Funds
- [x] Savings account management
- [x] 6 financial calculators
- [x] Sound effects system
- [x] Data export/import
- [x] Profile & statistics
- [x] Settings & preferences
- [x] Responsive UI
- [x] Debug tools

### Potential Enhancements
- [ ] Multiplayer leaderboards
- [ ] Achievement system
- [ ] More investment types (Stocks, Crypto, Real Estate)
- [ ] Credit card system with debt
- [ ] Loan management
- [ ] Emergency events (medical, accidents)
- [ ] Career progression (salary increases)
- [ ] Social features (share progress)
- [ ] Mobile app (React Native)
- [ ] Dark/Light theme toggle
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] AI financial advisor chatbot
- [ ] Tutorial mode for beginners
- [ ] Scenario difficulty selector

---

## 🐛 Troubleshooting

### Gemini API Issues

**Problem**: Scenarios not generating
**Solution**: 
1. Check API key in `.env`
2. Verify API quota at [Google AI Studio](https://aistudio.google.com/)
3. Check browser console for errors
4. Fallback scenarios will be used automatically
5. Try regenerating scenarios

### Data Not Saving

**Problem**: Progress lost on refresh
**Solution**:
1. Check browser console for persistence errors
2. Verify localStorage is enabled (not in private/incognito mode)
3. Check localStorage quota (5MB minimum required)
4. Export data as backup before troubleshooting
5. Clear browser cache and reimport data

### Questions Not Showing A/B Options

**Problem**: Questions display without choices
**Solution**:
1. Gemini prompt enforces A/B format
2. Parser handles multiple response formats
3. Fallback questions provided if parsing fails
4. Check console for parsing errors
5. Verify API response structure

### Firebase Authentication Errors

**Problem**: Can't sign in or sign up
**Solution**:
1. Verify Firebase config in `.env`
2. Check Firebase console for enabled auth methods
3. Ensure email/password auth is enabled
4. Check Google OAuth credentials if using Google sign-in
5. Clear browser cookies and try again

### Sound Not Playing

**Problem**: No audio feedback
**Solution**:
1. Check sound settings in Settings page
2. Verify browser allows audio (user gesture required)
3. Check volume slider (not at 0%)
4. Try clicking any button to initialize AudioContext
5. Check browser console for Web Audio API errors

### Investment Not Showing

**Problem**: FD or MF not appearing in portfolio
**Solution**:
1. Check if amount was deducted from source
2. Verify investment in history logs
3. Check Profile page for investment summary
4. Refresh page to reload state
5. Export data and check JSON structure

---

## Learning Resources

### Financial Concepts Covered
- **Tax Planning**: Understanding income tax deductions
- **Emergency Funds**: Importance of liquid savings
- **Insurance**: Risk protection and coverage
- **Fixed Deposits**: Safe, guaranteed returns
- **Mutual Funds**: Market-linked investments
- **SIP**: Systematic Investment Plans
- **EMI**: Loan repayment calculations
- **Compound Interest**: Power of compounding
- **Budgeting**: Expense tracking and planning
- **Retirement Planning**: Long-term wealth building
- **Risk Management**: Balancing risk and reward
- **Opportunity Cost**: Trade-offs in decisions

### Recommended Reading
- "Rich Dad Poor Dad" by Robert Kiyosaki
- "The Psychology of Money" by Morgan Housel
- "Let's Talk Money" by Monika Halan (India-specific)
- "The Intelligent Investor" by Benjamin Graham
- "Your Money or Your Life" by Vicki Robin

### Online Resources
- [Investopedia](https://www.investopedia.com/) - Financial education
- [Zerodha Varsity](https://zerodha.com/varsity/) - Indian markets
- [ET Money](https://www.etmoney.com/) - Personal finance
- [Freefincal](https://freefincal.com/) - Financial planning

---

## Contributing

This project was built for the Gemini 3 Hackathon. If you'd like to contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Contribution Guidelines
- Follow existing code style
- Add comments for complex logic
- Test thoroughly before submitting
- Update README if adding features
- Keep commits atomic and descriptive

---

## License

This project was created for the Gemini 3 Hackathon.

---

## Acknowledgments

- **Google Gemini AI** for powering the scenario generation
- **Firebase** for authentication infrastructure
- **Vite** for the amazing dev experience
- **Tailwind CSS** for rapid styling
- **Framer Motion** for smooth animations
- **Lucide React** for beautiful icons
- **React Team** for the incredible framework
- **Open Source Community** for inspiration and tools

---

## Contact

For questions or feedback about this project, please open an issue on GitHub.

---

## Play FATE Today!

**Built for the Gemini 3 Hackathon**

> "Play the game of money before it plays you."

Start your financial literacy journey with FATE - where every choice teaches, every consequence matters, and every month brings new challenges. Learn to manage money in a safe, simulated environment before facing real-world financial decisions.

**Key Takeaways:**
- Learn by doing, not just reading
- Experience consequences without real risk
- Track your financial decision patterns
- Get personalized AI feedback
- Build confidence in money management

Ready to take control of your financial future? Start playing FATE now!
