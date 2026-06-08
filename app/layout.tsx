import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { Inter, Oswald } from "next/font/google"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { QuoteAssistant } from "@/components/quote-assistant"
import {
  BUSINESS_LEGAL_NAME,
  BUSINESS_NAME,
  CONTACT_EMAIL,
  CONTACT_PHONE_HREF,
  SERVICE_AREA,
  SITE_DESCRIPTION,
  SITE_URL,
} from "@/lib/site"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || SITE_URL

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${BUSINESS_NAME} - Mobile Detailing in Ottawa`,
    template: `%s | ${BUSINESS_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: BUSINESS_NAME,
  alternates: {
    canonical: "/",
  },
  keywords: [
    "mobile detailing Ottawa",
    "Ottawa car detailing",
    "interior car detailing Ottawa",
    "exterior car detailing Ottawa",
    "headlight restoration Ottawa",
    "mobile auto detailing Ottawa",
  ],
  authors: [{ name: BUSINESS_NAME }],
  creator: BUSINESS_NAME,
  publisher: BUSINESS_NAME,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: [{ url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: `${BUSINESS_NAME} - Mobile Detailing in Ottawa`,
    description: SITE_DESCRIPTION,
    type: "website",
    url: siteUrl,
    siteName: BUSINESS_NAME,
    locale: "en_CA",
  },
  twitter: {
    card: "summary_large_image",
    title: `${BUSINESS_NAME} - Mobile Detailing in Ottawa`,
    description: SITE_DESCRIPTION,
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: BUSINESS_NAME,
  legalName: BUSINESS_LEGAL_NAME,
  description: SITE_DESCRIPTION,
  email: CONTACT_EMAIL,
  telephone: CONTACT_PHONE_HREF,
  url: siteUrl,
  areaServed: SERVICE_AREA,
  image: `${siteUrl}/images/macbros-icon-source.png`,
  logo: `${siteUrl}/images/macbros-icon-source.png`,
  priceRange: "$$",
  knowsAbout: [
    "Mobile detailing",
    "Interior detailing",
    "Exterior detailing",
    "Headlight rejuvenation",
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${oswald.variable}`}>
      <body className="flex min-h-screen flex-col font-sans antialiased text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div className="relative z-10 flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
        <QuoteAssistant />
        <Analytics />
      </body>
    </html>
  )
}
