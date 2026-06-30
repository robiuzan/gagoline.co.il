import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "מדיניות פרטיות",
  description: "מדיניות הפרטיות של אתר גגוליין.",
};

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        title="מדיניות פרטיות"
        crumbs={[{ label: "בית", href: "/" }, { label: "מדיניות פרטיות" }]}
      />
      <Section tone="white">
        <div className="mx-auto max-w-3xl space-y-4 text-gray-700">
          <p>
            אנו ב{siteConfig.name} מכבדים את פרטיותכם. עמוד זה מסביר איזה מידע אנו אוספים
            וכיצד אנו עושים בו שימוש.{" "}
            <span className="text-gray-400">🔶 נוסח משפטי מלא לאישור.</span>
          </p>
          <h2 className="font-heading text-lg font-bold text-primary">
            איזה מידע אנו אוספים
          </h2>
          <p>
            כאשר אתם פונים אלינו דרך הטופס, הטלפון או הוואטסאפ, אנו אוספים את הפרטים
            שמסרתם (שם, טלפון ופרטי הפנייה) לצורך מתן מענה והצעת מחיר בלבד.
          </p>
          <h2 className="font-heading text-lg font-bold text-primary">שימוש במידע</h2>
          <p>
            המידע משמש ליצירת קשר חוזר ולמתן השירות המבוקש. איננו מוכרים או מעבירים את
            פרטיכם לצדדים שלישיים שלא לצורך מתן השירות.
          </p>
          <h2 className="font-heading text-lg font-bold text-primary">יצירת קשר</h2>
          <p>
            בכל שאלה בנושא פרטיות ניתן לפנות אלינו בטלפון{" "}
            <span dir="ltr">{siteConfig.phone}</span> או בדוא״ל{" "}
            <span dir="ltr">{siteConfig.email}</span>.
          </p>
        </div>
      </Section>
    </>
  );
}
