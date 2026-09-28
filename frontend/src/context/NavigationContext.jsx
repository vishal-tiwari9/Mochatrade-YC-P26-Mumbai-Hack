import React, { createContext, useContext, useState, useEffect } from "react"

const NavigationContext = createContext({
  activePage: "landing",
  navigate: () => null,
})

const VALID_PAGES = [
  "landing",
  "dashboard",
  "exposure",
  "risk-analysis",
  "scenarios",
  "hedge-advisor",
  "charts",
  "alerts",
  "reports",
  "settings",
]

function getPageFromUrl() {
  if (typeof window === "undefined") return "landing"

  // 1. Check hash first if present (e.g., /#reports, /#dashboard)
  const hash = window.location.hash.replace(/^#\/?/, "").toLowerCase()
  if (hash) {
    if (hash === "landing") return "landing"
    if (VALID_PAGES.includes(hash)) return hash
  }

  // 2. Check pathname (e.g., /, /dashboard, /exposure)
  const path = window.location.pathname.replace(/^\/+/, "").replace(/\/+$/, "").toLowerCase()
  if (path === "" || path === "landing") {
    return "landing"
  }
  if (VALID_PAGES.includes(path)) {
    return path
  }

  // Fallback to landing if unknown
  return "landing"
}

export function NavigationProvider({ children }) {
  const [activePage, setActivePage] = useState(getPageFromUrl)

  useEffect(() => {
    const handleLocationChange = () => {
      setActivePage(getPageFromUrl())
    }

    window.addEventListener("popstate", handleLocationChange)
    window.addEventListener("hashchange", handleLocationChange)
    return () => {
      window.removeEventListener("popstate", handleLocationChange)
      window.removeEventListener("hashchange", handleLocationChange)
    }
  }, [])

  const navigate = (pageId) => {
    const normalized = pageId.toLowerCase().replace(/^\/+/, "").replace(/\s+/g, "-")
    const targetPage = VALID_PAGES.includes(normalized) ? normalized : "landing"
    const targetUrl = targetPage === "landing" ? "/" : `/${targetPage}`

    setActivePage(targetPage)

    if (window.location.pathname !== targetUrl || window.location.hash) {
      window.history.pushState(null, "", targetUrl)
    }
  }

  return (
    <NavigationContext.Provider value={{ activePage, navigate }}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error("useNavigation must be used within a NavigationProvider")
  }
  return context
}
