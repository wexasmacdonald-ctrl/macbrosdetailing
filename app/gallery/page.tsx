import Link from "next/link"
import { ArrowRight, Camera } from "lucide-react"
import { PageHero } from "@/components/page-hero"

export const metadata = {
  title: "Gallery",
  description: "Our portfolio is being built. Check back soon to see real detailing work.",
}

export default function GalleryPage() {
  return (
    <>
      <PageHero eyebrow="Gallery" title="Coming" accent="Soon" />

      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center border border-border">
            <Camera className="h-6 w-6 text-primary" aria-hidden />
          </div>

          <h2 className="mt-8 font-display text-2xl font-bold uppercase italic tracking-tight text-foreground md:text-3xl">
            Our portfolio is being built.
          </h2>

          <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
            Real photos and videos from completed details will be added here as the portfolio grows.
            In the meantime, send us your vehicle details and we&apos;ll get back to you with a quote.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-5">
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
    </>
  )
}
