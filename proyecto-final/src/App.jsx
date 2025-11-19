import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import ThemeToggle from './components/Shared/ThemeToggle'
import AuthObserver from './components/Auth/AuthObserver'
import { AppRoutes } from './routes/AppRoutes'
import { logoutFirebase } from './store/slices/auth/thunks'

function App() {
  const dispatch = useDispatch()
  const { status } = useSelector(state => state.auth)
  const location = useLocation()

  // No mostramos nada de botones mientras está verificando la sesión
  const showToggle = status !== 'checking'

  const isPrivateRoute =
    location.pathname.startsWith('/feed') ||
    location.pathname.startsWith('/profile')

  return (
    <ThemeProvider>
      {showToggle && (
        <div
          style={{
            position: 'fixed',
            top: '1rem',
            right: '1rem',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <ThemeToggle />

          {isPrivateRoute && (
            <button
              onClick={() => dispatch(logoutFirebase())}
              style={{
                background: 'transparent',
                color: 'var(--primary)',
                border: '1px solid var(--primary)',
                padding: '0.4rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              Cerrar sesión
            </button>
          )}
        </div>
      )}

      <AuthObserver>
        <AppRoutes />
      </AuthObserver>
    </ThemeProvider>
  )
}

export default App
