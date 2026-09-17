import Image from "next/image"
import { Clock } from "lucide-react"
import type { Deal } from "@/lib/reward-data"
import { cn } from "@/lib/utils"

export function DealCard({
  deal,
  onOpen,
}: {
  deal: Deal
  onOpen?: (id: string) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen?.(deal.id)}
      className="flex h-[278px] w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card text-left shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative h-28 w-full shrink-0">
        <Image src={deal.image || "/placeholder.svg"} alt={deal.name} fill className="object-cover" />
        {deal.eligible && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-success px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-success-foreground shadow-sm">
            Eligible
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-3">
        <p className="truncate text-[11px] font-medium text-muted-foreground">{deal.merchant}</p>
        <h3 className="mt-0.5 line-clamp-2 min-h-[2.3rem] text-[13px] font-bold leading-[1.15rem] text-card-foreground">
          {deal.name}
        </h3>
        <div className="mt-auto flex min-w-0 flex-col items-start gap-1.5 pt-2.5 text-[11px] text-muted-foreground">
          <span className="max-w-full rounded-lg bg-secondary px-2 py-1 font-medium leading-tight text-secondary-foreground">
            {deal.category}
          </span>
          <span className="flex min-w-0 items-center gap-1 whitespace-nowrap">
            <Clock className="size-3 shrink-0" />
            {deal.expiry === "Check RewardLoop app" ? "Available now" : `${deal.expiresInDays} days`}
          </span>
        </div>
      </div>
    </button>
  )
}

export function DealRowCard({ deal, onOpen, tag }: { deal: Deal; onOpen?: (id: string) => void; tag?: string }) {
  return (
    <button
      type="button"
      onClick={() => onOpen?.(deal.id)}
      className={cn(
        "flex h-[278px] w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card text-left shadow-sm",
      )}
    >
      <div className="relative h-28 w-full">
        <Image src={deal.image || "/placeholder.svg"} alt={deal.name} fill className="object-cover" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-3">
        <p className="truncate text-[11px] font-medium text-muted-foreground">{deal.merchant}</p>
        <h3 className="mt-0.5 line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-snug text-card-foreground">{deal.name}</h3>
        <span className="mt-2 w-fit max-w-full rounded-lg bg-secondary px-2 py-1 text-[11px] font-medium leading-tight text-secondary-foreground">
          {tag ?? deal.category}
        </span>
        <p className="mt-auto flex items-center gap-1 pt-2 text-[11px] text-muted-foreground">
          <Clock className="size-3" />
          {deal.expiry === "Check RewardLoop app" ? "Available now" : `Expires in ${deal.expiresInDays} days`}
        </p>
      </div>
    </button>
  )
}
