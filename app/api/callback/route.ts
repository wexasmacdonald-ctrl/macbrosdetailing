import { NextResponse } from "next/server"
import { z } from "zod"
import { escapeHtml, sendContactEmail } from "@/lib/contact"
import { checkRateLimit } from "@/lib/rate-limit"

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

    await sendContactEmail({
      subject: `Callback request from ${name}`,
      replyTo: email,
      text,
      html,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Callback request failed", error)

    return NextResponse.json(
      {
        error:
          "The site is not configured to send callback requests yet. Add the SMTP environment variables and try again.",
      },
      { status: 500 },
    )
  }
}
