"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { ArrowRight, Check } from "lucide-react"
import { BottomNav, StatusBar } from "../phone-chrome"
import { deals, getDeal, type Deal } from "@/lib/reward-data"
import type { CustomerScenario } from "@/lib/mvp-engine"
import { cn } from "@/lib/utils"

const scenarioPairs: Record<string, [string, string]> = {
  "known-food": ["maple-coffee", "lumen-cinema"],
  learning: ["frame-stream", "willow-credit"],
  "voucher-savings": ["canvas-bag", "maple-coffee"],
  "campaign-travel": ["skytrail-pass", "loop-lounge"],
  "membership-exclusive": ["loop-lounge", "canvas-bag"],
  "entertainment-streaming": ["lumen-cinema", "frame-stream"],
  "gaming-tech": ["frame-stream", "lumen-cinema"],
  "birthday-seasonal": ["maple-coffee", "loop-lounge"],
  "meadow-yoga": ["frame-stream", "skytrail-pass"],
}

function RewardChoice({ deal, label, selected, dimmed, onSelect }: { deal: Deal; label: "A" | "B"; selected: boolean; dimmed: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "relative grid h-[204px] w-full min-w-0 grid-cols-[132px_1fr] overflow-hidden rounded-[22px] border-2 bg-card text-left shadow-sm transition-all",
        selected ? "border-primary shadow-[0_10px_28px_rgba(239,0,40,.14)]" : "border-border hover:border-primary/40",
        dimmed && "opacity-55",
      )}
    >
      <div className="relative h-full min-h-0 w-full overflow-hidden">
        <Image src={deal.image || "/placeholder.svg"} alt={deal.name} fill sizes="132px" className="object-cover" />
        <span className="absolute left-2 top-2 flex size-7 items-center justify-center rounded-full bg-white/95 text-[11px] font-black text-primary shadow-sm">
          {label}
        </span>
        {selected && (
          <span className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
            <Check className="size-4" strokeWidth={3} />
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-col p-3">
        <h2 className="text-[12px] font-extrabold leading-[1.02rem] text-card-foreground">{deal.name}</h2>
        <p className="mt-1 text-[10px] leading-snug text-muted-foreground">{deal.merchant}</p>
        <span className={cn("mt-auto rounded-xl px-2 py-1.5 text-center text-[11px] font-bold", selected ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground")}>
          {selected ? "Selected" : "Choose this"}
        </span>
      </div>
    </button>
  )
}

export function PreferenceChoiceScreen({
  scenario,
  selectedId,
  onChoose,
  onNavigate,
}: {
  scenario: CustomerScenario
  selectedId: string | null
  onChoose: (rewardId: string, alternativeId: string) => void
  onNavigate: (screen: string, rewardId?: string) => void
}) {
  const pair = useMemo(() => {
    const ids = scenarioPairs[scenario.id] ?? [deals[0].id, deals[1].id]
    return ids.map((id) => getDeal(id)).filter((deal): deal is Deal => Boolean(deal))
  }, [scenario.id])

  const persistedChoice = selectedId && pair.some((deal) => deal.id === selectedId) ? selectedId : null
  const [pendingId, setPendingId] = useState<string | null>(null)

  useEffect(() => {
    setPendingId(persistedChoice)
  }, [persistedChoice, scenario.id])

  function selectReward(rewardId: string) {
    setPendingId(rewardId)
  }

  function claimSelectedReward() {
    if (!pendingId) return
    const alternative = pair.find((deal) => deal.id !== pendingId)
    if (!alternative) return
    onChoose(pendingId, alternative.id)
    onNavigate("vouchers")
  }

  const selected = pendingId ? getDeal(pendingId) : undefined

  return (
    <div className="flex h-full flex-col bg-[radial-gradient(circle_at_90%_0%,rgba(239,0,40,.07),transparent_34%),hsl(var(--background))]">
      <StatusBar />
      <div className="flex flex-1 flex-col overflow-hidden px-4 pb-2 pt-4">
        <h1 className="mt-1 text-[24px] font-black leading-[1.05] tracking-tight text-foreground">Which reward feels more useful?</h1>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">Pick one now:you can find it in My Vouchers after claiming.</p>

        <div className="mt-3 flex flex-col">
          {pair.map((deal, index) => (
            <div key={deal.id}>
            <RewardChoice
              deal={deal}
              label={index === 0 ? "A" : "B"}
              selected={pendingId === deal.id}
              dimmed={Boolean(pendingId && pendingId !== deal.id)}
              onSelect={() => selectReward(deal.id)}
            />
            {index === 0 && (
              <div className="flex h-7 items-center gap-2 px-5" aria-hidden="true">
                <span className="h-px flex-1 bg-border" />
                <span className="flex size-6 items-center justify-center rounded-full border border-primary/15 bg-background text-[9px] font-black text-primary shadow-sm">OR</span>
                <span className="h-px flex-1 bg-border" />
              </div>
            )}
            </div>
          ))}
        </div>

        <div className="pt-4">
          <button
            type="button"
            disabled={!selected}
            onClick={claimSelectedReward}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 text-sm font-extrabold text-primary-foreground shadow-lg transition-all disabled:cursor-not-allowed disabled:bg-primary/30 disabled:shadow-none"
          >
            {selected ? "Claim selected reward" : "Choose a reward to continue"}
            {selected && <ArrowRight className="size-4" />}
          </button>
        </div>
      </div>

      <BottomNav active="" onNavigate={onNavigate} />
    </div>
  )
}
