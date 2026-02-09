import { createContext, useContext, useReducer, useEffect, useState } from 'react'
import { getUserSession } from '../utils/session'
import { saveUserData, loadUserData } from '../engine/persistence'
import {
    initializeGameState,
    applyChoice as engineApplyChoice,
    applyIncome as engineApplyIncome,
    finalizeMonth as engineFinalizeMonth,
    applyBehavioralDecisions,
    initializeModifiers,
    advanceScenarioIndex,
    isMonthComplete,
    getCurrentScenario,
    depositToSavings as engineDepositToSavings,
    withdrawFromSavings as engineWithdrawFromSavings,
    startInsurance as engineStartInsurance,
    cancelInsurance as engineCancelInsurance,
    deductInsurancePremium as engineDeductInsurancePremium,
    startFixedDeposit as engineStartFixedDeposit,
    startMutualFund as engineStartMutualFund,
    updateInvestments as engineUpdateInvestments
} from '../engine/gameEngine'

/**
 * Create initial state using engine's initializeGameState
 * @param {string} userId 
 * @returns {Object} Initial game state with isLoaded flag
 */
function createInitialState(userId = 'default_user') {
    return {
        ...initializeGameState(userId),
        isLoaded: false
    }
}

// Initial state placeholder (will be hydrated on mount)
const initialState = createInitialState()

/**
 * Game state reducer - uses engine functions for immutable state updates
 */
function gameReducer(state, action) {
    switch (action.type) {
        case 'HYDRATE':
            return { ...action.payload, isLoaded: true }

        case 'INITIALIZE':
            // Initialize fresh state for a user
            return {
                ...initializeGameState(action.payload.userId),
                isLoaded: true
            }

        case 'APPLY_CHOICE': {
            // Apply a choice using the engine function
            // action.payload should be a Choice object: { balanceChange, riskChange, savingsChange?, description?, isInsurance? }
            const newState = engineApplyChoice(state, action.payload)
            return newState
        }

        case 'ADVANCE_SCENARIO': {
            // Advance to next scenario in the current batch
            const newBatch = advanceScenarioIndex(state.currentBatch)
            return {
                ...state,
                currentBatch: newBatch
            }
        }

        case 'APPLY_INCOME': {
            // Apply monthly income (default or custom)
            const income = action.payload?.income
            const newState = income
                ? engineApplyIncome(state, income)
                : engineApplyIncome(state)
            return newState
        }

        case 'FINALIZE_MONTH': {
            // Save current month's state to history
            return engineFinalizeMonth(state)
        }

        case 'START_NEW_MONTH': {
            // Increment month and set new batch
            return {
                ...state,
                month: state.month + 1,
                currentBatch: action.payload?.batch || null
            }
        }

        case 'SET_BATCH': {
            // Set the current scenario batch
            return {
                ...state,
                currentBatch: action.payload
            }
        }

        case 'APPLY_BEHAVIORAL_DECISIONS': {
            // Apply behavioral decisions from monthly strategy (cumulative effects)
            // action.payload should be an array of answers: ['A', 'B', 'A'] etc.
            return applyBehavioralDecisions(state, action.payload)
        }

        case 'INITIALIZE_MODIFIERS': {
            // Initialize modifiers from initial preferences (floor/ceiling calibration)
            // action.payload should be { primaryDrive: string, riskLevel: string }
            return initializeModifiers(state, action.payload)
        }

        case 'UPDATE_INSURANCE': {
            // Toggle or set insurance status
            return {
                ...state,
                insuranceOpted: action.payload ?? !state.insuranceOpted
            }
        }

        case 'DEPOSIT_TO_SAVINGS': {
            // Deposit money from balance to savings
            return engineDepositToSavings(state, action.payload)
        }

        case 'WITHDRAW_FROM_SAVINGS': {
            // Withdraw money from savings to balance
            return engineWithdrawFromSavings(state, action.payload)
        }

        case 'START_INSURANCE': {
            // Start insurance with monthly premium
            return engineStartInsurance(state, action.payload)
        }

        case 'CANCEL_INSURANCE': {
            // Cancel active insurance
            return engineCancelInsurance(state)
        }

        case 'DEDUCT_INSURANCE_PREMIUM': {
            // Deduct monthly insurance premium
            return engineDeductInsurancePremium(state)
        }

        case 'START_FD': {
            // Start a fixed deposit
            return engineStartFixedDeposit(state, action.payload)
        }

        case 'START_MF': {
            // Start a mutual fund investment
            return engineStartMutualFund(state, action.payload)
        }

        case 'UPDATE_INVESTMENTS': {
            // Update investment values (FD maturity, MF returns)
            return engineUpdateInvestments(state)
        }

        case 'RESET':
            return { ...createInitialState(state.userId), isLoaded: true }

        // Legacy action support for backward compatibility during migration
        case 'PROCESS_CHOICE_RESULT':
            // Map legacy action to engine state shape
            return {
                ...state,
                balance: action.payload.updatedState.balance ?? state.balance,
                riskScore: action.payload.updatedState.riskExposure ?? action.payload.updatedState.riskScore ?? state.riskScore,
                history: [
                    ...state.history,
                    {
                        type: 'choice',
                        month: state.month,
                        balanceChange: (action.payload.updatedState.balance ?? state.balance) - state.balance,
                        description: action.payload.narrative,
                        timestamp: Date.now()
                    }
                ]
            }

        case 'NEXT_MONTH':
            return {
                ...state,
                month: state.month + 1
            }

        case 'ADD_IMPACT':
            return {
                ...state,
                balance: state.balance + action.payload.amount,
                history: [
                    ...state.history,
                    {
                        type: 'impact',
                        month: state.month,
                        balanceChange: action.payload.amount,
                        description: action.payload.description,
                        icon: action.payload.icon,
                        timestamp: Date.now()
                    }
                ]
            }

        default:
            return state
    }
}

// Context
const GameContext = createContext(null)
const GameDispatchContext = createContext(null)

/**
 * GameProvider component - wraps app and provides game state
 */
export function GameProvider({ children }) {
    const [state, dispatch] = useReducer(gameReducer, initialState)
    const [isHydrating, setIsHydrating] = useState(true)

    // Hydrate state from persistence on mount (async)
    useEffect(() => {
        async function hydrateState() {
            try {
                const { userId } = getUserSession()
                const savedState = await loadUserData(userId)

                if (savedState) {
                    // Ensure saved state has all required fields
                    const hydratedState = {
                        ...createInitialState(userId),
                        ...savedState,
                        isLoaded: true
                    }
                    console.log('Game State Hydrated from persistence:', hydratedState)
                    dispatch({ type: 'HYDRATE', payload: hydratedState })
                } else {
                    // Initialize fresh state for this user
                    const freshState = createInitialState(userId)
                    console.log('Game State Initialized (fresh):', freshState)
                    dispatch({ type: 'HYDRATE', payload: freshState })
                }
            } catch (error) {
                console.error('Failed to hydrate game state:', error)
                // Initialize with default state on error
                const freshState = createInitialState()
                dispatch({ type: 'HYDRATE', payload: freshState })
            } finally {
                setIsHydrating(false)
            }
        }
        hydrateState()
    }, [])

    // Persist state to persistence on every change (async)
    useEffect(() => {
        async function persistState() {
            if (state.isLoaded && !isHydrating) {
                try {
                    const { userId } = getUserSession()
                    await saveUserData(userId, state)
                } catch (error) {
                    console.error('Failed to persist game state:', error)
                }
            }
        }
        persistState()
    }, [state, isHydrating])

    return (
        <GameContext.Provider value={state}>
            <GameDispatchContext.Provider value={dispatch}>
                {children}
            </GameDispatchContext.Provider>
        </GameContext.Provider>
    )
}

// Hooks
export function useGameState() {
    const context = useContext(GameContext)
    if (context === null) {
        throw new Error('useGameState must be used within a GameProvider')
    }
    return context
}

export function useGameDispatch() {
    const context = useContext(GameDispatchContext)
    if (context === null) {
        throw new Error('useGameDispatch must be used within a GameProvider')
    }
    return context
}

// Helper hook for common game operations
export function useGame() {
    const state = useGameState()
    const dispatch = useGameDispatch()

    return {
        state,
        dispatch,
        // Helper functions
        applyChoice: (choice) => dispatch({ type: 'APPLY_CHOICE', payload: choice }),
        advanceScenario: () => dispatch({ type: 'ADVANCE_SCENARIO' }),
        applyIncome: (income) => dispatch({ type: 'APPLY_INCOME', payload: { income } }),
        finalizeMonth: () => dispatch({ type: 'FINALIZE_MONTH' }),
        startNewMonth: (batch) => dispatch({ type: 'START_NEW_MONTH', payload: { batch } }),
        setBatch: (batch) => dispatch({ type: 'SET_BATCH', payload: batch }),
        applyBehavioralDecisions: (answers) => dispatch({ type: 'APPLY_BEHAVIORAL_DECISIONS', payload: answers }),
        updateInsurance: (opted) => dispatch({ type: 'UPDATE_INSURANCE', payload: opted }),
        depositToSavings: (amount) => dispatch({ type: 'DEPOSIT_TO_SAVINGS', payload: amount }),
        withdrawFromSavings: (amount) => dispatch({ type: 'WITHDRAW_FROM_SAVINGS', payload: amount }),
        startInsurance: (data) => dispatch({ type: 'START_INSURANCE', payload: data }),
        cancelInsurance: () => dispatch({ type: 'CANCEL_INSURANCE' }),
        deductInsurancePremium: () => dispatch({ type: 'DEDUCT_INSURANCE_PREMIUM' }),
        startFD: (data) => dispatch({ type: 'START_FD', payload: data }),
        startMF: (data) => dispatch({ type: 'START_MF', payload: data }),
        updateInvestments: () => dispatch({ type: 'UPDATE_INVESTMENTS' }),
        reset: () => dispatch({ type: 'RESET' }),
        // Getters
        getCurrentScenario: () => getCurrentScenario(state.currentBatch),
        isMonthComplete: () => isMonthComplete(state.currentBatch)
    }
}
