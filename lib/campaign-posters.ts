import type { CustomerScenario } from "./mvp-engine"
import { getDeal } from "./reward-data"

export type CampaignPoster = {
  id: string
  image: string
  label: string
  message: string
  category: string
  rewardId: string
  tone?: "light" | "dark"
}

export const campaignPosters: CampaignPoster[] = [
  { id: "food-dining", image: "/images/food.svg", label: "Taste more, save more", message: "A food reward selected for your next treat.", category: "Food & Dining", rewardId: "maple-coffee" },
  { id: "travel-discount", image: "/images/travel.svg", label: "Adventure perks await", message: "A travel reward to make your next trip go further.", category: "Travel & Roaming", rewardId: "skytrail-pass" },
  { id: "loyalty-thank-you", image: "/images/membership.svg", label: "Thanks for being with us", message: "Here’s a little something selected just for you.", category: "Membership & Exclusive", rewardId: "loop-lounge" },
  { id: "shopping-savings", image: "/images/shopping.svg", label: "Smart savings picked for you", message: "A shopping reward selected around what you enjoy.", category: "Shopping & Savings", rewardId: "canvas-bag" },
  { id: "travel-roaming", image: "/images/travel.svg", label: "Roam farther with less worry", message: "A travel perk selected for your next adventure.", category: "Travel & Roaming", rewardId: "skytrail-pass" },
  { id: "entertainment-streaming", image: "/images/entertainment.svg", label: "Your next binge starts here", message: "An entertainment reward picked for your downtime.", category: "Entertainment & Streaming", rewardId: "lumen-cinema" },
  { id: "gaming-tech", image: "/images/tech.svg", label: "Level up your rewards", message: "A digital perk selected for the way you play.", category: "Gaming & Tech", rewardId: "pixel-pass", tone: "dark" },
  { id: "family-lifestyle", image: "/images/wellness.svg", label: "More for the moments that matter", message: "A wellbeing reward selected for everyday life.", category: "Sports & Wellness", rewardId: "meadow-yoga" },
  { id: "birthday-seasonal", image: "/images/birthday.svg", label: "Little extras for the ones you love", message: "A special reward for moments worth celebrating.", category: "Birthday & Seasonal", rewardId: "confetti-treat" },
  { id: "membership-exclusive", image: "/images/membership.svg", label: "Something extra, just for you", message: "An exclusive benefit selected to recognise your loyalty.", category: "Membership & Exclusive", rewardId: "loop-lounge" },
]

const byId = Object.fromEntries(campaignPosters.map((poster) => [poster.id, poster]))

const preferencePoster: Record<string, string> = {
  "Food & Dining": "food-dining",
  "Shopping & Savings": "shopping-savings",
  "Travel & Roaming": "travel-roaming",
  "Membership & Exclusive": "membership-exclusive",
  "Entertainment & Streaming": "entertainment-streaming",
  "Gaming & Tech": "gaming-tech",
  "Birthday & Seasonal": "birthday-seasonal",
  "Sports & Wellness": "family-lifestyle",
}

const behaviourPoster: Record<string, string> = {
  "Casual Browsers": "family-lifestyle",
  "Voucher Trackers": "shopping-savings",
  "Deal Comparers": "food-dining",
  "Trigger Responders": "travel-discount",
  "Status Seekers": "loyalty-thank-you",
}

export function getCampaignPoster(
  scenario: CustomerScenario,
  learningIndex = 0,
  learnedRewardId?: string | null,
) {
  if (scenario.learning && !learnedRewardId) {
    return campaignPosters[learningIndex % campaignPosters.length]
  }

  const learnedCategory = learnedRewardId ? getDeal(learnedRewardId)?.category : undefined
  const posterId =
    (learnedCategory && preferencePoster[learnedCategory]) ||
    preferencePoster[scenario.preferenceCluster] ||
    behaviourPoster[scenario.behaviorCluster] ||
    "loyalty-thank-you"

  return byId[posterId]
}
