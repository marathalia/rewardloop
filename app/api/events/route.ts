import { NextResponse } from "next/server"
import { appendRewardLoopEvent, readRewardLoopEvents, summarizeEvents } from "@/lib/event-store"

export const runtime = "nodejs"

export async function GET() {
  const events = await readRewardLoopEvents(100)
  return NextResponse.json({ events: events.slice(0, 30), summary: summarizeEvents(events) })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (!body.type || !body.customerId) {
      return NextResponse.json({ error: "type and customerId are required" }, { status: 400 })
    }
    const event = await appendRewardLoopEvent({
      type: String(body.type),
      customerId: String(body.customerId),
      decisionId: body.decisionId ? String(body.decisionId) : undefined,
      rewardId: body.rewardId ? String(body.rewardId) : undefined,
      channel: body.channel ? String(body.channel) : undefined,
      experiment: body.experiment ? String(body.experiment) : undefined,
      metadata: body.metadata && typeof body.metadata === "object" ? body.metadata : undefined,
    })
    return NextResponse.json(event, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Invalid event" }, { status: 400 })
  }
}
