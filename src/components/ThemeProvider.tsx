'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { DEFAULT_THEME, THEME_STORAGE_KEY, isThemeId, type ThemeId } from '@/lib/themes'

// Two independent choices, both kept in this browser only:
//   theme   — light or dark mode (the sun/moon button)
//   palette — the colour theme: Grace, Beloved, Abide or Stillness
// Neither touches the session or any saved data; they only set attributes on <html>.

const ThemeContext = createContext<{
  theme: 'light' | 'dark'
  toggle: () => void
  palette: ThemeId
  setPalette: (id: ThemeId) => void
}>({ theme: 'light', toggle: () => {}, palette: DEFAULT_THEME, setPalette: () => {} })

// Storage can be unavailable (private windows, blocked site data); the site
// must still work, just without remembering the choice.
function read(key: string) {
  try { return localStorage.getItem(key) } catch { return null }
}
function write(key: string, value: string) {
  try { localStorage.setItem(key, value) } catch {}
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [palette, setPaletteState] = useState<ThemeId>(DEFAULT_THEME)

  useEffect(() => {
    const stored = read('theme') as 'light' | 'dark' | null
    const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const resolved = stored ?? preferred
    setTheme(resolved)
    document.documentElement.classList.toggle('dark', resolved === 'dark')

    const p = read(THEME_STORAGE_KEY)
    const id = isThemeId(p) ? p : DEFAULT_THEME
    setPaletteState(id)
    document.documentElement.setAttribute('data-theme', id)
  }, [])

  const toggle = () => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light'
      write('theme', next)
      document.documentElement.classList.toggle('dark', next === 'dark')
      return next
    })
  }

  const setPalette = useCallback((id: ThemeId) => {
    setPaletteState(id)
    write(THEME_STORAGE_KEY, id)
    document.documentElement.setAttribute('data-theme', id)
  }, [])

  return <ThemeContext.Provider value={{ theme, toggle, palette, setPalette }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
