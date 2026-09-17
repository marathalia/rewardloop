"use client"

import { useEffect, useState } from "react"
import {
  BellRing,
  CircleAlert,
  Compass,
  Heart,
  Home,
  BrainCircuit,
  Smartphone,
  Ticket,
  Wallet,
} from "lucide-react"
import { PageHeader, PageShell } from "@/components/page-header"
import { Badge, Card, CardContent } from "@/components/ui/primitives"
import { PhoneFrame } from "@/components/prototype/phone-frame"
import { HomeScreen } from "@/components/prototype/screens/home-screen"
import { SmartDiscovery } from "@/components/prototype/screens/smart-discovery"
import { DealDetail } from "@/components/prototype/screens/deal-detail"
import { LockScreen } from "@/components/prototype/screens/lock-screen"
import { VouchersScreen } from "@/components/prototype/screens/vouchers-screen"
import { PreferenceChoiceScreen } from "@/components/prototype/screens/preference-choice-screen"
import { UnavailableRecoveryScreen } from "@/components/prototype/screens/unavailable-recovery-screen"
import { getDeal } from "@/lib/reward-data"
import { customerScenarios, type CustomerScenario } from "@/lib/mvp-engine"
import { cn } from "@/lib/utils"

type ScreenId =
  | "lockscreen"
  | "home"
  | "interest-popup"
  | "preference-choice"
  | "discovery"
  | "unavailable-recovery"
  | "deal"
  | "vouchers"

type ActivityItem = { id: string | number; label: string; detail: string; time: string }
type CustomerSimulatorState = { claimed: string[]; activity: ActivityItem[]; preferenceChoice: string | null; interestChoices: string[] }
type SimulatorState = Record<string, CustomerSimulatorState>

const screens: { id: ScreenId; label: string; sub: string; icon: typeof Home }[] = [
  { id: "lockscreen", label: "Push alert", sub: "Proactive entry point", icon: BellRing },
  { id: "home", label: "Home", sub: "Cluster campaign popup", icon: Home },
  { id: "interest-popup", label: "Reward interests", sub: "Optional, subtle prompt", icon: BrainCircuit },
  { id: "preference-choice", label: "Pick a reward", sub: "Choose between two", icon: Heart },
  { id: "discovery", label: "Discovery", sub: "Eligible rewards", icon: Compass },
  { id: "unavailable-recovery", label: "Unavailable recovery", sub: "Eligible alternatives", icon: CircleAlert },
  { id: "deal", label: "Deal detail", sub: "Claim and redeem", icon: Ticket },
  { id: "vouchers", label: "My vouchers", sub: "Claimed rewards", icon: Wallet },
]

const screenNames = Object.fromEntries(screens.map((screen) => [screen.id, screen.label]))
const scenarioDeal: Record<string, string> = {
  "known-food": "maple-coffee",
  learning: "frame-stream",
  "voucher-savings": "willow-credit",
  "campaign-travel": "skytrail-pass",
  "membership-exclusive": "loop-lounge",
  "entertainment-streaming": "lumen-cinema",
  "gaming-tech": "frame-stream",
  "birthday-seasonal": "confetti-treat",
  "meadow-yoga": "meadow-yoga",
}

const simulatorStorageKey = "rewardloop-customer-state-v1"

function createInitialSimulatorState(): SimulatorState {
  return Object.fromEntries(customerScenarios.map((item) => [
    item.customerId,
    { claimed: [], activity: [], preferenceChoice: null, interestChoices: [] },
  ]))
}

function persistEvent(customerId: string, payload: Record<string, unknown>) {
  return fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ customerId, ...payload }),
  }).catch(() => undefined)
}

export function AppSimulatorPage() {
  const [scenarioId, setScenarioId] = useState("known-food")
  const scenario = customerScenarios.find((item) => item.id === scenarioId) ?? customerScenarios[0]
  const [screen, setScreen] = useState<ScreenId>("home")
  const [dealId, setDealId] = useState(scenarioDeal[scenarioId])
  const [simulatorState, setSimulatorState] = useState<SimulatorState>(createInitialSimulatorState)
  const [stateHydrated, setStateHydrated] = useState(false)
  const customerState = simulatorState[scenario.customerId] ?? { claimed: [], activity: [], preferenceChoice: null, interestChoices: [] }
  const claimed = customerState.claimed
  const activity = customerState.activity
  const learnedRewardId = customerState.preferenceChoice ?? customerState.interestChoices[0] ?? null

  useEffect(() => {
    try {
      const savedState = window.localStorage.getItem(simulatorStorageKey)
      if (savedState) {
        const parsed = JSON.parse(savedState) as SimulatorState
        const cleaned = Object.fromEntries(Object.entries(parsed).map(([customerId, state]) => [
          customerId,
          {
            claimed: Array.isArray(state.claimed) ? state.claimed : [],
            preferenceChoice: typeof state.preferenceChoice === "string" ? state.preferenceChoice : null,
            interestChoices: Array.isArray(state.interestChoices) ? state.interestChoices.filter((id) => typeof id === "string") : [],
            activity: Array.isArray(state.activity)
              ? state.activity.filter((item) => ["App navigation", "Reward opened", "Reward claimed", "Reward selected", "Preference shared"].includes(item.label))
              : [],
          },
        ]))
        setSimulatorState((current) => ({ ...current, ...cleaned }))
      }
    } catch {
      window.localStorage.removeItem(simulatorStorageKey)
    } finally {
      setStateHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (stateHydrated) window.localStorage.setItem(simulatorStorageKey, JSON.stringify(simulatorState))
  }, [simulatorState, stateHydrated])

  function updateCustomerState(customerId: string, update: (current: CustomerSimulatorState) => CustomerSimulatorState) {
    setSimulatorState((current) => ({
      ...current,
      [customerId]: update(current[customerId] ?? { claimed: [], activity: [], preferenceChoice: null, interestChoices: [] }),
    }))
  }

  const pushActivity = (customerId: string, label: string, detail: string) => {
    updateCustomerState(customerId, (current) => ({
      ...current,
      activity: [
        { id: crypto.randomUUID(), label, detail, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
        ...current.activity,
      ].slice(0, 6),
    }))
  }

  function navigate(next: string, id?: string) {
    const target = next as ScreenId
    if (id) setDealId(id)
    setScreen(target)
    pushActivity(scenario.customerId, id ? "Reward opened" : "App navigation", `${screenNames[target] ?? target}${id ? ` · ${getDeal(id)?.merchant ?? id}` : ""}`)
    void persistEvent(scenario.customerId, {
      type: id ? "reward_clicked" : "app_navigation",
      rewardId: id,
      metadata: { screen: target, source: "RewardLoop simulator", scenarioId: scenario.id },
    })
  }

  function selectScenario(next: CustomerScenario) {
    setScenarioId(next.id)
    setDealId(scenarioDeal[next.id])
    setScreen("home")
  }

  function claimDeal(id: string) {
    if (claimed.includes(id)) return
    updateCustomerState(scenario.customerId, (current) => ({
      ...current,
      claimed: current.claimed.includes(id) ? current.claimed : [...current.claimed, id],
    }))
    pushActivity(scenario.customerId, "Reward claimed", `${getDeal(id)?.name ?? id} added to My Vouchers`)
    void persistEvent(scenario.customerId, {
      type: "reward_claimed",
      rewardId: id,
      experiment: "exploration-slot",
      metadata: { rewardName: getDeal(id)?.name ?? id, estimatedValue: getDeal(id)?.value ?? "$0" },
    })
  }

  function choosePreference(id: string, alternativeId: string) {
    const chosen = getDeal(id)
    const alternative = getDeal(alternativeId)
    const previousChoice = customerState.preferenceChoice
    updateCustomerState(scenario.customerId, (current) => ({
      ...current,
      preferenceChoice: id,
      claimed: [
        ...current.claimed.filter((claimedId) => claimedId !== current.preferenceChoice && claimedId !== id),
        id,
      ],
      activity: [
        {
          id: crypto.randomUUID(),
          label: "Reward selected",
          detail: `${chosen?.name ?? id} added to My Vouchers`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
        ...current.activity,
      ].slice(0, 6),
    }))
    void persistEvent(scenario.customerId, {
      type: "reward_preference_selected",
      rewardId: id,
      experiment: "customer-reward-pair",
      metadata: {
        chosenReward: chosen?.name ?? id,
        chosenCategory: chosen?.category,
        alternativeRewardId: alternativeId,
        alternativeReward: alternative?.name ?? alternativeId,
        alternativeCategory: alternative?.category,
        previousRewardId: previousChoice ?? "none",
        source: "RewardLoop simulator",
        scenarioId: scenario.id,
      },
    })
    void persistEvent(scenario.customerId, {
      type: "reward_claimed",
      rewardId: id,
      experiment: "customer-reward-pair",
      metadata: {
        rewardName: chosen?.name ?? id,
        estimatedValue: chosen?.value ?? "$0",
        source: "preference-choice",
        replacedRewardId: previousChoice ?? "none",
      },
    })
  }

  function learnPreferenceFromSurvey(id: string) {
    const chosen = getDeal(id)
    if (!chosen) return
    updateCustomerState(scenario.customerId, (current) => ({
      ...current,
      preferenceChoice: id,
      activity: [
        {
          id: crypto.randomUUID(),
          label: "Preference shared",
          detail: `${chosen.category} selected in the optional rewards survey`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
        ...current.activity,
      ].slice(0, 6),
    }))
    void persistEvent(scenario.customerId, {
      type: "reward_preference_selected",
      rewardId: id,
      experiment: "optional-category-survey",
      metadata: {
        chosenCategory: chosen.category,
        source: "subtle-rewards-survey",
        scenarioId: scenario.id,
      },
    })
  }

  function saveInterestChoices(ids: string[]) {
    const selectedIds = ids.slice(0, 3)
    const categories = selectedIds
      .map((id) => getDeal(id)?.category)
      .filter((category): category is string => Boolean(category))

    updateCustomerState(scenario.customerId, (current) => ({
      ...current,
      interestChoices: selectedIds,
      activity: [
        {
          id: crypto.randomUUID(),
          label: "Preference shared",
          detail: `${categories.join(", ")} selected from the optional rewards prompt`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
        ...current.activity,
      ].slice(0, 6),
    }))
    void persistEvent(scenario.customerId, {
      type: "reward_interests_shared",
      rewardId: selectedIds[0],
      metadata: {
        selectedRewardIds: selectedIds,
        selectedCategories: categories,
        source: "subtle-interest-popup",
        scenarioId: scenario.id,
      },
    })
    setScreen("home")
  }

  function claimCampaign(id: string) {
    if (scenario.learning && !learnedRewardId) {
      const alternativeId = id === "willow-credit" ? "frame-stream" : "willow-credit"
      choosePreference(id, alternativeId)
      return
    }
    claimDeal(id)
  }

  function recordCampaignImpression(posterId: string, category: string, cyclePosition: number) {
    void persistEvent(scenario.customerId, {
      type: "campaign_impression",
      experiment: scenario.learning ? "exploration-slot" : "none",
      metadata: {
        posterId,
        category,
        cyclePosition,
        policy: scenario.learning && !learnedRewardId ? "learning-cycle" : "cluster-personalised",
        scenarioId: scenario.id,
      },
    })
  }

  function restartLearningCycle() {
    updateCustomerState(scenario.customerId, (current) => ({
      claimed: [],
      preferenceChoice: null,
      interestChoices: [],
      activity: [
        {
          id: crypto.randomUUID(),
          label: "Learning restarted",
          detail: "Campaign exploration returned to the first rotating poster",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
        ...current.activity,
      ].slice(0, 6),
    }))
    setScreen("home")
  }


  function renderScreen() {
    switch (screen) {
      case "lockscreen":
        return <LockScreen scenario={scenario} dealId={dealId} onNavigate={navigate} />
      case "home":
        return (
          <HomeScreen
            scenario={scenario}
            dealId={dealId}
            learningPreferenceId={learnedRewardId}
            claimedIds={claimed}
            onCampaignClaim={claimCampaign}
            onCampaignImpression={recordCampaignImpression}
            onNavigate={navigate}
          />
        )
      case "interest-popup":
        return (
          <HomeScreen
            scenario={scenario}
            dealId={dealId}
            learningPreferenceId={learnedRewardId}
            claimedIds={claimed}
            interestPopupOpen
            initialInterestIds={customerState.interestChoices}
            onInterestSave={saveInterestChoices}
            onInterestDismiss={() => setScreen("home")}
            onCampaignClaim={claimCampaign}
            onCampaignImpression={recordCampaignImpression}
            onNavigate={navigate}
          />
        )
      case "preference-choice":
        return <PreferenceChoiceScreen scenario={scenario} selectedId={customerState.preferenceChoice} onChoose={choosePreference} onNavigate={navigate} />
      case "discovery":
        return (
          <SmartDiscovery
            scenario={scenario}
            learningPreferenceId={learnedRewardId}
            onLearnPreference={learnPreferenceFromSurvey}
            onNavigate={navigate}
          />
        )
      case "unavailable-recovery":
        return <UnavailableRecoveryScreen scenario={scenario} onNavigate={navigate} />
      case "deal":
        return <DealDetail dealId={dealId} claimed={claimed.includes(dealId)} onClaim={claimDeal} onNavigate={navigate} />
      case "vouchers":
        return <VouchersScreen claimedIds={claimed} onNavigate={navigate} />
    }
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="Customer Experience"
        title="Personalised RewardLoop experience simulator"
        subtitle="Explore sample customers, prepared campaign previews and simulated voucher claims. These actions do not issue real rewards or update the historical analysis."
      />

      <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(420px,470px)_375px_minmax(220px,1fr)] 2xl:grid-cols-[500px_375px_minmax(260px,1fr)]">
        <div className="grid gap-4 sm:grid-cols-2 xl:items-start">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Simulated customers</p>
            <div className="space-y-2">
              {customerScenarios.map((item) => {
                const active = scenario.id === item.id
                const itemState = simulatorState[item.customerId]
                const itemLearnedRewardId = itemState?.preferenceChoice ?? itemState?.interestChoices?.[0] ?? null
                const learned = Boolean(itemLearnedRewardId)
                return (
                  <button key={item.id} type="button" onClick={() => selectScenario(item)} className={cn("w-full rounded-xl border p-3 text-left transition-all", active ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-card hover:border-primary/30")}>
                    <div className="flex items-center justify-between gap-2"><span className="font-mono text-xs font-bold">{item.customerId}</span><Badge variant={item.learning && !learned ? "warning" : "success"}>{item.learning ? (learned ? "Learned" : "Learning") : "Sample profile"}</Badge></div>
                    <p className="mt-1 text-sm font-semibold">{learned ? getDeal(itemLearnedRewardId ?? "")?.category : item.preferenceCluster}</p>
                    <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{item.behaviorCluster}</p>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-3 xl:sticky xl:top-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Journey screens</p>
            <div className="grid gap-2">
              {screens.map((item, index) => {
                const Icon = item.icon
                const active = screen === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setScreen(item.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border p-3 text-left transition-all",
                      active ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-card hover:border-primary/30",
                    )}
                  >
                    <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{index + 1}. {item.label}</span>
                      <span className="block truncate text-xs text-muted-foreground">{item.sub}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-center xl:sticky xl:top-6 xl:self-start">
          <PhoneFrame>{renderScreen()}</PhoneFrame>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Claimed by user</p><p className="mt-1 text-2xl font-bold">{claimed.length}</p><p className="mt-1 truncate font-mono text-[10px] text-muted-foreground">{scenario.customerId}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Confirmed redemptions</p><p className="mt-1 text-2xl font-bold">Not tracked</p><p className="mt-1 truncate font-mono text-[10px] text-muted-foreground">{scenario.customerId}</p></CardContent></Card>
          </div>
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-2"><div className="flex items-center gap-2"><BrainCircuit className="size-4 text-primary" /><p className="text-sm font-semibold">Selected customer</p></div><Badge variant={scenario.learning && !learnedRewardId ? "warning" : "success"}>{scenario.learning ? (learnedRewardId ? "Learned policy" : "Learning policy") : "Demo policy"}</Badge></div>
              <p className="mt-3 font-mono text-sm font-bold">{scenario.customerId}</p>
              <dl className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between gap-3"><dt className="shrink-0 text-muted-foreground">Behaviour</dt><dd className="min-w-0 text-right font-semibold leading-snug">{scenario.behaviorCluster}</dd></div>
                <div className="flex justify-between gap-3"><dt className="shrink-0 text-muted-foreground">Preference</dt><dd className="min-w-0 text-right font-semibold leading-snug">{learnedRewardId ? getDeal(learnedRewardId)?.category : scenario.preferenceCluster}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Evidence</dt><dd className="font-semibold">{learnedRewardId ? "Response captured" : scenario.learning ? "Collecting" : "Sample profile, not a measured confidence score"}</dd></div>
                <div className="flex justify-between gap-3"><dt className="shrink-0 text-muted-foreground">Trigger</dt><dd className="min-w-0 text-right font-semibold leading-snug">{scenario.moment}</dd></div>
              </dl>
              {scenario.learning && learnedRewardId && (
                <button type="button" onClick={restartLearningCycle} className="mt-4 w-full rounded-xl border border-primary/25 bg-card px-3 py-2.5 text-xs font-bold text-primary transition-colors hover:bg-primary/5">
                  Restart learning cycle
                </button>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><Smartphone className="size-4 text-primary" /><h3 className="text-sm font-semibold">Simulator activity</h3></div>
                <Badge variant="outline">This browser</Badge>
              </div>
              <p className="mt-1 font-mono text-[10px] text-muted-foreground">Showing {scenario.customerId} only</p>
              <div className="mt-4 space-y-3">
                {activity.length === 0 && <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-center"><p className="text-sm font-semibold">No app interactions yet</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">Tap the notification or interact inside the phone to generate customer signals.</p></div>}
                {activity.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="border-l-2 border-primary/30 pl-3">
                    <div className="flex items-center justify-between gap-2"><p className="text-sm font-medium">{item.label}</p><span className="text-[11px] text-muted-foreground">{item.time}</span></div>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{item.detail}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  )
}
