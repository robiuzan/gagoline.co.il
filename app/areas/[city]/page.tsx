import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, MapPin, MessageCircle, Phone } from "lucide-react";
import { serviceJsonLd, faqJsonLd, jsonLdScript } from "@ishub/site-kit/seo";
import {
  cities,
  manifest,
  siteConfig,
  telHref,
  whatsappHref,
  type CitySlug,
} from "@/lib/site-config";
import { serviceCards } from "@/lib/content";
import { cityDepth } from "@/lib/city-depth";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Prose } from "@/components/ui/Prose";
import { FinalCta } from "@/components/marketing/FinalCta";

export function generateStaticParams(): { city: CitySlug }[] {
  return cities.map((c) => ({ city: c.slug }));
}

/**
 * The description is built from the city's own first sentence, so 23 pages get 23 descriptions
 * instead of one template with a name swapped in. Capped rather than truncated mid-word.
 */
function metaDescription(citySlug: CitySlug): string {
  const first = cityDepth[citySlug].answerA.split(". ")[0] ?? "";
  const tail = " איטום גגות מקצועי, אבחון מקור הנזילה ואחריות בכתב.";
  return `${first.replace(/[.,]$/, "")}.${tail}`;
}

export function generateMetadata({ params }: { params: { city: string } }): Metadata {
  const city = cities.find((c) => c.slug === params.city);
  if (!city) return {};
  return {
    alternates: { canonical: `/areas/${city.slug}/` },
    title: `איטום גגות ב${city.name} | אחריות בכתב + מחיר שקוף`,
    description: metaDescription(city.slug),
  };
}

export default function AreaPage({ params }: { params: { city: string } }) {
  const city = cities.find((c) => c.slug === params.city);
  if (!city) notFound();

  const depth = cityDepth[city.slug];
  const priority = depth.priority
    .map((p) => ({ ...p, card: serviceCards.find((c) => c.slug === p.slug) }))
    .filter((p): p is typeof p & { card: NonNullable<(typeof p)["card"]> } =>
      Boolean(p.card),
    );
  const prioritySlugs = new Set(depth.priority.map((p) => p.slug));
  const otherServices = serviceCards.filter((c) => !prioritySlugs.has(c.slug));
  const nearby = depth.nearby
    .map((slug) => cities.find((c) => c.slug === slug))
    .filter((c): c is (typeof cities)[number] => Boolean(c));

  // Service + areaServed:City. This is the only machine-readable statement that the business
  // serves THIS city — everything else on the page is prose. serviceType stays the category
  // ("איטום גגות") while name carries the city, so 23 pages do not invent 23 categories.
  //
  // Deliberately NOT a business node per city: one operation serving 23 places is the claim, and
  // 23 RoofingContractor nodes would imply 23 premises that do not exist (docs/schema-graph.md §5).
  //
  // FAQPage is legitimate here because both answers render visibly below — see §4.2.
  const jsonLd = [
    serviceJsonLd(manifest, {
      name: `איטום גגות ב${city.name}`,
      description: depth.answerA,
      serviceType: "איטום גגות",
      url: `${manifest.url}/areas/${city.slug}/`,
      areaServed: { "@type": "City", name: city.name },
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
        title={`איטום גגות ב${city.name}`}
        subtitle={`אחריות בכתב, מחיר שקוף ואבחון מדויק של מקור הנזילה — שירות איטום מקצועי ב${city.name} והסביבה.`}
        crumbs={[
          { label: "בית", href: "/" },
          { label: "אזורי שירות", href: "/areas/" },
          { label: city.name },
        ]}
      />

      <Section tone="white">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {/* Answer block — question-form H2 + a self-contained answer about THIS city. */}
            <h2 className="font-heading text-xl font-bold text-primary">
              {depth.answerQ}
            </h2>
            <p className="mt-3 text-lg leading-relaxed text-gray-700">{depth.answerA}</p>

            <h2 className="mt-10 font-heading text-xl font-bold text-primary">
              הגגות ש{city.name} בנויה מהם
            </h2>
            {depth.stock.map((p, i) => (
              <Prose key={i} parts={p} className="mt-4 text-gray-700" />
            ))}

            <h2 className="mt-10 font-heading text-xl font-bold text-primary">
              תנאי הסביבה ב{city.name}
            </h2>
            <p className="mt-3 text-gray-700">{depth.exposure}</p>

            {/* Priority services carry a city-specific REASON. This is the service↔city edge with
                something to say, rather than 8 identical tiles repeated on 23 pages. */}
            <h2 className="mt-10 font-heading text-xl font-bold text-primary">
              השירותים המבוקשים ביותר ב{city.name}
            </h2>
            <ul className="mt-5 space-y-3">
              {priority.map(({ card, why }) => (
                <li key={card.slug}>
                  <Link
                    href={`/services/${card.slug}/`}
                    className="group flex items-start justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-4 hover:border-secondary"
                  >
                    <span>
                      <span className="font-semibold text-primary group-hover:text-secondary-600">
                        {card.name} ב{city.name}
                      </span>
                      <span className="mt-1 block text-sm text-gray-600">{why}</span>
                    </span>
                    <ChevronLeft
                      className="mt-1 h-4 w-4 shrink-0 text-gray-400 group-hover:text-secondary"
                      aria-hidden
                    />
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="mt-8 font-heading text-base font-bold text-primary">
              שירותים נוספים שאנחנו מבצעים ב{city.name}
            </h3>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {otherServices.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/services/${s.slug}/`}
                    className="flex items-center justify-between gap-2 rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:border-secondary hover:text-secondary-600"
                  >
                    {s.name}
                    <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>

            <h2 className="mt-10 font-heading text-xl font-bold text-primary">
              שאלות נפוצות — איטום גגות ב{city.name}
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

          <aside className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-gray-100 bg-gray-50 p-6 shadow-sm">
              <p className="font-heading text-lg font-bold text-primary">
                יש נזילה ב{city.name}?
              </p>
              <p className="mt-1 text-sm text-gray-600">
                ביקור, אבחון מקור הנזילה והצעה שקופה — ללא התחייבות.
              </p>
              <div className="mt-5 flex flex-col gap-3">
                <Button href={telHref} data-cta="area-call" variant="accent" size="lg">
                  <Phone className="h-5 w-5" aria-hidden />
                  <span dir="ltr">{siteConfig.phone}</span>
                </Button>
                <Button
                  href={whatsappHref(`היי, יש לי נזילה ב${city.name} ואשמח להצעת מחיר`)}
                  data-cta="area-whatsapp"
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

        {/* City → city edge. Before this, city pages linked to no other city. */}
        <div className="mt-14 border-t border-gray-100 pt-10">
          <h2 className="font-heading text-xl font-bold text-primary">
            אנחנו עובדים גם בסביבת {city.name}
          </h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {nearby.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/areas/${c.slug}/`}
                  className="flex items-center justify-between gap-2 rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:border-secondary hover:text-secondary-600"
                >
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
                    איטום גגות ב{c.name}
                  </span>
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
      </Section>

      <FinalCta />
    </>
  );
}
