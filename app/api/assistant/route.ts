import { NextResponse } from "next/server"
import { z } from "zod"
import { checkRateLimit } from "@/lib/rate-limit"
import {
  BUSINESS_NAME,
  CONTACT_EMAIL,
  CONTACT_PHONE,
  SERVICE_AREA,
  SERVICE_TYPES,
} from "@/lib/site"

export const runtime = "nodejs"

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(1200),
})

const requestSchema = z.object({
  messages: z.array(messageSchema).min(1).max(12),
})

type AssistantPayload = {
  reply: string
  intent: "quote" | "callback" | "question" | "handoff"
  quickReplies: string[]
  collected: {
    name?: string
    phone?: string
    email?: string
    year?: string
    make?: string
    model?: string
    vehicleType?: string
    area?: string
    details?: string
    callbackTime?: string
  }
  readyForQuote: boolean
  readyForCallback: boolean
}

function getClientKey(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")
  return forwardedFor?.split(",")[0]?.trim() || "unknown"
}

function fallbackAssistant(messages: Array<z.infer<typeof messageSchema>>): AssistantPayload {
  const latest = messages.at(-1)?.content.toLowerCase() ?? ""

  if (latest.includes("call") || latest.includes("phone") || latest.includes("callback")) {
    return {
      reply:
        `We can call you back or you can call ${CONTACT_PHONE}. To request a callback, send your name, phone, email, and the best time to reach you.`,
      intent: "callback",
      quickReplies: ["Request a callback", "Call now", "Get a quote"],
      collected: {},
      readyForQuote: false,
      readyForCallback: false,
    }
  }

  if (latest.includes("price") || latest.includes("cost") || latest.includes("how much")) {
    return {
      reply:
        "Pricing depends on the vehicle condition, size, requested work, location, and photos/details. I can collect the details MacBros needs for an accurate quote.",
      intent: "quote",
      quickReplies: ["Start quote", "What details do you need?", "Request callback"],
      collected: {},
      readyForQuote: false,
      readyForCallback: false,
    }
  }

  return {
    reply:
      "I can help you choose a detailing service, collect quote details, or request a callback. What vehicle do you have and what would you like cleaned?",
    intent: "quote",
    quickReplies: ["Start quote", "Interior deep clean", "Exterior package", "Request callback"],
    collected: {},
    readyForQuote: false,
    readyForCallback: false,
  }
}

function normalizePayload(value: unknown): AssistantPayload {
  const optionalString = z
    .union([z.string(), z.null()])
    .optional()
    .transform((field) => field ?? undefined)

  const parsed = z
    .object({
      reply: z.string().trim().min(1).max(900),
      intent: z.enum(["quote", "callback", "question", "handoff"]),
      quickReplies: z.array(z.string().trim().min(1).max(80)).max(4).default([]),
      collected: z
        .object({
          name: optionalString,
          phone: optionalString,
          email: optionalString,
          year: optionalString,
          make: optionalString,
          model: optionalString,
          vehicleType: optionalString,
          area: optionalString,
          details: optionalString,
          callbackTime: optionalString,
        })
        .default({}),
      readyForQuote: z.boolean().default(false),
      readyForCallback: z.boolean().default(false),
    })
    .safeParse(value)

  if (!parsed.success) {
    return fallbackAssistant([{ role: "user", content: "" }])
  }

  return withDefaults(parsed.data)
}

function sanitizeReply(reply: string) {
  return reply
    .replace(/stain and odor removal/gi, "stain and odor treatment")
    .replace(/remove smoke odors/gi, "help reduce smoke odors")
    .replace(/smoke odors with our interior detailing and ozone treatments/gi, "smoke odor with interior detailing")
    .replace(/guarantee/gi, "promise")
    .replace(/I[’']ll pass this along[^.]*\./gi, "")
    .replace(/you[’']ll receive a detailed quote[^.]*\./gi, "")
    .replace(/We[’']ll give you a call[^.]*\./gi, "")
    .replace(/We will give you a call[^.]*\./gi, "")
    .replace(/\s{2,}/g, " ")
    .trim()
}

function withDefaults(payload: AssistantPayload): AssistantPayload {
  let reply = sanitizeReply(payload.reply)

  if (payload.readyForQuote) {
    reply = `${reply} I have enough details to send this to MacBros. Tap Send Quote Request below to submit it. If you want to attach photos, use the full Quote page.`
  }

  if (payload.readyForCallback) {
    reply = `${reply} I have enough details to request the callback. Tap Request Callback below to submit it.`
  }

  const quickReplies =
    payload.quickReplies.length > 0
      ? payload.quickReplies.slice(0, 4)
      : payload.intent === "callback"
        ? ["Request callback", "Call now", "Ask a question"]
        : payload.intent === "quote"
          ? ["Interior deep clean", "Exterior package", "Send quote", "Call now"]
          : ["Start quote", "Request callback", "Call now"]

  return {
    ...payload,
    reply,
    quickReplies,
  }
}

function extractOpenAIText(payload: { output_text?: unknown; output?: unknown }) {
  if (typeof payload.output_text === "string") {
    return payload.output_text
  }

  if (Array.isArray(payload.output)) {
    for (const item of payload.output) {
      if (!item || typeof item !== "object" || !("content" in item)) {
        continue
      }

      const content = (item as { content?: unknown }).content
      if (!Array.isArray(content)) {
        continue
      }

      for (const part of content) {
        if (
          part &&
          typeof part === "object" &&
          "text" in part &&
          typeof (part as { text?: unknown }).text === "string"
        ) {
          return (part as { text: string }).text
        }
      }
    }
  }

  return null
}

export async function POST(request: Request) {
  const start = Date.now()

  if (!checkRateLimit(`assistant:${getClientKey(request)}`, 30, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many assistant messages. Please wait a few minutes and try again." },
      { status: 429 },
    )
  }

  try {
    const body = await request.json()
    const parsed = requestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid assistant message." }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY?.trim()
    if (!apiKey) {
      return NextResponse.json({
        ...fallbackAssistant(parsed.data.messages),
        mode: "fallback",
      })
    }

    const model = process.env.OPENAI_MODEL?.trim() || "o4-mini"
    const conversation = parsed.data.messages
      .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
      .join("\n")

    const systemPrompt = `
You are the MacBros Detailing quote assistant for ${BUSINESS_NAME}.

Business facts:
- Mobile detailing service. MacBros goes to the customer.
- Service area: ${SERVICE_AREA}.
- Phone: ${CONTACT_PHONE}.
- Email: ${CONTACT_EMAIL}.
- Services:
  1. Interior Standard Package: basic upkeep, vacuuming, dashboard/console/door panels wiped, cupholders/touch points cleaned, seats/floor mats cleaned, interior windows, trunk vacuum if requested.
  2. Interior Premium / Deep Clean Package: fuller interior reset, detailed surface cleaning, seats cleaned thoroughly, carpets/floor mats cleaned, door panels/touch points, dashboard/console/trim, interior windows, trunk if requested.
  3. Exterior Package: hand wash, exterior windows, wax/sealant, visible tire shine.
  4. Headlight Rejuvenation Add-On: de-yellowing/headlight clarity improvement; results depend on age/condition.
  5. Other requests: case-by-case for cars, SUVs, pickup trucks, work trucks, vans, boats, trailers, and other vehicles.
- Pricing is quote-based and depends on vehicle condition, size, requested work, location, and photos/details. Do not invent prices or estimates.
- Do not mention or request a storefront address. This is a mobile/service-area business.
- Do not promise perfect stain removal, salt removal, odor removal, smoke removal, scratch removal, or restoration. Say MacBros can assess, clean, treat, improve, or quote it based on condition.
- Do not mention ozone, ceramic coating, paint correction, engine bay, wheel removal, or services not listed above unless the user asks and you explain it is case-by-case.
- For quote requests, collect: name, phone, email, year, make, model, vehicle type, area/region, and requested work/details.
- For callbacks, collect: name, phone, email, and preferred callback time.
- Photos help quote accuracy, but the assistant cannot upload photos in chat. Tell users they can submit photos on the full Quote page if needed.
- Never claim a quote request, callback request, email, call, appointment, or message has been sent/scheduled until the user clicks the actual Send Quote Request or Request Callback button. If readyForQuote or readyForCallback is true, say the details are ready to submit and tell the user to tap the button below.

Your job:
- Be concise, helpful, and direct.
- Ask one or two practical questions at a time.
- First help the customer diagnose what they need, then close toward a quote or call.
- When the user describes problems, reflect them back and recommend the likely package:
  - salt, pet hair, spills, heavy dirt, seats/carpets -> Interior Premium / Deep Clean.
  - basic dust/vacuum/wipe-down -> Interior Standard.
  - outside wash/wax/shine -> Exterior Package.
  - cloudy/yellow headlights -> Headlight Rejuvenation Add-On.
- Make the customer feel understood by explaining why that package fits their situation.
- Use soft closing language: "That sounds like a good fit for..." and "I can collect the details so MacBros can quote it properly."
- Do not ask for contact info first unless the user specifically asks for a callback. Ask vehicle/condition questions first, then contact info after the service need is clear.
- Always provide 2-4 quickReplies that reduce friction. Examples: "Interior Premium", "Exterior Package", "Request callback", "Call now", "Send quote".
- When enough fields are collected, set readyForQuote or readyForCallback to true.
- When readyForQuote is true, the reply must say: "Tap Send Quote Request below to submit it."
- When readyForCallback is true, the reply must say: "Tap Request Callback below to submit it."
- Return only valid JSON with keys: reply, intent, quickReplies, collected, readyForQuote, readyForCallback.
`

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        text: {
          format: {
            type: "json_schema",
            name: "macbros_assistant_response",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              required: [
                "reply",
                "intent",
                "quickReplies",
                "collected",
                "readyForQuote",
                "readyForCallback",
              ],
              properties: {
                reply: { type: "string" },
                intent: { type: "string", enum: ["quote", "callback", "question", "handoff"] },
                quickReplies: {
                  type: "array",
                  maxItems: 4,
                  items: { type: "string" },
                },
                collected: {
                  type: "object",
                  additionalProperties: false,
                  required: [
                    "name",
                    "phone",
                    "email",
                    "year",
                    "make",
                    "model",
                    "vehicleType",
                    "area",
                    "details",
                    "callbackTime",
                  ],
                  properties: {
                    name: { type: ["string", "null"] },
                    phone: { type: ["string", "null"] },
                    email: { type: ["string", "null"] },
                    year: { type: ["string", "null"] },
                    make: { type: ["string", "null"] },
                    model: { type: ["string", "null"] },
                    vehicleType: { type: ["string", "null"] },
                    area: { type: ["string", "null"] },
                    details: { type: ["string", "null"] },
                    callbackTime: { type: ["string", "null"] },
                  },
                },
                readyForQuote: { type: "boolean" },
                readyForCallback: { type: "boolean" },
              },
            },
          },
        },
        input: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Conversation so far:\n${conversation}\n\nReturn the next assistant response as JSON.`,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => "")
      console.error(
        JSON.stringify({
          level: "error",
          msg: "assistant openai request failed",
          route: "/api/assistant",
          status: response.status,
          error: errorText.slice(0, 300),
          ms: Date.now() - start,
        }),
      )

      return NextResponse.json({
        ...fallbackAssistant(parsed.data.messages),
        mode: "fallback",
      })
    }

    const payload = (await response.json()) as { output_text?: unknown; output?: unknown }
    const text = extractOpenAIText(payload)
    const json = text ? JSON.parse(text) : null

    console.log(
      JSON.stringify({
        level: "info",
        msg: "assistant response sent",
        route: "/api/assistant",
        model,
        ms: Date.now() - start,
      }),
    )

    return NextResponse.json({
      ...normalizePayload(json),
      mode: "ai",
    })
  } catch (error) {
    console.error(
      JSON.stringify({
        level: "error",
        msg: "assistant failed",
        route: "/api/assistant",
        error: error instanceof Error ? error.message : String(error),
        ms: Date.now() - start,
      }),
    )

    return NextResponse.json({
      ...fallbackAssistant([{ role: "user", content: "" }]),
      mode: "fallback",
    })
  }
}
