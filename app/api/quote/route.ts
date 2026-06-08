import { NextResponse } from "next/server"
import { z } from "zod"
import { escapeHtml, sendContactEmail, sendCustomerEmail } from "@/lib/contact"
import { checkRateLimit } from "@/lib/rate-limit"
import { BUSINESS_NAME, CONTACT_EMAIL, CONTACT_PHONE } from "@/lib/site"

export const runtime = "nodejs"

const vehicleTypes = [
  "Car",
  "SUV",
  "Pickup truck",
  "Work truck",
  "Van",
  "Boat",
  "Trailer",
  "Other",
] as const

const quoteSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(7).max(30),
  email: z.string().trim().email().max(120),
  year: z.string().trim().min(2).max(10),
  make: z.string().trim().min(2).max(60),
  model: z.string().trim().min(1).max(60),
  vehicleType: z.enum(vehicleTypes),
  area: z.string().trim().min(2).max(120),
  details: z.string().trim().min(10).max(3000),
  marketing: z.boolean(),
  website: z.string().trim().max(0).optional().default(""),
})

const allowedPhotoTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
])

function getClientKey(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")
  return forwardedFor?.split(",")[0]?.trim() || "unknown"
}

function readString(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value : ""
}

function fileValidationError() {
  return NextResponse.json(
    {
      error:
        "Photos must be JPG, PNG, WebP, HEIC, or HEIF. Upload up to 5 files, 5 MB each.",
    },
    { status: 400 },
  )
}

export async function POST(request: Request) {
  const start = Date.now()

  if (!checkRateLimit(`quote:${getClientKey(request)}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a few minutes and try again." },
      { status: 429 },
    )
  }

  try {
    const formData = await request.formData()
    const photoFiles = formData
      .getAll("photos")
      .filter((value): value is File => value instanceof File && value.size > 0)

    if (photoFiles.length > 5) {
      return fileValidationError()
    }

    let totalPhotoBytes = 0
    for (const file of photoFiles) {
      totalPhotoBytes += file.size

      if (!allowedPhotoTypes.has(file.type) || file.size > 5 * 1024 * 1024) {
        return fileValidationError()
      }
    }

    if (totalPhotoBytes > 15 * 1024 * 1024) {
      return fileValidationError()
    }

    const parsed = quoteSchema.safeParse({
      name: readString(formData, "name"),
      phone: readString(formData, "phone"),
      email: readString(formData, "email"),
      year: readString(formData, "year"),
      make: readString(formData, "make"),
      model: readString(formData, "model"),
      vehicleType: readString(formData, "vehicleType"),
      area: readString(formData, "area"),
      details: readString(formData, "details"),
      marketing: readString(formData, "marketing") === "on",
      website: readString(formData, "website"),
    })

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please check your vehicle details and try again." },
        { status: 400 },
      )
    }

    if (parsed.data.website) {
      return NextResponse.json({ ok: true })
    }

    const { name, phone, email, year, make, model, vehicleType, area, details, marketing } =
      parsed.data

    const attachments = await Promise.all(
      photoFiles.map(async (file) => ({
        filename: file.name,
        content: Buffer.from(await file.arrayBuffer()),
        contentType: file.type || undefined,
      })),
    )

    const text = [
      "New quote request",
      "",
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Email: ${email}`,
      `Vehicle: ${year} ${make} ${model}`,
      `Vehicle type: ${vehicleType}`,
      `Area: ${area}`,
      `Marketing opt-in: ${marketing ? "Yes" : "No"}`,
      `Photos attached: ${attachments.length}`,
      "",
      "Requested work:",
      details,
    ].join("\n")

    const html = `
      <h1>New quote request</h1>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Vehicle:</strong> ${escapeHtml(`${year} ${make} ${model}`)}</p>
      <p><strong>Vehicle type:</strong> ${escapeHtml(vehicleType)}</p>
      <p><strong>Area:</strong> ${escapeHtml(area)}</p>
      <p><strong>Marketing opt-in:</strong> ${marketing ? "Yes" : "No"}</p>
      <p><strong>Photos attached:</strong> ${attachments.length}</p>
      <p><strong>Requested work:</strong><br />${escapeHtml(details).replaceAll("\n", "<br />")}</p>
    `

    const customerText = [
      `Thanks for contacting ${BUSINESS_NAME}.`,
      "",
      "We received your quote request and will review the details before replying with next steps.",
      "Pricing depends on the vehicle condition, requested work, location, and any photos/details provided.",
      "",
      "Your request:",
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Email: ${email}`,
      `Vehicle: ${year} ${make} ${model}`,
      `Vehicle type: ${vehicleType}`,
      `Area: ${area}`,
      `Photos attached: ${attachments.length}`,
      "",
      "Requested work:",
      details,
      "",
      `Questions? Reply to this email or contact us at ${CONTACT_EMAIL} / ${CONTACT_PHONE}.`,
    ].join("\n")

    const customerHtml = `
      <h1>Quote request received</h1>
      <p>Thanks for contacting ${escapeHtml(BUSINESS_NAME)}. We received your quote request and will review the details before replying with next steps.</p>
      <p>Pricing depends on the vehicle condition, requested work, location, and any photos/details provided.</p>
      <h2>Your request</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Vehicle:</strong> ${escapeHtml(`${year} ${make} ${model}`)}</p>
      <p><strong>Vehicle type:</strong> ${escapeHtml(vehicleType)}</p>
      <p><strong>Area:</strong> ${escapeHtml(area)}</p>
      <p><strong>Photos attached:</strong> ${attachments.length}</p>
      <p><strong>Requested work:</strong><br />${escapeHtml(details).replaceAll("\n", "<br />")}</p>
      <p>Questions? Reply to this email or contact us at ${escapeHtml(CONTACT_EMAIL)} / ${escapeHtml(CONTACT_PHONE)}.</p>
    `

    await Promise.all([
      sendContactEmail({
        subject: `Quote request from ${name} for ${year} ${make} ${model}`,
        replyTo: email,
        text,
        html,
        attachments,
      }),
      sendCustomerEmail({
        to: email,
        subject: `We received your ${BUSINESS_NAME} quote request`,
        text: customerText,
        html: customerHtml,
      }),
    ])

    console.log(
      JSON.stringify({
        level: "info",
        msg: "quote request sent",
        route: "/api/quote",
        ms: Date.now() - start,
      }),
    )

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(
      JSON.stringify({
        level: "error",
        msg: "quote request failed",
        route: "/api/quote",
        error: error instanceof Error ? error.message : String(error),
        ms: Date.now() - start,
      }),
    )

    return NextResponse.json(
      {
        error:
          "The site is not configured to send quote requests yet. Add the SMTP environment variables and try again.",
      },
      { status: 500 },
    )
  }
}
