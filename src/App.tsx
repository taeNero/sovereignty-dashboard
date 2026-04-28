import Dashboard from './components/Dashboard'
import AuthGate from './components/AuthGate'
import ErrorBoundary from './components/ErrorBoundary'

export default function App() {
  return (
    <ErrorBoundary>
      <AuthGate>
        <Dashboard />
      </AuthGate>
    </ErrorBoundary>
  )
}
