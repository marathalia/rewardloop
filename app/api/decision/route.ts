import { NextResponse } from "next/server"
import { appendRewardLoopEvent } from "@/lib/event-store"
import { makeDecision, type Channel } from "@/lib/mvp-engine"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { scenarioId?: string; channel?: Channel }
    const channel = body.channel ?? "In-app"
    const decision = makeDecision(body.scenarioId ?? "known-food", channel)
    await appendRewardLoopEvent({
      type: "decision_created",
      customerId: decision.scenario.customerId,
      decisionId: decision.decisionId,
      rewardId: decision.selected.id,
      channel,
      experiment: decision.experimentAssignment,
      metadata: { score: decision.selected.score, preference: decision.scenario.preferenceCluster },
    })
    return NextResponse.json(decision)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Decision failed" },
      { status: 400 },
    )
  }
}
