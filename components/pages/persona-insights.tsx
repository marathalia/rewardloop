"use client"

import {
  MessageSquare,
  Gift,
  Radio,
  Sparkles,
  Users,
  Wallet,
  Home,
  MousePointerClick,
  Gauge,
  Megaphone,
  BadgeCheck,
} from "lucide-react"
import { PageHeader, PageShell } from "@/components/page-header"
import { Card, CardContent, Badge } from "@/components/ui/primitives"
import { personas, treatmentStrategy, dataset, type PersonaId } from "@/lib/data"

const personaIcons: Record<PersonaId, React.ElementType> = {
  home: Home,
  voucher: Wallet,
  detail: MousePointerClick,
  skimmer: Gauge,
  campaign: Megaphone,
  membership: BadgeCheck,
}

const swatch = [
  "oklch(0.48 0.09 185)",
  "oklch(0.7 0.17 32)",
  "oklch(0.82 0.13 68)",
  "oklch(0.62 0.11 240)",
  "oklch(0.55 0.02 260)",
  "oklch(0.66 0.13 155)",
]

export function PersonaInsightsPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Internal Dashboard"
        title="Behavioral Cluster Insights"
        subtitle={`Six activity groups across ${dataset.uniqueUsers.toLocaleString()} customers. Group names describe observed patterns; reward, channel and message suggestions are ideas to test.`}
      />

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {personas.map((persona, i) => {
          const Icon = personaIcons[persona.id]
          return (
            <Card
              key={persona.id}
              className="group overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="h-1.5 w-full" style={{ background: swatch[i] }} />
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex size-11 items-center justify-center rounded-xl text-primary-foreground shadow-sm"
                      style={{ background: swatch[i] }}
                    >
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold leading-tight">{persona.name}</h3>
                      <p className="text-xs text-muted-foreground">{persona.behaviour}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-4 rounded-xl bg-muted/60 p-3">
                  <div className="flex items-center gap-1.5">
                    <Users className="size-4 text-muted-foreground" />
                    <span className="text-lg font-bold">{persona.users.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground">users</span>
                  </div>
                  <div className="h-6 w-px bg-border" />
                  <span className="text-lg font-bold text-primary">{persona.percent}%</span>
                  <span className="-ml-2 text-xs text-muted-foreground">of base</span>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg border border-border bg-card p-2"><p className="text-sm font-bold">{persona.avgEvents}</p><p className="text-[10px] text-muted-foreground">events/customer</p></div>
                  <div className="rounded-lg border border-border bg-card p-2"><p className="text-sm font-bold">{persona.dealDetailShare}%</p><p className="text-[10px] text-muted-foreground">avg detail share</p></div>
                  <div className="rounded-lg border border-border bg-card p-2"><p className="text-sm font-bold">{persona.voucherShare}%</p><p className="text-[10px] text-muted-foreground">avg voucher share</p></div>
                </div>

                <p className="mt-2 text-xs text-muted-foreground">Shares are averages of each customer’s event share, not conversion rates.</p>
                <div className="mt-4 space-y-3 text-sm">
                  <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Behavioural signals
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {persona.signals.map((s) => (
                        <Badge key={s} variant="muted">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex items-start gap-2">
                      <Gift className="mt-0.5 size-4 shrink-0 text-primary" />
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground">Suggested rewards</p>
                        <p className="text-[13px] leading-snug">{persona.rewardTypes}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Radio className="mt-0.5 size-4 shrink-0 text-primary" />
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground">Suggested channel</p>
                        <p className="text-[13px] leading-snug">{persona.channel}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-card p-3">
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                      <MessageSquare className="size-3.5" /> Suggested message tone: {persona.tone}
                    </p>
                    <p className="mt-1.5 text-[13px] italic leading-relaxed text-foreground/80">
                      &ldquo;{persona.toneExample}&rdquo;
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Treatment Strategy table */}
      <div className="mt-8">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          <h2 className="text-lg font-semibold tracking-tight">Ideas to test by group</h2>
        </div>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-left">
                  {["Cluster", "Trigger Moment", "Reward Type", "Channel", "Objective"].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {treatmentStrategy.map((row, i) => (
                  <tr
                    key={row.persona}
                    className={i % 2 ? "bg-muted/20" : "" + " transition-colors hover:bg-accent/40"}
                  >
                    <td className="px-4 py-3 font-medium">{row.persona}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.trigger}</td>
                    <td className="px-4 py-3">{row.reward}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">{row.channel}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge>{row.objective}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </PageShell>
  )
}
