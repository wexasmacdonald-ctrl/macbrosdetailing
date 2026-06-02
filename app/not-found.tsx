import Link from "next/link"

export default function NotFound() {
  return (
    <section className="border-b border-border/50 py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-primary">
          404
        </p>
        <h1 className="mt-5 font-display text-4xl font-bold uppercase italic tracking-tight text-chrome md:text-6xl">
          Page Not Found
        </h1>
        <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
          The page you requested doesn&apos;t exist. Use the links below to get back to the main
          site or request a quote.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-5">
          <Link
            href="/"
            className="bg-primary px-7 py-3.5 font-display text-sm font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Back Home
          </Link>
          <Link
            href="/quote"
            className="font-display text-sm font-semibold uppercase tracking-widest text-foreground/80 underline underline-offset-4 transition-colors hover:text-foreground"
          >
            Get A Quote
          </Link>
        </div>
      </div>
    </section>
  )
}
