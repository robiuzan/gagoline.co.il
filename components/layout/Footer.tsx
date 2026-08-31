import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { siteConfig, telHref, services, cities } from "@/lib/site-config";
import { Container } from "@/components/ui/Container";
import { EmailLink } from "@/components/ui/EmailAddress";

export function Footer() {
  // Derived at BUILD time, not request time — a static export has no request. That is the whole
  // reason this was hardcoded, and the reasoning was inverted: a literal is frozen until someone
  // remembers to edit it, whereas a build-time year self-corrects on the next deploy. The site
  // deploys often enough that this is strictly better, and it is still deterministic per build.
  const year = new Date().getFullYear();

  return (
    <footer className="bg-primary text-white/90">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand + contact */}
        <div>
          {/* Plain <img>, not next/image — see Header.tsx. The dark-background variant of the
              mark is a separate file because the footer sits on `bg-primary`. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/gagoline_logo_dark_bg.png"
            alt={siteConfig.name}
            width={600}
            height={176}
            className="h-10 w-auto"
          />
          <p className="mt-3 text-sm text-white/70">{siteConfig.tagline}</p>
          <ul className="mt-5 space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-accent-400" aria-hidden />
              <a
                href={telHref}
                data-cta="footer-call"
                className="hover:text-white"
                dir="ltr"
              >
                {siteConfig.phone}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-accent-400" aria-hidden />
              <EmailLink className="hover:text-white" dataCta="footer-email" />
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-accent-400" aria-hidden />
              <span>{siteConfig.serviceArea}</span>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 text-accent-400" aria-hidden />
              <span>
                {siteConfig.hours.weekday}
                <br />
                {siteConfig.hours.friday}
              </span>
            </li>
          </ul>
        </div>

        {/* Services */}
        <nav aria-label="שירותים">
          <Link
            href="/services/"
            className="font-semibold text-white hover:text-accent-400"
          >
            השירותים שלנו
          </Link>
          <ul className="mt-4 space-y-2 text-sm">
            {services.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/services/${s.slug}`}
                  className="text-white/70 hover:text-white"
                >
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Areas */}
        <nav aria-label="אזורי שירות">
          <Link href="/areas/" className="font-semibold text-white hover:text-accent-400">
            אזורי שירות
          </Link>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {/* All 23 — a .slice() here previously left 11 cities with a single inbound link
                while the other 12 had 43. See docs/link-graph.md §4. */}
            {cities.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/areas/${c.slug}`}
                  className="text-white/70 hover:text-white"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Quick links + legal */}
        <nav aria-label="קישורים">
          <p className="font-semibold text-white">קישורים</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/about" className="text-white/70 hover:text-white">
                אודות
              </Link>
            </li>
            {/*
              גלריה restored 2026-08-27 with its photographs. המלצות stays out — still noindex,
              still no real reviews (backlog §7.1). Restore it with its content, not before.
            */}
            <li>
              <Link href="/gallery/" className="text-white/70 hover:text-white">
                גלריה
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="text-white/70 hover:text-white">
                מחירון
              </Link>
            </li>
            <li>
              <Link href="/blog/" className="text-white/70 hover:text-white">
                מדריכים
              </Link>
            </li>
            <li>
              <Link href="/faq" className="text-white/70 hover:text-white">
                שאלות נפוצות
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-white/70 hover:text-white">
                צור קשר
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="text-white/70 hover:text-white">
                מדיניות פרטיות
              </Link>
            </li>
            <li>
              <Link href="/accessibility" className="text-white/70 hover:text-white">
                הצהרת נגישות
              </Link>
            </li>
            {/* /terms/ was emitted and sitemapped with zero inbound internal links — a genuine
                orphan the backlog never named (see §5.8, corrected 2026-08-17). */}
            <li>
              <Link href="/terms" className="text-white/70 hover:text-white">
                תקנון ותנאי שימוש
              </Link>
            </li>
          </ul>
        </nav>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col items-center justify-between gap-2 py-5 text-xs text-white/60 sm:flex-row">
          <p>
            © {year} {siteConfig.name}. כל הזכויות שמורות.
          </p>
          <p>איטום גגות בתל אביב והמרכז</p>
        </Container>
      </div>
    </footer>
  );
}
