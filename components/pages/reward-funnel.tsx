"use client"

import { ArrowRight, TrendingDown, Info } from "lucide-react"
import { PageHeader, PageShell } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/primitives"
import { funnelStages, unavailableJourney } from "@/lib/data"

const possibleReasons: Record<string, string> = {
  "Deal Listing": "Customers may only be checking the dashboard, or the route to available deals may be hard to notice.",
  "Deal Click": "The offers may not feel relevant or valuable enough to open.",
  "Deal Detail": "A page may fail to load, or its view event may not be recorded after a click.",
  "Redeem Screen": "Eligibility, availability or offer terms may discourage the next step. Customers may also be browsing for later.",
}
const format = (value: number) => value.toLocaleString("en-SG")
const percent = (value: number, total: number) => total > 0 ? value / total * 100 : 0

export function RewardFunnelPage() {
  const startingSessions = funnelStages[0]?.value ?? 0
  const transitions = funnelStages.slice(1).map((stage, index) => {
    const previous = funnelStages[index]
    const lost = previous.value - stage.value
    return { stage, previous, lost, drop: percent(lost, previous.value) }
  })
  const largestLoss = [...transitions].sort((a, b) => b.lost - a.lost)[0]

  return (
    <PageShell>
      <PageHeader eyebrow="Internal Dashboard" title="Reward Funnel" subtitle="See where reward sessions progress and where they stop reaching the next step." />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Session flow</CardTitle>
          <p className="text-sm text-muted-foreground">{format(startingSessions)} starting sessions. Each step must follow the previous one in the same session.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="hidden grid-cols-[160px_minmax(0,1fr)_140px] gap-4 text-xs text-muted-foreground sm:grid"><span>Step</span><span>Share of starting sessions · same scale for every bar</span><span className="text-right">Sessions / share</span></div>
          {funnelStages.map(stage => {
            const width = percent(stage.value, startingSessions)
            return (
              <div key={stage.stage} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 sm:grid-cols-[160px_minmax(0,1fr)_140px]">
                <span className="text-sm font-medium">{stage.stage}</span>
                <div aria-hidden="true" className="col-span-2 row-start-2 h-9 overflow-hidden rounded-lg bg-muted sm:col-span-1 sm:col-start-2 sm:row-start-auto">
                  <div className="h-full rounded-sm bg-primary" style={{ width: `${width}%` }} />
                </div>
                <div className="col-start-2 row-start-1 text-right tabular-nums sm:col-start-3 sm:row-start-auto"><span className="text-sm font-semibold">{format(stage.value)}</span><span className="ml-2 text-xs text-muted-foreground">{width.toFixed(2)}%</span></div>
              </div>
            )
          })}
          <p className="border-t border-border pt-3 text-xs text-muted-foreground">Reaching the redeem screen does not confirm a completed redemption.</p>
        </CardContent>
      </Card>

      <div className="mb-4 mt-7"><h2 className="text-lg font-semibold">Where sessions drop off</h2><p className="mt-1 text-sm text-muted-foreground">Drop-off means the next step was not recorded in order. It does not always mean the customer left the app.</p></div>
      <div className="grid gap-4 lg:grid-cols-2">
        {transitions.map(({ stage, previous, lost, drop }) => (
          <Card key={stage.stage}>
            <CardHeader className="pb-3"><CardTitle className="flex flex-wrap items-center gap-2 text-sm">{previous.stage}<ArrowRight aria-hidden="true" className="size-4 text-muted-foreground" />{stage.stage}</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1"><span className="text-2xl font-bold tabular-nums">{format(lost)}</span><span className="text-sm text-muted-foreground">sessions did not reach the next step</span></div>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-primary"><TrendingDown aria-hidden="true" className="size-4" /><strong className="tabular-nums">{drop.toFixed(2)}%</strong><span>of {format(previous.value)} sessions at {previous.stage}</span></p>
              <div className="mt-4 border-t border-border pt-3"><p className="text-xs font-semibold text-muted-foreground">Possible reasons to check</p><p className="mt-1 text-sm leading-relaxed">{possibleReasons[stage.stage] ?? "The saved funnel does not identify the reason for this gap."}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4"><TrendingDown aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" /><p className="text-sm leading-relaxed"><strong>Largest loss by session count: </strong>{largestLoss ? `${largestLoss.previous.stage} to ${largestLoss.stage.stage}, with ${format(largestLoss.lost)} sessions not reaching the next step.` : "No transitions available."}</p></div>

      <Card className="mt-4">
        <CardHeader><CardTitle className="flex items-center gap-2"><Info aria-hidden="true" className="size-4 text-primary" />What the data can tell us about the reasons</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed">
          <p>Across all app sessions, <strong>{format(unavailableJourney.sessions)}</strong> reached an unavailable reward or Rewards error state. Of those, <strong>{format(unavailableJourney.endedAtUnavailable)} ({unavailableJourney.droppedAfter}%)</strong> ended on that state.</p>
          <p className="text-muted-foreground">These counts are not linked to individual funnel gaps in the saved results. The possible reasons above are hypotheses, not measured causes. Linking error states, eligibility messages and page-loading events to each session would help check them.</p>
        </CardContent>
      </Card>
    </PageShell>
  )
}
