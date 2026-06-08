"use client"

import { useState } from "react"
import { track } from "@vercel/analytics"
import { Bot, MessageSquare, Phone, Send, X } from "lucide-react"
import { CONTACT_PHONE, CONTACT_PHONE_HREF } from "@/lib/site"
import { cn } from "@/lib/utils"

type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

type AssistantResponse = {
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
  mode?: "ai" | "fallback"
}

const initialMessage: ChatMessage = {
  role: "assistant",
  content:
    "Need help choosing a package, requesting a quote, or booking a callback? Tell me what vehicle you have and what you need done.",
}

const vehicleTypes = new Set([
  "Car",
  "SUV",
  "Pickup truck",
  "Work truck",
  "Van",
  "Boat",
  "Trailer",
  "Other",
])

function normalizeVehicleType(value?: string) {
  if (!value) {
    return "Other"
  }

  const match = Array.from(vehicleTypes).find(
    (type) => type.toLowerCase() === value.trim().toLowerCase(),
  )

  return match ?? "Other"
}

function missingQuoteFields(collected: AssistantResponse["collected"]) {
  const required = [
    ["name", "name"],
    ["phone", "phone"],
    ["email", "email"],
    ["year", "vehicle year"],
    ["make", "make"],
    ["model", "model"],
    ["area", "area"],
    ["details", "what you want done"],
  ] as const

  return required
    .filter(([key]) => !collected[key])
    .map(([, label]) => label)
}

function missingCallbackFields(collected: AssistantResponse["collected"]) {
  const required = [
    ["name", "name"],
    ["phone", "phone"],
    ["email", "email"],
    ["callbackTime", "preferred callback time"],
  ] as const

  return required
    .filter(([key]) => !collected[key])
    .map(([, label]) => label)
}

export function QuoteAssistant() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [quickReplies, setQuickReplies] = useState([
    "Start quote",
    "Request callback",
    "Help me choose",
  ])
  const [collected, setCollected] = useState<AssistantResponse["collected"]>({})
  const [readyForQuote, setReadyForQuote] = useState(false)
  const [readyForCallback, setReadyForCallback] = useState(false)

  async function sendMessage(value: string) {
    const content = value.trim()
    if (!content || loading) {
      return
    }

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content }]
    setMessages(nextMessages)
    setInput("")
    setLoading(true)
    track("assistant_message_sent")

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages.slice(-10) }),
      })

      const payload = (await response.json()) as AssistantResponse | { error?: string }

      if (!response.ok || "error" in payload) {
        throw new Error("Assistant unavailable")
      }

      const assistantPayload = payload as AssistantResponse

      setMessages((current) => [
        ...current,
        { role: "assistant", content: assistantPayload.reply },
      ])
      setQuickReplies(assistantPayload.quickReplies?.slice(0, 4) ?? [])
      setCollected((current) => ({ ...current, ...assistantPayload.collected }))
      setReadyForQuote(assistantPayload.readyForQuote)
      setReadyForCallback(assistantPayload.readyForCallback)
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "I can still help. Send your name, phone, email, vehicle, area, and what you need done, or call us directly.",
        },
      ])
      setQuickReplies(["Call now", "Request callback", "Quote page"])
    } finally {
      setLoading(false)
    }
  }

  async function submitQuoteRequest() {
    const missing = missingQuoteFields(collected)
    if (missing.length > 0) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: `Before I can send this quote request, I still need: ${missing.join(", ")}.`,
        },
      ])
      return
    }

    setSubmitting(true)
    track("assistant_quote_submit")

    try {
      const formData = new FormData()
      formData.set("name", collected.name ?? "")
      formData.set("phone", collected.phone ?? "")
      formData.set("email", collected.email ?? "")
      formData.set("year", collected.year ?? "")
      formData.set("make", collected.make ?? "")
      formData.set("model", collected.model ?? "")
      formData.set("vehicleType", normalizeVehicleType(collected.vehicleType))
      formData.set("area", collected.area ?? "")
      formData.set("details", collected.details ?? "")

      const response = await fetch("/api/quote", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Quote request failed")
      }

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "Quote request sent. We also emailed you a copy of your request. If you have photos, send them through the full Quote page for a more accurate review.",
        },
      ])
      setReadyForQuote(false)
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "I could not send that request from chat. Please use the Quote page or call us directly.",
        },
      ])
    } finally {
      setSubmitting(false)
    }
  }

  async function submitCallbackRequest() {
    const missing = missingCallbackFields(collected)
    if (missing.length > 0) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: `Before I can request a callback, I still need: ${missing.join(", ")}.`,
        },
      ])
      return
    }

    setSubmitting(true)
    track("assistant_callback_submit")

    try {
      const formData = new FormData()
      formData.set("name", collected.name ?? "")
      formData.set("phone", collected.phone ?? "")
      formData.set("email", collected.email ?? "")
      formData.set("callbackTime", collected.callbackTime ?? "")
      formData.set("message", collected.details ?? "Requested callback through the quote assistant.")

      const response = await fetch("/api/callback", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Callback request failed")
      }

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: "Callback request sent. We also emailed you a copy of your request.",
        },
      ])
      setReadyForCallback(false)
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "I could not send that callback request from chat. Please use the Contact page or call us directly.",
        },
      ])
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed right-4 bottom-4 z-50 md:right-6 md:bottom-6">
      {open && (
        <section className="mb-4 flex max-h-[78vh] w-[calc(100vw-2rem)] max-w-md flex-col overflow-hidden border border-border/70 bg-background/95 shadow-2xl shadow-black/40 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center border border-primary/50 bg-primary/10">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-sm font-bold uppercase italic tracking-wide text-foreground">
                  Quote Assistant
                </h2>
                <p className="text-xs text-muted-foreground">MacBros Detailing</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-9 w-9 items-center justify-center text-muted-foreground hover:text-foreground"
              aria-label="Close quote assistant"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={cn(
                  "max-w-[88%] border px-4 py-3 text-sm leading-relaxed",
                  message.role === "assistant"
                    ? "border-border/70 bg-card/90 text-muted-foreground"
                    : "ml-auto border-primary/50 bg-primary/15 text-foreground",
                )}
              >
                {message.content}
              </div>
            ))}
            {loading && (
              <div className="max-w-[80%] border border-border/70 bg-card/90 px-4 py-3 text-sm text-muted-foreground">
                Thinking...
              </div>
            )}
          </div>

          <div className="border-t border-border/70 px-4 py-3">
            <div className="mb-3 flex flex-wrap gap-2">
              {quickReplies.map((reply) => (
                <button
                  key={reply}
                  type="button"
                  onClick={() => {
                    if (reply.toLowerCase().includes("call now")) {
                      window.location.href = `tel:${CONTACT_PHONE_HREF}`
                      return
                    }
                    if (reply.toLowerCase().includes("quote page")) {
                      window.location.href = "/quote"
                      return
                    }
                    if (reply.toLowerCase().includes("photo")) {
                      window.location.href = "/quote"
                      return
                    }
                    void sendMessage(reply)
                  }}
                  className="border border-border/70 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                >
                  {reply}
                </button>
              ))}
            </div>

            {(readyForQuote || readyForCallback) && (
              <div className="mb-3 flex flex-wrap gap-2">
                {readyForQuote && (
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={submitQuoteRequest}
                    className="bg-primary px-4 py-2 font-display text-xs font-semibold uppercase tracking-widest text-primary-foreground disabled:opacity-60"
                  >
                    Send Quote Request
                  </button>
                )}
                {readyForCallback && (
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={submitCallbackRequest}
                    className="bg-primary px-4 py-2 font-display text-xs font-semibold uppercase tracking-widest text-primary-foreground disabled:opacity-60"
                  >
                    Request Callback
                  </button>
                )}
              </div>
            )}

            <form
              className="flex gap-2"
              onSubmit={(event) => {
                event.preventDefault()
                void sendMessage(input)
              }}
            >
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about services or start a quote..."
                className="min-w-0 flex-1 border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-10 w-10 items-center justify-center bg-primary text-primary-foreground disabled:opacity-60"
                aria-label="Send assistant message"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>

            <a
              href={`tel:${CONTACT_PHONE_HREF}`}
              className="mt-3 flex items-center justify-center gap-2 border border-border px-3 py-2 font-display text-xs font-semibold uppercase tracking-widest text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Phone className="h-4 w-4 text-primary" />
              Call Now {CONTACT_PHONE}
            </a>
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => {
          setOpen((current) => !current)
          track("assistant_toggle", { open: !open })
        }}
        className="group flex items-center gap-3 bg-primary px-5 py-4 font-display text-sm font-semibold uppercase tracking-widest text-primary-foreground shadow-xl shadow-black/30 transition-colors hover:bg-primary/90"
        aria-expanded={open}
      >
        <MessageSquare className="h-5 w-5" />
        {open ? "Close" : "Quote Assistant"}
      </button>
    </div>
  )
}
