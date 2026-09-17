"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { ChevronDown, ChevronRight, Clock, FilePenLine, Gift, Grid2X2, Plane, ReceiptText, Search, Smartphone, SquarePlus, X } from "lucide-react"
import { BottomNav, StatusBar, RewardLoopLogo } from "../phone-chrome"
import { getDeal } from "@/lib/reward-data"
import type { CustomerScenario } from "@/lib/mvp-engine"
import { campaignPosters, getCampaignPoster } from "@/lib/campaign-posters"
import { cn } from "@/lib/utils"

const customerNames: Record<string, string> = {
  "known-food": "Sarah",
  learning: "Alex",
  "voucher-savings": "Michelle",
  "campaign-travel": "Brian",
  "membership-exclusive": "Alicia",
  "entertainment-streaming": "Daniel",
  "gaming-tech": "Max",
  "birthday-seasonal": "Kevin",
  "meadow-yoga": "Jamie",
}

const interestOptions = [
  { rewardId: "maple-coffee", label: "Food & dining", emoji: "🍽️" },
  { rewardId: "willow-credit", label: "Shopping deals", emoji: "🛍️" },
  { rewardId: "harbor-stay", label: "Travel perks", emoji: "✈️" },
  { rewardId: "lumen-cinema", label: "Entertainment", emoji: "🎬" },
  { rewardId: "pixel-pass", label: "Tech & gaming", emoji: "🎮" },
  { rewardId: "meadow-yoga", label: "Wellness", emoji: "🏃" },
  { rewardId: "confetti-treat", label: "Special treats", emoji: "🎁" },
  { rewardId: "loop-lounge", label: "Exclusive perks", emoji: "✨" },
]
const emptyInterestIds: string[] = []

export function HomeScreen({
  scenario,
  dealId,
  learningPreferenceId,
  claimedIds,
  interestPopupOpen = false,
  initialInterestIds = emptyInterestIds,
  onCampaignClaim,
  onCampaignImpression,
  onInterestSave,
  onInterestDismiss,
  onNavigate,
}: {
  scenario: CustomerScenario
  dealId: string
  learningPreferenceId: string | null
  claimedIds: string[]
  interestPopupOpen?: boolean
  initialInterestIds?: string[]
  onCampaignClaim: (rewardId: string) => void
  onCampaignImpression: (posterId: string, category: string, cyclePosition: number) => void
  onInterestSave?: (rewardIds: string[]) => void
  onInterestDismiss?: () => void
  onNavigate: (screen: string, dealId?: string) => void
}) {
  const featured = getDeal(dealId) ?? getDeal("maple-coffee")!
  const [campaignOpen, setCampaignOpen] = useState(() => !interestPopupOpen)
  const [learningIndex, setLearningIndex] = useState(0)
  const [interestSelected, setInterestSelected] = useState<string[]>(initialInterestIds)
  const wasInterestPopupOpen = useRef(interestPopupOpen)
  const campaign = useMemo(
    () => getCampaignPoster(scenario, learningIndex, learningPreferenceId),
    [scenario, learningIndex, learningPreferenceId],
  )
  const campaignReward = getDeal(campaign.rewardId) ?? featured
  const customerName = customerNames[scenario.id] ?? "there"
  const hasClaimedReward = claimedIds.length > 0
  const campaignAlreadyClaimed = claimedIds.includes(campaign.rewardId)
  const bannerImage = campaign.image

  useEffect(() => {
    const justClosedInterests = wasInterestPopupOpen.current && !interestPopupOpen
    setCampaignOpen(justClosedInterests ? false : !interestPopupOpen)
    wasInterestPopupOpen.current = interestPopupOpen
    setLearningIndex(0)
  }, [claimedIds.length, interestPopupOpen, scenario.id])

  useEffect(() => {
    if (interestPopupOpen) setInterestSelected(initialInterestIds)
  }, [initialInterestIds, interestPopupOpen])

  useEffect(() => {
    if (!scenario.learning || learningPreferenceId || !campaignOpen) return
    const timer = window.setInterval(() => {
      setLearningIndex((current) => (current + 1) % campaignPosters.length)
    }, 4500)
    return () => window.clearInterval(timer)
  }, [scenario.learning, learningPreferenceId, campaignOpen])

  useEffect(() => {
    if (!campaignOpen || (scenario.learning && !learningPreferenceId)) return
    onCampaignImpression(campaign.id, campaign.category, learningIndex + 1)
  }, [campaign.id, campaign.category, campaignOpen, learningIndex, learningPreferenceId, onCampaignImpression, scenario.learning])

  function claimCampaign() {
    if (campaignAlreadyClaimed) {
      setCampaignOpen(false)
      onNavigate("discovery")
      return
    }
    onCampaignClaim(campaign.rewardId)
    setCampaignOpen(false)
    onNavigate("vouchers")
  }

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-background">
      <div className="bg-[#0f766e] text-white">
        <StatusBar dark />
        <header className="px-4 pb-5 pt-2">
          <div className="flex items-center justify-between">
            <button type="button" className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-left text-sm font-bold text-foreground shadow-sm" aria-label="RewardLoop demo">
              <span>RewardLoop demo</span>
              <ChevronDown className="size-4 text-muted-foreground" />
            </button>
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-full border-2 border-white bg-[#ccfbf1] text-base">RL</span>
              <button type="button" onClick={() => onNavigate("lockscreen")} aria-label="Inbox" className="rounded-lg p-1"><ReceiptText className="size-6" /></button>
            </div>
          </div>

          <section className="mt-3 rounded-2xl bg-white p-4 text-foreground shadow-xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Your rewards space</p>
            <h2 className="mt-2 text-xl font-bold">Small perks. More possibilities.</h2>
            <p className="mt-2 text-sm text-muted-foreground">Explore fictional offers, choose your interests and save a demo voucher.</p>
            <button type="button" onClick={() => onNavigate("discovery")} className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white">Explore rewards</button>
          </section>
        </header>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-5">
        <button
          type="button"
          onClick={() => onNavigate("discovery")}
          aria-label={hasClaimedReward ? "View personalised rewards" : "View your personalised reward"}
          className="group relative mt-3 h-[98px] w-full overflow-hidden rounded-[22px] border border-primary/15 bg-[#f0fdfa] text-left shadow-[0_10px_24px_rgba(40,24,28,0.12)] transition-transform active:scale-[0.99]"
        >
          <Image src={bannerImage} alt="" fill sizes="315px" className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.02]" />
          <span
            className={cn(
              "absolute inset-0",
              campaign.tone === "dark"
                ? "bg-[linear-gradient(90deg,rgba(4,3,25,.99)_0%,rgba(4,3,25,.92)_48%,rgba(4,3,25,.16)_72%,rgba(4,3,25,0)_88%)]"
                : "bg-[linear-gradient(90deg,rgba(255,250,249,1)_0%,rgba(255,250,249,.96)_48%,rgba(255,250,249,.22)_72%,rgba(255,250,249,0)_88%)]",
            )}
          />
          <span className={cn("absolute inset-y-0 left-0 flex w-[61%] flex-col justify-center px-4", campaign.tone === "dark" ? "text-white" : "text-foreground")}>
            <span className={cn("text-[9px] font-extrabold uppercase tracking-[0.16em]", campaign.tone === "dark" ? "text-white/70" : "text-primary")}>
              {hasClaimedReward ? "More picks based on what you like" : "Picked for you"}
            </span>
            <span className="mt-1.5 text-[16px] font-black leading-[1.08] tracking-tight">
              {hasClaimedReward ? "View personalised rewards" : "View your personalised reward"}
            </span>
          </span>
        </button>

        <section className="mt-8">
          <h2 className="text-base font-extrabold text-foreground">Get roaming for your next adventure</h2>
          <div className="mt-3 grid grid-cols-[1.05fr_1.65fr] gap-2">
            <button type="button" onClick={() => onNavigate("deal", "harbor-stay")} className="relative min-h-40 overflow-hidden rounded-xl bg-[linear-gradient(180deg,#dff3ff_0%,#fff0df_100%)] text-left shadow-sm">
              <span className="absolute -bottom-10 inset-x-0 top-8" aria-hidden="true"><Image src="/images/travel.svg" alt="" fill sizes="145px" className="object-cover" /></span>
              <span className="absolute inset-x-3 top-3 z-10 text-[19px] font-black uppercase leading-[0.92] text-primary drop-shadow-sm">Best-priced<br />roaming</span>
              <span className="absolute bottom-3 left-3 z-10 flex items-center gap-1 text-xs font-bold text-foreground"><Plane className="size-4" /> Worldwide</span>
            </button>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Search", symbol: <Search className="size-6" /> },
                { label: "Malaysia", symbol: "🇲🇾" },
                { label: "Japan", symbol: "🇯🇵" },
                { label: "Indonesia", symbol: "🇮🇩" },
                { label: "China", symbol: "🇨🇳" },
                { label: "S. Korea", symbol: "🇰🇷" },
              ].map((place) => (
                <button key={place.label} type="button" onClick={() => onNavigate("deal", "harbor-stay")} className="flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl bg-muted px-1 py-2 text-[10px] font-medium text-foreground">
                  <span className="text-xl">{place.symbol}</span>
                  <span className="w-full truncate text-center">{place.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-base font-extrabold text-foreground">Top picks</h2>
          <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto pb-1">
            <button type="button" onClick={() => onNavigate("deal", "pixel-pass")} className="w-40 shrink-0 overflow-hidden rounded-xl bg-neutral-950 text-left text-white shadow-sm">
              <div className="relative h-28"><Image src="/images/tech.svg" alt="Orbit phone and technology deal" fill sizes="160px" className="object-cover" /></div>
              <div className="p-3"><p className="text-xs font-bold">Digital demo offer</p><p className="mt-1 text-[10px] text-white/65">Pixel Grove game pass</p></div>
            </button>
            <button type="button" onClick={() => onNavigate("discovery")} className="w-40 shrink-0 overflow-hidden rounded-xl border border-border bg-card text-left shadow-sm">
              <div className="relative h-28"><Image src="/images/shopping.svg" alt="Shopping and Willow Market deals" fill sizes="160px" className="object-cover" /></div>
              <div className="p-3"><p className="text-xs font-bold">Willow Market deals</p><p className="mt-1 text-[10px] text-muted-foreground">Discover partner offers</p></div>
            </button>
          </div>
        </section>
      </div>

      <BottomNav active="home" onNavigate={onNavigate} />

      {interestPopupOpen && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 px-4 py-8 backdrop-blur-[1px]">
          <section role="dialog" aria-modal="true" aria-labelledby="interest-popup-title" className="relative w-full overflow-hidden rounded-[28px] border border-white/70 bg-[#fff9f8] p-5 shadow-2xl">
            <button type="button" onClick={onInterestDismiss} aria-label="Close reward interests" className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full border border-black/5 bg-white text-foreground shadow-md">
              <X className="size-4.5" />
            </button>

            <div className="flex items-center gap-3 pr-10">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-xl">✨</span>
              <div>
                <p className="whitespace-nowrap text-[7px] font-extrabold uppercase tracking-[0.1em] text-primary">Make Rewards feel more you</p>
                <h2 id="interest-popup-title" className="mt-0.5 text-[21px] font-black leading-tight tracking-tight text-foreground">What would you like to see <span className="whitespace-nowrap">more of?</span></h2>
              </div>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">Pick a few that sound good. You can change this anytime, and your rewards will keep adapting.</p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {interestOptions.map((option) => {
                const selected = interestSelected.includes(option.rewardId)
                return (
                  <button
                    key={option.rewardId}
                    type="button"
                    onClick={() => setInterestSelected((current) => selected ? current.filter((id) => id !== option.rewardId) : current.length < 3 ? [...current, option.rewardId] : current)}
                    className={cn("relative flex min-h-14 items-center gap-2 rounded-2xl border px-3 py-2.5 text-left transition-colors", selected ? "border-primary bg-primary/5" : "border-border bg-white")}
                  >
                    <span className="text-lg" aria-hidden="true">{option.emoji}</span>
                    <span className="text-[11px] font-bold leading-tight text-foreground">{option.label}</span>
                    {selected && <span className="absolute right-2 top-2 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-white">✓</span>}
                  </button>
                )
              })}
            </div>
            <p className="mt-2 text-center text-[9px] text-muted-foreground">Choose up to 3</p>

            <button type="button" disabled={interestSelected.length === 0} onClick={() => onInterestSave?.(interestSelected)} className="mt-3 w-full rounded-2xl bg-primary px-4 py-3.5 text-sm font-extrabold text-primary-foreground shadow-lg disabled:opacity-40">
              Show me more like this
            </button>
            <button type="button" onClick={onInterestDismiss} className="mt-1.5 w-full rounded-xl py-2 text-[11px] font-semibold text-muted-foreground">Not sure yet</button>
          </section>
        </div>
      )}

      {campaignOpen && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 px-4 py-12 backdrop-blur-[1px]">
          {scenario.learning && !learningPreferenceId ? (
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="reward-reveal-title"
              className="relative w-full overflow-hidden rounded-[28px] border border-white/70 bg-[#fff9f8] p-5 shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setCampaignOpen(false)}
                aria-label="Close reward suggestion"
                className="absolute right-3 top-3 z-20 flex size-9 items-center justify-center rounded-full border border-black/5 bg-white text-neutral-900 shadow-md"
              >
                <X className="size-4.5" />
              </button>

              <div className="relative mx-auto mt-1 flex h-32 max-w-[250px] items-center justify-center" aria-hidden="true">
                <div className="absolute left-5 top-5 h-20 w-24 -rotate-6 rounded-2xl bg-[linear-gradient(145deg,#ffd7df,#fff)] shadow-md" />
                <div className="absolute right-5 top-5 h-20 w-24 rotate-6 rounded-2xl bg-[linear-gradient(145deg,#dce9ff,#fff)] shadow-md" />
                <div className="relative z-10 flex size-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl ring-8 ring-white/80">
                  <Gift className="size-9" strokeWidth={1.8} />
                </div>
              </div>

              <div className="text-center">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary">A little something for you</p>
                <h2 id="reward-reveal-title" className="mx-auto mt-2 max-w-[280px] text-[25px] font-black leading-tight tracking-tight text-foreground">
                  <span className="block">Two rewards.</span>
                  <span className="block whitespace-nowrap">One quick choice.</span>
                </h2>
                <p className="mx-auto mt-2 max-w-[285px] text-xs leading-relaxed text-muted-foreground">
                  Pick the one you would be more likely to use, and we&apos;ll show you more rewards that feel relevant.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setCampaignOpen(false)
                  onNavigate("preference-choice")
                }}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 text-sm font-extrabold text-primary-foreground shadow-lg transition-transform active:scale-[0.98]"
              >
                Reveal my choices
                <ChevronRight className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setCampaignOpen(false)}
                className="mt-2 w-full rounded-xl py-2 text-xs font-semibold text-muted-foreground"
              >
                Maybe later
              </button>
            </section>
          ) : (
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="campaign-title"
            aria-label={`${campaign.label} personalised campaign`}
            className="relative aspect-[3/4] max-h-full w-full overflow-hidden rounded-[28px] border border-white/70 bg-[#fff9f8] shadow-2xl"
          >
            <Image
              src={campaign.image}
              alt={`${campaign.category} campaign background`}
              fill
              priority
              sizes="343px"
              className="object-cover"
            />
            <div
              className={cn(
                "absolute inset-0",
                campaign.tone === "dark"
                  ? "bg-[linear-gradient(180deg,rgba(3,5,24,.58)_0%,rgba(3,5,24,.12)_48%,rgba(3,5,24,.38)_100%)]"
                  : "bg-[linear-gradient(90deg,rgba(255,255,255,.48)_0%,rgba(255,255,255,.08)_68%,transparent_100%)]",
              )}
            />
            <button
              type="button"
              onClick={() => setCampaignOpen(false)}
              aria-label="Close personalised campaign"
              className="absolute right-3 top-3 z-20 flex size-10 items-center justify-center rounded-full border border-black/5 bg-white/95 text-neutral-900 shadow-lg transition-transform hover:scale-105"
            >
              <X className="size-5" />
            </button>

            <div className="relative z-10 flex h-full flex-col p-5 pt-6">
              <RewardLoopLogo />

              <div className={cn("mt-4 max-w-[60%]", campaign.tone === "dark" ? "text-white" : "text-foreground")}>
                <p className="text-sm font-semibold">Hey {customerName},</p>
                <h2
                  id="campaign-title"
                  className={cn(
                    "mt-1 text-[28px] font-black leading-[0.98] tracking-tight text-balance",
                    campaign.tone === "dark" ? "text-white" : "text-primary",
                  )}
                >
                  {campaign.label}.
                </h2>
                <p className={cn("mt-3 text-xs font-medium leading-relaxed", campaign.tone === "dark" ? "text-white/80" : "text-foreground/70")}>
                  {campaign.message}
                </p>

                <div className={cn("mt-3 max-w-[80%] border-l-2 pl-2.5", campaign.tone === "dark" ? "border-white/70" : "border-primary")}>
                  <p className={cn("text-[9px] font-extrabold uppercase tracking-[0.12em]", campaign.tone === "dark" ? "text-white/75" : "text-primary")}>
                    Just for you
                  </p>
                  <p className="mt-0.5 line-clamp-3 text-[12px] font-extrabold leading-snug">{campaignReward.name}</p>
                  <p className={cn("mt-0.5 truncate text-[10px]", campaign.tone === "dark" ? "text-white/65" : "text-foreground/55")}>
                    {campaignReward.merchant}
                  </p>
                </div>
              </div>

              <div className="mt-auto">
              <button
                type="button"
                onClick={claimCampaign}
                aria-label={campaignAlreadyClaimed ? "View personalised rewards" : `Claim ${campaignReward.name}`}
                className="flex w-full items-center justify-center rounded-2xl bg-primary px-4 py-3.5 text-sm font-extrabold text-primary-foreground shadow-lg transition-transform active:scale-[0.98]"
              >
                {campaignAlreadyClaimed ? "View personalised rewards" : "Claim your reward"}
              </button>

              <p className={cn("mt-2.5 flex items-center justify-center gap-1.5 text-[10px] font-medium", campaign.tone === "dark" ? "text-white/80" : "text-foreground/65")}>
                <Clock className={cn("size-3.5", campaign.tone === "dark" ? "text-white" : "text-primary")} />
                Available now · Review terms before redeeming
              </p>
              </div>
            </div>
          </section>
          )}
        </div>
      )}
    </div>
  )
}
