export function SectionHeading({
  eyebrow,
  title,
  accent,
  description,
  align = "left",
}: {
  eyebrow?: string
  title: string
  accent?: string
  description?: string
  align?: "left" | "center"
}) {
  const alignClasses = align === "center" ? "items-center text-center mx-auto" : "items-start text-left"
  return (
    <div className={`flex flex-col ${alignClasses}`}>
      {eyebrow && (
        <div className="flex items-center gap-3">
          <span className="h-px w-10 bg-primary" />
          <span className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            {eyebrow}
          </span>
        </div>
      )}
      <h2 className="mt-4 font-display text-3xl font-bold uppercase italic leading-[1] tracking-tight text-balance md:text-4xl lg:text-5xl">
        <span className="text-chrome">{title}</span>
        {accent && (
          <>
            {" "}
            <span className="text-primary">{accent}</span>
          </>
        )}
      </h2>
      {description && (
        <p className={`mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground text-pretty md:text-lg ${align === "center" ? "mx-auto" : ""}`}>
          {description}
        </p>
      )}
    </div>
  )
}
