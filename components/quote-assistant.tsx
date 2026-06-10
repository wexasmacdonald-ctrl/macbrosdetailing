"use client"

import { useEffect, useRef, useState } from "react"
import { track } from "@vercel/analytics"
import { Bot, CheckCircle2, MessageSquare, Phone, Send, Sparkles, X } from "lucide-react"
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

const defaultQuickReplies = ["Start quote", "Request callback", "Help me choose"]

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
  const [quickReplies, setQuickReplies] = useState(defaultQuickReplies)
  const [collected, setCollected] = useState<AssistantResponse["collected"]>({})
  const [readyForQuote, setReadyForQuote] = useState(false)
  const [readyForCallback, setReadyForCallback] = useState(false)
  const scrollAnchorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [messages, loading, open])

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

  function handleQuickReply(reply: string) {
    const normalized = reply.toLowerCase()

    if (normalized.includes("call now")) {
      window.location.href = `tel:${CONTACT_PHONE_HREF}`
      return
    }

    if (normalized.includes("quote page") || normalized.includes("photo")) {
      window.location.href = "/quote"
      return
    }

    void sendMessage(reply)
  }

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 md:inset-x-auto md:right-6 md:bottom-6">
      {open && (
        <section
          className="mx-auto mb-3 flex h-[min(720px,76svh)] w-full max-w-[440px] animate-in flex-col overflow-hidden rounded-3xl border border-border/80 bg-background/95 shadow-2xl shadow-black/45 backdrop-blur-xl fade-in slide-in-from-bottom-3 duration-200 md:mb-4"
          aria-label="MacBros quote assistant"
        >
          <div className="h-1 bg-gradient-to-r from-primary via-red-500 to-primary" />

          <div className="flex items-start justify-between border-b border-border/70 bg-card/70 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/60 bg-primary/10 shadow-lg shadow-primary/10">
                <Bot className="h-5 w-5 text-primary" />
                <span className="absolute -right-1 -bottom-1 h-3 w-3 rounded-full border border-background bg-emerald-500" />
              </div>
              <div>
                <h2 className="font-display text-base font-bold uppercase italic tracking-wide text-foreground">
                  Quote Assistant
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Service guidance, quote requests, callbacks
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-background hover:text-foreground"
              aria-label="Close quote assistant"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div
            className="flex-1 space-y-4 overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(220,38,38,0.11),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent)] px-4 py-4"
            aria-live="polite"
          >
            <div className="rounded-2xl border border-border/70 bg-card/80 px-4 py-3">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">
                    Fastest path to a quote
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Share your vehicle, location area, and what condition it is in. Photos can be
                    added on the quote page if needed.
                  </p>
                </div>
              </div>
            </div>

            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={cn(
                  "group flex max-w-[92%] gap-2",
                  message.role === "assistant" ? "mr-auto" : "ml-auto flex-row-reverse",
                )}
              >
                {message.role === "assistant" && (
                  <div className="mt-1 hidden h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-primary/40 bg-primary/10 sm:flex">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    "border px-4 py-3 text-sm leading-relaxed shadow-sm",
                    message.role === "assistant"
                      ? "rounded-2xl rounded-tl-md border-border/70 bg-card/95 text-muted-foreground"
                      : "rounded-2xl rounded-tr-md border-primary/45 bg-primary text-primary-foreground shadow-primary/10",
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="mr-auto flex max-w-[80%] gap-2">
                <div className="mt-1 hidden h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-primary/40 bg-primary/10 sm:flex">
                  <Bot className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="flex items-center gap-1 rounded-2xl rounded-tl-md border border-border/70 bg-card/95 px-4 py-3 text-sm text-muted-foreground">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:120ms]" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:240ms]" />
                  <span className="ml-2">Checking the best next step</span>
                </div>
              </div>
            )}
            <div ref={scrollAnchorRef} />
          </div>

          <div className="border-t border-border/70 bg-background/95 px-4 py-4">
            {quickReplies.length > 0 && !loading && (
              <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                {quickReplies.map((reply) => (
                  <button
                    key={reply}
                    type="button"
                    onClick={() => handleQuickReply(reply)}
                    className="shrink-0 rounded-full border border-border/80 bg-card px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:bg-primary/10 hover:text-foreground"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}

            {(readyForQuote || readyForCallback) && (
              <div className="mb-3 grid gap-2 sm:grid-cols-2">
                {readyForQuote && (
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={submitQuoteRequest}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 font-display text-xs font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Send Quote
                  </button>
                )}
                {readyForCallback && (
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={submitCallbackRequest}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 font-display text-xs font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
                  >
                    <Phone className="h-4 w-4" />
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
                placeholder="Type vehicle, area, or what you need..."
                className="min-w-0 flex-1 rounded-full border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-45"
                aria-label="Send assistant message"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                AI helps collect details. Final recommendations and quotes are confirmed by
                MacBros.
              </p>
              <a
                href={`tel:${CONTACT_PHONE_HREF}`}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-3 py-2 font-display text-xs font-semibold uppercase tracking-widest text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <Phone className="h-4 w-4 text-primary" />
                Call
              </a>
            </div>
          </div>
        </section>
      )}

      <div className="mx-auto flex max-w-[440px] justify-end md:max-w-none">
        <button
          type="button"
          onClick={() => {
            setOpen((current) => !current)
            track("assistant_toggle", { open: !open })
          }}
          className="group flex items-center gap-3 rounded-full border border-primary/50 bg-primary px-4 py-3 text-left text-primary-foreground shadow-xl shadow-black/30 transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-2xl md:px-5 md:py-4"
          aria-expanded={open}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15">
            <MessageSquare className="h-5 w-5" />
          </span>
          <span className="leading-none">
            <span className="block font-display text-xs font-semibold uppercase tracking-widest">
              {open ? "Close" : "Quote Assistant"}
            </span>
            {!open && (
              <span className="mt-1 block text-[11px] font-medium normal-case tracking-normal opacity-85">
                Get help or request a callback
              </span>
            )}
          </span>
        </button>
      </div>
    </div>
  )
}
