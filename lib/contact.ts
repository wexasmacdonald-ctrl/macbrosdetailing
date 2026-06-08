import nodemailer from "nodemailer"
import { CONTACT_EMAIL } from "@/lib/site"

type MailAttachment = {
  filename: string
  content: Buffer
  contentType?: string
}

type MailPayload = {
  subject: string
  replyTo: string
  text: string
  html: string
  attachments?: MailAttachment[]
}

type CustomerMailPayload = {
  to: string
  subject: string
  text: string
  html: string
}

let transporter: nodemailer.Transporter | null = null

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

function getTransporter() {
  if (transporter) {
    return transporter
  }

  const host = getRequiredEnv("SMTP_HOST")
  const user = getRequiredEnv("SMTP_USER")
  const pass = getRequiredEnv("SMTP_PASS")
  const rawPort = getRequiredEnv("SMTP_PORT")
  const port = Number(rawPort)

  if (!Number.isFinite(port)) {
    throw new Error("SMTP_PORT must be a valid number.")
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === "true" || port === 465,
    auth: {
      user,
      pass,
    },
  })

  return transporter
}

export async function sendContactEmail(payload: MailPayload) {
  const from = getRequiredEnv("SMTP_FROM")
  const to = process.env.CONTACT_TO_EMAIL?.trim() || CONTACT_EMAIL

  await getTransporter().sendMail({
    from,
    to,
    replyTo: payload.replyTo,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
    attachments: payload.attachments,
  })
}

export async function sendCustomerEmail(payload: CustomerMailPayload) {
  const from = getRequiredEnv("SMTP_FROM")

  await getTransporter().sendMail({
    from,
    to: payload.to,
    replyTo: CONTACT_EMAIL,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
  })
}

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}
