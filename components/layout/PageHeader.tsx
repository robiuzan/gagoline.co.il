import Link from "next/link";
import { breadcrumbJsonLd, jsonLdScript } from "@ishub/site-kit/seo";
import { manifest } from "@/lib/site-config";
import { Container } from "@/components/ui/Container";

export interface Crumb {
  label: string;
  href?: string;
}

/**
 * Inner-page hero band: breadcrumb + title + optional subtitle.
 *
 * Also emits the `BreadcrumbList` for the page, built from **the same `crumbs` array it renders**.
 * That is the whole point: markup and structured data cannot drift, because there is only one
 * source. Every route using this component gets a breadcrumb node for free — 44 of the 45 emitted
 * routes, all but `/` and `/404`, which have no PageHeader.
 *
 * The trailing crumb deliberately has no `href` (it is the current page), and the kit's builder
 * omits `item` for it rather than throwing — see the note on `breadcrumbJsonLd`.
 */
export function PageHeader({
  title,
  subtitle,
  crumbs,
}: {
  title: string;
  subtitle?: string;
  crumbs?: Crumb[];
}) {
  return (
    <div className="bg-primary text-white">
      {crumbs && crumbs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLdScript(
              breadcrumbJsonLd(
                manifest,
                crumbs.map((c) => ({ name: c.label, path: c.href })),
              ),
            ),
          }}
        />
      )}
      <Container className="py-12 sm:py-16">
        {crumbs && crumbs.length > 0 && (
          <nav aria-label="פירורי לחם" className="mb-3">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-white/70">
              {crumbs.map((c, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  {c.href ? (
                    <Link href={c.href} className="hover:text-white">
                      {c.label}
                    </Link>
                  ) : (
                    <span className="text-white/90">{c.label}</span>
                  )}
                  {i < crumbs.length - 1 && <span aria-hidden>/</span>}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <h1 className="font-heading text-3xl font-extrabold sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-3 max-w-2xl text-white/85">{subtitle}</p>}
      </Container>
    </div>
  );
}
