import type { Metadata } from "next";
import { faqJsonLd, jsonLdScript } from "@ishub/site-kit/seo";
import { faqs } from "@/lib/content";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { Faq } from "@/components/marketing/Faq";
import { FinalCta } from "@/components/marketing/FinalCta";

export const metadata: Metadata = {
  alternates: { canonical: "/faq/" },
  title: "שאלות ותשובות",
  description:
    "שאלות נפוצות על איטום גגות: כמה זה עולה, כמה זה מחזיק, מתי לאטום, ההבדל בין השיטות ועוד.",
};

// Was hand-assembled here (backlog §4.6). The kit builder keeps the shape consistent with the
// rest of the fleet, and jsonLdScript escapes "<" — raw JSON.stringify did not, so an answer
// containing markup could have broken out of the script tag.
const jsonLd = faqJsonLd(faqs);

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
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
