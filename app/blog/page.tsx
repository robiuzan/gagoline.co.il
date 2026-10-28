import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { SiteImage } from "@ishub/site-kit/components";
import { articles } from "@/content/articles";
import { manifest } from "@/lib/site-config";
import { imageFor } from "@/lib/images";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { FinalCta } from "@/components/marketing/FinalCta";

/**
 * The `noindex` block is GONE as of this commit, and `/blog/` is back in app/sitemap.ts.
 *
 * It was noindexed on 2026-08-17 because the route rendered "תכני הבלוג בדרך 🔶 — בקרוב" while
 * sitting in the sitemap: an indexed empty page that spent crawl budget demonstrating the site was
 * unfinished (backlog §7.4, §3.9). The condition for restoring it was real articles, and those now
 * exist. Re-adding the robots block would be correct only if every article were removed.
 */
export const metadata: Metadata = {
  alternates: { canonical: "/blog/" },
  title: "מדריכים על איטום גגות",
  description:
    "מדריכים מפורטים על איתור נזילות, בחירת שיטת איטום, הכנת הגג לחורף ורטיבות בקירות — מהניסיון שלנו בשטח.",
};

export default function BlogPage() {
  /**
   * A start-side thumbnail per card, DERIVED from the guide's own `lead` image (its 480-px
   * `thumb`, contract §2) — no separate slot, so the index can never show a picture the guide
   * does not. Cards without a thumb keep today's text-only layout. The first card that carries one
   * is the page's single priority image; the rest are lazy.
   */
  const cards = articles.map((a) => ({
    article: a,
    lead: imageFor(`/blog/${a.slug}/`, "lead"),
  }));
  const firstThumb = cards.find((c) => c.lead?.thumb)?.article.slug;

  return (
    <>
      <PageHeader
        title="מדריכים על איטום גגות"
        subtitle="מה שאנחנו מסבירים בשטח, כתוב. איתור נזילות, בחירה בין שיטות, והכנת הגג לחורף."
        crumbs={[{ label: "בית", href: "/" }, { label: "מדריכים" }]}
      />

      <Section tone="white">
        <ul className="mx-auto grid max-w-4xl gap-4">
          {cards.map(({ article: a, lead }) => (
            <li key={a.slug}>
              <Link
                href={`/blog/${a.slug}/`}
                className="group flex items-start justify-between gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-6 hover:border-secondary"
              >
                {lead?.thumb && (
                  <SiteImage
                    images={manifest.images}
                    src={lead.thumb.src}
                    alt={lead.alt}
                    width={lead.thumb.width}
                    height={lead.thumb.height}
                    priority={a.slug === firstThumb}
                    className="w-24 shrink-0 rounded-lg border border-gray-100 bg-white sm:w-32"
                  />
                )}
                <span>
                  <h2 className="font-heading text-lg font-bold text-primary group-hover:text-secondary-600">
                    {a.title}
                  </h2>
                  <span className="mt-2 block text-gray-600">{a.description}</span>
                </span>
                <ChevronLeft
                  className="mt-1 h-5 w-5 shrink-0 text-gray-400 group-hover:text-secondary-600"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <FinalCta />
    </>
  );
}
