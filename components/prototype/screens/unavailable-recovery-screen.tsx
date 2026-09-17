"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { AlertTriangle, Bell, Check, ChevronLeft, ChevronRight, LockKeyhole, Sparkles } from "lucide-react"
import { BottomNav, StatusBar } from "../phone-chrome"
import { deals, getDeal, preferenceRewardIds, type Deal } from "@/lib/reward-data"
import type { CustomerScenario } from "@/lib/mvp-engine"

const fallbackAlternatives = ["maple-coffee", "willow-credit", "harbor-stay"]

export function UnavailableRecoveryScreen({
  scenario,
  onNavigate,
}: {
  scenario: CustomerScenario
  onNavigate: (screen: string, dealId?: string) => void
}) {
  const [notifyMe, setNotifyMe] = useState(false)
  const membershipLocked = scenario.tier === "Basic"
  const unavailableDeal = getDeal(membershipLocked ? "loop-lounge" : "sunrise-lunch")!

  const alternatives = useMemo(() => {
    const preferredIds = preferenceRewardIds[scenario.preferenceCluster] ?? fallbackAlternatives
    const selected = preferredIds
      .map((id) => getDeal(id))
      .filter((deal): deal is Deal => Boolean(deal && deal.id !== unavailableDeal.id && deal.eligible && deal.access !== "plus"))
    const selectedIds = new Set(selected.map((deal) => deal.id))
    const fallback = deals.filter((deal) => deal.eligible && deal.access !== "plus" && deal.id !== unavailableDeal.id && !selectedIds.has(deal.id))
    return [...selected, ...fallback].slice(0, 3)
  }, [scenario.preferenceCluster, unavailableDeal.id])

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      <StatusBar />
      <header className="flex items-center gap-3 px-4 pb-3 pt-2">
        <button type="button" onClick={() => onNavigate("discovery")} className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-foreground" aria-label="Back to rewards">
          <ChevronLeft className="size-5" />
        </button>
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-primary">Reward update</p>
          <h1 className="text-xl font-black tracking-tight text-foreground">Let&apos;s find you another</h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-5">
        <section className="overflow-hidden rounded-2xl border border-amber-200 bg-card shadow-sm">
          <div className="relative h-28">
            <Image src={unavailableDeal.image} alt={unavailableDeal.name} fill sizes="330px" className="object-cover saturate-[0.65]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
            <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-extrabold text-amber-700 shadow-sm">
              {membershipLocked ? <LockKeyhole className="size-3" /> : <AlertTriangle className="size-3" />}
              {membershipLocked ? "Not eligible" : "Unavailable now"}
            </span>
            <div className="absolute inset-x-3 bottom-3 text-white">
              <h2 className="line-clamp-2 text-base font-extrabold leading-tight">{unavailableDeal.name}</h2>
              <p className="mt-0.5 text-[10px] text-white/80">{unavailableDeal.merchant}</p>
            </div>
          </div>
          <div className="p-3.5">
            <p className="text-xs leading-relaxed text-muted-foreground">
              {membershipLocked
                ? "This benefit requires RewardLoop Red, so it is not available on your current account."
                : "The current allocation has been fully claimed, so this reward cannot be redeemed right now."}
            </p>
            <button type="button" onClick={() => setNotifyMe((current) => !current)} className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-primary">
              {notifyMe ? <Check className="size-3.5" /> : <Bell className="size-3.5" />}
              {notifyMe ? "We’ll let you know when it returns" : "Notify me if it becomes available"}
            </button>
          </div>
        </section>

        <section className="mt-5">
          <div className="flex items-start gap-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Sparkles className="size-4" /></span>
            <div>
              <h2 className="text-base font-black leading-tight text-foreground">You can enjoy these instead</h2>
              <p className="mt-0.5 text-[10px] text-muted-foreground">Eligible for your account · available now</p>
            </div>
          </div>

          <div className="mt-3 space-y-2.5">
            {alternatives.map((deal) => (
              <button key={deal.id} type="button" onClick={() => onNavigate("deal", deal.id)} className="group flex w-full items-center gap-3 overflow-hidden rounded-2xl border border-border bg-card p-2 text-left shadow-sm transition-colors hover:border-primary/30">
                <span className="relative h-[76px] w-[88px] shrink-0 overflow-hidden rounded-xl">
                  <Image src={deal.image} alt="" fill sizes="88px" className="object-cover transition-transform group-hover:scale-105" />
                </span>
                <span className="min-w-0 flex-1 py-1">
                  <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wide text-emerald-600"><Check className="size-3" />Eligible</span>
                  <span className="mt-1 line-clamp-2 block text-[12px] font-extrabold leading-snug text-foreground">{deal.name}</span>
                  <span className="mt-1 block truncate text-[10px] text-muted-foreground">{deal.merchant}</span>
                </span>
                <ChevronRight className="mr-1 size-4 shrink-0 text-muted-foreground" />
              </button>
            ))}
          </div>
        </section>
      </div>

      <BottomNav active="discovery" onNavigate={onNavigate} />
    </div>
  )
}
