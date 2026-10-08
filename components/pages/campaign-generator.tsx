"use client"

import catalogue from "@/lib/reward-catalog.json"

import { useState } from "react"
import {
  Bell,
  BrainCircuit,
  Check,
  CheckCircle2,
  Copy,
  Eye,
  Mail,
  Image as ImageIcon,
  MessageSquare,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Target,
  Wand2,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader, PageShell } from "@/components/page-header"
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui/primitives"
import { customerScenarios, type Channel, type DecisionResult } from "@/lib/mvp-engine"
import { RewardLoopLogo } from "@/components/prototype/phone-chrome"
import { cn } from "@/lib/utils"

type GeneratedContent = {
  headline: string
  posterKicker: string
  posterBadge: string
  visualDirection: string
  inApp: string
  push: string
  sms: string
  emailSubject: string
  emailBody: string
  cta: string
  rationale: string
}

type GenerationResult = {
  content: GeneratedContent
  artwork?: {
    portrait?: string
    banner?: string
  }
  provider: string
  imageProvider?: string
  guardrailStatus: string
  warning?: string
}

const rewardImages: Record<string, string> = Object.fromEntries(catalogue.map(reward => [reward.id,reward.image]))

function Selector({ label, value, options, onChange, disabled = false }: { disabled?: boolean; label: string; value: string; options: Array<{ value: string; label: string }>; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      <select disabled={disabled} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  )
}

function OutputCard({ icon: Icon, title, text }: { icon: React.ElementType; title: string; text: string }) {
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState(false)
  return (
    <Card className="group h-full">
      <CardContent className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-semibold"><Icon className="size-4 text-primary" />{title}</span>
          <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(text); setCopyError(false); setCopied(true); setTimeout(() => setCopied(false), 1200) } catch { setCopyError(true) } }} className="text-muted-foreground transition-colors hover:text-foreground" aria-label={`Copy ${title}`}>
            {copied ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />}
          </button>
        </div>
        <p className="text-sm leading-relaxed text-foreground/80">{text}</p>
        {copyError && <p role="status" className="mt-2 text-xs text-destructive">Copy failed. Select and copy the text manually.</p>}
      </CardContent>
    </Card>
  )
}

function PosterCreative({ format, aspect, image, generated, content, rewardName, merchant, value, onPreview, hideHeader = false }: { format: string; aspect: "portrait" | "banner"; image: string; generated: boolean; content: GeneratedContent; rewardName: string; merchant: string; value: string; onPreview?: () => void; hideHeader?: boolean }) {
  const aspectClass = aspect === "portrait" ? "aspect-[3/4]" : "aspect-[10/3]"
  const compact = aspect === "portrait"
  const displayHeadline = content.headline
    .replace(/\s*[:–-]\s*selected for you\.?$/i, "")
    .replace(/\s+selected for you\.?$/i, "")
    .trim()
  const longHeadline = displayHeadline.length > 32
  const artwork = (
    <div className={cn("relative overflow-hidden rounded-2xl border border-black/10 bg-[#f9dce1] shadow-lg", aspectClass)} style={{ containerType: "inline-size" }}>
      <img src={image} alt={`${merchant} campaign background`} className="absolute inset-0 size-full object-cover" />
      <div className={cn(
        "absolute",
        aspect === "banner"
          ? "inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,.98)_0%,rgba(255,255,255,.91)_40%,rgba(255,255,255,.34)_58%,rgba(255,255,255,.02)_76%)]"
          : "inset-0",
      )} style={aspect === "portrait" ? {
        background: "radial-gradient(125% 88% at 0% 0%, rgba(255,255,255,.98) 0%, rgba(255,255,255,.9) 37%, rgba(255,255,255,.48) 63%, rgba(255,255,255,0) 84%)",
      } : undefined} />

      <div className={cn("absolute inset-0 flex min-h-0 flex-col", compact ? "p-[5%]" : "p-[2.6%]")}>
        <div>
          <RewardLoopLogo className={compact ? "[&_img]:w-[clamp(86px,21cqw,128px)]" : "[&_img]:w-[clamp(58px,9cqw,106px)]"} />
        </div>

        <div className={cn("min-h-0", compact ? "mt-[3%] max-w-[63%]" : "mt-[1.3%] max-w-[48%]")}>
          <p className={cn("font-extrabold uppercase text-primary", compact ? "text-[clamp(10px,2.5cqw,14px)] tracking-[0.1em]" : "text-[clamp(7px,1.15cqw,12px)] tracking-[0.12em]")}>{content.posterKicker}</p>
          <h3
            className="mt-[1.6%] text-pretty font-black leading-[0.98] tracking-[-0.035em] text-[#171417]"
            style={{ fontSize: compact ? (longHeadline ? "clamp(23px,6.2cqw,38px)" : "clamp(28px,7.2cqw,46px)") : (longHeadline ? "clamp(15px,3.1cqw,35px)" : "clamp(17px,3.65cqw,42px)"), overflowWrap: "break-word" }}
          >
            {displayHeadline}
          </h3>
          <div className={cn("border-l-2 border-primary", compact ? "mt-[3%] pl-[4%]" : "mt-[2%] pl-[3%]")}>
            <p className={cn("font-extrabold leading-[1.12] text-[#171417]", compact ? "text-[clamp(13px,3.5cqw,19px)]" : "text-[clamp(9px,1.55cqw,16px)]")}>{rewardName}</p>
            <p className={cn("leading-tight text-[#171417]/65", compact ? "mt-1 text-[clamp(10px,2.6cqw,13px)]" : "mt-0.5 text-[clamp(7px,1.1cqw,11px)]")}>{merchant} · Value {value}</p>
          </div>
        </div>

        <div className={cn("mt-auto", aspect === "banner" && "flex w-[48%] items-center gap-[3%]")}>
          <span className={cn("rounded-full bg-[#ee174c] text-center font-black text-white shadow-md", compact ? "block w-full px-4 py-[3.1%] text-[clamp(13px,3.4cqw,18px)]" : "min-w-[42%] px-[4%] py-[1.7%] text-[clamp(8px,1.2cqw,13px)]")}>Claim reward</span>
          <p className={cn("font-medium leading-tight text-[#171417]/55", compact ? "mt-[2%] text-center text-[clamp(9px,2.25cqw,11px)]" : "text-[clamp(6px,.85cqw,9px)]")}>Terms and eligibility apply</p>
        </div>
      </div>
      {onPreview && <span className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-black/75 px-3 py-2 text-xs font-bold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"><Eye className="size-4" />Full preview</span>}
    </div>
  )
  return (
    <div>
      {!hideHeader && <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{format}</p>
        <Badge variant={generated ? "success" : "outline"}>{generated ? "AI background + text overlay" : "Saved reward background"}</Badge>
      </div>}
      {onPreview ? <button type="button" onClick={onPreview} className="group block w-full rounded-2xl text-left outline-none ring-offset-4 focus-visible:ring-2 focus-visible:ring-primary" aria-label={`Preview ${format}`}>{artwork}</button> : artwork}
    </div>
  )
}

const generationStages = [
  { at: 8, label: "Checking eligibility and ranking rewards" },
  { at: 25, label: "Writing guardrailed campaign copy" },
  { at: 48, label: "Preparing campaign artwork" },
  { at: 78, label: "Assembling campaign previews" },
  { at: 96, label: "Running final guardrail checks" },
]

function GenerationProgress({ progress }: { progress: number }) {
  const activeStage = [...generationStages].reverse().find((stage) => progress >= stage.at) ?? generationStages[0]
  return (
    <Card className="overflow-hidden border-primary/25">
      <CardContent className="grid min-h-[430px] gap-8 p-6 lg:grid-cols-[1fr_280px] lg:items-center">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm"><Sparkles className="size-5 animate-pulse" /></span>
            <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Generating campaign</p><h2 className="text-xl font-bold">Building campaign previews</h2></div>
          </div>
          <p className="mt-5 text-sm text-muted-foreground">{activeStage.label}</p>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label="Campaign generation progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
            <div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-xs"><span className="text-muted-foreground">Please keep this page open</span><span className="font-bold text-primary">{progress}%</span></div>
          <div className="mt-6 space-y-3">
            {generationStages.slice(0, 4).map((stage) => {
              const complete = progress > stage.at + 12
              const active = activeStage.label === stage.label
              return <div key={stage.label} className={cn("flex items-center gap-3 text-sm", complete || active ? "text-foreground" : "text-muted-foreground/60")}><span className={cn("flex size-6 items-center justify-center rounded-full border", complete ? "border-emerald-500 bg-emerald-500 text-white" : active ? "border-primary bg-primary/10 text-primary" : "border-border")}>
                {complete ? <Check className="size-3.5" /> : active ? <RefreshCw className="size-3 animate-spin" /> : null}
              </span>{stage.label}</div>
            })}
          </div>
        </div>
        <div className="mx-auto w-full max-w-[250px]">
          <div className="flex aspect-[3/4] animate-pulse flex-col overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/10 via-card to-primary/20 p-5 shadow-xl">
            <div className="h-7 w-20 rounded-full bg-white/80" /><div className="mt-14 h-3 w-20 rounded bg-primary/15" /><div className="mt-2 h-7 w-36 rounded bg-foreground/15" /><div className="mt-2 h-7 w-28 rounded bg-foreground/15" /><div className="mt-auto h-10 rounded-full bg-primary/30" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

async function emitEvent(payload: Record<string, unknown>) {
  const response = await fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
  if (!response.ok) throw new Error("The action could not be saved. Please try again.")
}

async function postJson(path: string, payload: Record<string, unknown>, timeoutMs: number) {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
    const raw = await response.text()
    let data: unknown
    try {
      data = raw ? JSON.parse(raw) : {}
    } catch {
      throw new Error(`Server returned an invalid response (${response.status}). Make sure RewardLoop is running with npm run dev.`)
    }
    if (!response.ok) {
      const message = data && typeof data === "object" && "error" in data && typeof data.error === "string"
        ? data.error
        : "Request failed"
      throw new Error(message)
    }
    return data
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Generation took too long. Please try again; the campaign uses the fast static-artwork fallback by default.")
    }
    throw error
  } finally {
    window.clearTimeout(timeout)
  }
}

export function CampaignGeneratorPage() {
  const [scenarioId, setScenarioId] = useState("known-food")
  const channel: Channel = "In-app"
  const tone = "Friendly"
  const [decision, setDecision] = useState<DecisionResult | null>(null)
  const [generation, setGeneration] = useState<GenerationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [approved, setApproved] = useState(false)
  const [approving, setApproving] = useState(false)
  const [error, setError] = useState("")
  const [activePreview, setActivePreview] = useState<"portrait" | "banner" | null>(null)
  const scenario = customerScenarios.find((item) => item.id === scenarioId) ?? customerScenarios[0]

  async function runDecision() {
    setLoading(true)
    setGenerationProgress(6)
    setError("")
    setApproved(false)
    setDecision(null)
    setGeneration(null)
    const progressTimer = window.setInterval(() => {
      setGenerationProgress((current) => {
        if (current >= 92) return current
        if (current < 28) return current + 4
        if (current < 70) return current + 2
        return current + 1
      })
    }, 650)
    try {
      const decisionPayload = await postJson("/api/decision", { scenarioId, channel }, 15_000)
      const nextDecision = decisionPayload as DecisionResult
      setDecision(nextDecision)
      setGenerationProgress((current) => Math.max(current, 25))

      const generationPayload = await postJson("/api/generate", {
        rewardId: nextDecision.selected.id,
        customerId: nextDecision.scenario.customerId,
        decisionId: nextDecision.decisionId,
        behaviorCluster: nextDecision.scenario.behaviorCluster,
        preferenceCluster: nextDecision.scenario.preferenceCluster,
        moment: nextDecision.scenario.moment,
        channel,
        tone,
      }, 300_000)
      setGeneration(generationPayload as GenerationResult)
      setGenerationProgress(100)
      await emitEvent({ type: "recommendation_exposed", customerId: nextDecision.scenario.customerId, decisionId: nextDecision.decisionId, rewardId: nextDecision.selected.id, channel, experiment: nextDecision.experimentAssignment })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "MVP decision failed")
    } finally {
      window.clearInterval(progressTimer)
      await new Promise((resolve) => window.setTimeout(resolve, 350))
      setLoading(false)
    }
  }

  function changeScenario(value: string) {
    setScenarioId(value)
    setDecision(null)
    setGeneration(null)
    setApproved(false)
    setActivePreview(null)
    setError("")
  }

  async function approveCampaign() {
    if (!decision || !generation || approving || approved) return
    setApproving(true)
    setError("")
    try {
      await emitEvent({ type: "campaign_approved", customerId: decision.scenario.customerId, decisionId: decision.decisionId, rewardId: decision.selected.id, channel, experiment: decision.experimentAssignment })
      setApproved(true)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Approval could not be saved. Please try again.")
    } finally {
      setApproving(false)
    }
  }

  return (
    <PageShell>
      <PageHeader eyebrow="Campaign Studio" title="Create a personalised rewards campaign" subtitle="Choose a sample audience to preview a reward and campaign copy. Artwork may use saved images; these drafts are not sent to customers." />

      <div className="mt-5 grid overflow-hidden rounded-2xl border border-border bg-card md:grid-cols-3">
        {[
          ["1", "Choose", "Select the customer moment."],
          ["2", "Generate", "Rank a demo reward and prepare campaign previews."],
          ["3", "Review", "Review the copy, branding and call to action."],
        ].map(([number, title, detail], index) => <div key={number} className={cn("flex gap-3 p-4", index > 0 && "border-t border-border md:border-l md:border-t-0")}><span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{number}</span><div><p className="text-sm font-bold">{title}</p><p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{detail}</p></div></div>)}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[320px_1fr]">
        <div>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Wand2 className="size-4 text-primary" />1. Campaign setup</CardTitle></CardHeader>
            <CardContent className="space-y-3.5">
              <Selector label="Preference cluster" value={scenarioId} onChange={changeScenario} disabled={loading || approving} options={customerScenarios.map((item) => ({ value: item.id, label: item.preferenceCluster }))} />
              <Button className="w-full" onClick={runDecision} disabled={loading}>{loading ? <><RefreshCw className="size-4 animate-spin" />Generating campaign</> : <><Sparkles className="size-4" />Generate campaign</>}</Button>
              {error && <p className="rounded-lg border border-destructive/20 bg-destructive/5 p-2.5 text-xs text-destructive">{error}</p>}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {decision && !decision.scenario.learning && decision.selected.category !== decision.scenario.preferenceCluster && <p className="rounded-xl border border-border bg-muted p-3 text-sm"><strong>Alternative category selected:</strong> {decision.selected.category}. The demo catalogue does not cover every preference category.</p>}
          {loading && <GenerationProgress progress={generationProgress} />}

          {!loading && !decision && <Card className="border-dashed"><CardContent className="grid min-h-[430px] gap-8 p-8 lg:grid-cols-[1fr_280px] lg:items-center"><div><Target className="size-10 text-primary/50" /><h2 className="mt-4 text-xl font-bold">Ready to create a campaign</h2><p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">Start with the preselected audience or choose another customer moment. RewardLoop ranks the demo catalogue and prepares copy with generated or saved imagery. Review the resulting drafts before saving a demo approval.</p><div className="mt-6 flex flex-wrap gap-3">{[[ShieldCheck,"Demo reward"],[BrainCircuit,"Draft copy"],[ImageIcon,"Campaign image"]].map(([Icon,label]) => { const StepIcon = Icon as React.ElementType; return <div key={label as string} className="min-w-[110px] flex-1 rounded-xl border border-border bg-muted/30 p-3"><StepIcon className="size-4 text-primary" /><p className="mt-2 text-xs font-semibold">{label as string}</p></div> })}</div></div><div className="mx-auto w-full max-w-[230px] rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/10 via-card to-primary/20 p-5 shadow-lg"><div className="aspect-[3/4] rounded-2xl border border-dashed border-primary/30 bg-white/45 p-4"><div className="h-7 w-20 rounded-full bg-white" /><div className="mt-14 h-3 w-20 rounded bg-primary/15" /><div className="mt-2 h-7 w-32 rounded bg-foreground/10" /><div className="mt-2 h-7 w-24 rounded bg-foreground/10" /></div></div></CardContent></Card>}

          {!loading && decision && <>
            <Card className="overflow-hidden border-primary/30">
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-primary/10 to-accent/40 p-5">
                  <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">2. Selected reward</p><h2 className="mt-3 text-2xl font-bold">{decision.selected.name}</h2><p className="text-sm text-muted-foreground">{decision.selected.merchant} · {decision.selected.category} · value {decision.selected.value}</p><p className="mt-3 text-sm leading-relaxed">{decision.selected.rationale}</p></div>
                </div>
              </CardContent>
            </Card>

            {generation && <>
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm"><Sparkles className="size-4 text-primary" /><span className="font-semibold">{generation.provider}</span><Badge variant={generation.guardrailStatus === "passed" ? "success" : "outline"}>{generation.guardrailStatus === "passed" ? "AI copy checks passed" : "Catalogue template"}</Badge><span className="text-xs text-muted-foreground">Images: {generation.imageProvider ?? "Static reward image"}</span>{generation.warning && <span className="text-xs text-muted-foreground">{generation.warning}</span>}</div>
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><ImageIcon className="size-4 text-primary" />3. Review campaign previews</CardTitle></CardHeader>
                <CardContent className="space-y-8">
                  <div className="mx-auto w-full max-w-[500px]">
                    <PosterCreative format="RewardLoop popup poster · 3:4" aspect="portrait" image={generation.artwork?.portrait ?? rewardImages[decision.selected.id] ?? "/images/food.svg"} generated={Boolean(generation.artwork?.portrait)} content={generation.content} rewardName={decision.selected.name} merchant={decision.selected.merchant} value={decision.selected.value} onPreview={() => setActivePreview("portrait")} />
                  </div>
                  <div className="w-full">
                    <PosterCreative format="Homepage / email banner · 10:3" aspect="banner" image={generation.artwork?.banner ?? rewardImages[decision.selected.id] ?? "/images/food.svg"} generated={Boolean(generation.artwork?.banner)} content={generation.content} rewardName={decision.selected.name} merchant={decision.selected.merchant} value={decision.selected.value} onPreview={() => setActivePreview("banner")} />
                  </div>
                  <div className="mt-4 rounded-xl bg-muted/50 p-3 text-xs leading-relaxed"><span className="font-semibold">Background-art prompt direction:</span> {generation.content.visualDirection} <span className="text-muted-foreground">Backgrounds can use generated or saved images. RewardLoop adds the logo, catalogue text and call to action. The current previews are read-only.</span></div>
                </CardContent>
              </Card>
              <div className="grid gap-3 md:grid-cols-2"><OutputCard icon={Smartphone} title="In-app supporting copy" text={`${generation.content.headline}\n${generation.content.inApp}`} /><OutputCard icon={Bell} title="Push notification" text={generation.content.push} /><OutputCard icon={MessageSquare} title="SMS fallback" text={generation.content.sms} /><OutputCard icon={Mail} title="Email copy" text={`${generation.content.emailSubject}\n\n${generation.content.emailBody}`} /></div>
              <Card><CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">4. Final approval</p><p className="mt-1 font-semibold">{approved ? "Demo approval saved" : "Review every format. Approval saves a demo event; it does not send a campaign."}</p></div><Button onClick={approveCampaign} disabled={approved || approving}>{approved ? <><CheckCircle2 className="size-4" />Approved</> : <><ShieldCheck className="size-4" />Save demo approval</>}</Button></CardContent></Card>
            </>}
          </>}
        </div>
      </div>
      {activePreview && generation && decision && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={activePreview === "portrait" ? "RewardLoop poster preview" : "Homepage and email banner preview"} onMouseDown={(event) => { if (event.currentTarget === event.target) setActivePreview(null) }}>
        <div className={cn("relative w-full", activePreview === "portrait" ? "max-w-[620px]" : "max-w-[1400px]")} style={activePreview === "portrait" ? { width: "min(620px, calc((100vh - 96px) * 0.75), 100%)" } : undefined}>
          <button type="button" onClick={() => setActivePreview(null)} className="absolute -right-2 -top-12 z-10 flex size-10 items-center justify-center rounded-full bg-white text-black shadow-lg hover:bg-white/90" aria-label="Close preview"><X className="size-5" /></button>
          <PosterCreative hideHeader format={activePreview === "portrait" ? "RewardLoop popup poster · 3:4" : "Homepage / email banner · 10:3"} aspect={activePreview} image={(activePreview === "portrait" ? generation.artwork?.portrait : generation.artwork?.banner) ?? rewardImages[decision.selected.id] ?? "/images/food.svg"} generated={Boolean(activePreview === "portrait" ? generation.artwork?.portrait : generation.artwork?.banner)} content={generation.content} rewardName={decision.selected.name} merchant={decision.selected.merchant} value={decision.selected.value} />
        </div>
      </div>}
    </PageShell>
  )
}
