import Link from "next/link";
import { Container } from "@/components/ui/Container";

export interface Crumb {
  label: string;
  href?: string;
}

/** Inner-page hero band: breadcrumb + title + optional subtitle. */
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
