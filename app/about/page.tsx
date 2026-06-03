import Link from "next/link"
import { ArrowRight, FileText, MessageSquare, ShieldCheck, Truck } from "lucide-react"
import { PageHero } from "@/components/page-hero"
import { SectionHeading } from "@/components/section-heading"
import { SERVICE_AREA } from "@/lib/site"

export const metadata = {
  title: "About",
  description:
    "MacBros Detailing is a local, family-owned mobile detailing service in Ottawa and the surrounding area.",
}

const values = [
  {
    icon: ShieldCheck,
    title: "Careful Work",
    description:
      "We take our time and pay attention to the details that make a vehicle feel clean again.",
  },
  {
    icon: MessageSquare,
    title: "Clear Communication",
    description:
      "We tell you what we can do, what we cannot guarantee, and what to expect before we start.",
  },
  {
    icon: Truck,
    title: "Mobile Convenience",
    description: `We come to you across ${SERVICE_AREA}, so you do not have to rearrange your day.`,
  },
  {
    icon: FileText,
    title: "Straightforward Service",
    description: "We review the job clearly before confirming the work.",
  },
] as const

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="Local."
        accent="Family-Owned."
        description={`A mobile detailing service in ${SERVICE_AREA}.`}
      />

      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Who We Are" title="MacBros" accent="Detailing" />
          <div className="mt-6 space-y-5 leading-relaxed text-muted-foreground">
            <p>
              MacBros Detailing is a local, family-owned mobile detailing service serving{" "}
              {SERVICE_AREA}. We focus on careful work, clear communication, and
              making the detailing process simple for our customers.
            </p>
            <p>
              We come to you, review what your vehicle needs, and follow up with the next steps -
              no rigid menus, no surprises.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-border/50 py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Why Local" title="Why Customers" accent="Choose Local" />
          <div className="mt-6 space-y-5 leading-relaxed text-muted-foreground">
            <p>
              Choosing a local, family-owned service means you talk directly to the people doing
              the work. Every vehicle is reviewed individually so the service matches what actually
              needs to be done, communication stays simple, and the same hands that gave you a
              quote are the ones detailing your car.
            </p>
            <p>
              Mobile service means we can come to your driveway, workplace, or another suitable
              location.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="What We Care About"
            title="The"
            accent="Basics, Done Right"
          />

          <div className="mt-10 grid grid-cols-1 gap-px bg-border md:grid-cols-2">
            {values.map((value) => (
              <div key={value.title} className="bg-black/40 backdrop-blur-sm p-5 md:p-7">
                <div className="flex h-11 w-11 items-center justify-center border border-border">
                  <value.icon size={20} className="text-primary" />
                </div>
                <h3 className="mt-5 font-display text-lg font-bold uppercase italic tracking-tight text-foreground">
                  {value.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {value.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <Link
              href="/quote"
              className="font-display text-sm font-semibold uppercase tracking-widest text-foreground/80 underline underline-offset-4 transition-colors hover:text-foreground"
            >
              Request a quote
              <ArrowRight size={14} className="ml-2 inline" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
