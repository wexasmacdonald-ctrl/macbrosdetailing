import Link from "next/link"
import { Mail } from "lucide-react"
import { PageHero } from "@/components/page-hero"
import { CallbackForm } from "@/components/callback-form"
import { CONTACT_EMAIL, SERVICE_AREA } from "@/lib/site"

export const metadata = {
  title: "Contact",
  description: "Get in touch with MacBros Detailing or request a callback.",
}

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Get In"
        accent="Touch"
        description="For general questions or callback requests. For vehicle-specific quotes, use the Quote page."
      />

      <section className="py-16 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.4fr] lg:gap-16 lg:px-8">
          <aside className="space-y-8">
            <div>
              <h2 className="font-display text-xl font-bold uppercase italic tracking-tight text-chrome md:text-2xl">
                Email
              </h2>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="mt-3 inline-flex items-center gap-2 text-sm text-foreground transition-colors hover:text-primary"
              >
                <Mail className="h-4 w-4 text-primary" />
                {CONTACT_EMAIL}
              </a>
            </div>

            <div>
              <h2 className="font-display text-xl font-bold uppercase italic tracking-tight text-chrome md:text-2xl">
                Service Area
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{SERVICE_AREA}.</p>
            </div>

            <div className="border-l-2 border-primary/60 bg-card/85 backdrop-blur-sm px-4 py-3 text-sm leading-relaxed text-muted-foreground">
              Need a vehicle quote? Use the{" "}
              <Link href="/quote" className="text-foreground underline-offset-2 hover:underline">
                Quote page
              </Link>{" "}
              so we can collect the right details.
            </div>
          </aside>

          <div>
            <h2 className="font-display text-2xl font-bold uppercase italic tracking-tight text-chrome md:text-3xl">
              Request A Callback
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Leave your details and we&apos;ll get back to you.
            </p>
            <div className="mt-8">
              <CallbackForm />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
