"use client"

import { useState } from "react"
import { AlertCircle, Check, Send, Upload } from "lucide-react"

const VEHICLE_TYPES = [
  "Car",
  "SUV",
  "Pickup truck",
  "Work truck",
  "Van",
  "Boat",
  "Trailer",
  "Other",
] as const

export function QuoteForm() {
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [fileNames, setFileNames] = useState<string[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setErrorMessage(null)

    const form = e.currentTarget

    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        body: new FormData(form),
      })

      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null

      if (!response.ok) {
        throw new Error(payload?.error ?? "We couldn't send your request. Please try again.")
      }

      form.reset()
      setFileNames([])
      setDone(true)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "We couldn't send your request. Please try again.",
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center border border-border bg-card p-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center border border-primary bg-primary/10">
          <Check className="h-6 w-6 text-primary" />
        </div>
        <h3 className="mt-6 font-display text-2xl font-bold uppercase italic tracking-tight text-chrome">
          Quote Request Received
        </h3>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          Thanks - we received your request. We&apos;ll review the details and get back to you with
          a quote.
        </p>
        <button
          type="button"
          onClick={() => {
            setDone(false)
            setErrorMessage(null)
            setFileNames([])
          }}
          className="mt-8 border border-border px-6 py-3 font-display text-xs font-semibold uppercase tracking-widest text-foreground hover:border-primary hover:text-primary"
        >
          Submit Another
        </button>
      </div>
    )
  }

  const fileLabel =
    fileNames.length === 0
      ? "Choose photos (optional)"
      : fileNames.length === 1
        ? fileNames[0]
        : `${fileNames.length} files selected`

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" name="name" required autoComplete="name" />
        <Field label="Phone" name="phone" type="tel" required autoComplete="tel" />
      </div>
      <Field label="Email" name="email" type="email" required autoComplete="email" />

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Year" name="year" required inputMode="numeric" />
        <Field label="Make / Brand" name="make" required />
        <Field label="Model" name="model" required />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Select label="Vehicle Type" name="vehicleType" required>
          <option value="">Select a vehicle type...</option>
          {VEHICLE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </Select>
        <Field
          label="Area / Region"
          name="area"
          placeholder="e.g. Ottawa, Kanata, Orleans"
          required
          autoComplete="address-level2"
        />
      </div>

      <Textarea
        label="What would you like done?"
        name="details"
        rows={5}
        placeholder="Please include as much detail as possible about what you want cleaned, restored, or detailed."
        required
      />

      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <div>
        <span className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Optional Photo Upload
        </span>
        <label className="mt-2 flex cursor-pointer items-center gap-3 border border-dashed border-border bg-card px-4 py-4 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground">
          <Upload className="h-4 w-4" />
          <span className="truncate">{fileLabel}</span>
          <input
            type="file"
            name="photos"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            multiple
            className="sr-only"
            onChange={(e) => setFileNames(Array.from(e.target.files ?? []).map((file) => file.name))}
          />
        </label>
        <p className="mt-2 text-xs text-muted-foreground">
          Up to 5 photos. JPG, PNG, WebP, HEIC, or HEIF. Max 5 MB each.
        </p>
      </div>

      <label className="flex items-start gap-3 text-sm text-muted-foreground">
        <input
          type="checkbox"
          name="marketing"
          className="mt-1 h-4 w-4 border border-border bg-card accent-primary"
        />
        <span>I agree to receive occasional marketing emails from MacBros Detailing.</span>
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="group inline-flex items-center gap-2 bg-primary px-7 py-3.5 font-display text-sm font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
      >
        {submitting ? "Sending..." : "Get My Quote"}
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

      <p className="text-xs leading-relaxed text-muted-foreground">
        By clicking Get My Quote, you agree to be contacted by MacBros Detailing about your quote
        request by phone, text, or email.
      </p>
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
  inputMode,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  placeholder?: string
  autoComplete?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]
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
        inputMode={inputMode}
        className="mt-2 w-full border border-border bg-card px-4 py-3 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none"
      />
    </label>
  )
}

function Select({
  label,
  name,
  required,
  children,
}: {
  label: string
  name: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label} {required && <span className="text-primary">*</span>}
      </span>
      <select
        name={name}
        required={required}
        className="mt-2 w-full border border-border bg-card px-4 py-3 text-sm text-foreground transition-colors focus:border-primary focus:outline-none"
      >
        {children}
      </select>
    </label>
  )
}

function Textarea({
  label,
  name,
  rows = 4,
  placeholder,
  required,
}: {
  label: string
  name: string
  rows?: number
  placeholder?: string
  required?: boolean
}) {
  return (
    <label className="block">
      <span className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label} {required && <span className="text-primary">*</span>}
      </span>
      <textarea
        name={name}
        rows={rows}
        required={required}
        placeholder={placeholder}
        className="mt-2 w-full resize-none border border-border bg-card px-4 py-3 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none"
      />
    </label>
  )
}
