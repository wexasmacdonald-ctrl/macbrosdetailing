import { PageHero } from "@/components/page-hero"
import { QuoteForm } from "@/components/quote-form"
import { SERVICE_AREA } from "@/lib/site"

export const metadata = {
  title: "Quote",
  description:
    "Request a detailed quote from MacBros Detailing. Mobile service in Ottawa and the surrounding area.",
}

export default function QuotePage() {
  return (
    <>
      <PageHero
        eyebrow="Quote"
        title="Get My"
        accent="Quote"
        description="Photos are optional, but they help us quote more accurately. Please include as much detail as possible about what you want cleaned, restored, or detailed."
      />

      <section className="py-16 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.4fr] lg:gap-16 lg:px-8">
          <aside className="space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold uppercase italic tracking-tight text-chrome md:text-2xl">
                What We Need
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Vehicle details, what you want done, and your area. Photos help, but they are
                optional.
              </p>
            </div>

            <div className="border-l-2 border-primary/60 bg-card/85 backdrop-blur-sm px-4 py-3 text-sm leading-relaxed text-muted-foreground">
              Access to water and electricity may be needed depending on the job.
            </div>

            <div>
              <h2 className="font-display text-xl font-bold uppercase italic tracking-tight text-chrome md:text-2xl">
                Service Area
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{SERVICE_AREA}.</p>
            </div>
          </aside>

          <div>
            <h2 className="font-display text-2xl font-bold uppercase italic tracking-tight text-chrome md:text-3xl">
              Quote Request
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Fill in the details below and we&apos;ll get back to you with a quote.
            </p>
            <div className="mt-8">
              <QuoteForm />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
