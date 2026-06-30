import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { ServicesGrid } from "@/components/marketing/ServicesGrid";
import { FinalCta } from "@/components/marketing/FinalCta";

export const metadata: Metadata = {
  title: "השירותים שלנו",
  description:
    "שירותי איטום גגות מלאים בתל אביב והמרכז: איטום גגות, זיפות, יריעות ביטומניות, מרפסות, איתור נזילות ועוד — עם אחריות בכתב.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        title="השירותים שלנו"
        subtitle="פתרון איטום לכל סוג של גג ובעיה — מאיתור נזילות ועד איטום מלא, עם אחריות בכתב."
        crumbs={[{ label: "בית", href: "/" }, { label: "השירותים שלנו" }]}
      />
      <ServicesGrid />
      <FinalCta />
    </>
  );
}
