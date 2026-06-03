import Link from "next/link"
import { ArrowRight, Mail } from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"
import { BUSINESS_LEGAL_NAME, BUSINESS_NAME, CONTACT_EMAIL, SERVICE_AREA } from "@/lib/site"

export function SiteFooter() {
  return (
    <footer className="relative border-t border-border/50 bg-black/90 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md">
            <Link href="/" aria-label={`${BUSINESS_NAME} home`}>
              <BrandLogo
                width={390}
                height={108}
                className="max-w-[320px] object-contain sm:max-w-[390px]"
              />
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Mobile detailing in {SERVICE_AREA}.
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-3 inline-flex items-center gap-2 text-sm text-foreground/90 transition-colors hover:text-primary"
            >
              <Mail className="h-4 w-4 text-primary" />
              {CONTACT_EMAIL}
            </a>
          </div>

          <div className="max-w-sm border border-border/50 bg-black/75 p-5">
            <h3 className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-foreground">
              Need A Quote?
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Send your vehicle details and photos and we&apos;ll reply with a quote.
            </p>
            <Link
              href="/quote"
              className="mt-4 inline-flex items-center gap-2 font-display text-xs font-semibold uppercase tracking-[0.2em] text-foreground transition-colors hover:text-primary"
            >
              Get My Quote
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-border/50">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p className="text-xs text-muted-foreground">
            Copyright {new Date().getFullYear()} {BUSINESS_NAME}.{" "}
            <span className="text-muted-foreground/80">
              {BUSINESS_NAME} operates under {BUSINESS_LEGAL_NAME}.
            </span>
          </p>
          <Link
            href="/privacy-policy"
            className="text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  )
}
