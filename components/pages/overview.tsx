"use client"

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts"
import {
  CalendarDays,
  Users,
  MousePointerClick,
  Layers,
  AlertTriangle,
  Database,
  Workflow,
} from "lucide-react"
import { PageHeader, PageShell } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/primitives"
import {
  categoryEngagement,
  clusterModel,
  dailyEvents,
  dataSource,
  dataset,
  dealConcentration,
  funnelStages,
  personas,
  topDeals,
  unavailableJourney,
} from "@/lib/data"

const chartColors = [
  "oklch(0.48 0.09 185)",
  "oklch(0.7 0.17 32)",
  "oklch(0.82 0.13 68)",
  "oklch(0.62 0.11 240)",
  "oklch(0.55 0.02 260)",
  "oklch(0.66 0.13 155)",
]

const kpiIcons = [Database, Users, Layers, Users, AlertTriangle, MousePointerClick]

function TooltipBox({ active, payload, label, suffix = "" }: {
  active?: boolean
  payload?: { name: string; value: number; color?: string }[]
  label?: string
  suffix?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-md">
      {label && <p className="mb-1 font-medium">{label}</p>}
      {payload.map((item, index) => (
        <p key={index} className="flex items-center gap-1.5 text-muted-foreground">
          <span className="size-2 rounded-full" style={{ background: item.color }} />
          {item.name}: <span className="font-semibold text-foreground">{item.value.toLocaleString()}{suffix}</span>
        </p>
      ))}
    </div>
  )
}

export function OverviewPage() {
  const observedDates = new Map(dailyEvents.map(day => [day.date, day.events]))
  const chartDays: { date: string; events: number | null }[] = []
  for (let day = new Date(`${dataset.minDate}T00:00:00Z`); day <= new Date(`${dataset.maxDate}T00:00:00Z`); day.setUTCDate(day.getUTCDate() + 1)) {
    const date = day.toISOString().slice(0, 10)
    chartDays.push({ date, events: observedDates.get(date) ?? null })
  }
  const dashboardSessions = funnelStages[0]?.value ?? 0
  const dealClicks = funnelStages.find(stage => stage.stage === "Deal Click")?.value ?? 0
  const largest = [...personas].sort((a, b) => b.users - a.users)[0]
  const kpis = [
    { label: "Recorded events", value: dataset.totalEvents.toLocaleString(), sub: "Screen views, clicks and other actions" },
    { label: "Customers", value: dataset.uniqueUsers.toLocaleString(), sub: "Distinct customer IDs" },
    { label: "App sessions", value: dataset.sessions.toLocaleString(), sub: "Includes repeat visits" },
    { label: "Largest group", value: `${largest.percent}%`, sub: largest.name },
    { label: "Unavailable sessions", value: unavailableJourney.sessions.toLocaleString(), sub: "Reward unavailable or error shown" },
    { label: "Deal-click reach", value: `${(dashboardSessions ? dealClicks / dashboardSessions * 100 : 0).toFixed(2)}%`, sub: "Of Rewards Dashboard sessions" },
  ]
  const clusterPie = personas.map((cluster, index) => ({
    name: cluster.name,
    value: cluster.percent,
    users: cluster.users,
    color: chartColors[index],
  }))

  return (
    <PageShell>
      <PageHeader
        eyebrow="Rewards overview"
        title="RewardLoop Lens"
        subtitle="Customer activity, reward interests and the journey from browsing to redemption screens."
      >
        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-sm font-medium shadow-sm">
          <CalendarDays className="size-4 text-primary" />
          {dataset.dateRange.split(" to ").map(date => new Date(`${date}T00:00:00Z`).toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })).join(" to ")}
        </div>
      </PageHeader>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {kpis.map((kpi, index) => {
          const Icon = kpiIcons[index]
          return (
            <Card key={kpi.label} className="group relative overflow-hidden transition-shadow hover:shadow-md">
              <CardContent className="p-4">
                <div className="mb-3 flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="size-4" /></div>
                <p className="text-xl font-bold tracking-tight md:text-2xl">{kpi.value}</p>
                <p className="mt-0.5 text-xs font-medium text-foreground/80">{kpi.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{kpi.sub}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Daily activity</CardTitle>
          <p className="text-sm text-muted-foreground">Recorded actions across {dataset.days} dates · {dataSource.timezone}. Generated from a fixed random seed.</p>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartDays} margin={{ left: 8, right: 16, top: 8, bottom: 4 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} interval={6} tickFormatter={(value) => value.slice(5)} stroke="var(--border)" />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickFormatter={(value) => value >= 1000 ? `${Number((value / 1000).toFixed(1))}k` : String(value)} stroke="var(--border)" />
                <Tooltip content={<TooltipBox />} />
                <Line type="linear" dataKey="events" name="Events" stroke={chartColors[0]} strokeWidth={2.5} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer groups</CardTitle>
            <p className="text-sm text-muted-foreground">Share of {dataset.uniqueUsers.toLocaleString()} customers. Each belongs to one group.</p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <div className="h-64 w-full sm:w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={clusterPie} dataKey="value" nameKey="name" innerRadius={58} outerRadius={96} paddingAngle={2} stroke="none" isAnimationActive={false}>
                      {clusterPie.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                    </Pie>
                    <Tooltip content={<TooltipBox suffix="%" />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="w-full space-y-2 sm:w-1/2">
                {clusterPie.map((cluster) => (
                  <li key={cluster.name} className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex min-w-0 items-center gap-2"><span className="size-2.5 shrink-0 rounded-full" style={{ background: cluster.color }} /><span className="leading-snug">{cluster.name}</span></span>
                    <span className="font-semibold">{cluster.value}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity by reward category</CardTitle>
            <p className="text-sm text-muted-foreground">Share of category-specific events. General browsing is excluded.</p>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryEngagement} layout="vertical" margin={{ left: 12, right: 24 }}>
                  <XAxis type="number" domain={[0, "auto"]} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickFormatter={(value) => `${value}%`} stroke="var(--border)" />
                  <YAxis type="category" dataKey="category" width={155} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} stroke="var(--border)" />
                  <Tooltip content={<TooltipBox suffix="%" />} cursor={{ fill: "var(--muted)" }} />
                  <Bar dataKey="value" name="Event share" radius={[0, 6, 6, 0]} fill={chartColors[0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>From browsing to redeem screen</CardTitle>
            <p className="text-sm text-muted-foreground">Sessions reaching each step in order. Percentages use {dashboardSessions.toLocaleString()} starting sessions.</p>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {funnelStages.map((stage, index) => (
              <div key={stage.stage}>
                <div className="mb-1 flex items-center justify-between text-sm"><span className="font-medium">{stage.stage}</span><span className="text-muted-foreground">{stage.value.toLocaleString()} · {stage.percent}%</span></div>
                <div className="h-7 w-full overflow-hidden rounded-lg bg-muted"><div className="h-full rounded-lg bg-primary" style={{ width: `${Math.max(0, Math.min(stage.percent, 100))}%`, opacity: 1 - index * 0.12 }} /></div>
              </div>
            ))}
            <p className="pt-2 text-xs text-muted-foreground">Redeem-screen visits do not confirm completed redemptions.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Workflow className="size-4 text-primary" />About the customer groups</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <MetricRow label="Method" value="K-Means" />
            <MetricRow label="Customer groups" value={`${clusterModel.clusters} clusters`} />
            <MetricRow label="Customer coverage" value={`${clusterModel.coverage}%`} />
            <MetricRow label="Final model separation score" value={clusterModel.sampleSilhouette.toFixed(4)} />
            <MetricRow label="Group counts tested" value={`k=3 to k=8`} />
            <p className="rounded-lg bg-muted/60 p-2.5 text-xs leading-relaxed text-muted-foreground">The groups describe generated activity patterns. This score measures separation on synthetic data, not accuracy on real customers.</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Where deal clicks go</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <ProgressMetric label="Top 10 named deals" value={dealConcentration.top10} />
            <ProgressMetric label="Top 20 named deals" value={dealConcentration.top20} />
            <p className="text-xs text-muted-foreground">Share of {dealConcentration.namedDealClicks.toLocaleString()} clicks on named deals.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="size-4 text-primary" />Unavailable rewards & errors</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-3xl font-bold">{unavailableJourney.sessions.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">sessions reached an unavailable or Rewards error state</p>
            <p className="text-2xl font-bold text-primary">{unavailableJourney.droppedAfter}%</p>
            <p className="text-xs text-muted-foreground">ended on that state ({unavailableJourney.endedAtUnavailable.toLocaleString()} sessions)</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4 overflow-hidden">
        <CardHeader>
          <CardTitle>Most-clicked deals</CardTitle>
          <p className="text-sm text-muted-foreground">Top 10 by deal clicks. Customer and session counts include all activity for each deal.</p>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead><tr className="border-y border-border bg-muted/50 text-left"><th className="px-4 py-3">Deal</th><th className="px-4 py-3">Category</th><th className="px-4 py-3 text-right">Deal clicks</th><th className="px-4 py-3 text-right">Customers</th><th className="px-4 py-3 text-right">Sessions</th><th className="px-4 py-3 text-right">All events</th></tr></thead>
            <tbody>{topDeals.slice(0, 10).map((deal, index) => <tr key={deal.name} className={index % 2 ? "bg-muted/20" : ""}><td className="max-w-[360px] px-4 py-3 font-medium">{deal.name}</td><td className="px-4 py-3 text-muted-foreground">{deal.category}</td><td className="px-4 py-3 text-right font-semibold">{deal.dealClicks.toLocaleString()}</td><td className="px-4 py-3 text-right">{deal.users.toLocaleString()}</td><td className="px-4 py-3 text-right">{deal.sessions.toLocaleString()}</td><td className="px-4 py-3 text-right">{deal.events.toLocaleString()}</td></tr>)}</tbody>
          </table>
        </div>
      </Card>

    </PageShell>
  )
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-start justify-between gap-3 border-b border-border pb-2 last:border-0"><span className="text-xs text-muted-foreground">{label}</span><span className="max-w-[60%] text-right text-xs font-semibold">{value}</span></div>
}

function ProgressMetric({ label, value }: { label: string; value: number }) {
  return <div><div className="flex items-baseline justify-between"><span className="text-sm text-muted-foreground">{label}</span><span className="text-2xl font-bold text-primary">{value}%</span></div><div className="mt-1.5 h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} /></div></div>
}
