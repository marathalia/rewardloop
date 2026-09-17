import type { PersonaId } from "./data"

export interface AppReward { name: string; category: string; tag?: string; available: boolean }
export interface AppView { greeting: string; hero: string; sectionTitle: string; why: string; channel: string; rewards: AppReward[] }

export const appViews: Record<PersonaId, AppView> = {
  home: { greeting: "Welcome back", hero: "One useful reward, picked for you", sectionTitle: "Easy rewards to explore", why: "Because your recent reward journeys started from Home and stayed lightweight.", channel: "Home banner / In-app", rewards: [
    { name: "Explore a fictional reward", category: "Demo offer", tag: "Demo", available: true },
    { name: "Explore a fictional reward", category: "Demo offer", tag: "Demo", available: true },
    { name: "Explore a fictional reward", category: "Demo offer", tag: "Demo", available: true },
  ] },
  voucher: { greeting: "Hello", hero: "Your value, ready when you need it", sectionTitle: "Vouchers and saved benefits", why: "Because you frequently revisit voucher and wallet surfaces.", channel: "Push / In-app wallet", rewards: [
    { name: "Explore a fictional reward", category: "Demo offer", tag: "Demo", available: true },
    { name: "Explore a fictional reward", category: "Demo offer", tag: "Demo", available: true },
    { name: "Explore a fictional reward", category: "Demo offer", tag: "Demo", available: true },
  ] },
  detail: { greeting: "Good to see you", hero: "High-value offers with every detail", sectionTitle: "Compare your best matches", why: "Because you spend more time evaluating deal details and terms.", channel: "In-app / Push", rewards: [
    { name: "Explore a fictional reward", category: "Demo offer", tag: "Demo", available: true },
    { name: "Explore a fictional reward", category: "Demo offer", tag: "Demo", available: true },
    { name: "Explore a fictional reward", category: "Demo offer", tag: "Demo", available: true },
  ] },
  skimmer: { greeting: "Welcome", hero: "Your fastest route to value", sectionTitle: "One-tap picks", why: "Because your recent visits ended on the Rewards dashboard.", channel: "In-app hero / Push", rewards: [
    { name: "Explore a fictional reward", category: "Demo offer", tag: "Demo", available: true },
    { name: "Explore a fictional reward", category: "Demo offer", tag: "Demo", available: true },
    { name: "Explore a fictional reward", category: "Demo offer", tag: "Demo", available: true },
  ] },
  campaign: { greeting: "You’re here", hero: "Continue from your message", sectionTitle: "Your campaign-matched offer", why: "Because you arrived through a tracked campaign or deeplink.", channel: "SMS / Push / Email", rewards: [
    { name: "Explore a fictional reward", category: "Demo offer", tag: "Demo", available: true },
    { name: "Explore a fictional reward", category: "Demo offer", tag: "Demo", available: true },
    { name: "Explore a fictional reward", category: "Demo offer", tag: "Demo", available: true },
  ] },
  membership: { greeting: "Hello, Plus member", hero: "Benefits reserved for you", sectionTitle: "Membership and RewardLoop perks", why: "Because you explore Me-tab and membership benefit surfaces.", channel: "Me tab / In-app", rewards: [
    { name: "Explore a fictional reward", category: "Demo offer", tag: "Demo", available: true },
    { name: "Explore a fictional reward", category: "Demo offer", tag: "Demo", available: true },
    { name: "Explore a fictional reward", category: "Demo offer", tag: "Demo", available: true },
  ] },
}
