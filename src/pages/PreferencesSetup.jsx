import { useState } from 'react'
import { getUserSession, savePreferences } from '../utils/session'
import { useGameDispatch } from '../context/GameContext'

/**
 * Maps user preferences to behavioral answers for the game engine
 * The engine expects an array of 'A' or 'B' answers for 3 questions
 * 
 * @param {Object} preferences - User preferences from setup
 * @returns {Array<string>} Array of answers ['A', 'B', 'A'] etc.
 */
function mapPreferencesToAnswers(preferences) {
    const answers = []

    // Question 1: Stability (A: Flexible, B: Locked)
    // Map primaryDrive - security = B (locked/stable), others = A
    answers.push(preferences.primaryDrive === 'security' ? 'B' : 'A')

    // Question 2: Protection (A: Luck, B: Covered)
    // Map based on if health/savings are in spending interests
    const protectionInterests = ['health', 'savings']
    const hasProtectionFocus = preferences.spendingInterests?.some(i => protectionInterests.includes(i))
    answers.push(hasProtectionFocus ? 'B' : 'A')

    // Question 3: Ambition (A: Steady, B: High Stakes)
    // Map riskLevel - high = B, others = A
    answers.push(preferences.riskLevel === 'high' ? 'B' : 'A')

    return answers
}

const STEPS = [
    { id: 1, label: 'Primary Drive' },
    { id: 2, label: 'Spending Interests' },
    { id: 3, label: 'Risk Level' }
]

const DRIVES = [
    {
        id: 'security',
        label: 'SECURITY',
        icon: '🛡️',
        desc: 'Stability and risk mitigation. Protect the core.'
    },
    {
        id: 'freedom',
        label: 'FREEDOM',
        icon: '☁️',
        desc: 'Liquidity and early exit strategies. Total mobility.'
    },
    {
        id: 'legacy',
        label: 'LEGACY',
        icon: '🏛️',
        desc: 'Long-term growth and generational wealth.'
    }
]

const SPENDING_INTERESTS = [
    { id: 'housing', label: 'Housing & Rent' },
    { id: 'transport', label: 'Transportation' },
    { id: 'food', label: 'Food & Dining' },
    { id: 'entertainment', label: 'Entertainment' },
    { id: 'health', label: 'Healthcare' },
    { id: 'education', label: 'Education' },
    { id: 'savings', label: 'Savings & Investment' },
    { id: 'travel', label: 'Travel' }
]

const RISK_LEVELS = [
    { id: 'low', label: 'LOW', desc: 'Conservative approach' },
    { id: 'medium', label: 'MEDIUM', desc: 'Balanced risk-reward' },
    { id: 'high', label: 'HIGH', desc: 'Aggressive growth' }
]

export default function PreferencesSetup() {
    const dispatch = useGameDispatch()
    const [currentStep, setCurrentStep] = useState(1)
    const [preferences, setPreferences] = useState({
        primaryDrive: null,
        spendingInterests: [],
        riskLevel: null
    })

    const handleDriveSelect = (driveId) => {
        setPreferences(prev => ({ ...prev, primaryDrive: driveId }))
    }

    const handleInterestToggle = (interestId) => {
        setPreferences(prev => ({
            ...prev,
            spendingInterests: prev.spendingInterests.includes(interestId)
                ? prev.spendingInterests.filter(id => id !== interestId)
                : [...prev.spendingInterests, interestId]
        }))
    }

    const handleRiskSelect = (riskId) => {
        setPreferences(prev => ({ ...prev, riskLevel: riskId }))
    }

    const canProceed = () => {
        if (currentStep === 1) return preferences.primaryDrive !== null
        if (currentStep === 2) return preferences.spendingInterests.length > 0
        if (currentStep === 3) return preferences.riskLevel !== null
        return false
    }

    const handleNext = async () => {
        if (currentStep < 3) {
            setCurrentStep(prev => prev + 1)
        } else {
            // Save preferences to localStorage
            const { userId } = getUserSession()
            savePreferences(userId, preferences)

            // Initialize modifiers based on preferences (sets floor/ceiling for the game)
            dispatch({
                type: 'INITIALIZE_MODIFIERS',
                payload: {
                    primaryDrive: preferences.primaryDrive,
                    riskLevel: preferences.riskLevel
                }
            })

            // Start Month 1 and go directly to simulation
            dispatch({ type: 'START_NEW_MONTH', payload: { batch: null } })

            // Redirect to simulation to start playing
            window.location.hash = '#/simulation'
        }
    }

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1)
        } else {
            window.location.hash = '#/'
        }
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            {/* Header */}
            <header className="p-6 flex justify-between items-center border-b border-fate-gray/30">
                <span className="font-mono text-sm text-fate-text tracking-wider">
                    PHASE {String(currentStep).padStart(2, '0')} / 03
                </span>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-8 md:p-16 max-w-5xl mx-auto w-full">
                {currentStep === 1 && (
                    <div>
                        <h1 className="font-heading text-5xl md:text-7xl font-bold leading-tight mb-4">
                            WHAT IS YOUR<br />
                            <span className="text-fate-orange">PRIMARY DRIVE?</span>
                        </h1>
                        <p className="text-fate-text text-lg mb-12 max-w-lg">
                            This choice will shape your starting attributes and the inherent risks of your financial simulation.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {DRIVES.map((drive, idx) => (
                                <button
                                    key={drive.id}
                                    onClick={() => handleDriveSelect(drive.id)}
                                    className={`p-6 rounded-lg text-left transition-all ${preferences.primaryDrive === drive.id
                                        ? 'bg-fate-orange text-black'
                                        : 'bg-fate-card hover:bg-fate-gray border border-fate-gray'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-16">
                                        <span className="font-mono text-sm">
                                            {String(idx + 1).padStart(2, '0')}
                                        </span>
                                        <span className="text-2xl">{drive.icon}</span>
                                    </div>
                                    <h3 className="font-heading text-2xl font-bold mb-2">
                                        {drive.label}
                                    </h3>
                                    <p className={`text-sm ${preferences.primaryDrive === drive.id ? 'text-black/70' : 'text-fate-text'
                                        }`}>
                                        {drive.desc}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div>
                        <h1 className="font-heading text-5xl md:text-7xl font-bold leading-tight mb-4">
                            SPENDING<br />
                            <span className="text-fate-orange">PRIORITIES?</span>
                        </h1>
                        <p className="text-fate-text text-lg mb-12 max-w-lg">
                            Select the categories that matter most to your lifestyle. These will influence your scenarios.
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {SPENDING_INTERESTS.map((interest) => (
                                <button
                                    key={interest.id}
                                    onClick={() => handleInterestToggle(interest.id)}
                                    className={`p-4 rounded-lg text-left transition-all font-medium ${preferences.spendingInterests.includes(interest.id)
                                        ? 'bg-fate-orange text-black'
                                        : 'bg-fate-card hover:bg-fate-gray border border-fate-gray text-white'
                                        }`}
                                >
                                    {interest.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {currentStep === 3 && (
                    <div>
                        <h1 className="font-heading text-5xl md:text-7xl font-bold leading-tight mb-4">
                            RISK<br />
                            <span className="text-fate-orange">TOLERANCE?</span>
                        </h1>
                        <p className="text-fate-text text-lg mb-12 max-w-lg">
                            How much volatility can you handle? This affects scenario difficulty.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {RISK_LEVELS.map((risk) => (
                                <button
                                    key={risk.id}
                                    onClick={() => handleRiskSelect(risk.id)}
                                    className={`p-6 rounded-lg text-left transition-all ${preferences.riskLevel === risk.id
                                        ? 'bg-fate-orange text-black'
                                        : 'bg-fate-card hover:bg-fate-gray border border-fate-gray'
                                        }`}
                                >
                                    <h3 className="font-heading text-3xl font-bold mb-2">
                                        {risk.label}
                                    </h3>
                                    <p className={`text-sm ${preferences.riskLevel === risk.id ? 'text-black/70' : 'text-fate-text'
                                        }`}>
                                        {risk.desc}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="p-6 flex justify-between items-center border-t border-fate-gray/30">
                <button
                    onClick={handleBack}
                    className="text-fate-text hover:text-white transition-colors flex items-center gap-2"
                >
                    ← ABORT
                </button>

                <div className="flex items-center gap-4">
                    <span className="font-heading text-lg font-bold tracking-wide">
                        INITIATE NEXT SEQUENCE
                    </span>
                    <button
                        onClick={handleNext}
                        disabled={!canProceed()}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${canProceed()
                            ? 'bg-white text-black hover:bg-fate-orange'
                            : 'bg-fate-gray text-fate-muted cursor-not-allowed'
                            }`}
                    >
                        →
                    </button>
                </div>
            </footer>

            {/* System Status */}
            <div className="absolute bottom-6 right-6 text-right">
                <div className="font-mono text-xs text-fate-muted">
                    SYSTEM: FATE_V3.0.1
                </div>
                <div className="font-mono text-xs text-fate-muted">
                    STATUS: AWAITING_DECISION
                </div>
            </div>
        </div>
    )
}
