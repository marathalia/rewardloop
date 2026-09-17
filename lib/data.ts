import catalog from "./reward-catalog.json"
import dashboardData from "./dashboard-data.json"

export type PersonaId = "home" | "voucher" | "detail" | "skimmer" | "campaign" | "membership"

export interface Persona {
  id: PersonaId
  name: string
  shortName: string
  users: number
  percent: number
  color: string
  behaviour: string
  signals: string[]
  rewardTypes: string
  channel: string
  tone: string
  toneExample: string
  avgEvents: number
  avgSessions: number
  avgActiveDays: number
  dealClickRate: number
  dealDetailShare: number
  voucherShare: number
  campaignShare: number
  topDrivers: string[]
}

export const dataset = dashboardData.dataset
export const dataSource = dashboardData.source
export const dataQuality = dashboardData.quality
export const clusterModel = dashboardData.clusterModel
export const dailyEvents = dashboardData.dailyEvents
export const topDeals = dashboardData.topDeals

export const personas = dashboardData.clusters as Persona[]

export const funnelStages = dashboardData.funnelStages
export const categoryEngagement = dashboardData.categoryEngagement
export const dealConcentration = dashboardData.dealConcentration
export const unavailableJourney = dashboardData.unavailableJourney

const largestCluster = [...personas].sort((a, b) => b.users - a.users)[0]
const dealClickSessions = funnelStages.find((stage) => stage.stage === "Deal Click")?.value ?? 0
const redeemSessions = funnelStages.find((stage) => stage.stage === "Redeem Screen")?.value ?? 0
const dashboardSessions = funnelStages[0]?.value ?? 0

export const kpis = [
  { label: "Events Analysed", value: dataset.totalEvents.toLocaleString(), sub: "all source events" },
  { label: "Unique Users", value: dataset.uniqueUsers.toLocaleString(), sub: "100% clustered" },
  { label: "Sessions", value: dataset.sessions.toLocaleString(), sub: "observed app sessions" },
  { label: "Largest Cluster", value: `${largestCluster.percent}%`, sub: largestCluster.shortName },
  { label: "Unavailable Sessions", value: unavailableJourney.sessions.toLocaleString(), sub: "error or ineligible journey" },
  { label: "Ordered Deal CTR", value: `${((dealClickSessions / dashboardSessions) * 100).toFixed(2)}%`, sub: "dashboard → listing → click" },
]

export const aiRecommendations = [
  {
    title: "Test different browsing treatments",
    body: `${personas[0].percent}% are Casual Browsers and ${personas[1].percent}% are Voucher Trackers. Give each a distinct home-to-reward path.`,
    impact: "High",
  },
  {
    title: "Protect high-intent detail exploration",
    body: `${personas[2].users.toLocaleString()} Deal Comparers average ${personas[2].avgEvents} events. Preserve comparison context and make eligibility obvious.`,
    impact: "High",
  },
  {
    title: "Recover unavailable journeys",
    body: `${unavailableJourney.sessions.toLocaleString()} sessions reached an unavailable or error state; ${unavailableJourney.droppedAfter}% ended on that state. Surface eligible alternatives immediately.`,
    impact: "High",
  },
  {
    title: "Keep campaign continuity",
    body: `${personas[4].users.toLocaleString()} Trigger Responders have strong deeplink and campaign signals. Carry message, offer, and eligibility context into the landing screen.`,
    impact: "Medium",
  },
  {
    title: "Treat redeem-screen reach as intent",
    body: `${redeemSessions.toLocaleString()} ordered dashboard journeys reached a redeem screen. The event taxonomy does not prove completed redemption, so measure confirmed success separately.`,
    impact: "Medium",
  },
]

export const treatmentStrategy = [
  {
    persona: "Casual Browsers",
    trigger: "Home-led reward entry with shallow depth",
    reward: "One clear, eligible featured reward",
    channel: "Home banner / In-app",
    objective: "Deepen discovery",
  },
  {
    persona: "Voucher Trackers",
    trigger: "Voucher or wallet revisit",
    reward: "Saved value, expiry and redemption utility",
    channel: "Push / In-app wallet",
    objective: "Drive usage",
  },
  {
    persona: "Deal Comparers",
    trigger: "Repeated deal-detail evaluation",
    reward: "High-value, comparison-friendly offers",
    channel: "In-app / Push",
    objective: "Convert intent",
  },
  {
    persona: "Single-Glance Bouncers",
    trigger: "Dashboard view with minimal follow-through",
    reward: "One-tap reward plus preference capture",
    channel: "In-app hero / Push",
    objective: "Increase depth",
  },
  {
    persona: "Trigger Responders",
    trigger: "Tracked campaign or deeplink arrival",
    reward: "Message-matched eligible offer",
    channel: "SMS / Push / Email",
    objective: "Preserve continuity",
  },
  {
    persona: "Status Seekers",
    trigger: "Me-tab or membership-perk exploration",
    reward: "Plus membership and exclusive benefits",
    channel: "Me tab / In-app",
    objective: "Grow perk usage",
  },
]

export interface Reward {
  id: string
  name: string
  category: string
  persona: string
  eligible: boolean
  available: boolean
  channel: string
  reason?: string
}

export const rewards: Reward[] = catalog.slice(0,6).map(reward => ({id:reward.id,name:reward.name,category:reward.category,persona:"Demo customer",eligible:true,available:true,channel:"In-app / Push"}))

export const prototypeDisclaimer =
  `Source: ${dataSource.file}, ${dataset.totalEvents.toLocaleString()} events from ${dataset.dateRange} (${dataSource.timezone}). Redeem-screen reach is an intent proxy; the supplied taxonomy does not contain a confirmed redemption-success event. All customers, offers and events are synthetic.`
