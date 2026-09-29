import React, { createContext, useContext, useState } from "react"

const AppContext = createContext()

export function AppProvider({ children }) {
  const [liveExposures, setLiveExposures] = useState([])
  const [liveRiskScore, setLiveRiskScore] = useState(null)
  const [liveRiskLevel, setLiveRiskLevel] = useState(null)
  const [liveVolatility, setLiveVolatility] = useState(null)
  const [liveMitigation, setLiveMitigation] = useState(null)
  
  const value = {
    liveExposures, setLiveExposures,
    liveRiskScore, setLiveRiskScore,
    liveRiskLevel, setLiveRiskLevel,
    liveVolatility, setLiveVolatility,
    liveMitigation, setLiveMitigation
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => useContext(AppContext)
