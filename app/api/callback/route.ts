import { NextResponse } from "next/server"
import { z } from "zod"
import { escapeHtml, sendContactEmail, sendCustomerEmail } from "@/lib/contact"
import { checkRateLimit } from "@/lib/rate-limit"
import { BUSINESS_NAME, CONTACT_EMAIL, CONTACT_PHONE } from "@/lib/site"

export const runtime = "nodejs"

const callbackSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(7).max(30),
  email: z.string().trim().email().max(120),
  callbackTime: z.string().trim().min(2).max(120),
  message: z.string().trim().max(1000).optional().default(""),
  website: z.string().trim().max(0).optional().default(""),
})

function getClientKey(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")
  return forwardedFor?.split(",")[0]?.trim() || "unknown"
}

function readString(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value : ""
}

export async function POST(request: Request) {
  const start = Date.now()

  if (!checkRateLimit(`callback:${getClientKey(request)}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a few minutes and try again." },
      { status: 429 },
    )
  }

  try {
    const formData = await request.formData()
    const parsed = callbackSchema.safeParse({
      name: readString(formData, "name"),
      phone: readString(formData, "phone"),
      email: readString(formData, "email"),
      callbackTime: readString(formData, "callbackTime"),
      message: readString(formData, "message"),
      website: readString(formData, "website"),
    })

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please check your details and try again." },
        { status: 400 },
      )
    }

    if (parsed.data.website) {
      return NextResponse.json({ ok: true })
    }

    const { name, phone, email, callbackTime, message } = parsed.data
    const safeMessage = message || "None provided"

    const text = [
      "New callback request",
      "",
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Email: ${email}`,
      `Preferred callback time: ${callbackTime}`,
      `Message: ${safeMessage}`,
    ].join("\n")

    const html = `
      <h1>New callback request</h1>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Preferred callback time:</strong> ${escapeHtml(callbackTime)}</p>
      <p><strong>Message:</strong><br />${escapeHtml(safeMessage).replaceAll("\n", "<br />")}</p>
    `

    const customerText = [
      `Thanks for contacting ${BUSINESS_NAME}.`,
      "",
      "We received your callback request and will get back to you.",
      "",
      "Your request:",
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Email: ${email}`,
      `Preferred callback time: ${callbackTime}`,
      `Message: ${safeMessage}`,
      "",
      `Questions? Reply to this email or contact us at ${CONTACT_EMAIL} / ${CONTACT_PHONE}.`,
    ].join("\n")

    const customerHtml = `
      <h1>Callback request received</h1>
      <p>Thanks for contacting ${escapeHtml(BUSINESS_NAME)}. We received your callback request and will get back to you.</p>
      <h2>Your request</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Preferred callback time:</strong> ${escapeHtml(callbackTime)}</p>
      <p><strong>Message:</strong><br />${escapeHtml(safeMessage).replaceAll("\n", "<br />")}</p>
      <p>Questions? Reply to this email or contact us at ${escapeHtml(CONTACT_EMAIL)} / ${escapeHtml(CONTACT_PHONE)}.</p>
    `

    await Promise.all([
      sendContactEmail({
        subject: `Callback request from ${name}`,
        replyTo: email,
        text,
        html,
      }),
      sendCustomerEmail({
        to: email,
        subject: `We received your ${BUSINESS_NAME} callback request`,
        text: customerText,
        html: customerHtml,
      }),
    ])

    console.log(
      JSON.stringify({
        level: "info",
        msg: "callback request sent",
        route: "/api/callback",
        ms: Date.now() - start,
      }),
    )

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(
      JSON.stringify({
        level: "error",
        msg: "callback request failed",
        route: "/api/callback",
        error: error instanceof Error ? error.message : String(error),
        ms: Date.now() - start,
      }),
    )

    return NextResponse.json(
      {
        error:
          "The site is not configured to send callback requests yet. Add the SMTP environment variables and try again.",
      },
      { status: 500 },
    )
  }
}
