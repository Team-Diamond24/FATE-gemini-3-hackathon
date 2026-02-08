import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, User, Settings, Image, ChevronRight, Home, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react'
import { useGame } from '../context/GameContext'
import { getUserSession } from '../utils/session'
import { fetchMonthlyScenarios, fetchMonthlyReflection } from '../services/api'

// Impact Log Item Component
function ImpactLogItem({ log }) {
    const isSystem = log.type === 'system' || log.description?.toLowerCase().includes('tax') ||
        log.description?.toLowerCase().includes('deduction') ||
        log.description?.toLowerCase().includes('penalty')

    const isPositive = (log.amount || log.balanceChange || 0) > 0

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex items-center justify-between py-3 border-b border-fate-gray/30 ${isSystem ? 'bg-red-500/5' : ''
                }`}
        >
            <div className="flex items-center gap-3">
                <span className={`text-xs font-mono ${isSystem ? 'text-red-400' : 'text-fate-text'}`}>
                    {isSystem ? 'System:' : 'Choice:'}
                </span>
                <span className="text-sm text-white truncate max-w-[180px]">
                    {log.description || log.narrative?.substring(0, 30) || 'Decision made'}
                </span>
            </div>
            <div className="flex items-center gap-2">
                <span className={`font-mono text-sm font-bold ${isPositive ? 'text-green-400' : 'text-fate-orange'
                    }`}>
                    {isPositive ? '+' : ''}{log.amount || log.balanceChange ? `₹${Math.abs(log.amount || log.balanceChange).toLocaleString()}` : ''}
                </span>
                <span className="text-lg">{log.icon || (isSystem ? '⚠️' : '📋')}</span>
            </div>
        </motion.div>
    )
}

// Summary Panel Component - Shown when month is complete
function SummaryPanel({ reflection, isLoading, onProceed, isProceedLoading }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col justify-center p-8"
        >
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <CheckCircle size={24} className="text-green-400" />
                    <span className="font-mono text-lg text-green-400 tracking-wider">
                        MONTH COMPLETE
                    </span>
                </div>
            </div>

            <div className="bg-fate-card border border-fate-gray/30 rounded-lg p-6 mb-8">
                <span className="font-mono text-xs text-fate-text tracking-widest block mb-4">
                    MONTHLY REFLECTION
                </span>
                {isLoading ? (
                    <div className="flex items-center gap-3 text-fate-muted">
                        <div className="w-4 h-4 border-2 border-fate-orange border-t-transparent rounded-full animate-spin" />
                        <span className="font-mono text-sm">Generating reflection...</span>
                    </div>
                ) : (
                    <p className="text-white leading-relaxed">
                        {reflection || 'Your financial decisions this month have shaped your path. Review your choices and prepare for new challenges ahead.'}
                    </p>
                )}
            </div>

            <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={onProceed}
                disabled={isProceedLoading}
                className={`w-full bg-fate-orange text-black font-bold py-4 rounded font-mono tracking-wider transition-colors flex items-center justify-center gap-3
                    ${isProceedLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-fate-orange-light'}`}
            >
                {isProceedLoading ? (
                    <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        PREPARING NEXT MONTH...
                    </>
                ) : (
                    <>
                        PROCEED TO NEXT MONTH
                        <ChevronRight size={18} />
                    </>
                )}
            </motion.button>
        </motion.div>
    )
}

// Main Dashboard Content
function DashboardContent() {
    const {
        state,
        applyChoice,
        advanceScenario,
        getCurrentScenario,
        isMonthComplete,
        applyIncome,
        finalizeMonth,
        startNewMonth,
        setBatch,
        updateInsurance
    } = useGame()

    const [scenario, setScenario] = useState(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [showSummary, setShowSummary] = useState(false)
    const [reflection, setReflection] = useState('')
    const [isLoadingReflection, setIsLoadingReflection] = useState(false)
    const [isProceedLoading, setIsProceedLoading] = useState(false)
    const { userId } = getUserSession()

    // Check if month is complete and load scenario
    useEffect(() => {
        if (state.isLoaded) {
            // Check if month is complete
            const monthComplete = isMonthComplete()

            if (monthComplete) {
                setShowSummary(true)
                loadReflection()
            } else if (state.currentBatch) {
                const current = getCurrentScenario()
                setScenario(current)
                setShowSummary(false)
            }
        }
    }, [state.isLoaded, state.month, state.currentBatch])

    // Load monthly reflection
    const loadReflection = async () => {
        setIsLoadingReflection(true)
        try {
            const reflectionText = await fetchMonthlyReflection(state)
            setReflection(reflectionText)
        } catch (error) {
            console.error('Failed to load reflection:', error)
            setReflection('This month has been a journey of financial decisions. Your choices have impacted your balance and risk profile.')
        } finally {
            setIsLoadingReflection(false)
        }
    }

    // Handle proceeding to next month
    const handleProceedToNextMonth = async () => {
        setIsProceedLoading(true)
        try {
            // Step 1: Apply income
            applyIncome()

            // Step 2: Finalize month (save to history)
            finalizeMonth()

            // Step 3: Fetch new scenarios
            const newBatch = await fetchMonthlyScenarios(state)

            // Step 4: Start new month with new batch
            startNewMonth(newBatch)

            // Reset UI state
            setShowSummary(false)
            setReflection('')

            // Navigate to simulation
            window.location.hash = '#/simulation'
        } catch (error) {
            console.error('Failed to proceed to next month:', error)
            // Still proceed with defaults
            startNewMonth(null)
            setShowSummary(false)
            window.location.hash = '#/simulation'
        } finally {
            setIsProceedLoading(false)
        }
    }

    const handleChoice = async (choice) => {
        setIsProcessing(true)
        await new Promise(resolve => setTimeout(resolve, 300))

        // Build Choice object expected by engine
        const engineChoice = {
            balanceChange: choice.balanceChange || 0,
            riskChange: choice.riskChange || 0,
            savingsChange: choice.savingsChange || 0,
            description: choice.label || '',
            isInsurance: choice.isInsurance || false
        }

        applyChoice(engineChoice)
        advanceScenario()

        setIsProcessing(false)
    }

    const handleBuyInsurance = () => {
        // Apply insurance choice - costs money but reduces risk
        const insuranceChoice = {
            balanceChange: -200,
            riskChange: -10,
            savingsChange: 0,
            description: 'Purchased Insurance Coverage',
            isInsurance: true
        }
        applyChoice(insuranceChoice)
        updateInsurance(true)
    }

    const getRiskColor = (score) => {
        if (score < 30) return 'text-green-400'
        if (score <= 70) return 'text-fate-orange'
        return 'text-red-500'
    }

    const getRiskBgColor = (score) => {
        if (score < 30) return 'bg-green-400'
        if (score <= 70) return 'bg-fate-orange'
        return 'bg-red-500'
    }

    if (!state.isLoaded) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-fate-orange font-mono text-sm tracking-wider animate-pulse">
                    LOADING FATE...
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white relative">
            {/* Grid Overlay */}
            <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: `
            linear-gradient(rgba(38, 38, 38, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(38, 38, 38, 0.5) 1px, transparent 1px)
          `,
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Header */}
            <header className="relative z-10 flex items-center justify-between p-4 border-b border-fate-gray/30">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-fate-orange rounded flex items-center justify-center font-bold text-black">
                        F
                    </div>
                    <span className="font-mono text-sm tracking-wider text-fate-text">
                        FATE // SIM_V2
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <button className="w-10 h-10 border border-fate-gray rounded flex items-center justify-center hover:bg-fate-gray/50 transition-colors">
                        <Image size={18} className="text-fate-text" />
                    </button>
                    <button className="w-10 h-10 border border-fate-gray rounded flex items-center justify-center hover:bg-fate-gray/50 transition-colors">
                        <User size={18} className="text-fate-text" />
                    </button>
                </div>
            </header>

            {/* Main 3-Column Layout */}
            <main className="relative z-10 grid grid-cols-1 lg:grid-cols-[320px_1fr_340px] gap-0 min-h-[calc(100vh-65px)]">

                {/* LEFT COLUMN - Profile/Stats */}
                <div className="border-r border-fate-gray/30 p-6 flex flex-col">
                    {/* User Info */}
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-fate-gray/30">
                        <div className="w-12 h-12 bg-fate-gray rounded-lg flex items-center justify-center">
                            <User size={24} className="text-fate-text" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-fate-text">USER //</span>
                                <span className="font-mono text-sm text-white">{userId.toUpperCase()}</span>
                                <Settings size={14} className="text-fate-text" />
                            </div>
                            <span className="font-mono text-xs text-fate-orange">STUDENT</span>
                        </div>
                    </div>

                    {/* Profile Section */}
                    <div className="mb-6">
                        <span className="font-mono text-xs text-fate-text tracking-widest block mb-3">PROFILE</span>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="font-mono text-xs text-fate-text">STATUS // STUDENT</span>
                                <span className="font-mono text-2xl font-bold">{String(state.month).padStart(2, '0')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-mono text-xs text-fate-text">RISK TYPE // BALANCED</span>
                            </div>
                        </div>
                    </div>

                    {/* Savings - Fixed to use engine default (500) */}
                    <div className="mb-6 p-4 bg-fate-card border border-fate-gray/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <Home size={16} className="text-fate-text" />
                            <span className="font-mono text-xs text-fate-text">SAVINGS</span>
                        </div>
                        <div className="flex justify-between items-end mb-3">
                            <span className="font-mono text-2xl font-bold text-fate-orange">
                                ₹{(state.savings ?? 500).toLocaleString()}
                            </span>
                            <span className="font-mono text-sm text-fate-text">
                                ₹{((state.savings ?? 500) * 0.1).toLocaleString()}
                            </span>
                        </div>
                        <div className="h-2 bg-fate-gray rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-fate-orange"
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, ((state.savings ?? 500) / 5000) * 100)}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                    </div>

                    {/* Current Month / Balance */}
                    <div className="mb-6">
                        <span className="font-mono text-xs text-fate-text tracking-widest block mb-2">CURRENT MONTH</span>
                        <div className="flex items-center gap-3">
                            <span className="font-mono text-4xl font-bold text-fate-orange">
                                ₹{state.balance.toLocaleString()}
                            </span>
                            <span className="font-mono text-lg text-fate-text">.00</span>
                            {state.insuranceOpted && (
                                <Shield size={24} className="text-fate-orange ml-2" />
                            )}
                        </div>
                        <span className="font-mono text-xs text-fate-text tracking-widest block mt-1">AVAILABLE CAPITAL</span>
                    </div>

                    {/* Risk Score */}
                    <div className="mb-6">
                        <span className="font-mono text-xs text-fate-text tracking-widest block mb-2">RISK SCORE</span>
                        <div className="flex items-center gap-4">
                            <span className={`font-mono text-3xl font-bold ${getRiskColor(state.riskScore)}`}>
                                {state.riskScore}/100
                            </span>
                            <div className="flex-1">
                                <div className="h-2 bg-fate-gray rounded-full overflow-hidden">
                                    <motion.div
                                        className={`h-full ${getRiskBgColor(state.riskScore)}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${state.riskScore}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                            </div>
                            <span className="font-mono text-xs text-fate-text">{state.riskScore}/100</span>
                        </div>
                    </div>

                    {/* Insurance */}
                    <div className="mb-6">
                        <span className="font-mono text-xs text-fate-text tracking-widest block mb-2">INSURANCE</span>
                        <div className="flex items-center justify-between">
                            <span className={`font-mono text-xl font-bold ${state.insuranceOpted ? 'text-green-400' : 'text-fate-muted'}`}>
                                {state.insuranceOpted ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                            {state.insuranceOpted ? (
                                <span className="font-mono text-xs px-2 py-1 rounded bg-green-400/20 text-green-400">
                                    ACTIVE
                                </span>
                            ) : (
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleBuyInsurance}
                                    className="font-mono text-xs px-3 py-1.5 rounded bg-fate-orange text-black hover:bg-fate-orange-light transition-colors"
                                >
                                    BUY ₹200
                                </motion.button>
                            )}
                        </div>
                    </div>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Continue Button */}
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => window.location.hash = '#/simulation'}
                        className="w-full bg-fate-orange text-black font-bold py-4 rounded font-mono tracking-wider hover:bg-fate-orange-light transition-colors"
                    >
                        CONTINUE SIMULATION
                    </motion.button>
                </div>

                {/* CENTER COLUMN - Active Scenario or Summary */}
                <div className="p-8 flex flex-col border-r border-fate-gray/30">
                    <div className="mb-4">
                        <span className="font-mono text-xs text-fate-text tracking-widest">
                            TEMPORAL NODE // <span className="text-white">MONTH {String(state.month).padStart(2, '0')} EVENT</span>
                        </span>
                    </div>

                    {showSummary ? (
                        <SummaryPanel
                            reflection={reflection}
                            isLoading={isLoadingReflection}
                            onProceed={handleProceedToNextMonth}
                            isProceedLoading={isProceedLoading}
                        />
                    ) : scenario ? (
                        <div className="flex-1 flex flex-col justify-center">
                            <p
                                className="text-xl leading-relaxed mb-12 max-w-lg"
                                dangerouslySetInnerHTML={{ __html: scenario.situation || scenario.text || 'Loading...' }}
                            />

                            <div className="flex flex-wrap gap-4">
                                {scenario.choices && scenario.choices.map((choice, idx) => (
                                    <motion.button
                                        key={choice.id}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleChoice(choice)}
                                        disabled={isProcessing}
                                        className={`px-6 py-3 rounded border-2 font-mono text-sm tracking-wider transition-all ${idx === 0
                                            ? 'bg-fate-orange text-black border-fate-orange hover:bg-fate-orange-light'
                                            : 'border-fate-orange text-fate-orange hover:bg-fate-orange hover:text-black'
                                            } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {choice.label}
                                        {choice.cost && (
                                            <span className="ml-3 px-2 py-0.5 bg-black/20 rounded text-xs">
                                                ₹{choice.cost.toLocaleString()}
                                            </span>
                                        )}
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center">
                            <div className="text-fate-muted mb-4">
                                <AlertTriangle size={48} className="mx-auto opacity-50" />
                            </div>
                            <p className="font-mono text-sm text-fate-text mb-2">No active scenario</p>
                            <p className="font-mono text-xs text-fate-muted">Click "Continue Simulation" to start</p>
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN - Impact Logs */}
                <div className="p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <span className="font-mono text-xs text-fate-text tracking-widest">
                            RECENT IMPACT LOGS
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {state.history.length === 0 ? (
                            <div className="text-center py-12 text-fate-muted">
                                <AlertTriangle size={32} className="mx-auto mb-3 opacity-50" />
                                <p className="font-mono text-sm">No impact logs yet</p>
                                <p className="font-mono text-xs mt-1">Make choices to see your history</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {state.history.slice().reverse().map((log, idx) => (
                                    <ImpactLogItem key={idx} log={log} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* View Archive Button */}
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        className="mt-4 w-full bg-fate-orange text-black font-bold py-3 rounded font-mono text-sm tracking-wider flex items-center justify-center gap-2 hover:bg-fate-orange-light transition-colors"
                    >
                        VIEW FULL ARCHIVE
                        <ChevronRight size={16} />
                    </motion.button>
                </div>
            </main>

            {/* Side Label */}
            <div className="fixed left-2 top-1/2 -translate-y-1/2 -rotate-90 origin-left font-mono text-xs text-fate-muted tracking-widest hidden lg:block">
                SIMULATION ACTIVE // 0.0.1
            </div>
        </div>
    )
}

export default function Dashboard() {
    return <DashboardContent />
}
