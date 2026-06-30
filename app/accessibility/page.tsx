import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "הצהרת נגישות",
  description: "הצהרת הנגישות של אתר גגוליין בהתאם לתקן הישראלי.",
};

export default function AccessibilityPage() {
  return (
    <>
      <PageHeader
        title="הצהרת נגישות"
        crumbs={[{ label: "בית", href: "/" }, { label: "הצהרת נגישות" }]}
      />
      <Section tone="white">
        <div className="mx-auto max-w-3xl space-y-4 text-gray-700">
          <p>
            {siteConfig.name} רואה חשיבות רבה במתן שירות שוויוני לכלל הגולשים, ופועלת
            להנגשת האתר בהתאם לתקן הישראלי (ת״י 5568) ולהנחיות WCAG 2.0 ברמה AA.
          </p>
          <h2 className="font-heading text-lg font-bold text-primary">מה הונגש באתר</h2>
          <ul className="list-disc space-y-1 ps-5">
            <li>מבנה סמנטי ותמיכה בניווט באמצעות מקלדת.</li>
            <li>ניגודיות צבעים תקינה וטקסט קריא.</li>
            <li>תיאורים חלופיים לתמונות בעלות משמעות.</li>
            <li>התאמה לקוראי מסך וכיווניות RTL מלאה.</li>
          </ul>
          <h2 className="font-heading text-lg font-bold text-primary">
            פניות בנושא נגישות
          </h2>
          <p>
            נתקלתם בקושי? נשמח לסייע. ניתן לפנות לרכז הנגישות בטלפון{" "}
            <span dir="ltr">{siteConfig.phone}</span> או בדוא״ל{" "}
            <span dir="ltr">{siteConfig.email}</span>.{" "}
            <span className="text-gray-400">🔶 פרטי רכז נגישות ותאריך עדכון לאישור.</span>
          </p>
        </div>
      </Section>
    </>
  );
}
