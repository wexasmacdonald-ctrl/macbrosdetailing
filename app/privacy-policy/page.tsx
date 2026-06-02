import { PageHero } from "@/components/page-hero"
import { BUSINESS_LEGAL_NAME, BUSINESS_NAME, CONTACT_EMAIL } from "@/lib/site"

export const metadata = {
  title: "Privacy Policy",
  description: "How MacBros Detailing collects and uses your information.",
}

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Privacy" accent="Policy" />

      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-3xl space-y-8 px-4 text-sm leading-relaxed text-muted-foreground sm:px-6 lg:px-8">
          <p>
            This Privacy Policy describes how {BUSINESS_NAME} collects and uses information when
            you contact us or request a quote. {BUSINESS_NAME} operates under {BUSINESS_LEGAL_NAME}.
          </p>

          <Section title="Information We Collect">
            <p>When you contact us or submit a quote request, we may collect:</p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">
              <li>Name</li>
              <li>Phone number</li>
              <li>Email address</li>
              <li>Vehicle year, make, and model</li>
              <li>Vehicle type</li>
              <li>Area or region</li>
              <li>Quote request details</li>
              <li>Optional uploaded photos</li>
              <li>Optional marketing email consent</li>
              <li>Callback request information</li>
            </ul>
          </Section>

          <Section title="How We Use Your Information">
            <p>The information you provide is used to:</p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">
              <li>Respond to quote requests</li>
              <li>Respond to callback requests</li>
              <li>Schedule service</li>
              <li>Communicate with customers</li>
              <li>Send occasional marketing emails, only if you opt in</li>
            </ul>
          </Section>

          <Section title="Marketing Emails">
            <p>
              We only send marketing emails to customers who opt in. You can request to be removed
              from marketing emails at any time by replying to one of our emails or contacting us
              at{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-foreground underline-offset-2 hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </Section>

          <Section title="Sharing Your Information">
            <p>
              We do not sell your information. We use the information you provide to operate our
              detailing service and communicate with you about your request.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              For any questions about this Privacy Policy or your information, contact us at{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-foreground underline-offset-2 hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </Section>
        </div>
      </section>
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-xl font-bold uppercase italic tracking-tight text-chrome">
        {title}
      </h2>
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  )
}
