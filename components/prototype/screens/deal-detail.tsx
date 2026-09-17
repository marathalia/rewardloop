"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronDown, Clock, Tag, BadgeCheck, Check } from "lucide-react"
import { StatusBar } from "../phone-chrome"
import { getDeal } from "@/lib/reward-data"
import { cn } from "@/lib/utils"

export function DealDetail({
  dealId,
  onNavigate,
  onClaim,
  claimed = false,
}: {
  dealId: string
  onNavigate: (screen: string, dealId?: string) => void
  onClaim?: (dealId: string) => void
  claimed?: boolean
}) {
  const deal = getDeal(dealId) ?? getDeal("maple-coffee")!
  const [open, setOpen] = useState(true)

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="relative">
        <div className="relative h-64 w-full">
          <Image src={deal.image || "/placeholder.svg"} alt={deal.name} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
        </div>
        <div className="absolute inset-x-0 top-0">
          <StatusBar dark />
        </div>
        <button
          type="button"
          onClick={() => onNavigate("discovery")}
          className="absolute left-4 top-12 flex size-9 items-center justify-center rounded-full bg-card/90 text-card-foreground shadow-sm"
          aria-label="Back"
        >
          <ChevronLeft className="size-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-2.5 py-1 text-[11px] font-bold text-success">
          <BadgeCheck className="size-3.5" />
          Eligible · Worth {deal.value}
        </span>
        <h1 className="mt-3 text-2xl font-extrabold leading-tight text-foreground text-balance">{deal.name}</h1>
        <p className="mt-1 text-sm font-semibold text-muted-foreground">{deal.merchant}</p>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 font-medium text-secondary-foreground">
            <Tag className="size-3" />
            {deal.category}
          </span>
          <span className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 font-medium text-secondary-foreground">
            <Clock className="size-3" />
            {deal.expiry === "Check RewardLoop app" ? "Check current availability in RewardLoop" : `Expires ${deal.expiry}`}
          </span>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-foreground/80">{deal.description}</p>
        {/* Accordion */}
        <div className="mt-5 overflow-hidden rounded-2xl border border-border">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex w-full items-center justify-between bg-card px-4 py-3.5 text-sm font-bold text-card-foreground"
          >
            How to redeem
            <ChevronDown className={cn("size-5 transition-transform", open && "rotate-180")} />
          </button>
          {open && (
            <ol className="space-y-3 border-t border-border bg-card px-4 py-4">
              {deal.redeemSteps.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-foreground/80">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      <div className="border-t border-border bg-card px-5 pt-3 pb-6">
        <button
          type="button"
          onClick={() => {
            if (claimed) onNavigate("vouchers")
            else onClaim?.(deal.id)
          }}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold transition-colors",
            claimed ? "bg-success text-success-foreground" : "bg-primary text-primary-foreground",
          )}
        >
          {claimed ? (
            <>
              <Check className="size-5" />
              Claimed : added to My Vouchers
            </>
          ) : (
            "Claim Now"
          )}
        </button>
        <p className="mt-2.5 text-center text-xs text-muted-foreground">Already claimed? View in My Vouchers</p>
      </div>
    </div>
  )
}
