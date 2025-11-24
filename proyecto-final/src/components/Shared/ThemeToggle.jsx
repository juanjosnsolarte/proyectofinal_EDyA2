import { useContext } from 'react'
import { ThemeContext } from '../../context/ThemeContext'

function ThemeToggle() {
  const { theme, toggleTheme } = useContext(ThemeContext)

  return (
    <button onClick={toggleTheme}>
      Cambiar a modo {theme === 'dark' ? 'claro' : 'oscuro'}
    </button>
  )
}

export default ThemeToggle
