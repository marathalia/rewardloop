import { NextResponse } from "next/server"
import { campaignValidationIssues } from "@/lib/campaign-validation"
import { appendRewardLoopEvent } from "@/lib/event-store"
import { getReward, type Channel } from "@/lib/mvp-engine"

export const runtime = "nodejs"
export const maxDuration = 300

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

type ArtworkVariants = {
  portrait?: string
  banner?: string
}

function safeFallback(rewardName: string, value: string, merchant: string): GeneratedContent {
  return {
    headline: `${rewardName} : selected for you`,
    posterKicker: "A RewardLoop Reward selected for you",
    posterBadge: "MY REWARDLOOP EXCLUSIVE",
    visualDirection: `Feature the ${merchant} reward prominently using a clean, energetic RewardLoop-teal campaign template.`,
    inApp: `A ${merchant} reward matched to your recent Rewards activity is ready. View the demo details before claiming.`,
    push: `${rewardName} is ready in the RewardLoop app. View the demo details.`,
    sms: `RewardLoop: Your ${rewardName} (${value} value) is ready in the RewardLoop app. Terms apply. Reply STOP to opt out.`,
    emailSubject: `A ${merchant} reward selected for you`,
    emailBody: `Your fictional ${rewardName} reward is ready. Open the RewardLoop app to review eligibility, availability and full terms before claiming.`,
    cta: "Claim reward",
    rationale: "Guardrailed fallback copy generated from approved catalogue fields only.",
  }
}

function stringsOnly(value: unknown): value is GeneratedContent {
  if (!value || typeof value !== "object") return false
  const required = ["headline", "posterKicker", "posterBadge", "visualDirection", "inApp", "push", "sms", "emailSubject", "emailBody", "cta", "rationale"]
  return required.every((key) => typeof (value as Record<string, unknown>)[key] === "string")
}


function extractResponseText(value: unknown) {
  if (!value || typeof value !== "object") return undefined
  const output = (value as { output?: unknown }).output
  if (!Array.isArray(output)) return undefined
  for (const item of output) {
    if (!item || typeof item !== "object") continue
    const content = (item as { content?: unknown }).content
    if (!Array.isArray(content)) continue
    for (const part of content) {
      if (!part || typeof part !== "object") continue
      const candidate = part as { type?: unknown; text?: unknown }
      if (candidate.type === "output_text" && typeof candidate.text === "string") return candidate.text
    }
  }
  return undefined
}

async function generateArtwork(
  apiKey: string,
  model: string,
  prompt: string,
  size: "1024x1536" | "1024x1024" | "1536x1024",
) {
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      prompt,
      size,
      quality: "medium",
      output_format: "jpeg",
      output_compression: 60,
    }),
  })
  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`OpenAI image generation returned ${response.status}: ${detail.slice(0, 800)}`)
  }
  const result = await response.json() as { data?: Array<{ b64_json?: string }> }
  const image = result.data?.[0]?.b64_json
  if (!image) throw new Error("OpenAI returned no image data")
  return `data:image/jpeg;base64,${image}`
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    rewardId?: string
    customerId?: string
    decisionId?: string
    behaviorCluster?: string
    preferenceCluster?: string
    moment?: string
    channel?: Channel
    tone?: string
  }
  const reward = getReward(body.rewardId ?? "")
  if (!reward || reward.availability !== "Available") {
    return NextResponse.json({ error: "Only an available catalogue reward can be generated" }, { status: 400 })
  }

  const fallback = safeFallback(reward.name, reward.value, reward.merchant)
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({
      content: fallback,
      artwork: {},
      provider: "Template copy",
      imageProvider: "Static reward image",
      guardrailStatus: "template",
      warning: "OpenAI API key unavailable; approved copy and static reward imagery used.",
    })
  }

  const prompt = `Create concise, editable campaign copy for a personalised RewardLoop reward. The copy will be overlaid by our application on top of separately generated background artwork, so it must be short, scannable and layout-safe. Use only the approved facts below.\n\nCUSTOMER CONTEXT\nBehavior cluster: ${body.behaviorCluster}\nPreference: ${body.preferenceCluster}\nMoment: ${body.moment}\nRequested channel: ${body.channel}\nTone: ${body.tone}\n\nAPPROVED REWARD\nName: ${reward.name}\nMerchant: ${reward.merchant}\nCategory: ${reward.category}\nValue: ${reward.value}\nApproved claims: ${reward.approvedClaims.join("; ")}\nTerms: ${reward.terms}\n\nRULES\n- Never invent a reward, price, discount, eligibility condition, expiry or urgency.\n- Never mention funding, sponsorship, partner funding, RewardLoop funding, payment arrangements or commercial arrangements in any field.\n- Do not state or imply that RewardLoop monitored private behaviour; use respectful language such as 'selected for you'.\n- Headline: maximum 6 words, natural sentence case, no trailing full stop.\n- posterKicker: maximum 6 words.\n- posterBadge: maximum 3 words, uppercase, and must be a customer-facing benefit label only.\n- CTA: exactly 'Claim reward'.\n- SMS: under 160 characters and includes 'Terms apply'.\n- Push: under 120 characters.\n- visualDirection: describe the reward-specific scene, lighting, palette and composition. Reserve uncluttered negative space on the left and lower edge for our HTML text and CTA overlay.\n- Mention only the approved reward and claims.`

  const schema = {
    type: "object",
    properties: {
      headline: { type: "string" },
      posterKicker: { type: "string" },
      posterBadge: { type: "string" },
      visualDirection: { type: "string" },
      inApp: { type: "string" },
      push: { type: "string" },
      sms: { type: "string" },
      emailSubject: { type: "string" },
      emailBody: { type: "string" },
      cta: { type: "string" },
      rationale: { type: "string" },
    },
    required: ["headline", "posterKicker", "posterBadge", "visualDirection", "inApp", "push", "sms", "emailSubject", "emailBody", "cta", "rationale"],
    additionalProperties: false,
  }

  let content = fallback
  let provider = "Template copy"
  const warnings: string[] = []

  try {
    const model = process.env.OPENAI_MODEL ?? "gpt-5-mini"
    let feedback = ""
    for (let attempt = 0; attempt < 2; attempt++) {
      const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          instructions: "You write campaign drafts for a fictional rewards-app portfolio. Produce a structured, template-ready poster content specification. Follow the supplied catalogue and guardrails exactly.",
          input: prompt + feedback,
          reasoning: { effort: "low" },
          text: { format: { type: "json_schema", name: "campaign_content", strict: true, schema } },
        }),
      })
      if (!response.ok) {
          throw new Error(`OpenAI request failed (HTTP ${response.status}).`)
      }
      const result = await response.json()
      const text = extractResponseText(result)
      let parsed: unknown = null
      try { parsed = text ? JSON.parse(text) : null } catch { /* Retry malformed model output once. */ }
      const issues = stringsOnly(parsed)
        ? campaignValidationIssues(parsed, reward.value)
        : ["Return all required text fields as non-empty strings."]
      if (issues.length) {
        if (attempt === 0) {
          feedback = `\n\nCORRECTIONS REQUIRED\nThe previous draft was rejected: ${issues.join(" ")} Generate a new complete draft using only the approved facts. Keep rationale separate from customer-facing copy.`
          continue
        }
        throw new Error(`AI draft did not pass copy checks after a retry: ${issues.join(" ")}`)
      }
      content = parsed as GeneratedContent
      provider = `OpenAI · ${model}`
      break
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "generation error"
    warnings.push(message.startsWith("AI draft did not pass")
      ? `${message} Catalogue template shown instead.`
      : `${message.startsWith("OpenAI request failed") ? message : "AI copy could not be generated."} Catalogue template shown instead.`)
  }

  const artwork: ArtworkVariants = {}
  let imageProvider = "Static reward image"
  // Image rendering can take substantially longer than copy generation. Keep the
  // campaign workflow responsive by making it an explicit opt-in for local demos.
  // Static catalogue imagery is already used by the UI when no artwork is returned.
  const generateArtworkEnabled = process.env.OPENAI_GENERATE_ARTWORK === "true"
  if (generateArtworkEnabled) try {
    const imageModel = process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-2"
    const basePrompt = `Create premium background artwork for a personalised telecom rewards campaign. This is a BACKGROUND ONLY that will receive editable HTML text, the official RewardLoop logo, reward details and CTA later in our application.\n\nREWARD CONTEXT\nReward: ${reward.name}\nMerchant: ${reward.merchant}\nCategory: ${reward.category}\nCustomer moment: ${body.moment}\nTone: ${body.tone}\nArt direction: ${content.visualDirection}\n\nCOMPOSITION\n- Make the reward subject immediately recognisable through relevant objects, setting and commercial product photography.\n- Place the main subject on the RIGHT half or lower-right area.\n- Reserve calm, uncluttered negative space only in the UPPER-LEFT area for a logo, greeting, headline and short reward details.\n- Keep the lower half visually rich and continuous with the scene. Do not leave a blank, white, faded or empty lower band; carry meaningful low-contrast travel, lifestyle or reward-related texture through the lower-left while maintaining enough contrast for an opaque CTA overlay.\n- Use polished studio lighting, realistic materials and a refined teal, mint, cream and neutral palette appropriate to the category. Dark gaming or entertainment scenes may use navy with teal and electric-blue highlights.\n- Ensure good contrast behind the reserved overlay areas without drawing boxes or UI elements.\n\nSTRICT RULES\n- Do not render any words, letters, numbers, prices, discounts, logos, brand marks, buttons, badges, QR codes, barcodes or legal copy.\n- Do not create a finished poster or mobile UI screenshot. Generate only clean campaign background artwork.\n- Do not invent additional products, eligibility conditions or claims.\n- Avoid identifiable public figures.`
    const variants = await Promise.allSettled([
      generateArtwork(apiKey, imageModel, `${basePrompt}\nFORMAT: Vertical source artwork for a 3:4 RewardLoop in-app poster. Keep only the upper-left 58% visually quiet for copy; fill the lower half with the scene and place the subject on the right.`, "1024x1536"),
      generateArtwork(apiKey, imageModel, `${basePrompt}\nFORMAT: Ultra-wide 10:3 homepage rewards banner that can also be used in email. Keep the left 52% visually quiet for copy and place the subject on the right. Compose all important subjects inside the middle horizontal third so a 10:3 crop remains complete and recognisable.`, "1536x1024"),
    ])
    const keys: Array<keyof ArtworkVariants> = ["portrait", "banner"]
    variants.forEach((result, index) => {
      if (result.status === "fulfilled") artwork[keys[index]] = result.value
    })
    const generatedCount = Object.keys(artwork).length
    if (generatedCount === 0) {
      const firstFailure = variants.find((result) => result.status === "rejected")
      throw new Error(firstFailure?.status === "rejected" && firstFailure.reason instanceof Error
        ? firstFailure.reason.message
        : "All OpenAI artwork variants failed")
    }
    imageProvider = `OpenAI background · ${imageModel}`
    if (generatedCount < 2) warnings.push(`${2 - generatedCount} artwork format(s) used the approved static fallback.`)
  } catch (error) {
    const message = error instanceof Error ? error.message : "image generation error"
    warnings.push(message.includes("quota") || message.includes("429")
      ? "OpenAI artwork could not be generated because this project has no available image quota; approved static imagery is shown until billing or quota is enabled."
      : `Artwork fallback used: ${message}`)
  }

  await appendRewardLoopEvent({
    type: Object.keys(artwork).length ? "content_and_artwork_generated" : "content_generated",
    customerId: body.customerId ?? "anonymous",
    decisionId: body.decisionId,
    rewardId: reward.id,
    channel: body.channel,
    metadata: {
      provider,
      imageProvider,
      artworkVariants: Object.keys(artwork).length,
      guardrailStatus: provider.startsWith("OpenAI") ? "passed" : "template",
    },
  })

  return NextResponse.json({
    content,
    artwork,
    provider,
    imageProvider,
    guardrailStatus: provider.startsWith("OpenAI") ? "passed" : "template",
    warning: warnings.length ? warnings.join(" ") : undefined,
  })
}
