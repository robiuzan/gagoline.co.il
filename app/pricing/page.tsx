import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Check } from "lucide-react";
import { faqJsonLd, jsonLdScript } from "@ishub/site-kit/seo";
import { pricingContent } from "@/lib/content";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { PricingTeaser } from "@/components/marketing/PricingTeaser";
import { FinalCta } from "@/components/marketing/FinalCta";

export const metadata: Metadata = {
  alternates: { canonical: "/pricing/" },
  title: "מחירון איטום גגות",
  description:
    "מה קובע את מחיר איטום הגג, מה חייבת לכלול הצעת מחיר כתובה, ואיך משווים בין הצעות. טווחי מחיר להתרשמות — המחיר הסופי לפי ביקור ואבחון.",
};

/**
 * NO Offer / PriceSpecification JSON-LD on this page, deliberately.
 *
 * docs/schema-graph.md lists Offer as a target, but all four ranges in `priceRows` are unconfirmed
 * (docs/business-facts.md §D tags every one 🔶). Emitting machine-readable prices makes an
 * unverified number eligible for display in search results, which turns a copy problem into a
 * published commitment. FAQPage is fine — those answers are ours and contain no amounts.
 *
 * Ship Offer the day §D is answered, not before.
 */
const jsonLd = faqJsonLd(pricingContent.faqs);

export default function PricingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      <PageHeader
        title="מחירון איטום גגות"
        subtitle="טווחי מחיר להתרשמות. המחיר הסופי נקבע אחרי ביקור ואבחון בשטח — תמיד שקוף ומפורט מראש."
        crumbs={[{ label: "בית", href: "/" }, { label: "מחירון" }]}
      />

      <Section tone="white">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-heading text-xl font-bold text-primary">
            {pricingContent.answerQ}
          </h2>
          <p className="mt-3 text-lg leading-relaxed text-gray-700">
            {pricingContent.answerA}
          </p>
          {pricingContent.intro.map((p) => (
            <p key={p} className="mt-4 text-gray-700">
              {p}
            </p>
          ))}
        </div>
      </Section>

      <PricingTeaser />

      <Section tone="white">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-heading text-xl font-bold text-primary">
            {pricingContent.factorsTitle}
          </h2>
          <dl className="mt-5 space-y-4">
            {pricingContent.factors.map((f) => (
              <div key={f.title}>
                <dt className="font-semibold text-primary">{f.title}</dt>
                <dd className="mt-1 text-gray-700">{f.body}</dd>
              </div>
            ))}
          </dl>

          <h2 className="mt-12 font-heading text-xl font-bold text-primary">
            {pricingContent.quoteTitle}
          </h2>
          <p className="mt-3 text-gray-700">{pricingContent.quoteIntro}</p>
          <ul className="mt-4 space-y-2">
            {pricingContent.quoteChecklist.map((c) => (
              <li key={c} className="flex items-start gap-2 text-gray-700">
                <Check className="mt-1 h-4 w-4 shrink-0 text-green-600" aria-hidden />
                {c}
              </li>
            ))}
          </ul>

          <div className="mt-12 rounded-2xl border border-accent-200 bg-accent-50 p-6">
            <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-primary">
              <AlertTriangle className="h-5 w-5 shrink-0 text-accent-700" aria-hidden />
              {pricingContent.warningTitle}
            </h2>
            <ul className="mt-4 space-y-2">
              {pricingContent.warnings.map((w) => (
                <li key={w} className="flex items-start gap-2 text-gray-700">
                  <span
                    aria-hidden
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-700"
                  />
                  {w}
                </li>
              ))}
            </ul>
          </div>

          <h2 className="mt-12 font-heading text-xl font-bold text-primary">
            שאלות נפוצות על מחירי איטום
          </h2>
          <dl className="mt-4 space-y-5">
            {pricingContent.faqs.map((f) => (
              <div key={f.q}>
                <dt className="font-semibold text-primary">{f.q}</dt>
                <dd className="mt-1 text-gray-700">{f.a}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-10 text-sm text-gray-500">
            הטווחים מובאים להתרשמות בלבד ועשויים להשתנות לפי סוג הגג, שטחו, מצבו והנגישות
            אליו. המחיר המחייב יינתן רק לאחר ביקור ואבחון. לפירוט השיטות ראו{" "}
            <Link
              href="/services/"
              className="font-medium text-secondary-600 underline underline-offset-2"
            >
              את השירותים שלנו
            </Link>
            .
          </p>
        </div>
      </Section>

      <FinalCta />
    </>
  );
}
