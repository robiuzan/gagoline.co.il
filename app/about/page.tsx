import type { Metadata } from "next";
import { Check } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { TrustBar } from "@/components/marketing/TrustBar";
import { FinalCta } from "@/components/marketing/FinalCta";

export const metadata: Metadata = {
  alternates: { canonical: "/about/" },
  // Bare subject only — the root template in app/layout.tsx already appends "| גגוליין".
  // This page was the site's one doubled-brand title (backlog §2.1); don't reintroduce it.
  title: "אודות",
  description:
    "גגוליין — איטום גגות מקצועי מאז 2014 בתל אביב והמרכז. אבחון מקור הנזילה, אחריות בכתב ועבודה נקייה.",
};

const values = [
  "אמינות ושקיפות במחיר",
  "אבחון מדויק לפני כל עבודה",
  "אחריות בכתב על כל עבודה",
  "עבודה נקייה ומסודרת",
  "מענה מהיר — כולל חירום חורף",
  "צוות מקצועי משלנו, בלי קבלני משנה",
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title="אודות גגוליין"
        subtitle="איטום גגות מקצועי מאז 2014 — לגג יבש ולראש שקט."
        crumbs={[{ label: "בית", href: "/" }, { label: "אודות" }]}
      />

      <Section tone="white">
        <div className="mx-auto max-w-3xl">
          <p className="text-lg leading-relaxed text-gray-700">
            גגוליין נוסדה ב-2014 מתוך אמונה פשוטה: לאיטום גג טוב אסור שתהיה הפתעה — לא
            בחורף ולא בחשבון. במקום “לטוס” על הבעיה, אנחנו מאתרים את מקור הנזילה האמיתי,
            אוטמים בחומרים מתקדמים ומשאירים אחריכם גג יבש, עבודה נקייה ואחריות בכתב.
          </p>
          <p className="mt-4 text-gray-700">
            אנחנו מלווים בעלי בתים, ועדי בתים ועסקים בתל אביב והמרכז — עם צוות מקצועי
            משלנו, בלי קבלני משנה.
          </p>

          <h2 className="mt-10 font-heading text-xl font-bold text-primary">
            הערכים שלנו
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {values.map((v) => (
              <li key={v} className="flex items-start gap-2 text-gray-700">
                <Check className="mt-1 h-4 w-4 shrink-0 text-accent-600" aria-hidden />
                {v}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <TrustBar />
      <FinalCta />
    </>
  );
}
