import type { Metadata } from "next";
import { faqs } from "@/lib/content";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { Faq } from "@/components/marketing/Faq";
import { FinalCta } from "@/components/marketing/FinalCta";

export const metadata: Metadata = {
  title: "שאלות ותשובות",
  description:
    "שאלות נפוצות על איטום גגות: כמה זה עולה, כמה זה מחזיק, מתי לאטום, ההבדל בין השיטות ועוד.",
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <PageHeader
        title="שאלות ותשובות"
        subtitle="כל מה שרציתם לדעת על איטום גגות — ואם נשארה שאלה, פשוט התקשרו."
        crumbs={[{ label: "בית", href: "/" }, { label: "שאלות ותשובות" }]}
      />
      <Section tone="white">
        <Faq items={faqs} />
      </Section>
      <FinalCta />
    </>
  );
}
