import React from "react"
import { HeroContent } from "@/components/landing/HeroContent"
import { Hero3D } from "@/components/landing/Hero3D"
import { TheProblemSection } from "@/components/landing/TheProblemSection"
import { TraditionalWorkflowSection } from "@/components/landing/TraditionalWorkflowSection"
import { IntroduceHedgeMindSection } from "@/components/landing/IntroduceHedgeMindSection"
import { WorkflowSection } from "@/components/landing/WorkflowSection"
import { WhatMakesDifferentSection } from "@/components/landing/WhatMakesDifferentSection"
import { ScenarioDemoSection } from "@/components/landing/ScenarioDemoSection"
import { ProductEcosystemSection } from "@/components/landing/ProductEcosystemSection"
import { TargetUsersSection } from "@/components/landing/TargetUsersSection"
import { FinalCTASection } from "@/components/landing/FinalCTASection"

/**
 * LandingPage - HedgeMind Full Scrollable Product Experience
 * Root route: /
 * Storytelling structure:
 * 1. Hero (HedgeMind + 3D Financial Engine + Single CTA)
 * 2. Problem (Financial Risk Is Harder Than It Looks)
 * 3. Traditional Workflow (The Problem With Traditional Risk Management)
 * 4. Introduce HedgeMind (SEE · SIMULATE · DECIDE)
 * 5. Workflow (From Exposure to Decision - 01 to 05)
 * 6. Differentiators (What Makes HedgeMind Different - Bento Grid)
 * 7. Scenario Example (Ask What Happens Before It Happens)
 * 8. Product Ecosystem (One Financial Risk Command Center)
 * 9. Target Users (Built for Teams Managing Financial Risk)
 * 10. Final CTA (See Your Financial Risk Differently + Single CTA)
 */
export function LandingPage() {
  return (
    <main className="relative min-h-screen w-full bg-[#050816] text-[#F8FAFC] overflow-x-hidden selection:bg-blue-600 selection:text-white">
      {/* Background Ambience & Atmospheric Depth */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        {/* Subtle top-left soft blue glow */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-blue-900/15 blur-[128px]" />

        {/* Center-right 3D visualization glow */}
        <div className="absolute top-1/3 -right-20 w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[150px]" />

        {/* Lower atmospheric ambient glow */}
        <div className="absolute bottom-1/4 -left-20 w-[500px] h-[500px] rounded-full bg-indigo-900/10 blur-[150px]" />

        {/* Faint financial grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(to right, #3b82f6 1px, transparent 1px),
                              linear-gradient(to bottom, #3b82f6 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative z-10">
        {/* 1. HERO SECTION */}
        <section className="relative min-h-[calc(100vh-2rem)] flex items-center max-w-7xl w-full mx-auto px-6 sm:px-10 lg:px-12 py-12 lg:py-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full min-h-[calc(100vh-6rem)]">
            {/* Left Column: Authoritative Financial Copilot Messaging */}
            <div className="lg:col-span-6 flex items-center justify-center lg:justify-start order-1">
              <HeroContent />
            </div>

            {/* Right Column: 3D Financial Risk & Intelligence Engine */}
            <div className="lg:col-span-6 flex items-center justify-center relative w-full h-[420px] sm:h-[480px] lg:h-[620px] order-2">
              <Hero3D />
            </div>
          </div>
        </section>

        {/* 2. THE PROBLEM */}
        <TheProblemSection />

        {/* 3. TRADITIONAL RISK MANAGEMENT CHALLENGE */}
        <TraditionalWorkflowSection />

        {/* 4. INTRODUCE HEDGEMIND (SEE · SIMULATE · DECIDE) */}
        <IntroduceHedgeMindSection />

        {/* 5. HOW HEDGEMIND WORKS (01 - 05 PIPELINE) */}
        <WorkflowSection />

        {/* 6. WHAT MAKES HEDGEMIND DIFFERENT (BENTO GRID) */}
        <WhatMakesDifferentSection />

        {/* 7. EXAMPLE SCENARIO (WHAT-IF DEMO) */}
        <ScenarioDemoSection />

        {/* 8. PRODUCT ECOSYSTEM (8 COMMAND CENTER MODULES) */}
        <ProductEcosystemSection />

        {/* 9. TARGET USERS (BUILT FOR TEAMS MANAGING FINANCIAL RISK) */}
        <TargetUsersSection />

        {/* 10. FINAL CTA */}
        <FinalCTASection />
      </div>
    </main>
  )
}

export default LandingPage
