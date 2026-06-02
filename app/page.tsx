import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { SectionHeading } from "@/components/section-heading"
import { CONTACT_EMAIL, SERVICE_AREA } from "@/lib/site"

const processSteps = [
  {
    step: "01",
    title: "Send Your Details",
    desc: "Send your vehicle details and what you would like done.",
  },
  {
    step: "02",
    title: "We Review The Job",
    desc: "We review what needs to be done and follow up.",
  },
  {
    step: "03",
    title: "We Fit You In",
    desc: "We fit you into our schedule.",
  },
  {
    step: "04",
    title: "We Come To You",
    desc: "We arrive on site and complete the detail.",
  },
] as const

const credibilityPoints = [
  { title: "Mobile Service", desc: "We come to you." },
  {
    title: "Local Family-Owned",
    desc: "You deal with a local business, not a big chain.",
  },
  {
    title: "Ottawa Area",
    desc: `Serving ${SERVICE_AREA.toLowerCase()}.`,
  },
  {
    title: "Clear Communication",
    desc: "We review the job before confirming the work.",
  },
] as const

const faqItems = [
  {
    title: "Do you need access to water or power?",
    desc: "Depending on the job, access to water and electricity may be needed. We review that with you before confirming the booking.",
  },
  {
    title: "Can I send photos for a more accurate quote?",
    desc: "Yes. Photos are optional, but they help us understand the condition of the vehicle and quote the work more accurately.",
  },
  {
    title: "Do you only work on cars?",
    desc: "No. We also quote SUVs, pickup trucks, work trucks, vans, boats, trailers, and other vehicles by request.",
  },
] as const

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border/50">
        <div
          className="absolute -top-12 -right-40 h-px w-[700px] rotate-[18deg] bg-primary opacity-40"
          aria-hidden
        />

        <div className="relative mx-auto flex min-h-[62vh] max-w-7xl flex-col justify-center px-4 py-20 sm:px-6 md:py-28 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-primary" />
            <span className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              Mobile Detailing
            </span>
          </div>

          <h1 className="mt-5 max-w-3xl font-display text-4xl font-bold uppercase italic leading-[1] tracking-tight text-balance md:text-6xl lg:text-7xl">
            <span className="text-chrome">Mobile Detailing</span>{" "}
            <span className="text-primary">That Comes To You</span>
          </h1>

          <p className="mt-4 font-display text-sm font-semibold uppercase tracking-[0.2em] text-foreground/70 md:text-base">
            Ottawa &amp; Surrounding Area
          </p>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground text-pretty md:text-lg">
            MacBros Detailing is a local, family-owned mobile detailing service serving{" "}
            {SERVICE_AREA.toLowerCase()}. Send us your vehicle details and we&apos;ll get back to
            you with a quote.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Link
              href="/quote"
              className="group inline-flex items-center gap-2 bg-primary px-7 py-3.5 font-display text-sm font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Get My Quote
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/services"
              className="font-display text-sm font-semibold uppercase tracking-widest text-foreground/80 underline underline-offset-4 transition-colors hover:text-foreground"
            >
              View Services
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-border/50 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="How It Works" title="Simple," accent="Start To Finish" />

          <div className="mt-10 grid grid-cols-1 gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((step) => (
              <div key={step.step} className="bg-black/40 p-6 backdrop-blur-sm md:p-8">
                <span className="font-display text-4xl font-bold italic text-stroke-chrome md:text-5xl">
                  {step.step}
                </span>
                <h3 className="mt-6 font-display text-lg font-bold uppercase italic tracking-tight text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border/50 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Why MacBros" title="Local." accent="Honest." />

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {credibilityPoints.map((point) => (
              <div
                key={point.title}
                className="border border-border/50 bg-black/40 p-6 transition-colors hover:border-primary/50 backdrop-blur-sm md:p-7"
              >
                <span className="block h-px w-10 bg-primary" aria-hidden />
                <h3 className="mt-5 font-display text-base font-bold uppercase italic tracking-tight text-foreground">
                  {point.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{point.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border/50 py-16 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-8">
          <div>
            <SectionHeading eyebrow="What To Expect" title="Straightforward" accent="Booking" />
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground md:text-base">
              <p>
                Every vehicle is reviewed individually before the work is confirmed. That keeps the
                quote tied to the actual condition of the vehicle instead of a one-size-fits-all
                menu.
              </p>
              <p>
                If the job needs access to water or electricity, we will confirm that with you
                before the appointment. For quote requests, photos help us price the work more
                accurately.
              </p>
            </div>
          </div>

          <div className="border border-border/50 bg-black/40 p-6 backdrop-blur-sm md:p-8">
            <h2 className="font-display text-2xl font-bold uppercase italic tracking-tight text-chrome md:text-3xl">
              Questions?
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              For general questions or non-quote inquiries, email us directly at{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-foreground underline-offset-2 hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
            <div className="mt-6">
              <Link
                href="/contact"
                className="font-display text-sm font-semibold uppercase tracking-widest text-foreground/80 underline underline-offset-4 transition-colors hover:text-foreground"
              >
                Go To Contact Page
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Common Questions" title="Before You" accent="Book" />

          <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-3">
            {faqItems.map((item) => (
              <div key={item.title} className="border border-border/50 bg-black/40 p-6 backdrop-blur-sm md:p-7">
                <h3 className="font-display text-lg font-bold uppercase italic tracking-tight text-foreground">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
