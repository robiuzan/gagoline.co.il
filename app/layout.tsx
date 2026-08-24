import type { Metadata } from "next";
import { ogImageMeta } from "@ishub/site-kit";
import { Heebo, Rubik } from "next/font/google";
import { siteConfig, manifest } from "@/lib/site-config";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileCtaBar } from "@/components/layout/MobileCtaBar";
import { gtmHeadSnippet, gtmNoScriptSrc } from "@ishub/site-kit/analytics";
import { localBusinessJsonLd, jsonLdScript } from "@ishub/site-kit/seo";
import "./globals.css";

// Body font — Heebo (clean, legible Hebrew). Heading font — Rubik (modern Hebrew).
// Exposed as CSS variables consumed by tailwind.config.ts (font-sans / font-heading).
const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heebo",
  display: "swap",
});

const rubik = Rubik({
  subsets: ["hebrew", "latin"],
  variable: "--font-rubik",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.domain),
  // Homepage canonical. Every other route sets its own in page metadata, so nothing
  // inherits this — see the skyshade regression where a root canonical with no per-page
  // overrides made all 33 pages claim to be the homepage.
  alternates: { canonical: "/" },
  title: {
    default: `${siteConfig.name} — איטום גגות בתל אביב והמרכז`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.tagline,
  verification: {
    // Google Search Console site verification.
    google: "ezF8RK2XRQm2cTJRfJPuCQ9fPj29xDv4SIAc0UX0E_w",
  },
  openGraph: {
    images: ogImageMeta(manifest.images),
    type: "website",
    locale: "he_IL",
    siteName: siteConfig.name,
  },
};

/**
 * The RoofingContractor node, emitted on EVERY page rather than only the homepage.
 *
 * Two reasons. Coverage went from 2/45 pages to 45/45 for ~500 bytes each. More importantly,
 * `serviceJsonLd` wires `provider` to `{"@id": ".../#business"}`, and that reference only resolves
 * if the business node is present on the same page — otherwise every Service node on the site
 * points at something Google has to go and find elsewhere.
 */
const businessJsonLd = localBusinessJsonLd(manifest, {
  image: manifest.images?.og?.key
    ? `https://${manifest.images.mediaHost}/${manifest.images.og.key}`
    : undefined,
});

/** Shared GTM loader — inert (renders nothing) until analytics.gtmId is set in the manifest. */
const gtmHead = gtmHeadSnippet(manifest.analytics?.gtmId);
const gtmNoScript = gtmNoScriptSrc(manifest.analytics?.gtmId);

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} ${rubik.variable}`}>
      <head>
        {manifest.images?.mediaHost && (
          <link
            rel="preconnect"
            href={`https://${manifest.images.mediaHost}`}
            crossOrigin=""
          />
        )}
      </head>
      <body className="flex min-h-screen flex-col font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(businessJsonLd) }}
        />
        {gtmNoScript && (
          <noscript>
            <iframe
              src={gtmNoScript}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="gtm"
            />
          </noscript>
        )}
        {gtmHead && (
          <script id="gtm-init" dangerouslySetInnerHTML={{ __html: gtmHead }} />
        )}
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        {/* Spacer so the fixed mobile CTA bar never overlaps footer content. */}
        <div className="h-16 lg:hidden" aria-hidden />
        <MobileCtaBar />
      </body>
    </html>
  );
}
