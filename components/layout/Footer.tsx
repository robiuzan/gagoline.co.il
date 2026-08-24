import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { siteConfig, telHref, services, cities } from "@/lib/site-config";
import { Container } from "@/components/ui/Container";
import { EmailLink } from "@/components/ui/EmailAddress";

export function Footer() {
  const year = 2026; // static export — keep build deterministic; update yearly.

  return (
    <footer className="bg-primary text-white/90">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand + contact */}
        <div>
          <p className="font-heading text-2xl font-extrabold text-white">
            {siteConfig.name}
          </p>
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
              <EmailLink className="hover:text-white" />
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
          <p className="font-semibold text-white">השירותים שלנו</p>
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
          <p className="font-semibold text-white">אזורי שירות</p>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {cities.slice(0, 12).map((c) => (
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
              המלצות and גלריה removed 2026-08-17 — both routes are noindex until they hold real
              content (backlog §7.1–7.2). Restore each link with its content.
            */}
            <li>
              <Link href="/pricing" className="text-white/70 hover:text-white">
                מחירון
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
