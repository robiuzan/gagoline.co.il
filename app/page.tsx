import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { faqs } from "@/lib/content";
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

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "RoofingContractor",
  name: siteConfig.name,
  description: siteConfig.tagline,
  url: siteConfig.domain,
  telephone: siteConfig.phoneE164,
  foundingDate: String(siteConfig.founded),
  areaServed: "תל אביב והמרכז",
  address: { "@type": "PostalAddress", addressRegion: "מרכז", addressCountry: "IL" },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
