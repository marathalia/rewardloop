import { BatteryFull, Camera, Flashlight, SignalHigh, Wifi } from "lucide-react"
import type { CustomerScenario } from "@/lib/mvp-engine"
import { getDeal } from "@/lib/reward-data"

export function LockScreen({
  scenario,
  dealId,
  onNavigate,
}: {
  scenario: CustomerScenario
  dealId: string
  onNavigate: (screen: string, dealId?: string) => void
}) {
  const deal = getDeal(dealId) ?? getDeal("maple-coffee")!
  const body = scenario.learning
    ? `A fresh reward to explore: ${deal.name}. Tap to see if this feels relevant.`
    : scenario.id === "voucher-savings"
      ? `${deal.name} is ready in My Vouchers. Tap to review the current terms.`
      : scenario.id === "campaign-travel"
        ? `Continue your travel journey with ${deal.name}. Tap to view eligibility and booking terms.`
        : `${deal.name} was selected for you based on your recent rewards activity.`

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#263447] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(143,164,197,0.8),transparent_34%),radial-gradient(circle_at_22%_68%,rgba(83,108,145,0.72),transparent_42%),linear-gradient(160deg,#1b2431_0%,#3c506d_48%,#18212d_100%)]" />
      <div className="absolute -right-20 top-36 size-72 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -left-24 bottom-24 size-80 rounded-full bg-sky-300/10 blur-3xl" />

      <div className="relative flex h-full flex-col px-4 pb-3 pt-3">
        <div className="flex items-center justify-between px-2 text-xs font-semibold drop-shadow">
          <span>9:41</span>
          <div className="flex items-center gap-1.5">
            <SignalHigh className="size-4" strokeWidth={2.4} />
            <Wifi className="size-4" strokeWidth={2.4} />
            <BatteryFull className="size-[18px]" strokeWidth={2.4} />
          </div>
        </div>

        <div className="mt-7 text-center drop-shadow-md">
          <p className="text-[15px] font-medium">Wednesday, 15 July</p>
          <p className="-mt-1 text-[76px] font-extralight leading-none tracking-[-0.06em]">9:41</p>
        </div>

        <div className="mt-8">
          <button
            type="button"
            onClick={() => onNavigate("deal", deal.id)}
            className="w-full rounded-[1.45rem] border border-white/30 bg-white/80 p-3 text-left text-black shadow-xl backdrop-blur-2xl transition-transform active:scale-[0.98]"
            aria-label={`Open ${deal.name}`}
          >
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-[#ee174c] text-[13px] font-black lowercase tracking-tight text-white shadow-sm">s</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-semibold uppercase tracking-wide text-black/55">RewardLoop</span>
                <span className="block truncate text-[13px] font-semibold">A reward picked for you</span>
              </span>
              <span className="self-start pt-0.5 text-[11px] text-black/45">now</span>
            </div>
            <p className="mt-2 line-clamp-3 text-[13px] leading-[1.28] text-black/80">{body}</p>
          </button>

          <div className="mx-auto mt-2 h-1 w-9 rounded-full bg-white/55" />
          <p className="mt-2 text-center text-[11px] font-medium text-white/85 drop-shadow">Tap the notification to open the matched reward</p>
        </div>

        <div className="mt-auto flex items-center justify-between px-5 pb-2">
          <span className="flex size-12 items-center justify-center rounded-full bg-black/35 backdrop-blur-xl"><Flashlight className="size-5" fill="currentColor" /></span>
          <span className="flex size-12 items-center justify-center rounded-full bg-black/35 backdrop-blur-xl"><Camera className="size-5" fill="currentColor" /></span>
        </div>
        <div className="mx-auto h-1.5 w-32 rounded-full bg-white" />
      </div>
    </div>
  )
}
