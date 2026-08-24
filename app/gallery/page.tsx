import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { FinalCta } from "@/components/marketing/FinalCta";

/**
 * `noindex` until real before/after photos exist.
 *
 * This route previously rendered six empty dashed tiles reading "לפני / אחרי 🔶" under a subtitle
 * telling the visitor the images were temporary (backlog §7.2). Removed 2026-08-17. The route is
 * kept — rather than 404'd — because it is already indexed, but it is out of the sitemap and out of
 * all sitewide navigation.
 *
 * To restore: photos land on the media host (site.config.json → images.mediaHost) and render
 * through the kit's `SiteImage`, never `next/image` — `images.unoptimized` is true, so next/image
 * emits no srcset (backlog §10.2). Then re-add the nav/footer entries and the sitemap path and drop
 * the `robots` block. Blocked on docs/business-facts.md §A.
 */
export const metadata: Metadata = {
  alternates: { canonical: "/gallery/" },
  robots: { index: false, follow: true },
  title: "גלריה — לפני ואחרי",
  description:
    "תיעוד עבודות איטום גגות של גגוליין בתל אביב והמרכז. הגלריה בהכנה ותתעדכן בתמונות מהשטח.",
};

export default function GalleryPage() {
  return (
    <>
      <PageHeader
        title="גלריה — לפני ואחרי"
        crumbs={[{ label: "בית", href: "/" }, { label: "גלריה" }]}
      />
      <Section tone="white">
        <p className="mx-auto max-w-2xl text-center text-gray-600">
          אנחנו מתעדים את העבודות שלנו — לפני ואחרי — והתיעוד יעלה לכאן. רוצים לשמוע על
          עבודה דומה לשלכם? התקשרו אלינו ונסביר בדיוק מה מתאים לגג שלכם.
        </p>
      </Section>
      <FinalCta />
    </>
  );
}
