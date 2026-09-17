"use client"

import { useMemo, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import {
  BrainCircuit,
  CheckCircle2,
  FlaskConical,
  GraduationCap,
  Heart,
  Info,
  Lightbulb,
  MousePointerClick,
  RefreshCw,
  Sparkles,
  Target,
  Users,
} from "lucide-react"
import { PageHeader, PageShell } from "@/components/page-header"
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui/primitives"
import preferenceData from "@/lib/preference-dashboard-data.json"
import { cn } from "@/lib/utils"

const colors = [
  "oklch(0.55 0.02 260)",
  "oklch(0.48 0.09 185)",
  "oklch(0.7 0.17 32)",
  "oklch(0.62 0.11 240)",
  "oklch(0.66 0.13 155)",
  "oklch(0.72 0.13 290)",
  "oklch(0.82 0.13 68)",
  "oklch(0.68 0.14 335)",
  "oklch(0.58 0.12 195)",
]

const learningSteps = [
  {
    name: "Choose interests",
    design: "Let customers choose the reward categories they like. Vary the order so one option is not always first.",
    signal: "The categories they choose.",
    next: "Use their choices as a starting point for recommendations.",
  },
  {
    name: "Try different rewards",
    design: "Test a recommended row against the same row with one different, eligible reward.",
    signal: "Which rewards customers open, save or continue towards redeeming.",
    next: "Check whether showing something different helps customers find useful rewards.",
  },
  {
    name: "Compare message styles",
    design: "Show two randomly assigned groups different messages for the same eligible reward: one about savings, one about how it fits their interests.",
    signal: "The share of customers who click each message.",
    next: "Check which wording works better while keeping the offer the same.",
  },
  {
    name: "Learn from later activity",
    design: "Compare customers’ chosen interests with the rewards they interact with over time.",
    signal: "Whether later activity supports their earlier choices.",
    next: "Adjust recommendations as interests change or more information becomes available.",
  },
]

const learningReasonLabels: Record<string, string> = {
  no_category_signal: "No category signal",
  insufficient_evidence: "More interactions needed",
  ambiguous_mix: "Mixed preferences",
  narrow_margin: "Top choices too close",
  graduated: "Preference known",
}

export function PreferenceClustersPage() {
  const [selected, setSelected] = useState("Learning")
  const selectedCluster = preferenceData.clusters.find((cluster) => cluster.name === selected) ?? preferenceData.clusters[0]
  const filteredProfiles = useMemo(
    () => preferenceData.sampleProfiles.filter((profile) => profile.preferenceCluster === selected).slice(0, 5),
    [selected],
  )

  return (
    <PageShell>
      <PageHeader
        eyebrow="Personalisation Intelligence"
        title="Reward Preference Clusters"
        subtitle="An exploratory layer of category-interest scores based on recorded interactions. These rules do not confirm a customer’s preferences."
      />


      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard icon={Users} label="Customers scored" value={preferenceData.coverage.customers.toLocaleString()} sub="same full customer base" />
        <MetricCard icon={CheckCircle2} label="Meets current rules" value={`${preferenceData.coverage.knownShare}%`} sub={`${preferenceData.coverage.knownCustomers.toLocaleString()} customers`} />
        <MetricCard icon={GraduationCap} label="Still learning" value={`${preferenceData.coverage.learningShare}%`} sub={`${preferenceData.coverage.learningCustomers.toLocaleString()} customers`} highlight />
        <MetricCard icon={Lightbulb} label="No signal yet" value={preferenceData.coverage.noSignalCustomers.toLocaleString()} sub="cold-start opportunity" />
        <MetricCard icon={Target} label="Ambiguous evidence" value={preferenceData.coverage.ambiguousCustomers.toLocaleString()} sub="needs controlled exploration" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <CardHeader>
            <CardTitle>Preference-cluster distribution</CardTitle>
            <p className="text-sm text-muted-foreground">All customers receive exactly one preference state; bars start at zero</p>
          </CardHeader>
          <CardContent>
            <div className="h-[360px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={preferenceData.clusters} layout="vertical" margin={{ left: 28, right: 26 }}>
                  <XAxis type="number" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickFormatter={(value) => `${Math.round(value / 1000)}k`} stroke="var(--border)" />
                  <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} stroke="var(--border)" />
                  <Tooltip formatter={(value) => Number(value).toLocaleString()} cursor={{ fill: "var(--muted)" }} />
                  <Bar dataKey="customers" name="Customers" fill="oklch(0.48 0.09 185)" radius={[0, 6, 6, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-gradient-to-br from-accent/60 to-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BrainCircuit className="size-5 text-primary" />Two-layer model</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <LayerCard number="1" title="Behavior cluster" text="How the customer engages: Home browser, voucher manager, deal explorer, skimmer, campaign responder or perk browser." />
            <div className="flex justify-center"><span className="h-5 w-px bg-border" /></div>
            <LayerCard number="2" title="Reward preference" text="What they appear to like: food, travel, gaming, entertainment, wellness, membership, seasonal or savings." />
            <div className="flex justify-center"><span className="h-5 w-px bg-border" /></div>
            <LayerCard number="3" title="Next-best treatment" text="Combine moment × preference × eligibility × channel, with exploration for customers still learning." />
            <div className="rounded-xl border border-primary/20 bg-card p-3 text-xs leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground">Example:</span> Deal Detail Power Browser × Food & Dining → surface richer F&B comparisons. Campaign Responder × Learning → preserve the campaign offer and reserve one slot for controlled exploration.
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div><h2 className="text-lg font-semibold tracking-tight">Preference operating clusters</h2><p className="text-sm text-muted-foreground">Select a cluster to inspect confidence and example customer profiles.</p></div>
          <Badge variant="outline">{preferenceData.coverage.classifiedEventShare}% of events carry a classifiable reward signal</Badge>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {preferenceData.clusters.map((cluster, index) => (
            <button key={cluster.name} type="button" onClick={() => setSelected(cluster.name)} className={cn("rounded-2xl border bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md", selected === cluster.name ? "border-primary ring-2 ring-primary/10" : "border-border")}>
              <div className="flex items-start justify-between gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl text-white" style={{ background: colors[index] }}>{cluster.name === "Learning" ? <BrainCircuit className="size-5" /> : <Heart className="size-5" />}</span>
                <Badge variant={cluster.name === "Learning" ? "warning" : "muted"}>{cluster.share}%</Badge>
              </div>
              <h3 className="mt-3 font-semibold">{cluster.name}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{cluster.description}</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs"><span><strong className="block text-base text-foreground">{cluster.customers.toLocaleString()}</strong>customers</span><span><strong className="block text-base text-foreground">{cluster.avgTopShare}%</strong>avg top share</span></div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle>{selectedCluster.name} treatment</CardTitle>
            <p className="text-sm text-muted-foreground">{selectedCluster.customers.toLocaleString()} customers · {selectedCluster.share}% of base</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recommended push strategy</p><p className="mt-1 text-sm leading-relaxed">{selectedCluster.push}</p></div>
            <div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Representative reward types</p><div className="mt-2 flex flex-wrap gap-1.5">{selectedCluster.examples.map((example) => <Badge key={example} variant="muted">{example}</Badge>)}</div></div>
            <div className="grid grid-cols-3 gap-2 text-center"><SmallMetric value={selectedCluster.avgSignalEvents} label="avg signals" /><SmallMetric value={`${selectedCluster.avgTopShare}%`} label="top share" /><SmallMetric value={`${selectedCluster.avgMargin}%`} label="margin" /></div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader><CardTitle>Example anonymised profiles</CardTitle><p className="text-sm text-muted-foreground">Examples are truncated hashed IDs; no direct customer identity is shown.</p></CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead><tr className="border-y border-border bg-muted/50 text-left"><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Behavior cluster</th><th className="px-4 py-3">Top signal</th><th className="px-4 py-3">Evidence</th><th className="px-4 py-3">Confidence</th></tr></thead>
              <tbody>{filteredProfiles.map((profile, index) => <tr key={profile.customerId} className={index % 2 ? "bg-muted/20" : ""}><td className="px-4 py-3 font-mono text-xs">{profile.customerId}</td><td className="px-4 py-3">{profile.behaviorCluster}</td><td className="px-4 py-3">{profile.topPreference}</td><td className="px-4 py-3">{profile.signalEvents} signals</td><td className="px-4 py-3"><Badge variant={profile.preferenceCluster === "Learning" ? "warning" : "success"}>{profile.preferenceCluster === "Learning" ? learningReasonLabels[profile.learningReason] : `${profile.topShare}% top share`}</Badge></td></tr>)}</tbody>
            </table>
          </div>
        </Card>
      </div>

      <Card className="mt-6 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sparkles className="size-5 text-primary" />Learning customer preferences</CardTitle>
          <p className="text-sm text-muted-foreground">Customer choices and later activity can help improve future recommendations. These tests are proposed; improvements still need to be measured.</p>
        </CardHeader>
        <CardContent>
          <Badge variant="outline" className="mb-4">Proposed tests</Badge>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {learningSteps.map((experiment, index) => (
              <div key={experiment.name} className="rounded-xl border border-border bg-card p-4">
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">{index === 0 ? <MousePointerClick className="size-4" /> : index === 1 ? <FlaskConical className="size-4" /> : index === 2 ? <Target className="size-4" /> : <Lightbulb className="size-4" />}</span>
                <h3 className="mt-3 text-sm font-semibold">{experiment.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{experiment.design}</p>
                <div className="mt-3 border-t border-border pt-3 text-xs"><p><span className="font-semibold">What we learn:</span> {experiment.signal}</p><p className="mt-1"><span className="font-semibold">How we use it:</span> {experiment.next}</p></div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-start gap-3 rounded-xl bg-primary/5 p-4"><RefreshCw className="mt-0.5 size-5 shrink-0 text-primary" /><div><p className="text-sm font-semibold">When we have enough information</p><p className="mt-1 text-sm leading-relaxed text-muted-foreground">We look for repeated activity and a clear lead for one reward category. Until then, the customer stays in Learning. The current cut-offs are initial rules to test, not proof that a preference is correct.</p><details className="mt-3"><summary className="cursor-pointer text-xs font-medium focus-visible:outline-2 focus-visible:outline-primary">View the initial scoring rules</summary><p className="mt-2 text-xs leading-relaxed text-muted-foreground">At least 2 category-related events, a leading-category score of 6 or more, and at least 55% of the total score in that category. Its lead over the second category must be at least 15 percentage points, unless its share is at least 75%. These thresholds still need validation.</p></details></div></div>
        </CardContent>
      </Card>

      <Card className="mt-4 overflow-hidden">
        <CardHeader><CardTitle>Behavior × preference layer</CardTitle><p className="text-sm text-muted-foreground">The behavioral clusters remain distinct even when their current preference mix is similar.</p></CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead><tr className="border-y border-border bg-muted/50 text-left"><th className="px-4 py-3">Behavior cluster</th><th className="px-4 py-3 text-right">Customers</th><th className="px-4 py-3 text-right">Learning</th><th className="px-4 py-3">Top known preferences</th></tr></thead>
            <tbody>{preferenceData.behaviorPreferenceSummary.map((row, index) => <tr key={row.behaviorCluster} className={index % 2 ? "bg-muted/20" : ""}><td className="px-4 py-3 font-medium">{row.behaviorCluster}</td><td className="px-4 py-3 text-right">{row.customers.toLocaleString()}</td><td className="px-4 py-3 text-right font-semibold">{row.learningShare}%</td><td className="px-4 py-3"><div className="flex flex-wrap gap-1.5">{row.topPreferences.map((preference) => <Badge key={preference.name} variant="outline">{preference.name} · {preference.share}%</Badge>)}</div></td></tr>)}</tbody>
          </table>
        </div>
      </Card>

      <div className="mt-6 flex items-start gap-2 rounded-xl border border-dashed border-border bg-muted/40 p-3.5"><Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" /><p className="text-xs leading-relaxed text-muted-foreground">{preferenceData.caveat}</p></div>
    </PageShell>
  )
}

function MetricCard({ icon: Icon, label, value, sub, highlight = false }: { icon: React.ElementType; label: string; value: string; sub: string; highlight?: boolean }) {
  return <Card className={highlight ? "border-primary/30 bg-primary/5" : ""}><CardContent className="p-4"><span className={cn("flex size-8 items-center justify-center rounded-lg", highlight ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}><Icon className="size-4" /></span><p className="mt-3 text-2xl font-bold">{value}</p><p className="text-xs font-medium">{label}</p><p className="text-[11px] text-muted-foreground">{sub}</p></CardContent></Card>
}

function LayerCard({ number, title, text }: { number: string; title: string; text: string }) {
  return <div className="flex gap-3 rounded-xl border border-border bg-card p-3"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{number}</span><div><p className="text-sm font-semibold">{title}</p><p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{text}</p></div></div>
}

function SmallMetric({ value, label }: { value: string | number; label: string }) {
  return <div className="rounded-lg bg-muted/60 p-2"><p className="text-sm font-bold">{value}</p><p className="text-[10px] text-muted-foreground">{label}</p></div>
}
