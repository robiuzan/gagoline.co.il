import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "תקנון ותנאי שימוש",
  description: "תקנון ותנאי השימוש באתר גגוליין.",
};

export default function TermsPage() {
  return (
    <>
      <PageHeader
        title="תקנון ותנאי שימוש"
        crumbs={[{ label: "בית", href: "/" }, { label: "תקנון" }]}
      />
      <Section tone="white">
        <div className="mx-auto max-w-3xl space-y-4 text-gray-700">
          <p>
            השימוש באתר {siteConfig.name} ובתכניו כפוף לתנאים המפורטים להלן.{" "}
            <span className="text-gray-400">🔶 נוסח משפטי מלא לאישור.</span>
          </p>
          <h2 className="font-heading text-lg font-bold text-primary">כללי</h2>
          <p>
            המידע באתר, לרבות טווחי מחירים, מובא לצורכי התרשמות בלבד ואינו מהווה הצעה
            מחייבת. הצעת מחיר מחייבת תינתן לאחר ביקור ואבחון בשטח.
          </p>
          <h2 className="font-heading text-lg font-bold text-primary">קניין רוחני</h2>
          <p>
            כל הזכויות בתכני האתר שמורות ל{siteConfig.name}. אין לעשות שימוש בתכנים ללא
            אישור.
          </p>
        </div>
      </Section>
    </>
  );
}
