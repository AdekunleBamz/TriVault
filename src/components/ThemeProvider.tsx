'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useLocalStorage } from '@/hooks'
import { STORAGE_KEYS } from '@/lib/constants'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: Theme
}

export function ThemeProvider({ children, defaultTheme = 'dark' }: ThemeProviderProps) {
  const [theme, setTheme] = useLocalStorage<Theme>(STORAGE_KEYS.theme, defaultTheme)
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark')

  useEffect(() => {
    const root = document.documentElement
    
    // Determine the resolved theme
    let resolved: 'light' | 'dark' = 'dark'
    
    if (theme === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    } else {
      resolved = theme
    }
    
    setResolvedTheme(resolved)
    
    // Apply theme class
    root.classList.remove('light', 'dark')
    root.classList.add(resolved)
    
    // Update color-scheme
    root.style.colorScheme = resolved
  }, [theme])

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      setResolvedTheme(e.matches ? 'dark' : 'light')
      document.documentElement.classList.remove('light', 'dark')
      document.documentElement.classList.add(e.matches ? 'dark' : 'light')
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
