"use client"

import * as React from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: 'light'
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "ypf-theme",
}: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<Theme>(() => {
    if (typeof window === "undefined") return defaultTheme
    return (localStorage.getItem(storageKey) as Theme) || defaultTheme
  })

  // Aplica clase al <html>
  const applyThemeClass = React.useCallback((t: Exclude<Theme, "system">) => {
    const root = document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(t)
  }, [])

  // Aplica según theme actual
  React.useEffect(() => {
    if (typeof window === "undefined") return
    if (theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      applyThemeClass(prefersDark ? "dark" : "light")
    } else {
      applyThemeClass(theme)
    }
  }, [theme, applyThemeClass])

  // Escucha cambios del sistema cuando theme === "system"
  React.useEffect(() => {
    if (typeof window === "undefined" || theme !== "system") return
    const mql = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = () => applyThemeClass(mql.matches ? "dark" : "light")
    mql.addEventListener("change", handler)
    return () => mql.removeEventListener("change", handler)
  }, [theme, applyThemeClass])

  const value = {
    theme,
    setTheme: (t: Theme) => {
      localStorage.setItem(storageKey, t)
      setTheme(t)
    },
  }

  return <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext)
  if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider")
  return context
}
