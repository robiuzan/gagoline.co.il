import Link from "next/link";
import { manifest } from "@/lib/site-config";
import { faqs } from "@/lib/content";
import { localBusinessJsonLd, jsonLdScript } from "@ishub/site-kit/seo";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Hero } from "@/components/marketing/Hero";
import { TrustBar } from "@/components/marketing/TrustBar";
import { ServicesGrid } from "@/components/marketing/ServicesGrid";
import { WhyUs } from "@/components/marketing/WhyUs";
import { Process } from "@/components/marketing/Process";
import { Reviews } from "@/components/marketing/Reviews";
import { PricingTeaser } from "@/components/marketing/PricingTeaser";
import { ServiceAreas } from "@/components/marketing/ServiceAreas";
import { Faq } from "@/components/marketing/Faq";
import { FinalCta } from "@/components/marketing/FinalCta";

// Site-wide LocalBusiness JSON-LD — now from the shared @ishub/site-kit builder (manifest-driven).
const jsonLd = localBusinessJsonLd(manifest);

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      <Hero />
      <TrustBar />
      <ServicesGrid />
      <WhyUs />
      <Process />
      <Reviews />
      <PricingTeaser />
      <ServiceAreas />

      <Section id="faq" tone="white">
        <SectionHeading eyebrow="שאלות נפוצות" title="כל מה שרציתם לדעת על איטום גגות" />
        <Faq items={faqs.slice(0, 6)} />
        <p className="mt-6 text-center text-sm text-gray-500">
          יש לכם שאלה נוספת?{" "}
          <Link href="/faq" className="font-semibold text-secondary hover:underline">
            לכל השאלות והתשובות
          </Link>
        </p>
      </Section>

      <FinalCta />
    </>
  );
}
