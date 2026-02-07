import { useState, useEffect } from 'react'
import { getUserSession, getPreferences } from '../utils/session'
import LoginPage from '../pages/LoginPage'
import SignupPage from '../pages/SignupPage'
import UsernameSetup from '../pages/UsernameSetup'

/**
 * AuthGate component handles routing based on session state:
 * - No session → Landing Page
 * - No preferences → Preferences Setup
 * - Has preferences → Dashboard
 */
export default function AuthGate({
    LandingComponent,
    SetupComponent,
    DashboardComponent,
    SimulationComponent
}) {
    const [authState, setAuthState] = useState('loading')
    const [session, setSession] = useState(null)
    const [currentRoute, setCurrentRoute] = useState('')

    useEffect(() => {
        // Get hash route
        const handleHashChange = () => {
            setCurrentRoute(window.location.hash)
        }

        handleHashChange()
        window.addEventListener('hashchange', handleHashChange)
        return () => window.removeEventListener('hashchange', handleHashChange)
    }, [])

    useEffect(() => {
        // Check session and preferences
        const userSession = getUserSession()
        setSession(userSession)

        const preferences = getPreferences(userSession.userId)

        if (!preferences) {
            setAuthState('needs-setup')
        } else {
            setAuthState('authenticated')
        }
    }, [])

    // Handle explicit routes first
    if (currentRoute === '#/login') {
        return <LoginPage />
    }

    if (currentRoute === '#/signup') {
        return <SignupPage />
    }

    if (currentRoute === '#/username-setup') {
        return <UsernameSetup />
    }

    if (currentRoute === '#/setup') {
        return <SetupComponent />
    }

    if (currentRoute === '#/simulation') {
        return <SimulationComponent />
    }

    if (currentRoute === '#/dashboard') {
        return <DashboardComponent />
    }

    // Handle root route based on auth state
    if (authState === 'loading') {
        return (
            <div className="min-h-screen bg-fate-black flex items-center justify-center">
                <div className="text-fate-orange font-mono text-sm tracking-wider">
                    INITIALIZING FATE...
                </div>
            </div>
        )
    }

    // No hash route - show landing for guests or needs-setup
    if (currentRoute === '' || currentRoute === '#/') {
        if (authState === 'needs-setup') {
            return <LandingComponent onStart={() => window.location.hash = '#/setup'} />
        }
        if (authState === 'authenticated') {
            return <LandingComponent onStart={() => window.location.hash = '#/dashboard'} />
        }
        return <LandingComponent onStart={() => window.location.hash = '#/setup'} />
    }

    // Fallback
    return <LandingComponent onStart={() => window.location.hash = '#/setup'} />
}
