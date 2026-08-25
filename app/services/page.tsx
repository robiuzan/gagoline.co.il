import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { servicesContent } from "@/lib/content";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { ServicesGrid } from "@/components/marketing/ServicesGrid";
import { FinalCta } from "@/components/marketing/FinalCta";

export const metadata: Metadata = {
  alternates: { canonical: "/services/" },
  title: "השירותים שלנו",
  description:
    "איזה שירות איטום מתאים לגג שלכם? טבלת התאמה בין הסימפטום לשיטה — איטום גגות, זיפות, יריעות ביטומניות, מרפסות, מרתפים ואיתור נזילות.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        title="השירותים שלנו"
        subtitle="פתרון איטום לכל סוג של גג ובעיה — מאיתור נזילות ועד איטום מלא, עם אחריות בכתב."
        crumbs={[{ label: "בית", href: "/" }, { label: "השירותים שלנו" }]}
      />

      <Section tone="white">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-heading text-xl font-bold text-primary">
            {servicesContent.answerQ}
          </h2>
          <p className="mt-3 text-lg leading-relaxed text-gray-700">
            {servicesContent.answerA}
          </p>
          {servicesContent.intro.map((p) => (
            <p key={p} className="mt-4 text-gray-700">
              {p}
            </p>
          ))}
        </div>
      </Section>

      <ServicesGrid />

      {/* Symptom → service. The routing an eight-tile grid cannot express: the hub previously had
          no prose of its own at all, so a visitor who did not already know the vocabulary had
          nothing to choose with. */}
      <Section tone="muted">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-heading text-xl font-bold text-primary">
            {servicesContent.chooseTitle}
          </h2>
          <ul className="mt-5 space-y-3">
            {servicesContent.choose.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/services/${c.slug}/`}
                  className="group flex items-start justify-between gap-3 rounded-xl border border-gray-100 bg-white px-4 py-4 hover:border-secondary"
                >
                  <span>
                    <span className="font-semibold text-primary group-hover:text-secondary-600">
                      {c.symptom}
                    </span>
                    <span className="mt-1 block text-sm text-gray-600">{c.answer}</span>
                  </span>
                  <ChevronLeft
                    className="mt-1 h-4 w-4 shrink-0 text-gray-400 group-hover:text-secondary-600"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-gray-600">
            לא בטוחים מה מתאים?{" "}
            <Link
              href="/pricing/"
              className="font-medium text-secondary-600 underline underline-offset-2"
            >
              כך נקבע המחיר
            </Link>{" "}
            ומה כדאי לבדוק לפני שמזמינים ביקור.
          </p>
        </div>
      </Section>

      <FinalCta />
    </>
  );
}
