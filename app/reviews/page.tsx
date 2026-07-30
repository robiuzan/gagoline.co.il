import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reviews } from "@/components/marketing/Reviews";
import { FinalCta } from "@/components/marketing/FinalCta";

export const metadata: Metadata = {
  alternates: { canonical: "/reviews/" },
  title: "המלצות",
  description:
    "מה לקוחות מספרים על גגוליין — איטום גגות מקצועי עם אחריות בכתב בתל אביב והמרכז.",
};

export default function ReviewsPage() {
  return (
    <>
      <PageHeader
        title="לקוחות ממליצים"
        subtitle="אבחון מדויק, עבודה נקייה וגג שנשאר יבש — מה שמביא את הלקוחות הבאים."
        crumbs={[{ label: "בית", href: "/" }, { label: "המלצות" }]}
      />
      <Reviews />
      <FinalCta />
    </>
  );
}
