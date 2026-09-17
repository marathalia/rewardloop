"use client"

import { useEffect, useMemo, useRef, useState, type RefObject } from "react"
import { LockKeyhole, Sparkles } from "lucide-react"
import { StatusBar, BottomNav } from "../phone-chrome"
import { DealCard, DealRowCard } from "../deal-card"
import { deals, getDeal, preferenceRewardIds, type Deal } from "@/lib/reward-data"
import type { CustomerScenario } from "@/lib/mvp-engine"
import { cn } from "@/lib/utils"

const surveyOptions = [
  { label: "Food & dining", rewardId: "maple-coffee" },
  { label: "Shopping", rewardId: "willow-credit" },
  { label: "Travel", rewardId: "skytrail-pass" },
  { label: "Entertainment", rewardId: "lumen-cinema" },
  { label: "Gaming & tech", rewardId: "pixel-pass" },
  { label: "Wellness", rewardId: "meadow-yoga" },
  { label: "Birthday treats", rewardId: "confetti-treat" },
  { label: "Exclusive perks", rewardId: "loop-lounge" },
]

function PaginationDots({
  deals: items,
  active,
  label,
  onSelect,
}: {
  deals: Deal[]
  active: number
  label: string
  onSelect: (index: number) => void
}) {
  if (items.length <= 1) return null
  const visibleCount = Math.min(7, items.length)
  const safeActive = Math.max(0, Math.min(items.length - 1, active))
  const start = Math.max(0, Math.min(items.length - visibleCount, safeActive - Math.floor(visibleCount / 2)))
  const visibleItems = items.slice(start, start + visibleCount)

  return (
    <div className="mt-2 flex h-2 items-center justify-center gap-1.5" aria-label={`${label} ${safeActive + 1} of ${items.length}`}>
      {visibleItems.map((deal, visibleIndex) => {
        const itemIndex = start + visibleIndex
        return (
        <button
          key={deal.id}
          type="button"
          onClick={() => onSelect(itemIndex)}
          className={cn("h-1.5 shrink-0 rounded-full transition-all", itemIndex === safeActive ? "w-5 bg-primary" : "w-1.5 bg-border")}
          aria-label={`Show ${label.toLowerCase()} ${itemIndex + 1}`}
        />
        )
      })}
    </div>
  )
}

export function SmartDiscovery({
  scenario,
  learningPreferenceId,
  onLearnPreference,
  onNavigate,
}: {
  scenario: CustomerScenario
  learningPreferenceId?: string | null
  onLearnPreference?: (rewardId: string) => void
  onNavigate: (screen: string, dealId?: string) => void
}) {
  const forYouRef = useRef<HTMLDivElement>(null)
  const otherRef = useRef<HTMLDivElement>(null)
  const [activeForYou, setActiveForYou] = useState(0)
  const [activeOther, setActiveOther] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [surveyDismissed, setSurveyDismissed] = useState(false)
  const learnedPreference = learningPreferenceId ? getDeal(learningPreferenceId)?.category : undefined
  const activelyLearning = scenario.learning && !learnedPreference
  const effectivePreference = learnedPreference ?? scenario.preferenceCluster

  const available = useMemo(
    () => deals.filter((deal) => deal.eligible && deal.expiresInDays > 0 && (deal.access !== "plus" || scenario.tier !== "Basic")),
    [scenario.tier],
  )
  const forYou = useMemo(() => {
    const availableIds = new Set(available.map((deal) => deal.id))
    const recommendedIds = preferenceRewardIds[activelyLearning ? "Learning" : effectivePreference] ?? []
    const ordered = recommendedIds
      .map((id) => getDeal(id))
      .filter((deal): deal is Deal => Boolean(deal && availableIds.has(deal.id)))
    const seen = new Set(ordered.map((deal) => deal.id))
    return [...ordered, ...available.filter((deal) => !seen.has(deal.id))].slice(0, 8)
  }, [activelyLearning, available, effectivePreference])

  const categories = useMemo(() => ["All", ...Array.from(new Set(available.map((deal) => deal.category)))], [available])
  const otherRewards = useMemo(() => {
    return available.filter((deal) => selectedCategory === "All" || deal.category === selectedCategory)
  }, [available, selectedCategory])

  useEffect(() => {
    setActiveForYou(0)
    setActiveOther(0)
    setSelectedCategory("All")
    setSurveyDismissed(false)
    forYouRef.current?.scrollTo({ left: 0 })
    otherRef.current?.scrollTo({ left: 0 })
  }, [scenario.id])

  useEffect(() => {
    setActiveOther(0)
    otherRef.current?.scrollTo({ left: 0 })
  }, [selectedCategory])

  function scrollCarousel(ref: RefObject<HTMLDivElement | null>, items: Deal[], index: number, setActive: (index: number) => void) {
    const node = ref.current
    if (!node) return
    const safeIndex = Math.max(0, Math.min(items.length - 1, index))
    const card = node.children[safeIndex] as HTMLElement | undefined
    if (!card) return
    node.scrollTo({ left: card.offsetLeft - node.offsetLeft, behavior: "smooth" })
    setActive(safeIndex)
  }

  function trackCarousel(node: HTMLDivElement, length: number, setActive: (index: number) => void) {
    const first = node.children[0] as HTMLElement | undefined
    if (!first) return
    setActive(Math.max(0, Math.min(length - 1, Math.round(node.scrollLeft / (first.offsetWidth + 10)))))
  }

  const redBenefits = ["atelier-preview", "circle-session", "loop-lounge", "atelier-preview", "circle-session", "loop-lounge", "confetti-treat"]
    .map((id) => getDeal(id))
    .filter((deal): deal is Deal => Boolean(deal))
  const cardBenefits = ["canvas-bag", "byte-course"]
    .map((id) => getDeal(id))
    .filter((deal): deal is Deal => Boolean(deal))

  return (
    <div className="flex h-full flex-col bg-background">
      <StatusBar />
      <div className="flex-1 overflow-y-auto pb-5">
        <header className="px-4 pb-4 pt-2">
          <h1 className="text-2xl font-extrabold text-foreground">Rewards</h1>
        </header>

        {activelyLearning && !surveyDismissed && (
          <section className="mx-4 mb-4 rounded-2xl border border-border bg-card p-3 shadow-sm" aria-label="Optional reward preference survey">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-1.5 text-[11px] font-bold text-foreground"><Sparkles className="size-3.5 text-primary" /> Help us shape your rewards</p>
                <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">What would you like to see more of?</p>
              </div>
              <button type="button" onClick={() => setSurveyDismissed(true)} className="shrink-0 text-[9px] font-medium text-muted-foreground underline underline-offset-2">Skip for now</button>
            </div>
            <div className="no-scrollbar mt-2.5 flex gap-1.5 overflow-x-auto pb-0.5">
              {surveyOptions.map((option) => (
                <button
                  key={option.rewardId}
                  type="button"
                  onClick={() => onLearnPreference?.(option.rewardId)}
                  className="shrink-0 rounded-full border border-border bg-background px-2.5 py-1.5 text-[10px] font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="mb-2.5 px-4">
            <div className="flex items-center gap-1.5">
              <Sparkles className="size-4 text-primary" />
              <h2 className="text-sm font-extrabold uppercase tracking-wide text-foreground">{activelyLearning ? "Explore rewards" : "For you"}</h2>
            </div>
          </div>
          <div
            ref={forYouRef}
            onScroll={(event) => trackCarousel(event.currentTarget, forYou.length, setActiveForYou)}
            className="no-scrollbar mx-4 flex snap-x snap-mandatory gap-2.5 overflow-x-auto scroll-smooth pb-1"
          >
            {forYou.map((deal) => (
              <div key={deal.id} className="w-[76%] shrink-0 snap-start">
                <DealCard deal={deal} onOpen={(id) => onNavigate("deal", id)} />
              </div>
            ))}
          </div>
          <PaginationDots deals={forYou} active={activeForYou} label={activelyLearning ? "Explore reward" : "For you reward"} onSelect={(index) => scrollCarousel(forYouRef, forYou, index, setActiveForYou)} />
        </section>

        <section className="mt-6">
          <div className="px-4">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-foreground">Browse categories</h2>
            <p className="mt-1 text-[10px] text-muted-foreground">Other rewards you are eligible to claim.</p>
          </div>
          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-bold transition-colors",
                  selectedCategory === category ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground",
                )}
              >
                {category}
              </button>
            ))}
          </div>

          <div
            ref={otherRef}
            onScroll={(event) => trackCarousel(event.currentTarget, otherRewards.length, setActiveOther)}
            className="no-scrollbar mx-4 mt-3 flex snap-x snap-mandatory gap-2.5 overflow-x-auto scroll-smooth pb-1"
          >
            {otherRewards.map((deal) => (
              <div key={deal.id} className="w-[76%] shrink-0 snap-start">
                <DealRowCard deal={deal} onOpen={(id) => onNavigate("deal", id)} />
              </div>
            ))}
          </div>
          <PaginationDots deals={otherRewards} active={activeOther} label="Category reward" onSelect={(index) => scrollCarousel(otherRef, otherRewards, index, setActiveOther)} />
        </section>

        <section className="mt-7 border-t border-border px-4 pt-5">
          <div className="flex items-start gap-2.5">
            <LockKeyhole className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-wide text-foreground">Unlock more benefits</h2>
              <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">These offers are not mixed with claimable rewards. Check eligibility before signing up.</p>
            </div>
          </div>

          <div className="mt-4 space-y-5">
            <section>
              <h3 className="text-xs font-extrabold uppercase tracking-wide text-foreground">RewardLoop Plus Membership</h3>
              <p className="mt-1 text-[10px] text-muted-foreground">Member-only savings and services.</p>
              <div className="no-scrollbar mt-3 flex snap-x snap-mandatory gap-2.5 overflow-x-auto pb-1">
                {redBenefits.map((deal) => (
                  <div key={deal.id} className="w-[76%] shrink-0 snap-start">
                    <DealRowCard deal={deal} tag="RewardLoop Plus Membership" onOpen={(id) => onNavigate("deal", id)} />
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-xs font-extrabold uppercase tracking-wide text-foreground">RewardLoop–Loop Card Card</h3>
              <p className="mt-1 text-[10px] text-muted-foreground">Cashback and cardholder privileges.</p>
              <div className="no-scrollbar mt-3 flex snap-x snap-mandatory gap-2.5 overflow-x-auto pb-1">
                {cardBenefits.map((deal) => (
                  <div key={deal.id} className="w-[76%] shrink-0 snap-start">
                    <DealRowCard deal={deal} tag="RewardLoop–Loop Card Card" onOpen={(id) => onNavigate("deal", id)} />
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>
      </div>

      <BottomNav active="discovery" onNavigate={onNavigate} />
    </div>
  )
}
