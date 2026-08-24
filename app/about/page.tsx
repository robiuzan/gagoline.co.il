import type { Metadata } from "next";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { aboutContent } from "@/lib/content";
import { TrustBar } from "@/components/marketing/TrustBar";
import { FinalCta } from "@/components/marketing/FinalCta";

export const metadata: Metadata = {
  alternates: { canonical: "/about/" },
  // Bare subject only — the root template in app/layout.tsx already appends "| גגוליין".
  // This page was the site's one doubled-brand title (backlog §2.1); don't reintroduce it.
  title: "אודות",
  description:
    "גגוליין — איטום גגות מקצועי מאז 2014 בתל אביב והמרכז. למה אנחנו מתחילים באבחון מקור הנזילה, ואיך זה משנה את העבודה.",
};

/**
 * These six lines are the owner's own wording from brief.md. Two of them — the winter-emergency
 * line and "בלי קבלני משנה" — are still tagged 🔶 in brief.md:52 and docs/business-facts.md §B/§E.
 * They are left exactly as written and are NOT expanded on anywhere else on the page. Do not build
 * further copy on top of them until the owner confirms; see the note on `aboutContent`.
 */
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
          <h2 className="font-heading text-xl font-bold text-primary">
            {aboutContent.answerQ}
          </h2>
          <p className="mt-3 text-lg leading-relaxed text-gray-700">
            {aboutContent.answerA}
          </p>

          <h2 className="mt-10 font-heading text-xl font-bold text-primary">
            {aboutContent.storyTitle}
          </h2>
          {aboutContent.story.map((p) => (
            <p key={p} className="mt-4 text-gray-700">
              {p}
            </p>
          ))}
          <p className="mt-4 text-gray-700">
            השלב הזה הוא שירות בפני עצמו —{" "}
            <Link
              href="/services/leak-detection/"
              className="font-medium text-secondary-600 underline decoration-secondary-200 underline-offset-2 hover:decoration-secondary-600"
            >
              איתור מקור הנזילה
            </Link>{" "}
            — וגם כשהוא מסתיים בלי עבודת איטום, הוא עשה את מה שהוא נועד לעשות.
          </p>

          <h2 className="mt-10 font-heading text-xl font-bold text-primary">
            {aboutContent.principlesTitle}
          </h2>
          <dl className="mt-5 space-y-4">
            {aboutContent.principles.map((p) => (
              <div key={p.title}>
                <dt className="font-semibold text-primary">{p.title}</dt>
                <dd className="mt-1 text-gray-700">{p.body}</dd>
              </div>
            ))}
          </dl>

          <h2 className="mt-10 font-heading text-xl font-bold text-primary">
            {aboutContent.whoTitle}
          </h2>
          <p className="mt-3 text-gray-700">{aboutContent.who}</p>

          <h2 className="mt-10 font-heading text-xl font-bold text-primary">
            {aboutContent.areaTitle}
          </h2>
          <p className="mt-3 text-gray-700">
            {aboutContent.area}{" "}
            <Link
              href="/areas/"
              className="font-medium text-secondary-600 underline decoration-secondary-200 underline-offset-2 hover:decoration-secondary-600"
            >
              רשימת אזורי השירות המלאה
            </Link>{" "}
            כוללת 23 ערים.
          </p>

          <h2 className="mt-10 font-heading text-xl font-bold text-primary">
            {aboutContent.notUsTitle}
          </h2>
          <ul className="mt-4 space-y-2">
            {aboutContent.notUs.map((n) => (
              <li key={n} className="flex items-start gap-2 text-gray-700">
                <X className="mt-1 h-4 w-4 shrink-0 text-gray-400" aria-hidden />
                {n}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-gray-700">{aboutContent.notUsOutro}</p>

          <h2 className="mt-10 font-heading text-xl font-bold text-primary">
            הערכים שלנו
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {values.map((v) => (
              <li key={v} className="flex items-start gap-2 text-gray-700">
                <Check className="mt-1 h-4 w-4 shrink-0 text-accent-700" aria-hidden />
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
