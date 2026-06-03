import Link from "next/link"
import { ArrowRight, Check, Droplets } from "lucide-react"
import { PageHero } from "@/components/page-hero"
import { SERVICE_AREA } from "@/lib/site"

export const metadata = {
  title: "Services",
  description:
    "Mobile detailing packages for cars, SUVs, trucks, vans, boats, and trailers in Ottawa and the surrounding area.",
}

type Service = {
  id: string
  number: string
  title: string
  description: string
  features?: string[]
  note?: string
  fullWidth?: boolean
}

const mainServices: Service[] = [
  {
    id: "interior-standard",
    number: "01",
    title: "Interior Standard Package",
    description:
      "Quick interior refresh. We vacuum, wipe down the main surfaces, and get your cabin clean.",
    features: [
      "Interior vacuuming",
      "Dashboard, console, and door panels wiped",
      "Cupholders and touch points cleaned",
      "Seats and floor mats cleaned",
      "Interior windows cleaned",
      "Trunk vacuum if requested",
    ],
    note: "This is for basic upkeep, not heavy restoration.",
  },
  {
    id: "interior-premium",
    number: "02",
    title: "Interior Premium / Deep Clean Package",
    description:
      "A full interior reset aimed at getting the vehicle as close as possible to clean used-dealer condition.",
    features: [
      "Full interior vacuuming",
      "Detailed surface cleaning",
      "Seats cleaned thoroughly",
      "Carpets and floor mats cleaned",
      "Door panels and common touch points cleaned",
      "Dashboard, console, and trim cleaned",
      "Interior windows cleaned",
      "Trunk cleaned if requested",
    ],
    note: "We cannot guarantee removal of stains, salt, embedded debris, scratches, or physical damage.",
  },
  {
    id: "exterior",
    number: "03",
    title: "Exterior Package",
    description: "A clean exterior refresh for the outside of the vehicle.",
    features: ["Hand wash", "Exterior windows", "Wax / sealant", "Visible tire shine"],
    note: "Tire shine means cleaning and dressing the visible tire areas only. Wheels and tires are not removed.",
  },
  {
    id: "headlights",
    number: "04",
    title: "Headlight Rejuvenation Add-On",
    description: "Headlight rejuvenation / de-yellowing to improve clarity and appearance.",
    note: "Results depend on the condition and age of the headlight.",
  },
]

const otherRequests: Service = {
  id: "custom",
  number: "05",
  title: "Other Detailing Requests",
  description:
    "Customers can request other detailing work and MacBros Detailing will quote it case-by-case.",
  features: [
    "Cars",
    "SUVs",
    "Pickup trucks",
    "Work trucks",
    "Vans",
    "Boats",
    "Trailers",
    "Other vehicles by request",
  ],
  fullWidth: true,
}

function ServiceCard({ service }: { service: Service }) {
  return (
    <article
      id={service.id}
      className={`scroll-mt-24 border border-border/50 bg-black/40 p-5 backdrop-blur-sm transition-colors hover:border-primary/50 md:p-7 ${
        service.fullWidth ? "lg:col-span-2" : ""
      }`}
    >
      <div className="mb-4 flex items-center gap-3">
        <span className="font-mono text-sm tracking-widest text-primary">/ {service.number}</span>
        <span className="h-px max-w-[80px] flex-1 bg-border" />
      </div>

      <h2 className="font-display text-2xl font-bold uppercase italic leading-tight tracking-tight text-chrome md:text-3xl">
        {service.title}
      </h2>

      <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
        {service.description}
      </p>

      {service.features && service.features.length > 0 && (
        <ul className="mt-5 grid gap-2 sm:grid-cols-2">
          {service.features.map((feature) => (
            <li key={feature} className="flex items-start gap-3 text-sm">
              <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center border border-primary/30 bg-primary/10">
                <Check size={12} className="text-primary" />
              </span>
              <span className="text-foreground/90">{feature}</span>
            </li>
          ))}
        </ul>
      )}

      {service.note && (
        <p className="mt-5 border-l-2 border-primary/60 bg-black/30 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
          {service.note}
        </p>
      )}
    </article>
  )
}

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Detailing"
        accent="Packages"
        description={`Mobile detailing for cars, SUVs, trucks, vans, boats, and trailers across ${SERVICE_AREA}.`}
      />

      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-3 lg:gap-10">
            <div className="lg:col-span-2">
              <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
                Each vehicle is reviewed individually so the work matches what actually needs to be
                done. Below are the packages we offer most often. If your job is different, send us
                a quote request and we&apos;ll review it.
              </p>
            </div>
            <div className="flex items-start gap-3 border border-border/50 bg-black/40 p-5 backdrop-blur-sm">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center border border-border">
                <Droplets className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Access to water and electricity may be needed depending on the job.
              </p>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-2">
            {mainServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
            <ServiceCard service={otherRequests} />
          </div>

          <div className="mt-14 flex justify-center">
            <Link
              href="/quote"
              className="group inline-flex items-center gap-2 bg-primary px-7 py-3.5 font-display text-sm font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Get My Quote
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
