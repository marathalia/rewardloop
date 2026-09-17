"use client"

import { useState } from "react"
import { Coffee, Clapperboard, Gamepad2, Plane, Dumbbell, Check } from "lucide-react"
import { StatusBar, RewardLoopLogo } from "../phone-chrome"
import { cn } from "@/lib/utils"

const tiles = [
  { id: "foodie", label: "Foodie / Cafe Hopper", icon: Coffee },
  { id: "entertainment", label: "Entertainment Enthusiast", icon: Clapperboard },
  { id: "gamer", label: "Gamer / Tech-Savvy", icon: Gamepad2 },
  { id: "traveller", label: "Traveller", icon: Plane },
  { id: "fitness", label: "Sports & Fitness", icon: Dumbbell },
]

export function PreferencePopup({
  onNavigate,
  onSave,
  initialSelected = ["foodie", "gamer"],
}: {
  onNavigate: (screen: string) => void
  onSave?: (selected: string[]) => void
  initialSelected?: string[]
}) {
  const [selected, setSelected] = useState<string[]>(initialSelected)

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id)
      if (prev.length >= 3) return prev
      return [...prev, id]
    })
  }

  return (
    <div className="relative flex h-full flex-col bg-foreground/40">
      {/* dimmed home hint behind */}
      <div className="pointer-events-none absolute inset-0 bg-background/10" />

      <div className="relative flex h-full flex-col">
        <StatusBar dark />
        <div className="mt-auto flex flex-col rounded-t-4xl bg-card px-6 pt-7 pb-8 shadow-2xl">
          <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-border" />
          <RewardLoopLogo className="text-sm" />
          <h1 className="mt-3 text-2xl font-extrabold leading-tight text-card-foreground text-balance">
            Tell us what you love : we&apos;ll find rewards that actually matter to you.
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">Pick up to 3 to get started.</p>

          <div className="mt-5 space-y-2.5">
            {tiles.map((tile) => {
              const isSelected = selected.includes(tile.id)
              return (
                <button
                  key={tile.id}
                  type="button"
                  onClick={() => toggle(tile.id)}
                  className={cn(
                    "flex w-full items-center gap-3.5 rounded-2xl border-2 p-3.5 text-left transition-colors",
                    isSelected
                      ? "border-primary bg-accent"
                      : "border-border bg-card hover:border-muted-foreground/30",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-xl",
                      isSelected ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground",
                    )}
                  >
                    <tile.icon className="size-5" />
                  </span>
                  <span className="flex-1 text-sm font-bold text-card-foreground">{tile.label}</span>
                  {isSelected && (
                    <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="size-3.5" />
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          <button
            type="button"
            onClick={() => onSave ? onSave(selected) : onNavigate("home")}
            disabled={selected.length === 0}
            className="mt-6 w-full rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground disabled:opacity-50"
          >
            Save my preferences
          </button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            You can update this anytime in your profile.
          </p>
        </div>
      </div>
    </div>
  )
}
