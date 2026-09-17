import { appendFile, mkdir, readFile } from "node:fs/promises"
import path from "node:path"

export type RewardLoopEvent = {
  id: string
  timestamp: string
  type: string
  customerId: string
  decisionId?: string
  rewardId?: string
  channel?: string
  experiment?: string
  metadata?: Record<string, string | number | boolean>
}

// Vercel Functions expose a read-only deployment filesystem and a writable
// scratch directory at /tmp. Local development keeps using the project-level
// .runtime folder so existing simulator behaviour is unchanged.
const runtimeDir = process.env.VERCEL
  ? path.join("/tmp", "rewardloop-runtime")
  : path.join(process.cwd(), ".runtime")
const eventPath = path.join(runtimeDir, "rewardloop-events.jsonl")

export async function appendRewardLoopEvent(input: Omit<RewardLoopEvent, "id" | "timestamp">) {
  await mkdir(runtimeDir, { recursive: true })
  const event: RewardLoopEvent = {
    ...input,
    id: `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
  }
  await appendFile(eventPath, `${JSON.stringify(event)}\n`, "utf8")
  return event
}

export async function readRewardLoopEvents(limit = 30) {
  try {
    const contents = await readFile(eventPath, "utf8")
    return contents
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as RewardLoopEvent)
      .slice(-limit)
      .reverse()
  } catch {
    return []
  }
}

export function summarizeEvents(events: RewardLoopEvent[]) {
  const byType = events.reduce<Record<string, number>>((result, event) => {
    result[event.type] = (result[event.type] ?? 0) + 1
    return result
  }, {})
  return {
    total: events.length,
    exposures: byType.recommendation_exposed ?? 0,
    clicks: byType.reward_clicked ?? 0,
    claims: byType.reward_claimed ?? 0,
    preferences: (byType.preference_updated ?? 0) + (byType.reward_preference_selected ?? 0),
    approvals: byType.campaign_approved ?? 0,
    byType,
  }
}
