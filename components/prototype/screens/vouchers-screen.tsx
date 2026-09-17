import Image from "next/image"
import { ChevronRight, Clock3, Gift, Wallet } from "lucide-react"
import { BottomNav, StatusBar } from "../phone-chrome"
import { deals } from "@/lib/reward-data"

export function VouchersScreen({
  claimedIds,
  onNavigate,
}: {
  claimedIds: string[]
  onNavigate: (screen: string, dealId?: string) => void
}) {
  const claimed = deals.filter((deal) => claimedIds.includes(deal.id))
  const expiringSoon = claimed.filter((deal) => deal.expiresInDays <= 7)
  const vouchers = claimed.filter((deal) => deal.expiresInDays > 7)

  const VoucherCard = ({ deal, expiring = false }: { deal: (typeof claimed)[number]; expiring?: boolean }) => (
    <button type="button" onClick={() => onNavigate("deal", deal.id)} className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left">
      <div className="relative size-16 shrink-0 overflow-hidden rounded-xl"><Image src={deal.image} alt="" fill className="object-cover" /></div>
      <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{deal.name}</p><p className="text-xs text-muted-foreground">{deal.merchant}</p><span className={expiring ? "mt-1 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700" : "mt-1 inline-block rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success"}>{expiring && <Clock3 className="size-3" />}{expiring ? deal.expiry : "Ready to use"}</span></div>
      <ChevronRight className="size-5 text-muted-foreground" />
    </button>
  )

  return (
    <div className="flex h-full flex-col bg-background">
      <StatusBar />
      <header className="px-5 py-3">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold"><Wallet className="size-6 text-primary" />My Vouchers</h1>
        <p className="text-sm text-muted-foreground">Your claimed rewards, ready to use.</p>
      </header>
      <div className="flex-1 overflow-y-auto px-5 pb-4">
        {claimed.length === 0 ? (
          <div className="mt-16 flex flex-col items-center text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-accent text-primary"><Gift className="size-7" /></span>
            <h2 className="mt-4 text-lg font-bold">No vouchers yet</h2>
            <p className="mt-1 max-w-[240px] text-sm text-muted-foreground">Explore rewards picked for you and claim one in a tap.</p>
            <button type="button" onClick={() => onNavigate("discovery")} className="mt-5 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">Explore rewards</button>
          </div>
        ) : (
          <div className="space-y-5 pt-2">
            {expiringSoon.length > 0 && <section>
              <div className="mb-2 flex items-center gap-1.5"><Clock3 className="size-4 text-amber-600" /><h2 className="text-sm font-extrabold">Expiring soon</h2></div>
              <div className="space-y-3">{expiringSoon.map((deal) => <VoucherCard key={deal.id} deal={deal} expiring />)}</div>
            </section>}
            {vouchers.length > 0 && <section>
              <h2 className="mb-2 text-sm font-extrabold">My vouchers</h2>
              <div className="space-y-3">{vouchers.map((deal) => <VoucherCard key={deal.id} deal={deal} />)}</div>
            </section>}
          </div>
        )}
      </div>
      <BottomNav active="vouchers" onNavigate={onNavigate} />
    </div>
  )
}
