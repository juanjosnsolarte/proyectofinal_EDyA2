import { createContext, useState, useEffect } from 'react'

export const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('theme')
      if (saved === 'light' || saved === 'dark') {
        return saved
      }
    } catch (e) {
      console.error('Error leyendo theme de localStorage', e)
    }
    return 'dark'
  })

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))
  }

  useEffect(() => {
    try {
      localStorage.setItem('theme', theme)
    } catch (e) {
      console.error('Error guardando theme en localStorage', e)
    }

    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const value = {
    theme,
    toggleTheme,
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}
