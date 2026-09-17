import catalog from "./reward-catalog.json"
export type Deal = {
 id: string; name: string; merchant: string; category: string; expiry: string;
 expiresInDays: number; image: string; eligible: boolean; value: string; tone: string;
 description: string; redeemSteps: string[]; access?: "all" | "plus";
}
export const deals: Deal[] = catalog.map(reward => ({
 ...reward, expiry: `in ${reward.expiresInDays} demo days`, eligible: reward.availability === "Available",
 tone: "Clear and helpful", description: `${reward.name} from ${reward.merchant}. ${reward.terms}`,
 access: "all", redeemSteps: ["Open the fictional offer.", "Review the demo terms.", "Save a demo voucher. No real reward is issued."]
}))
export const preferenceRewardIds: Record<string,string[]> = Object.fromEntries(
 [...new Set(catalog.map(r => r.category))].map(category => [category,catalog.filter(r => r.category === category).map(r => r.id)])
)
preferenceRewardIds.Learning = catalog.filter((_,i) => i % 3 === 0).map(r => r.id)
export function getDeal(id: string) { return deals.find(r => r.id === id) }
export const preferenceTiles = [
  { id: "foodie", label: "Foodie / Cafe Hopper", icon: "coffee" },
  { id: "entertainment", label: "Entertainment Enthusiast", icon: "clapperboard" },
  { id: "gamer", label: "Gamer / Tech-Savvy", icon: "gamepad2" },
  { id: "traveller", label: "Traveller", icon: "plane" },
  { id: "fitness", label: "Sports & Fitness", icon: "dumbbell" },
] as const

export const personaTags = ["Gaming Enthusiast", "Home Cinema Buff", "Cafe Hopper"]

export const affinity = [
  { label: "Food & Dining", value: 72 },
  { label: "Entertainment", value: 18 },
  { label: "Travel", value: 10 },
]

export const genAiVariants = [{persona:"Demo customer",channel:"Push",copy:"A fictional reward is ready to explore in RewardLoop."}]
