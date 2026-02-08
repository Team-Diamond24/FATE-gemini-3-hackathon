import { useState, useEffect } from 'react'
import { useGame } from '../context/GameContext'
import { fetchMonthlyScenarios } from '../services/api'

function SimulationContent() {
    const {
        state,
        applyChoice,
        advanceScenario,
        applyIncome,
        finalizeMonth,
        startNewMonth,
        setBatch,
        getCurrentScenario,
        isMonthComplete
    } = useGame()

    const [scenario, setScenario] = useState(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [loadError, setLoadError] = useState(null)

    // Load scenarios when state is ready
    useEffect(() => {
        async function loadScenarios() {
            if (!state.isLoaded) return

            // If we have a batch with current scenario, use it
            if (state.currentBatch) {
                const current = getCurrentScenario()
                if (current) {
                    setScenario(current)
                    return
                }
            }

            // Otherwise fetch new scenarios for this month
            try {
                setLoadError(null)
                console.log('Fetching scenarios for month:', state.month)
                const batch = await fetchMonthlyScenarios(state)
                console.log('Received batch:', batch)
                setBatch(batch)

                // Get current scenario from the new batch
                if (batch && batch.scenarios && batch.scenarios.length > 0) {
                    setScenario(batch.scenarios[0])
                }
            } catch (error) {
                console.error('Failed to load scenarios:', error)
                setLoadError('Failed to load scenarios. Please try again.')
            }
        }
        loadScenarios()
    }, [state.isLoaded, state.month])

    const handleChoice = async (choice) => {
        setIsProcessing(true)

        // Simulate small delay for UX
        await new Promise(resolve => setTimeout(resolve, 300))

        // Build Choice object expected by engine
        // The choice from scenario has: id, label, balanceChange, riskChange
        const engineChoice = {
            balanceChange: choice.balanceChange || 0,
            riskChange: choice.riskChange || 0,
            savingsChange: choice.savingsChange || 0,
            description: choice.label || '',
            isInsurance: choice.isInsurance || false
        }

        console.log('Applying choice:', engineChoice)

        // Apply the choice using engine function
        applyChoice(engineChoice)
        advanceScenario()

        // Check if month is complete after advancing
        // Need to check after the dispatch is processed
        setTimeout(() => {
            const monthDone = isMonthComplete()
            console.log('Month complete?', monthDone)

            if (monthDone) {
                // Month is complete - finalize and go to dashboard for reflection
                finalizeMonth()
                
                // Navigate to dashboard to show month-end report
                window.location.hash = '#/dashboard'
            } else {
                // Get next scenario from batch
                const nextScenario = getCurrentScenario()
                console.log('Next scenario:', nextScenario)
                setScenario(nextScenario)
            }

            setIsProcessing(false)
        }, 100)
    }

    // Loading state
    if (!state.isLoaded) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-fate-orange font-mono text-sm tracking-wider animate-pulse">
                    INITIALIZING SIMULATION...
                </div>
            </div>
        )
    }

    // Error state
    if (loadError) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center flex-col gap-4">
                <div className="text-red-500 font-mono text-sm">
                    {loadError}
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 border border-fate-orange text-fate-orange font-mono text-sm hover:bg-fate-orange hover:text-black transition-colors"
                >
                    RETRY
                </button>
            </div>
        )
    }

    // Loading scenario state
    if (!scenario) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-fate-orange font-mono text-sm tracking-wider animate-pulse">
                    LOADING SCENARIO...
                </div>
            </div>
        )
    }

    // Get the display text - scenarios from generator use 'situation', fallback UI uses 'text'
    const displayText = scenario.situation || scenario.text || 'Make a choice...'

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            {/* Header */}
            <header className="p-6 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-fate-orange rounded flex items-center justify-center font-bold text-black">
                        F
                    </div>
                    <span className="font-mono text-sm text-fate-text tracking-wider">FATE</span>
                    <span className="font-mono text-sm text-fate-muted">MONTH {String(state.month).padStart(2, '0')}</span>
                </div>
                <div className="font-mono text-right">
                    <div className="text-3xl font-bold">₹{state.balance.toLocaleString('en-IN')}</div>
                    <div className="text-xs text-fate-text tracking-widest">CURRENT LIQUIDITY</div>
                </div>
            </header>

            {/* Main Content - Centered Scenario */}
            <main className="flex-1 flex items-center justify-center px-8">
                <div className="max-w-3xl text-center">
                    <h1
                        className="font-heading text-3xl md:text-5xl font-bold leading-tight mb-12"
                        dangerouslySetInnerHTML={{ __html: displayText }}
                    />

                    <div className="flex flex-wrap justify-center gap-4">
                        {scenario.choices && scenario.choices.map((choice) => (
                            <button
                                key={choice.id}
                                onClick={() => handleChoice(choice)}
                                disabled={isProcessing}
                                className={`px-8 py-4 rounded-full border-2 border-white/30 font-mono text-sm tracking-wider transition-all
                  ${isProcessing
                                        ? 'opacity-50 cursor-not-allowed'
                                        : 'hover:bg-white hover:text-black hover:border-white'
                                    }`}
                            >
                                {choice.label}
                                {choice.balanceChange !== 0 && (
                                    <span className={`ml-2 ${choice.balanceChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        ({choice.balanceChange > 0 ? '+' : ''}{choice.balanceChange})
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="p-6 flex justify-between items-center border-t border-fate-gray/30">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => window.location.hash = '#/dashboard'}
                        className="w-10 h-10 border border-fate-gray rounded-full flex items-center justify-center hover:bg-fate-gray transition-colors"
                    >
                        ←
                    </button>
                    <div className="flex items-center gap-2">
                        {[1, 2, 3].map((num) => (
                            <span
                                key={num}
                                className={`font-mono text-sm ${num === ((state.month - 1) % 3) + 1
                                    ? 'text-white font-bold'
                                    : 'text-fate-muted'
                                    }`}
                            >
                                {String(num).padStart(2, '0')}
                            </span>
                        ))}
                    </div>
                    <button className="w-10 h-10 border border-fate-gray rounded-full flex items-center justify-center hover:bg-fate-gray transition-colors">
                        →
                    </button>
                </div>

                <div className="flex items-center gap-8 text-xs font-mono text-fate-muted">
                    <span>PRIVACY POLICY</span>
                    <span>VARIANT {((state.month - 1) % 3) + 1} OF 3</span>
                    <span>TERMS OF FATE</span>
                </div>
            </footer>
        </div>
    )
}

export default function Simulation() {
    return <SimulationContent />
}
