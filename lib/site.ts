export const BUSINESS_NAME = "MacBros Detailing"
export const BUSINESS_LEGAL_NAME = "MacBros Property Services"
export const CONTACT_EMAIL = "info@macbrosdetailing.com"
export const CONTACT_PHONE = "819-576-7856"
export const CONTACT_PHONE_HREF = "+18195767856"
export const SERVICE_AREA = "Ottawa and the surrounding area"
export const SITE_DESCRIPTION =
  "MacBros Detailing is a local, family-owned mobile detailing service serving Ottawa and the surrounding area."
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || "https://www.macbrosdetailing.com"

export const SERVICE_TYPES = [
  "Interior detailing",
  "Exterior detailing",
  "Mobile detailing",
  "Headlight rejuvenation",
] as const
