import { createContext, useContext, useReducer, useEffect } from 'react'
import { getUserSession, saveGameState, getGameState } from '../utils/session'
import {
    initializeGameState,
    applyChoice as engineApplyChoice,
    applyIncome as engineApplyIncome,
    finalizeMonth as engineFinalizeMonth,
    applyBehavioralDecisions,
    advanceScenarioIndex,
    isMonthComplete,
    getCurrentScenario
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
            // Apply behavioral decisions from preferences setup
            // action.payload should be an array of answers: ['A', 'B', 'A'] etc.
            return applyBehavioralDecisions(state, action.payload)
        }

        case 'UPDATE_INSURANCE': {
            // Toggle insurance status
            return {
                ...state,
                insuranceOpted: action.payload ?? !state.insuranceOpted
            }
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

    // Hydrate state from localStorage on mount
    useEffect(() => {
        const { userId } = getUserSession()
        const savedState = getGameState(userId)

        if (savedState) {
            // Ensure saved state has all required fields
            const hydratedState = {
                ...createInitialState(userId),
                ...savedState,
                isLoaded: true  // Ensure isLoaded is set
            }
            console.log('Game State Hydrated from localStorage:', hydratedState)
            dispatch({ type: 'HYDRATE', payload: hydratedState })
        } else {
            // Initialize fresh state for this user
            const freshState = createInitialState(userId)
            console.log('Game State Initialized (fresh):', freshState)
            dispatch({ type: 'HYDRATE', payload: freshState })
        }
    }, [])

    // Persist state to localStorage on every change
    useEffect(() => {
        if (state.isLoaded) {
            const { userId } = getUserSession()
            saveGameState(userId, state)
        }
    }, [state])

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
        reset: () => dispatch({ type: 'RESET' }),
        // Getters
        getCurrentScenario: () => getCurrentScenario(state.currentBatch),
        isMonthComplete: () => isMonthComplete(state.currentBatch)
    }
}
