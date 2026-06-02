"use client"

import { useState } from "react"
import { AlertCircle, Check, Send } from "lucide-react"

export function CallbackForm() {
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setErrorMessage(null)

    const form = e.currentTarget

    try {
      const response = await fetch("/api/callback", {
        method: "POST",
        body: new FormData(form),
      })

      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null

      if (!response.ok) {
        throw new Error(
          payload?.error ?? "We couldn't send your callback request. Please try again.",
        )
      }

      form.reset()
      setDone(true)
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We couldn't send your callback request. Please try again.",
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center border border-border bg-card p-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center border border-primary bg-primary/10">
          <Check className="h-6 w-6 text-primary" />
        </div>
        <h3 className="mt-6 font-display text-2xl font-bold uppercase italic tracking-tight text-chrome">
          Request Received
        </h3>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          Thanks - we received your callback request and will get back to you.
        </p>
        <button
          type="button"
          onClick={() => {
            setDone(false)
            setErrorMessage(null)
          }}
          className="mt-8 border border-border px-6 py-3 font-display text-xs font-semibold uppercase tracking-widest text-foreground hover:border-primary hover:text-primary"
        >
          Submit Another
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" name="name" required autoComplete="name" />
        <Field label="Phone" name="phone" type="tel" required autoComplete="tel" />
      </div>
      <Field label="Email" name="email" type="email" required autoComplete="email" />
      <Field
        label="Preferred Callback Time"
        name="callbackTime"
        placeholder="e.g. weekday mornings"
        required
      />
      <Textarea label="Short Message" name="message" rows={4} />
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <button
        type="submit"
        disabled={submitting}
        className="group inline-flex items-center gap-2 bg-primary px-7 py-3.5 font-display text-sm font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
      >
        {submitting ? "Sending..." : "Request Callback"}
        <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </button>

      {errorMessage && (
        <div
          className="flex items-start gap-3 border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-foreground"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
          <p>{errorMessage}</p>
        </div>
      )}
    </form>
  )
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  autoComplete,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  placeholder?: string
  autoComplete?: string
}) {
  return (
    <label className="block">
      <span className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label} {required && <span className="text-primary">*</span>}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="mt-2 w-full border border-border bg-card px-4 py-3 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none"
      />
    </label>
  )
}

function Textarea({
  label,
  name,
  rows = 4,
}: {
  label: string
  name: string
  rows?: number
}) {
  return (
    <label className="block">
      <span className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </span>
      <textarea
        name={name}
        rows={rows}
        className="mt-2 w-full resize-none border border-border bg-card px-4 py-3 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none"
      />
    </label>
  )
}
