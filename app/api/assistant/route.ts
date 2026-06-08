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

  return parsed.data
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
- Services: ${SERVICE_TYPES.join(", ")}, headlight rejuvenation, and case-by-case detailing requests for cars, SUVs, pickup trucks, work trucks, vans, boats, trailers, and other vehicles.
- Pricing is quote-based and depends on vehicle condition, size, requested work, location, and photos/details. Do not invent prices or estimates.
- Do not mention or request a storefront address. This is a mobile/service-area business.
- For quote requests, collect: name, phone, email, year, make, model, vehicle type, area/region, and requested work/details.
- For callbacks, collect: name, phone, email, and preferred callback time.
- Photos help quote accuracy, but the assistant cannot upload photos in chat. Tell users they can submit photos on the full Quote page if needed.

Your job:
- Be concise, helpful, and direct.
- Ask one or two practical questions at a time.
- Help users choose the right package, explain what MacBros needs, or collect details.
- When enough fields are collected, set readyForQuote or readyForCallback to true.
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
