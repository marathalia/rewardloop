"use client"

import { useState } from "react"
import {
  LayoutDashboard,
  Users,
  Filter,
  Sparkles,
  Smartphone,
  Heart,
  Menu,
  X,
  Activity,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { OverviewPage } from "@/components/pages/overview"
import { PersonaInsightsPage } from "@/components/pages/persona-insights"
import { PreferenceClustersPage } from "@/components/pages/preference-clusters"
import { RewardFunnelPage } from "@/components/pages/reward-funnel"
import { CampaignGeneratorPage } from "@/components/pages/campaign-generator"
import { AppSimulatorPage } from "@/components/pages/app-simulator"

type NavId =
  | "overview"
  | "personas"
  | "preferences"
  | "funnel"
  | "campaign"
  | "simulator"

const navItems: {
  id: NavId
  label: string
  icon: React.ElementType
  group: "internal" | "customer"
}[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, group: "internal" },
  { id: "personas", label: "Behavior Clusters", icon: Users, group: "internal" },
  { id: "preferences", label: "Reward Preferences", icon: Heart, group: "internal" },
  { id: "funnel", label: "Reward Funnel", icon: Filter, group: "internal" },
  { id: "campaign", label: "Campaign Generator", icon: Sparkles, group: "internal" },
  { id: "simulator", label: "Customer App Simulator", icon: Smartphone, group: "customer" },
]

const groupLabels: Record<string, string> = {
  internal: "Internal : RewardLoop Lens",
  customer: "Customer Experience",
}

export function RewardLoopApp() {
  const [active, setActive] = useState<NavId>("overview")
  const [mobileOpen, setMobileOpen] = useState(false)

  const grouped = navItems.reduce<Record<string, typeof navItems>>((acc, item) => {
    ;(acc[item.group] ||= []).push(item)
    return acc
  }, {})

  const renderPage = () => {
    switch (active) {
      case "overview":
        return <OverviewPage />
      case "personas":
        return <PersonaInsightsPage />
      case "preferences":
        return <PreferenceClustersPage />
      case "funnel":
        return <RewardFunnelPage />
      case "campaign":
        return <CampaignGeneratorPage />
      case "simulator":
        return <AppSimulatorPage />
    }
  }

  const Sidebar = (
    <nav className="flex h-full flex-col gap-6 overflow-y-auto p-4 no-scrollbar">
      <div className="flex items-center gap-2.5 px-2 pt-1">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <Activity className="size-5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold tracking-tight">RewardLoop</p>
          <p className="text-[11px] text-muted-foreground">Fictional rewards app</p>
        </div>
      </div>

      {Object.entries(grouped).map(([group, items]) => (
        <div key={group} className="flex flex-col gap-1">
          <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {groupLabels[group]}
          </p>
          {items.map((item) => {
            const Icon = item.icon
            const isActive = active === item.id
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActive(item.id)
                  setMobileOpen(false)
                }}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-foreground/70 hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Icon className={cn("size-[18px] shrink-0 transition-transform group-hover:scale-110")} />
                <span className="leading-tight">{item.label}</span>
              </button>
            )
          })}
        </div>
      ))}

    </nav>
  )

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-border bg-sidebar lg:block">
        {Sidebar}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-72 bg-sidebar shadow-xl animate-in slide-in-from-left duration-200">
            {Sidebar}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-card/80 px-4 py-3 backdrop-blur lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex size-9 items-center justify-center rounded-lg border border-border"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Activity className="size-4" />
            </div>
            <span className="text-sm font-bold">RewardLoop</span>
          </div>
          {mobileOpen ? (
            <X className="size-5" onClick={() => setMobileOpen(false)} />
          ) : (
            <span className="w-9" />
          )}
        </header>

        <div className="border-b border-primary/15 bg-primary/5 px-6 py-3 text-sm text-primary"><strong>Portfolio demo · Synthetic data</strong><span className="ml-2">Fictional customers, offers and events. No real rewards are issued.</span></div>
        <main className="flex-1 overflow-x-hidden">{renderPage()}</main>
      </div>
    </div>
  )
}
