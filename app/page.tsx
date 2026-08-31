import Link from "next/link";
import { manifest } from "@/lib/site-config";
import { faqs, homeAnswer } from "@/lib/content";
import { webSiteJsonLd, faqJsonLd, jsonLdScript } from "@ishub/site-kit/seo";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Hero } from "@/components/marketing/Hero";
import { TrustBar } from "@/components/marketing/TrustBar";
import { ServicesGrid } from "@/components/marketing/ServicesGrid";
import { WhyUs } from "@/components/marketing/WhyUs";
import { Process } from "@/components/marketing/Process";
import { PricingTeaser } from "@/components/marketing/PricingTeaser";
import { ServiceAreas } from "@/components/marketing/ServiceAreas";
import { Faq } from "@/components/marketing/Faq";
import { FinalCta } from "@/components/marketing/FinalCta";

/**
 * The business node now lives in app/layout.tsx (every page carries it). What is unique to the
 * home page: WebSite, which drives Google's site-name feature, and the FAQPage for the six FAQs
 * rendered below.
 *
 * The FAQPage is legitimate because Faq.tsx uses `hidden={!isOpen}` rather than conditional
 * rendering, so all six answers ship in the DOM at first paint. If that accordion is ever
 * refactored to `{isOpen && …}`, this node becomes a violation — schema must match what the user
 * can see (docs/schema-graph.md §4.2).
 *
 * Both are built from the SAME slice the component renders, so they cannot drift.
 */
const HOME_FAQS = faqs.slice(0, 6);
const homeJsonLd = [webSiteJsonLd(manifest), faqJsonLd(HOME_FAQS)];

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(homeJsonLd) }}
      />
      <Hero />
      <TrustBar />

      {/*
       * Answer block (backlog §6.2). 44 of 53 routes already opened with a question-form H2 and a
       * self-contained answer; the homepage was one of the nine that did not — and it is the page
       * most likely to be retrieved for the head term. Placed directly under the trust bar so it
       * is the first prose an extractor meets.
       */}
      <section className="bg-white pt-12 sm:pt-16">
        <Container>
          <div className="mx-auto max-w-3xl">
            <h2 className="font-heading text-xl font-bold text-primary">
              {homeAnswer.q}
            </h2>
            <p className="mt-3 text-lg leading-relaxed text-gray-700">{homeAnswer.a}</p>
          </div>
        </Container>
      </section>

      <ServicesGrid />
      <WhyUs />
      <Process />
      <PricingTeaser />
      <ServiceAreas />

      <Section id="faq" tone="white">
        <SectionHeading eyebrow="שאלות נפוצות" title="כל מה שרציתם לדעת על איטום גגות" />
        <Faq items={HOME_FAQS} />
        <p className="mt-6 text-center text-sm text-gray-500">
          יש לכם שאלה נוספת?{" "}
          <Link href="/faq/" className="font-semibold text-secondary-600 hover:underline">
            לכל השאלות והתשובות
          </Link>
        </p>
      </Section>

      <FinalCta />
    </>
  );
}
