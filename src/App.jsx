import AuthGate from './components/AuthGate'
import LandingPage from './components/LandingPage'
import PreferencesSetup from './pages/PreferencesSetup'
import Dashboard from './pages/Dashboard'
import Simulation from './pages/Simulation'

function App() {
  return (
    <AuthGate
      LandingComponent={LandingPage}
      SetupComponent={PreferencesSetup}
      DashboardComponent={Dashboard}
      SimulationComponent={Simulation}
    />
  )
}

export default App
