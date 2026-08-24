import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { faqJsonLd, jsonLdScript } from "@ishub/site-kit/seo";
import { articleJsonLd } from "@/lib/article-jsonld";
import { articles, getArticle } from "@/content/articles";
import { manifest, cities } from "@/lib/site-config";
import { serviceCards } from "@/lib/content";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { ArticleBody } from "@/components/blog/ArticleBody";
import { FinalCta } from "@/components/marketing/FinalCta";

export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  return articles.map((a) => ({ slug: a.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const a = getArticle(params.slug);
  if (!a) return {};
  return {
    alternates: { canonical: `/blog/${a.slug}/` },
    title: a.title,
    description: a.description,
  };
}

/** dd/mm/yyyy — the Israeli format (CLAUDE.md §6). */
function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const a = getArticle(params.slug);
  if (!a) notFound();

  const related = a.relatedServices
    .map((slug) => serviceCards.find((c) => c.slug === slug))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));
  const relatedCities = (a.relatedCities ?? [])
    .map((slug) => cities.find((c) => c.slug === slug))
    .filter((c): c is (typeof cities)[number] => Boolean(c));

  // FAQPage is derived from the article's own faq blocks — the same array ArticleBody renders, so
  // the markup cannot describe questions the page does not show.
  const faqItems = a.blocks.flatMap((b) => (b.kind === "faq" ? [...b.items] : []));

  const jsonLd = [
    articleJsonLd(manifest, {
      slug: a.slug,
      headline: a.title,
      description: a.description,
      datePublished: a.datePublished,
      dateModified: a.dateModified,
    }),
    ...(faqItems.length > 0 ? [faqJsonLd(faqItems)] : []),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      <PageHeader
        title={a.title}
        crumbs={[
          { label: "בית", href: "/" },
          { label: "מדריכים", href: "/blog/" },
          { label: a.title },
        ]}
      />

      <Section tone="white">
        <div className="mx-auto max-w-3xl">
          {/* Authorship is the organisation, not an invented person — see lib/article-jsonld.ts. */}
          <p className="text-sm text-gray-500">
            נכתב על ידי צוות גגוליין · עודכן{" "}
            <time dateTime={a.dateModified}>{formatDate(a.dateModified)}</time>
          </p>

          <ArticleBody blocks={a.blocks} />

          <div className="mt-14 border-t border-gray-100 pt-8">
            <h2 className="font-heading text-lg font-bold text-primary">
              שירותים קשורים
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {related.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/services/${s.slug}/`}
                    className="flex items-center justify-between gap-2 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 hover:border-secondary hover:text-secondary-600"
                  >
                    {s.name}
                    <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>

            {relatedCities.length > 0 && (
              <p className="mt-5 text-sm text-gray-600">
                נותנים שירות ב
                {relatedCities.map((c, i) => (
                  <span key={c.slug}>
                    {i > 0 && ", "}
                    <Link
                      href={`/areas/${c.slug}/`}
                      className="font-medium text-secondary-600 underline underline-offset-2"
                    >
                      {c.name}
                    </Link>
                  </span>
                ))}{" "}
                ובכל אזור המרכז.
              </p>
            )}

            <p className="mt-6">
              <Link
                href="/blog/"
                className="text-sm font-medium text-secondary-600 underline underline-offset-2"
              >
                לכל המדריכים
              </Link>
            </p>
          </div>
        </div>
      </Section>

      <FinalCta />
    </>
  );
}
