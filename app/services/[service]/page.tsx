import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Check, ChevronLeft, MessageCircle, Phone, X } from "lucide-react";
import { serviceJsonLd, faqJsonLd, jsonLdScript } from "@ishub/site-kit/seo";
import {
  services,
  manifest,
  siteConfig,
  telHref,
  whatsappHref,
  cities,
  type ServiceSlug,
} from "@/lib/site-config";
import { serviceCards, processSteps } from "@/lib/content";
import { serviceDepth } from "@/lib/service-depth";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Prose } from "@/components/ui/Prose";
import { FinalCta } from "@/components/marketing/FinalCta";

export function generateStaticParams(): { service: ServiceSlug }[] {
  return services.map((s) => ({ service: s.slug }));
}

export function generateMetadata({ params }: { params: { service: string } }): Metadata {
  const card = serviceCards.find((c) => c.slug === params.service);
  if (!card) return {};
  return {
    alternates: { canonical: `/services/${card.slug}/` },
    title: `${card.name} בתל אביב והמרכז`,
    description: card.description,
  };
}

/**
 * Four cities linked from each service page, offset by the service's position in the array so the
 * 8 pages spread across the 23 cities instead of all pointing at the same four. Deterministic, so
 * the build stays reproducible.
 *
 * This is the service↔city edge — previously zero in both directions (backlog §9.3). It is also
 * the only honest way to express the `{service} ב{city}` intent WITHOUT building the 184-cell
 * matrix that docs/keyword-map.md §6 forbids.
 */
function citiesForService(slug: ServiceSlug) {
  const idx = services.findIndex((s) => s.slug === slug);
  const start = (Math.max(idx, 0) * 4) % cities.length;
  return Array.from({ length: 4 }, (_, i) => cities[(start + i) % cities.length]!);
}

export default function ServicePage({ params }: { params: { service: string } }) {
  const card = serviceCards.find((c) => c.slug === params.service);
  if (!card) notFound();

  const depth = serviceDepth[card.slug];
  const others = serviceCards.filter((c) => c.slug !== card.slug).slice(0, 4);
  const nearbyCities = citiesForService(card.slug);

  // Service node binds this page to the RoofingContractor node; FAQPage covers the per-service
  // questions rendered below (all visible, so the markup matches what the user sees).
  // PageHeader emits the BreadcrumbList.
  const jsonLd = [
    serviceJsonLd(manifest, {
      name: card.name,
      description: depth.answerA,
      slug: card.slug,
    }),
    faqJsonLd(depth.faqs),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      <PageHeader
        title={card.name}
        subtitle={card.tagline}
        crumbs={[
          { label: "בית", href: "/" },
          { label: "השירותים שלנו", href: "/services/" },
          { label: card.name },
        ]}
      />

      <Section tone="white">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {/* Answer block — question-form H2 + a self-contained 40–60 word answer. */}
            <h2 className="font-heading text-xl font-bold text-primary">
              {depth.answerQ}
            </h2>
            <p className="mt-3 text-lg leading-relaxed text-gray-700">{depth.answerA}</p>

            {depth.intro.map((p, i) => (
              <Prose key={i} parts={p} className="mt-4 text-gray-700" />
            ))}

            <h2 className="mt-10 font-heading text-xl font-bold text-primary">
              לאיזה גג זה מתאים
            </h2>
            <p className="mt-3 text-gray-700">{depth.substrates}</p>

            <h2 className="mt-10 font-heading text-xl font-bold text-primary">
              במה עובדים ואיך מכינים את המשטח
            </h2>
            <p className="mt-3 text-gray-700">{depth.materials}</p>
            <p className="mt-3 text-gray-700">{depth.prep}</p>

            {/* PER SERVICE. Was a hardcoded array shared by all 8 pages, so ceiling-damp advice
                rendered on the basement-sealing and roof-whitening pages (backlog §3.3). */}
            <h2 className="mt-10 font-heading text-xl font-bold text-primary">
              מתי כדאי לפנות אלינו?
            </h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {depth.whenToCall.map((t) => (
                <li key={t} className="flex items-start gap-2 text-gray-700">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-accent-700" aria-hidden />
                  {t}
                </li>
              ))}
            </ul>

            <h2 className="mt-10 font-heading text-xl font-bold text-primary">
              מה כלול ומה לא
            </h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              <ul className="space-y-2">
                {depth.included.map((t) => (
                  <li key={t} className="flex items-start gap-2 text-gray-700">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-green-600" aria-hidden />
                    {t}
                  </li>
                ))}
              </ul>
              <ul className="space-y-2">
                {depth.excluded.map((t) => (
                  <li key={t} className="flex items-start gap-2 text-gray-600">
                    <X className="mt-1 h-4 w-4 shrink-0 text-gray-400" aria-hidden />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <h2 className="mt-10 font-heading text-xl font-bold text-primary">
              כמה זמן זה לוקח ומתי אפשר לבצע
            </h2>
            <p className="mt-3 text-gray-700">{depth.duration}</p>
            <p className="mt-3 text-gray-700">{depth.weather}</p>

            <h2 className="mt-10 font-heading text-xl font-bold text-primary">
              מה גורם לאיטום להיכשל
            </h2>
            <dl className="mt-4 space-y-4">
              {depth.failureModes.map((f) => (
                <div key={f.title}>
                  <dt className="font-semibold text-primary">{f.title}</dt>
                  <dd className="mt-1 text-gray-700">{f.body}</dd>
                </div>
              ))}
            </dl>

            {/* The counter-intuitive section: when this service is the wrong answer. */}
            <div className="mt-10 rounded-2xl border border-accent-200 bg-accent-50 p-6">
              <h2 className="font-heading text-lg font-bold text-primary">
                מתי זה לא הפתרון
              </h2>
              <p className="mt-2 text-gray-700">{depth.notFor}</p>
            </div>

            <h2 className="mt-10 font-heading text-xl font-bold text-primary">
              איך אנחנו עובדים
            </h2>
            <ol className="mt-4 space-y-3">
              {processSteps.map((step, i) => (
                <li key={step.title} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="text-gray-700">
                    <strong className="text-primary">{step.title}.</strong> {step.body}
                  </span>
                </li>
              ))}
            </ol>

            <h2 className="mt-10 font-heading text-xl font-bold text-primary">
              שאלות נפוצות על {card.name}
            </h2>
            <dl className="mt-4 space-y-5">
              {depth.faqs.map((f) => (
                <div key={f.q}>
                  <dt className="font-semibold text-primary">{f.q}</dt>
                  <dd className="mt-1 text-gray-700">{f.a}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Sticky CTA card */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-gray-100 bg-gray-50 p-6 shadow-sm">
              <p className="font-heading text-lg font-bold text-primary">
                רוצים הצעת מחיר ל{card.name}?
              </p>
              <p className="mt-1 text-sm text-gray-600">
                ביקור, אבחון והצעה שקופה — ללא התחייבות.
              </p>
              <div className="mt-5 flex flex-col gap-3">
                <Button href={telHref} data-cta="service-call" variant="accent" size="lg">
                  <Phone className="h-5 w-5" aria-hidden />
                  <span dir="ltr">{siteConfig.phone}</span>
                </Button>
                <Button
                  href={whatsappHref(`היי, אני מעוניין/ת בהצעת מחיר ל${card.name}`)}
                  data-cta="service-whatsapp"
                  variant="whatsapp"
                  size="lg"
                >
                  <MessageCircle className="h-5 w-5" aria-hidden />
                  וואטסאפ
                </Button>
              </div>
            </div>
          </aside>
        </div>

        {/* Service → city edge. */}
        <div className="mt-14 border-t border-gray-100 pt-10">
          <h2 className="font-heading text-xl font-bold text-primary">
            {card.name} בכל אזור המרכז
          </h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {nearbyCities.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/areas/${c.slug}/`}
                  className="flex items-center justify-between gap-2 rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:border-secondary hover:text-secondary-600"
                >
                  {card.name} ב{c.name}
                  <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-gray-600">
            <Link
              href="/areas/"
              className="font-medium text-secondary-600 underline underline-offset-2"
            >
              לכל אזורי השירות
            </Link>
          </p>
        </div>

        {/* Related services */}
        <div className="mt-14 border-t border-gray-100 pt-10">
          <h2 className="font-heading text-xl font-bold text-primary">שירותים נוספים</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {others.map((o) => (
              <li key={o.slug}>
                <Link
                  href={`/services/${o.slug}/`}
                  className="flex items-center justify-between gap-2 rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:border-secondary hover:text-secondary-600"
                >
                  {o.name}
                  <ChevronLeft className="h-4 w-4" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <FinalCta />
    </>
  );
}
