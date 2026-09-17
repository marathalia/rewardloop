import Image from "next/image"
import { Home, ReceiptText, Plane, ShoppingBag, UserRound, Wifi, SignalHigh, BatteryFull } from "lucide-react"
import { cn } from "@/lib/utils"

export function StatusBar({ dark = false }: { dark?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-6 pt-3 pb-1 text-xs font-semibold",
        dark ? "text-white" : "text-foreground",
      )}
    >
      <span>9:41</span>
      <div className="flex items-center gap-1.5">
        <SignalHigh className="size-4" />
        <Wifi className="size-4" />
        <BatteryFull className="size-4" />
      </div>
    </div>
  )
}

const navItems = [
  { id: "home", label: "Home", icon: Home, screen: "home" },
  { id: "bills", label: "Bills", icon: ReceiptText, screen: "home" },
  { id: "skytrail-pass", label: "Roaming", icon: Plane, screen: "deal", dealId: "harbor-stay" },
  { id: "shop", label: "Shop", icon: ShoppingBag, screen: "discovery" },
  { id: "me", label: "Me", icon: UserRound, screen: "vouchers" },
] as const

export function BottomNav({
  active,
  onNavigate,
}: {
  active: string
  onNavigate?: (screen: string, dealId?: string) => void
}) {
  const activeId = active === "discovery" ? "shop" : active === "vouchers" ? "me" : active
  return (
    <nav className="mt-auto grid grid-cols-5 border-t border-border bg-card px-1 pb-5 pt-2">
      {navItems.map((item) => {
        const isActive = item.id === activeId
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate?.(item.screen, "dealId" in item ? item.dealId : undefined)}
            className={cn(
              "flex flex-col items-center gap-1 py-1 text-[10px] transition-colors",
              isActive ? "font-semibold text-foreground" : "font-medium text-muted-foreground",
            )}
          >
            <item.icon className="size-5" />
            {item.label}
          </button>
        )
      })}
    </nav>
  )
}

export function RewardLoopLogo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex w-fit items-center", className)}>
      <Image
        src="/images/logo.svg"
        alt="RewardLoop"
        width={525}
        height={282}
        className="h-auto w-[76px]"
        priority
      />
    </span>
  )
}
