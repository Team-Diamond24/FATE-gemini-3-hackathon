import { createContext, useContext, useReducer, useEffect } from 'react'
import { getUserSession, saveGameState, getGameState } from '../utils/session'

// Initial state
const initialState = {
    month: 1,
    balance: 24000,
    history: [],
    riskExposure: 0,
    stressLevel: 30,
    fortuneIndex: 60,
    isLoaded: false
}

// Reducer
function gameReducer(state, action) {
    switch (action.type) {
        case 'HYDRATE':
            return { ...action.payload, isLoaded: true }

        case 'PROCESS_CHOICE_RESULT':
            return {
                ...state,
                ...action.payload.updatedState,
                history: [
                    ...state.history,
                    {
                        timestamp: new Date().toISOString(),
                        month: state.month,
                        narrative: action.payload.narrative,
                        reflection: action.payload.reflection,
                        balanceChange: action.payload.updatedState.balance - state.balance
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
                        timestamp: new Date().toISOString(),
                        month: state.month,
                        amount: action.payload.amount,
                        description: action.payload.description,
                        icon: action.payload.icon
                    }
                ]
            }

        case 'RESET':
            return { ...initialState, isLoaded: true }

        default:
            return state
    }
}

// Context
const GameContext = createContext(null)
const GameDispatchContext = createContext(null)

// Provider
export function GameProvider({ children }) {
    const [state, dispatch] = useReducer(gameReducer, initialState)

    // Hydrate state from localStorage on mount
    useEffect(() => {
        const { userId } = getUserSession()
        const savedState = getGameState(userId)

        if (savedState) {
            dispatch({ type: 'HYDRATE', payload: savedState })
        } else {
            dispatch({ type: 'HYDRATE', payload: initialState })
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
