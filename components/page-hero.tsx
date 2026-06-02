export function PageHero({
  eyebrow,
  title,
  accent,
  description,
}: {
  eyebrow: string
  title: string
  accent: string
  description?: string
}) {
  return (
    <section className="relative overflow-hidden border-b border-border/50">
      <div
        className="absolute -top-12 -right-40 h-px w-[600px] rotate-[18deg] bg-primary opacity-40"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="h-px w-10 bg-primary" />
          <span className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            {eyebrow}
          </span>
        </div>

        <h1 className="mt-5 font-display text-4xl font-bold uppercase italic leading-[1] tracking-tight text-balance md:text-5xl lg:text-6xl">
          <span className="text-chrome">{title}</span>{" "}
          <span className="text-primary">{accent}</span>
        </h1>

        {description && (
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground text-pretty md:text-lg">
            {description}
          </p>
        )}
      </div>
    </section>
  )
}
