import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";
import { siteConfig, telHref, whatsappHref } from "@/lib/site-config";
import { thankYouContent } from "@/lib/content";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";

/**
 * The post-submission destination (backlog §8.6, §13.6).
 *
 * Before this route existed, a successful lead was an inline state swap inside `LeadForm`: no URL
 * changed, so there was no page view to count, no Google Ads conversion target, and no place to put
 * a next step. `LeadForm` now performs a FULL navigation here on a confirmed send — not a client-side
 * transition — because a real document load fires GTM's All Pages trigger without the container
 * needing a History Change trigger nobody in this repo can verify. See the note in LeadForm.tsx.
 *
 * `noindex, follow`:
 *   - the page is thin by design, and
 *   - if it were indexed, organic arrivals would inflate the conversion count with people who never
 *     filled anything in — which is the failure mode that makes a thank-you URL worse than useless.
 *
 * It is therefore also linked from nowhere. That is deliberate, and `scripts/link-graph-check.mjs`
 * exempts it via NEVER_LINKED — a different category from the temporarily-parked routes, and kept
 * separate on purpose so the exemption is never mistaken for one that should expire.
 */
export const metadata: Metadata = {
  alternates: { canonical: "/thank-you/" },
  robots: { index: false, follow: true },
  title: "תודה על הפנייה",
  description:
    "קיבלנו את הפנייה שלכם לגגוליין. נחזור אליכם לתיאום ביקור אבחון והצעת מחיר.",
};

export default function ThankYouPage() {
  return (
    <>
      <PageHeader
        title="קיבלנו את הפנייה"
        subtitle={thankYouContent.intro}
        crumbs={[{ label: "בית", href: "/" }, { label: "תודה" }]}
      />

      <Section tone="white">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-heading text-2xl font-bold text-primary">
            {thankYouContent.stepsHeading}
          </h2>
          <ol className="mt-6 space-y-5">
            {thankYouContent.steps.map((step, i) => (
              <li key={step.title} className="flex gap-4">
                <span
                  aria-hidden
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary font-heading font-bold text-primary-foreground"
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-heading text-lg font-bold text-primary">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-gray-700">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <p className="mt-8 text-gray-700">
            {thankYouContent.meanwhile}{" "}
            <Link href="/gallery/" className="font-semibold text-primary underline">
              גלריית עבודות
            </Link>{" "}
            <span className="text-gray-400">·</span>{" "}
            <Link href="/blog/" className="font-semibold text-primary underline">
              מדריכים לגג
            </Link>
          </p>
        </div>
      </Section>

      <Section tone="muted">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 text-center">
          <div>
            <h2 className="font-heading text-2xl font-bold text-primary">
              {thankYouContent.urgentHeading}
            </h2>
            <p className="mt-2 text-gray-700">{thankYouContent.urgentBody}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button href={telHref} data-cta="thankyou-call" variant="primary" size="lg">
              <Phone className="h-5 w-5" aria-hidden />
              חייגו עכשיו: <span dir="ltr">{siteConfig.phone}</span>
            </Button>
            <Button
              href={whatsappHref("היי, השארתי פרטים באתר")}
              data-cta="thankyou-whatsapp"
              variant="whatsapp"
              size="lg"
            >
              <MessageCircle className="h-5 w-5" aria-hidden />
              שלחו וואטסאפ
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
