import { AppRoutes } from './routes/AppRoutes'
import { ThemeProvider } from './context/ThemeContext'
import ThemeToggle from './components/Shared/ThemeToggle'
import AuthObserver from './components/Auth/AuthObserver'
import { useSelector } from 'react-redux'

function App() {
  const { status } = useSelector(state => state.auth)

  const showToggle = status !== 'checking'

  return (
    <ThemeProvider>
      {showToggle && (
        <div
          style={{
            position: 'fixed',
            top: '1rem',
            right: '1rem',
            zIndex: 9999,
          }}
        >
          <ThemeToggle />
        </div>
      )}

      <AuthObserver>
        <AppRoutes />
      </AuthObserver>
    </ThemeProvider>
  )
}

export default App
