import React from "react"
import { DashboardBentoGrid } from "./DashboardBentoGrid"
import { Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigation } from "@/context/NavigationContext"

export function Dashboard({ exposures = [], riskScore = null, volatility = null }) {
  const { navigate } = useNavigation()
  const hasData = exposures && exposures.length > 0 && riskScore !== null

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <div className="h-16 w-16 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-4 border border-blue-100 dark:border-blue-800/50">
          <Sparkles className="h-8 w-8 text-blue-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Exposures Analyzed</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
          Upload and analyze your CSV or Excel exposure data in the Exposure workspace to see your live risk dashboard.
        </p>
        <Button 
          onClick={() => navigate('exposure')}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2 font-medium"
        >
          Go to Exposure Workspace
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <DashboardBentoGrid 
        exposures={exposures} 
        riskScore={riskScore} 
        volatility={volatility} 
      />
    </div>
  )
}

export default Dashboard
