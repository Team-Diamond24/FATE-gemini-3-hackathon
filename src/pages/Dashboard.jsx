import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, User, Settings, Image, ChevronRight, Home, DollarSign, AlertTriangle, CheckCircle, BookOpen } from 'lucide-react'
import { useGame } from '../context/GameContext'
import { getUserSession } from '../utils/session'
import { fetchMonthlyScenarios, fetchMonthlyReflection, fetchDecisionQuestions } from '../services/api'
import { getStrategyStatus } from '../engine/gameEngine'
import DataManager from '../components/DataManager'

// Adds a "VIEW DATA" button

// Lesson Card Component - Educational reflection layout
function LessonCard({ reflection }) {
    // Parse the reflection into sections: [ANALYSIS], [THE LESSON], [STRATEGY]
    const parseReflection = (text) => {
        if (!text) return { analysis: '', lesson: '', strategy: '' }

        const sections = {
            analysis: '',
            lesson: '',
            strategy: ''
        }

        // Extract [ANALYSIS] section
        const analysisMatch = text.match(/\[ANALYSIS\]([\s\S]*?)(?=\[THE LESSON\]|\[STRATEGY\]|$)/i)
        if (analysisMatch) sections.analysis = analysisMatch[1].trim()

        // Extract [THE LESSON] section
        const lessonMatch = text.match(/\[THE LESSON\]([\s\S]*?)(?=\[STRATEGY\]|$)/i)
        if (lessonMatch) sections.lesson = lessonMatch[1].trim()

        // Extract [STRATEGY] section
        const strategyMatch = text.match(/\[STRATEGY\]([\s\S]*?)$/i)
        if (strategyMatch) sections.strategy = strategyMatch[1].trim()

        // If no sections found, treat entire text as analysis (fallback for old format)
        if (!sections.analysis && !sections.lesson && !sections.strategy) {
            sections.analysis = text
        }

        return sections
    }

    const { analysis, lesson, strategy } = parseReflection(reflection)

    return (
        <div className="space-y-5">
            {/* Analysis Section */}
            {analysis && (
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-fate-gray rounded flex items-center justify-center">
                            <span className="text-sm">📊</span>
                        </div>
                        <span className="font-mono text-xs text-fate-text tracking-widest">
                            ANALYSIS
                        </span>
                    </div>
                    <p className="text-white leading-relaxed text-sm pl-8">
                        {analysis}
                    </p>
                </div>
            )}

            {/* The Lesson Section - Highlighted for education */}
            {lesson && (
                <div className="bg-fate-orange/10 border border-fate-orange/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-fate-orange/20 rounded flex items-center justify-center">
                            <BookOpen size={14} className="text-fate-orange" />
                        </div>
                        <span className="font-mono text-xs text-fate-orange tracking-widest">
                            THE LESSON
                        </span>
                    </div>
                    <p className="text-white leading-relaxed text-sm">
                        {lesson}
                    </p>
                </div>
            )}

            {/* Strategy Section */}
            {strategy && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-green-500/20 rounded flex items-center justify-center">
                            <span className="text-sm">💡</span>
                        </div>
                        <span className="font-mono text-xs text-green-400 tracking-widest">
                            PRO-TIP
                        </span>
                    </div>
                    <p className="text-white leading-relaxed text-sm">
                        {strategy}
                    </p>
                </div>
            )}
        </div>
    )
}

// Impact Log Item Component - Enhanced with concept tags for educational tracking
function ImpactLogItem({ log }) {
    const isSystem = log.type === 'system' || log.description?.toLowerCase().includes('tax') ||
        log.description?.toLowerCase().includes('deduction') ||
        log.description?.toLowerCase().includes('penalty')

    const isPositive = (log.amount || log.balanceChange || 0) > 0
    const concept = log.concept // Financial concept tag

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex flex-col py-3 border-b border-fate-gray/30 ${isSystem ? 'bg-red-500/5' : ''}`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                    <span className={`text-xs font-mono ${isSystem ? 'text-red-400' : 'text-fate-text'}`}>
                        {isSystem ? 'System:' : 'Choice:'}
                    </span>
                    <span className="text-sm text-white truncate max-w-[140px]">
                        {log.description || log.narrative?.substring(0, 30) || 'Decision made'}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`font-mono text-sm font-bold ${isPositive ? 'text-green-400' : 'text-fate-orange'}`}>
                        {isPositive ? '+' : ''}{log.amount || log.balanceChange ? `₹${Math.abs(log.amount || log.balanceChange).toLocaleString()}` : ''}
                    </span>
                    <span className="text-lg">{log.icon || (isSystem ? '⚠️' : '📋')}</span>
                </div>
            </div>
            {/* Concept Tag - Educational Label */}
            {concept && (
                <div className="mt-2 flex items-center gap-2">
                    <BookOpen size={12} className="text-fate-orange" />
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-fate-orange/20 text-fate-orange">
                        {concept}
                    </span>
                </div>
            )}
        </motion.div>
    )
}

// Summary Panel Component - Shown when month is complete
function SummaryPanel({ reflection, decisionQuestions, isLoading, onProceed, isProceedLoading, selectedAnswers, onAnswerSelect, currentMonth }) {
    // Parse decision questions - improved parser
    const parseQuestions = (text) => {
        if (!text) return []

        const questions = []
        const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)

        let i = 0
        while (i < lines.length) {
            const line = lines[i]

            // Check if this is a question line (starts with number)
            if (/^\d+\./.test(line)) {
                const question = { question: line, choices: [] }
                i++

                // Look for A) and B) options
                while (i < lines.length && /^[AB]\)/.test(lines[i])) {
                    question.choices.push(lines[i])
                    i++
                }

                // Only add if we have both choices
                if (question.choices.length === 2) {
                    questions.push(question)
                }
            } else {
                i++
            }
        }

        return questions
    }

    const questions = parseQuestions(decisionQuestions)

    return (
        <div className="p-8 max-w-4xl mx-auto">
            {/* Month Complete Badge */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 mb-8"
            >
                <CheckCircle size={32} className="text-green-400" />
                <div>
                    <div className="font-heading text-2xl font-bold text-white">
                        Month {currentMonth} Complete
                    </div>
                    <div className="font-mono text-xs text-fate-text">
                        Review your performance and plan ahead
                    </div>
                </div>
            </motion.div>

            {/* Monthly Reflection - Lesson Card Layout */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-fate-card border border-fate-gray/30 rounded-xl p-6 mb-6"
            >
                {isLoading ? (
                    <div className="flex items-center gap-3 text-fate-muted py-8">
                        <div className="w-5 h-5 border-2 border-fate-orange border-t-transparent rounded-full animate-spin" />
                        <span className="font-mono text-sm">Your Financial Mentor is analyzing your decisions...</span>
                    </div>
                ) : (
                    <LessonCard reflection={reflection} />
                )}
            </motion.div>

            {/* Decision Questions */}
            {!isLoading && questions.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-fate-card border border-fate-gray/30 rounded-xl p-6 mb-8"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 bg-fate-orange/20 rounded flex items-center justify-center">
                            <span className="text-fate-orange">💭</span>
                        </div>
                        <span className="font-mono text-sm text-fate-text tracking-widest">
                            NEXT MONTH'S STRATEGY
                        </span>
                    </div>

                    <div className="space-y-6">
                        {questions.map((q, idx) => (
                            <div key={idx} className="pb-6 border-b border-fate-gray/30 last:border-0 last:pb-0">
                                <p className="text-white mb-4 text-base leading-relaxed">{q.question}</p>
                                <div className="grid grid-cols-2 gap-3">
                                    {q.choices.map((choice, cIdx) => {
                                        const answer = choice.startsWith('A)') ? 'A' : 'B'
                                        const isSelected = selectedAnswers[idx] === answer
                                        return (
                                            <motion.button
                                                key={cIdx}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => onAnswerSelect(idx, answer)}
                                                className={`px-4 py-3 rounded-lg font-mono text-sm transition-all ${isSelected
                                                    ? 'bg-fate-orange text-black shadow-lg'
                                                    : 'bg-fate-gray text-white hover:bg-fate-gray/70 border border-fate-gray'
                                                    }`}
                                            >
                                                {choice}
                                            </motion.button>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Proceed Button */}
            <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileTap={{ scale: 0.98 }}
                onClick={onProceed}
                disabled={isProceedLoading}
                className={`w-full bg-fate-orange text-black font-bold py-4 rounded-lg font-mono text-sm tracking-wider transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl
                    ${isProceedLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-fate-orange-light'}`}
            >
                {isProceedLoading ? (
                    <>
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        PREPARING NEXT MONTH...
                    </>
                ) : (
                    <>
                        START MONTH {currentMonth + 1}
                        <ChevronRight size={20} />
                    </>
                )}
            </motion.button>
        </div>
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
        updateInsurance,
        applyBehavioralDecisions
    } = useGame()

    const [reflection, setReflection] = useState('')
    const [decisionQuestions, setDecisionQuestions] = useState('')
    const [isLoadingReflection, setIsLoadingReflection] = useState(false)
    const [isProceedLoading, setIsProceedLoading] = useState(false)
    const [selectedAnswers, setSelectedAnswers] = useState([])
    const { userId, displayId } = getUserSession()

    // Load reflection when dashboard loads (month just completed)
    useEffect(() => {
        if (state.isLoaded && isMonthComplete()) {
            loadMonthEndData()
        }
    }, [state.isLoaded])

    // Load monthly reflection and decision questions
    const loadMonthEndData = async () => {
        setIsLoadingReflection(true)
        try {
            // Generate reflection based on user's choices this month
            const reflectionText = await fetchMonthlyReflection(state)
            setReflection(reflectionText)

            // Generate decision questions based on reflection
            const questions = await fetchDecisionQuestions(state, reflectionText)
            setDecisionQuestions(questions)
        } catch (error) {
            console.error('Failed to load month-end data:', error)
            setReflection('This month has been a journey of financial decisions. Your choices have impacted your balance and risk profile.')
            setDecisionQuestions('1. Next month, do you want to:\nA) Be more cautious\nB) Take more risks')
        } finally {
            setIsLoadingReflection(false)
        }
    }

    // Handle proceeding to next month
    const handleProceedToNextMonth = async () => {
        setIsProceedLoading(true)
        try {
            // Apply behavioral decisions from questions if answered
            if (selectedAnswers.length > 0) {
                applyBehavioralDecisions(selectedAnswers)
            }

            // Apply income for new month
            applyIncome()

            // Fetch new scenarios for next month
            const newBatch = await fetchMonthlyScenarios(state)

            // Start new month with new batch
            startNewMonth(newBatch)

            // Reset UI state
            setReflection('')
            setDecisionQuestions('')
            setSelectedAnswers([])

            // Navigate to simulation for next month
            window.location.hash = '#/simulation'
        } catch (error) {
            console.error('Failed to proceed to next month:', error)
            // Still proceed with defaults
            startNewMonth(null)
            window.location.hash = '#/simulation'
        } finally {
            setIsProceedLoading(false)
        }
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
        <div className="h-full flex flex-col">
            {/* Fixed Header */}
            <header className="flex-none flex items-center justify-between px-6 py-4 border-b border-fate-gray/30 bg-black z-20">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-fate-orange rounded flex items-center justify-center font-bold text-black text-lg">
                        F
                    </div>
                    <div>
                        <span className="font-heading text-lg font-bold tracking-wider">FATE</span>
                        <span className="font-mono text-xs text-fate-muted ml-2">// DASHBOARD</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-right mr-4">
                        <div className="font-mono text-xs text-fate-text">MONTH</div>
                        <div className="font-mono text-2xl font-bold text-fate-orange">{String(state.month).padStart(2, '0')}</div>
                    </div>

                    <DataManager />

                    <button
                        onClick={() => window.location.hash = '#/'}
                        className="px-4 py-2 border border-fate-gray rounded font-mono text-xs text-fate-text hover:bg-fate-gray/50 transition-colors"
                    >
                        HOME
                    </button>

                    <button className="w-10 h-10 border border-fate-gray rounded flex items-center justify-center hover:bg-fate-gray/50 transition-colors">
                        <Settings size={18} className="text-fate-text" />
                    </button>
                </div>
            </header>

            {/* Main Content - 3 Column Layout */}
            <div className="flex-1 flex overflow-hidden">
                {/* LEFT SIDEBAR - Fixed, Scrollable */}
                <aside className="w-80 border-r border-fate-gray/30 bg-black flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        {/* User Profile Card */}
                        <div className="bg-fate-card border border-fate-gray/30 rounded-lg p-4 mb-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-fate-gray rounded-lg flex items-center justify-center">
                                    <User size={24} className="text-fate-text" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-mono text-xs text-fate-text">USER ID</div>
                                    <div className="font-mono text-sm text-white truncate">{displayId}</div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-mono text-fate-text">STATUS</span>
                                <span className="font-mono text-fate-orange">STUDENT</span>
                            </div>
                        </div>

                        {/* Balance Card */}
                        <div className="bg-gradient-to-br from-fate-orange/20 to-fate-card border border-fate-orange/30 rounded-lg p-4 mb-4">
                            <div className="flex items-center gap-2 mb-2">
                                <DollarSign size={16} className="text-fate-orange" />
                                <span className="font-mono text-xs text-fate-text">BALANCE</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="font-mono text-3xl font-bold text-white">
                                    ₹{state.balance.toLocaleString()}
                                </span>
                                {state.insuranceOpted && (
                                    <Shield size={20} className="text-fate-orange" />
                                )}
                            </div>
                            <div className="font-mono text-xs text-fate-text mt-1">Available Capital</div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            {/* Savings */}
                            <div className="bg-fate-card border border-fate-gray/30 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <Home size={14} className="text-fate-text" />
                                    <span className="font-mono text-xs text-fate-text">SAVINGS</span>
                                </div>
                                <div className="font-mono text-xl font-bold text-white">
                                    ₹{(state.savings ?? 500).toLocaleString()}
                                </div>
                            </div>

                            {/* Risk Score */}
                            <div className="bg-fate-card border border-fate-gray/30 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle size={14} className="text-fate-text" />
                                    <span className="font-mono text-xs text-fate-text">RISK</span>
                                </div>
                                <div className={`font-mono text-xl font-bold ${getRiskColor(state.riskScore)}`}>
                                    {state.riskScore}/100
                                </div>
                            </div>
                        </div>

                        {/* Risk Progress Bar */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-mono text-xs text-fate-text">RISK EXPOSURE</span>
                                <span className="font-mono text-xs text-fate-text">{state.riskScore}%</span>
                            </div>
                            <div className="h-2 bg-fate-gray rounded-full overflow-hidden">
                                <motion.div
                                    className={`h-full ${getRiskBgColor(state.riskScore)}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${state.riskScore}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                        </div>

                        {/* Strategy Status Card */}
                        {(() => {
                            const strategyStatus = getStrategyStatus(state.modifiers)
                            const colorMap = {
                                red: 'bg-red-500/20 text-red-400 border-red-500/30',
                                orange: 'bg-fate-orange/20 text-fate-orange border-fate-orange/30',
                                yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
                                green: 'bg-green-500/20 text-green-400 border-green-500/30',
                                teal: 'bg-teal-500/20 text-teal-400 border-teal-500/30'
                            }
                            return (
                                <div className={`rounded-lg p-4 mb-6 border ${colorMap[strategyStatus.color]}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-mono text-xs opacity-75">STRATEGY STATUS</span>
                                    </div>
                                    <div className="font-mono text-lg font-bold mb-1">
                                        {strategyStatus.label}
                                    </div>
                                    <div className="font-mono text-xs opacity-75">
                                        {strategyStatus.description}
                                    </div>
                                </div>
                            )
                        })()}

                        {/* Insurance Section */}
                        <div className="bg-fate-card border border-fate-gray/30 rounded-lg p-4 mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Shield size={16} className="text-fate-text" />
                                    <span className="font-mono text-xs text-fate-text">INSURANCE</span>
                                </div>
                                <span className={`font-mono text-xs px-2 py-1 rounded ${state.insuranceOpted
                                    ? 'bg-green-400/20 text-green-400'
                                    : 'bg-fate-gray text-fate-muted'
                                    }`}>
                                    {state.insuranceOpted ? 'ACTIVE' : 'INACTIVE'}
                                </span>
                            </div>
                            {!state.insuranceOpted && (
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleBuyInsurance}
                                    className="w-full bg-fate-orange text-black font-mono text-xs py-2 rounded hover:bg-fate-orange-light transition-colors"
                                >
                                    PURCHASE ₹200
                                </motion.button>
                            )}
                        </div>

                        {/* Quick Stats */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center py-2 border-b border-fate-gray/30">
                                <span className="font-mono text-xs text-fate-text">Total Decisions</span>
                                <span className="font-mono text-sm text-white">{state.history.length}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-fate-gray/30">
                                <span className="font-mono text-xs text-fate-text">Net Worth</span>
                                <span className="font-mono text-sm text-white">₹{(state.balance + state.savings).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* CENTER CONTENT - Scrollable */}
                <main className="flex-1 flex flex-col overflow-hidden bg-black">
                    <div className="flex-none px-8 pt-6 pb-4 border-b border-fate-gray/30">
                        <span className="font-mono text-xs text-fate-text tracking-widest">
                            MONTH {String(state.month).padStart(2, '0')} SUMMARY
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <SummaryPanel
                            reflection={reflection}
                            decisionQuestions={decisionQuestions}
                            isLoading={isLoadingReflection}
                            onProceed={handleProceedToNextMonth}
                            isProceedLoading={isProceedLoading}
                            selectedAnswers={selectedAnswers}
                            onAnswerSelect={(idx, answer) => {
                                const newAnswers = [...selectedAnswers]
                                newAnswers[idx] = answer
                                setSelectedAnswers(newAnswers)
                            }}
                            currentMonth={state.month}
                        />
                    </div>
                </main>

                {/* RIGHT SIDEBAR - Fixed, Scrollable */}
                <aside className="w-96 border-l border-fate-gray/30 bg-black flex flex-col overflow-hidden">
                    <div className="flex-none px-6 py-4 border-b border-fate-gray/30">
                        <span className="font-mono text-xs text-fate-text tracking-widest">
                            IMPACT LOGS
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
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

                    <div className="flex-none p-4 border-t border-fate-gray/30">
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            className="w-full bg-fate-orange text-black font-bold py-3 rounded font-mono text-sm tracking-wider flex items-center justify-center gap-2 hover:bg-fate-orange-light transition-colors"
                        >
                            VIEW ARCHIVE
                            <ChevronRight size={16} />
                        </motion.button>
                    </div>
                </aside>
            </div>
        </div>
    )
}

export default function Dashboard() {
    return (
        <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
            <DashboardContent />
        </div>
    )
}
