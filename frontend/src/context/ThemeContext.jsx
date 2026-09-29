import React, { createContext, useContext, useEffect, useState } from "react"

const ThemeContext = createContext({
  theme: "dark",
  setTheme: () => null,
  toggleTheme: () => null,
})

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    // Read preference from localStorage, default to 'dark'
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("hedgemind_theme")
      if (stored === "light" || stored === "dark") {
        return stored
      }
    }
    return "dark"
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === "dark") {
      root.classList.add("dark")
      root.classList.remove("light")
    } else {
      root.classList.remove("dark")
      root.classList.add("light")
    }
    try {
      localStorage.setItem("hedgemind_theme", theme)
    } catch (e) {
      console.warn("Unable to persist theme to localStorage", e)
    }
  }, [theme])

  const setTheme = (newTheme) => {
    if (newTheme === "light" || newTheme === "dark") {
      setThemeState(newTheme)
    }
  }

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"))
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
