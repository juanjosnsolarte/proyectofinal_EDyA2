import { AppRoutes } from './routes/AppRoutes'
import { ThemeProvider } from './context/ThemeContext'
import ThemeToggle from './components/Shared/ThemeToggle'

function App() {
  return (
    <ThemeProvider>

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

      <AppRoutes />
    </ThemeProvider>
  )
}

export default App
