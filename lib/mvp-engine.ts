import catalogData from "./reward-catalog.json"
export type Channel = "In-app" | "Push" | "SMS" | "Email"

export type CustomerScenario = {
  id: string
  name: string
  customerId: string
  behaviorCluster: string
  preferenceCluster: string
  preferenceConfidence: number
  moment: string
  tier: "Basic" | "Plus" | "Elite"
  channels: Channel[]
  learning: boolean
  experiment: "none" | "category-choice" | "exploration-slot"
  description: string
}

export type RewardRecord = {
  id: string
  name: string
  merchant: string
  category: string
  value: string
  fundingType: "Partner-funded" | "RewardLoop-funded" | "Utility" | "Status-based"
  costBand: "Low" | "Medium" | "High"
  availability: "Available" | "Unavailable" | "Expired"
  eligibleTiers: Array<CustomerScenario["tier"]>
  channels: Channel[]
  expiresInDays: number
  businessPriority: number
  explorationEligible: boolean
  approvedClaims: string[]
  terms: string
}

export type RankedReward = RewardRecord & {
  score: number
  scoreBreakdown: Array<{ factor: string; points: number; explanation: string }>
  rationale: string
}

export type DecisionResult = {
  decisionId: string
  createdAt: string
  scenario: CustomerScenario
  selected: RankedReward
  alternatives: RankedReward[]
  excluded: Array<{ rewardId: string; name: string; reason: string }>
  experimentAssignment: string
}

export const customerScenarios: CustomerScenario[] = [
  {
    id: "known-food",
    name: "Known preference · high intent",
    customerId: "DEMO-003",
    behaviorCluster: "Deal Comparers",
    preferenceCluster: "Food & Dining",
    preferenceConfidence: 84,
    moment: "Compared multiple deal details",
    tier: "Plus",
    channels: ["In-app", "Push", "Email"],
    learning: false,
    experiment: "none",
    description: "Rich F&B evidence and repeated detail comparison indicate a high-intent decision moment.",
  },
  {
    id: "learning",
    name: "Learning · cold start",
    customerId: "DEMO-004",
    behaviorCluster: "Single-Glance Bouncers",
    preferenceCluster: "Learning",
    preferenceConfidence: 0,
    moment: "Entered Rewards but stopped at the dashboard",
    tier: "Basic",
    channels: ["In-app", "Push", "SMS"],
    learning: true,
    experiment: "exploration-slot",
    description: "No reliable category signal yet; one controlled exploration slot is used to learn safely.",
  },
  {
    id: "voucher-savings",
    name: "Voucher manager · expiring value",
    customerId: "DEMO-005",
    behaviorCluster: "Voucher Trackers",
    preferenceCluster: "Shopping & Savings",
    preferenceConfidence: 76,
    moment: "Revisited My Vouchers near expiry",
    tier: "Plus",
    channels: ["In-app", "Push", "SMS"],
    learning: false,
    experiment: "none",
    description: "Utility-led behaviour makes visible value and expiry the strongest treatment cues.",
  },
  {
    id: "campaign-travel",
    name: "Campaign responder · travel",
    customerId: "DEMO-006",
    behaviorCluster: "Trigger Responders",
    preferenceCluster: "Travel & Roaming",
    preferenceConfidence: 71,
    moment: "Arrived through a tracked roaming campaign deeplink",
    tier: "Elite",
    channels: ["In-app", "Push", "Email"],
    learning: false,
    experiment: "none",
    description: "Campaign context and travel affinity should continue seamlessly into the app.",
  },
  {
    id: "membership-exclusive",
    name: "Perk explorer · membership",
    customerId: "DEMO-007",
    behaviorCluster: "Status Seekers",
    preferenceCluster: "Membership & Exclusive",
    preferenceConfidence: 85,
    moment: "Browsed membership and exclusive partner benefits",
    tier: "Elite",
    channels: ["In-app", "Push", "Email"],
    learning: false,
    experiment: "none",
    description: "Repeated membership-perk exploration illustrates a possible affinity for status and exclusive benefits.",
  },
  {
    id: "entertainment-streaming",
    name: "Entertainment viewer · streaming",
    customerId: "DEMO-008",
    behaviorCluster: "Casual Browsers",
    preferenceCluster: "Entertainment & Streaming",
    preferenceConfidence: 78,
    moment: "Repeatedly opened streaming and entertainment offers",
    tier: "Plus",
    channels: ["In-app", "Push", "Email"],
    learning: false,
    experiment: "none",
    description: "Streaming offer engagement supports an entertainment-led campaign treatment.",
  },
  {
    id: "gaming-tech",
    name: "Gaming explorer · digital perks",
    customerId: "DEMO-009",
    behaviorCluster: "Deal Comparers",
    preferenceCluster: "Gaming & Tech",
    preferenceConfidence: 84,
    moment: "Compared gaming, device and digital-perk details",
    tier: "Plus",
    channels: ["In-app", "Push", "Email"],
    learning: false,
    experiment: "none",
    description: "High-detail browsing around gaming and technology signals strong digital-perk intent.",
  },
  {
    id: "birthday-seasonal",
    name: "Seasonal responder · celebration",
    customerId: "DEMO-010",
    behaviorCluster: "Trigger Responders",
    preferenceCluster: "Birthday & Seasonal",
    preferenceConfidence: 81,
    moment: "Engaged with birthday and seasonal celebration campaigns",
    tier: "Plus",
    channels: ["In-app", "Push", "SMS", "Email"],
    learning: false,
    experiment: "none",
    description: "Time-sensitive celebration engagement supports warm, occasion-led rewards.",
  },
  {
    id: "meadow-yoga",
    name: "Active customer · sports",
    customerId: "DEMO-011",
    behaviorCluster: "Casual Browsers",
    preferenceCluster: "Sports & Wellness",
    preferenceConfidence: 88,
    moment: "Returned to sports and wellness rewards",
    tier: "Elite",
    channels: ["In-app", "Push", "Email"],
    learning: false,
    experiment: "none",
    description: "Repeated sports and wellness engagement indicates a sports and wellness demo profile.",
  },
]

export const rewardCatalog = catalogData as RewardRecord[]

const behaviorCategoryBonus: Record<string, string[]> = {
  "Deal Comparers": ["Food & Dining", "Travel & Roaming"],
  "Voucher Trackers": ["Shopping & Savings", "Food & Dining"],
  "Trigger Responders": ["Travel & Roaming", "Entertainment & Streaming"],
  "Status Seekers": ["Membership & Exclusive"],
}

function addFactor(
  factors: RankedReward["scoreBreakdown"],
  factor: string,
  points: number,
  explanation: string,
) {
  if (points !== 0) factors.push({ factor, points, explanation })
}

export function getScenario(id: string) {
  const scenario = customerScenarios.find((scenario) => scenario.id === id)
  if (!scenario) throw new Error("Unknown customer scenario")
  return scenario
}

export function getReward(id: string) {
  return rewardCatalog.find((reward) => reward.id === id)
}

export function makeDecision(scenarioId: string, channel: Channel): DecisionResult {
  const scenario = getScenario(scenarioId)
  const excluded: DecisionResult["excluded"] = []
  const ranked: RankedReward[] = []

  for (const reward of rewardCatalog) {
    if (reward.availability !== "Available" || reward.expiresInDays < 0) {
      excluded.push({ rewardId: reward.id, name: reward.name, reason: reward.availability })
      continue
    }
    if (!reward.eligibleTiers.includes(scenario.tier)) {
      excluded.push({ rewardId: reward.id, name: reward.name, reason: `Not eligible for ${scenario.tier} tier` })
      continue
    }
    if (!reward.channels.includes(channel) || !scenario.channels.includes(channel)) {
      excluded.push({ rewardId: reward.id, name: reward.name, reason: `${channel} not permitted` })
      continue
    }

    const factors: RankedReward["scoreBreakdown"] = []
    addFactor(factors, "Base priority", reward.businessPriority, "Approved catalogue business priority")

    if (!scenario.learning && reward.category === scenario.preferenceCluster) {
      addFactor(factors, "Preference affinity", 50, `Sample profile preference: ${scenario.preferenceCluster}`)
    } else if (scenario.learning && reward.explorationEligible) {
      addFactor(factors, "Learning exploration", 28, "Eligible for the controlled exploration slot")
    }

    if (behaviorCategoryBonus[scenario.behaviorCluster]?.includes(reward.category)) {
      addFactor(factors, "Behavior fit", 18, `Fits ${scenario.behaviorCluster}`)
    }
    if (scenario.behaviorCluster === "Voucher Trackers" && reward.expiresInDays <= 7) {
      addFactor(factors, "Expiry moment", 16, "Visible near-term value fits a voucher revisit")
    }
    if (scenario.behaviorCluster === "Single-Glance Bouncers") {
      addFactor(factors, "Low-friction fit", reward.explorationEligible ? 14 : 2, "Simple offer suitable for shallow discovery")
    }
    if (scenario.moment.toLowerCase().includes("skytrail-pass") && reward.category === "Travel & Roaming") {
      addFactor(factors, "Moment relevance", 24, "Direct match to the tracked roaming moment")
    }
    addFactor(factors, "Channel fit", 10, `${channel} is allowed for customer and reward`)
    if (reward.fundingType === "Partner-funded") {
      addFactor(factors, "Funding efficiency", 5, "Partner-funded reward protects economics")
    }

    const score = factors.reduce((sum, factor) => sum + factor.points, 0)
    ranked.push({
      ...reward,
      score,
      scoreBreakdown: factors,
      rationale: factors
        .slice()
        .sort((a, b) => b.points - a.points)
        .slice(0, 3)
        .map((factor) => factor.explanation)
        .join(" · "),
    })
  }

  ranked.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
  const selected = ranked[0] ?? (() => { throw new Error("No eligible rewards for this scenario and channel") })()
  const experimentAssignment = scenario.learning
    ? `${scenario.experiment} · variant ${scenario.customerId.charCodeAt(scenario.customerId.length - 1) % 2 ? "B" : "A"}`
    : "Personalised treatment · no exploration"

  return {
    decisionId: `dec_${Date.now().toString(36)}_${scenario.id}`,
    createdAt: new Date().toISOString(),
    scenario,
    selected,
    alternatives: ranked.slice(1, 4),
    excluded,
    experimentAssignment,
  }
}
