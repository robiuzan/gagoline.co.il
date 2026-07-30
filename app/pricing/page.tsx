import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { PricingTeaser } from "@/components/marketing/PricingTeaser";

export const metadata: Metadata = {
  alternates: { canonical: "/pricing/" },
  title: "מחירון איטום גגות",
  description:
    "מחירון איטום גגות להתרשמות: יריעות ביטומניות, זיפות, סיוד ואיתור נזילות. מחיר סופי לפי ביקור ואבחון — שקוף ובלי הפתעות.",
};

export default function PricingPage() {
  return (
    <>
      <PageHeader
        title="מחירון איטום גגות"
        subtitle="טווחי מחיר להתרשמות. המחיר הסופי נקבע אחרי ביקור ואבחון בשטח — תמיד שקוף ומפורט מראש."
        crumbs={[{ label: "בית", href: "/" }, { label: "מחירון" }]}
      />
      <PricingTeaser />
      <Section tone="muted">
        <p className="mx-auto max-w-2xl text-center text-sm text-gray-500">
          🔶 הטווחים מובאים להתרשמות בלבד ועשויים להשתנות לפי סוג הגג, שטחו, מצבו והנגישות
          אליו. המחיר המחייב יינתן רק לאחר ביקור ואבחון.
        </p>
      </Section>
    </>
  );
}
