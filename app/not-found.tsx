import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, Phone } from "lucide-react";
import { siteConfig, telHref, whatsappHref, services } from "@/lib/site-config";
import { notFoundContent } from "@/lib/content";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";

/**
 * 404 (backlog §1.9). Was a scaffold: an <h1> reading "404", one line of copy and a link home.
 *
 * Demand on this site spikes with the first rain, and a visitor who mistypes a URL in November has
 * water coming through a ceiling. Sending them back to the homepage to restart the navigation is
 * the expensive option; the four most likely destinations and a click-to-call are the cheap one.
 *
 * NO `robots` KEY HERE, deliberately (corrected 2026-09-17). Next.js emits its own
 * `<meta name="robots" content="noindex">` for not-found, so declaring `robots` as well shipped
 * TWO robots tags on the same page. They agreed, so nothing was mis-indexed — but two directives
 * where one belongs is the kind of thing that reads as a bug to whoever audits it next.
 *
 * Dropping the key loses nothing: `follow` is the default when it is unstated, so Next's bare
 * `noindex` is equivalent in effect to the `noindex, follow` this used to declare. The page stays
 * out of the index while its links keep passing equity into the service pages instead of
 * dead-ending — which matters, because a 404 is reachable from any stale inbound link on the web.
 */
export const metadata: Metadata = {
  title: notFoundContent.title,
  description:
    "הדף המבוקש לא נמצא באתר גגוליין. כאן אפשר למצוא את השירותים ואת דרכי ההתקשרות.",
};

/** The four a lost visitor is most likely to have wanted, by search intent rather than array order. */
const RECOVERY = ["roof-sealing", "leak-detection", "balcony-sealing", "roof-tarring"];

export default function NotFound() {
  const suggestions = RECOVERY.flatMap((slug) => {
    const match = services.find((s) => s.slug === slug);
    return match ? [match] : [];
  });

  return (
    <Section tone="white">
      <div className="mx-auto max-w-2xl">
        <p className="font-heading text-5xl font-extrabold text-gray-200" aria-hidden>
          404
        </p>
        <h1 className="mt-2 font-heading text-3xl font-extrabold text-primary sm:text-4xl">
          {notFoundContent.title}
        </h1>
        <p className="mt-4 text-lg text-gray-700">{notFoundContent.intro}</p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Button href={telHref} data-cta="notfound-call" variant="accent" size="lg">
            <Phone className="h-5 w-5" aria-hidden />
            חייגו עכשיו: <span dir="ltr">{siteConfig.phone}</span>
          </Button>
          <Button
            href={whatsappHref("היי, אני מחפש/ת מידע על איטום גג")}
            data-cta="notfound-whatsapp"
            variant="whatsapp"
            size="lg"
          >
            שלחו וואטסאפ
          </Button>
        </div>

        <h2 className="mt-12 font-heading text-xl font-bold text-primary">
          {notFoundContent.linksHeading}
        </h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {suggestions.map((s) => (
            <li key={s.slug}>
              <Link
                href={`/services/${s.slug}/`}
                className="group flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-3 text-gray-700 hover:border-secondary hover:text-primary"
              >
                <ChevronLeft
                  className="h-4 w-4 shrink-0 text-gray-400 group-hover:text-secondary"
                  aria-hidden
                />
                {s.name}
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-gray-700">
          <Link href="/services/" className="font-semibold text-secondary-600 underline">
            כל שירותי האיטום
          </Link>{" "}
          <span className="text-gray-400">·</span>{" "}
          <Link href="/areas/" className="font-semibold text-secondary-600 underline">
            אזורי השירות
          </Link>{" "}
          <span className="text-gray-400">·</span>{" "}
          <Link href="/blog/" className="font-semibold text-secondary-600 underline">
            מדריכים לגג
          </Link>
        </p>
      </div>
    </Section>
  );
}
