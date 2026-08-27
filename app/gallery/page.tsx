import type { Metadata } from "next";
import { SiteImage } from "@ishub/site-kit/components";
import { manifest } from "@/lib/site-config";
import { galleryImages, galleryContent } from "@/lib/content";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { FinalCta } from "@/components/marketing/FinalCta";

/**
 * Indexable since 2026-08-27, in the same commit that added the photos — the trade
 * `app/sitemap.ts` describes, and the one `/blog/` made on 2026-08-24.
 *
 * The route previously rendered six empty dashed tiles reading "לפני / אחרי 🔶" (backlog §7.2);
 * those were deleted 2026-08-17 and the route was left `noindex` and out of all navigation until
 * real photos existed.
 *
 * The title no longer says "לפני ואחרי". None of the supplied photos are before/after PAIRS, so
 * that framing would have been a claim the images cannot support — see the provenance note over
 * `galleryImages` in lib/content.ts, which also records the six photos that were rejected.
 *
 * Images render through the kit's `SiteImage`, never `next/image` (`images.unoptimized` is true,
 * so next/image would emit no srcset and only add client JS). These are local `public/` paths, so
 * `srcFor` serves them verbatim and `srcsetFor` correctly emits no srcset — a static export has no
 * resizer, and advertising widths the origin cannot produce would be a lie. When the photos move
 * to the media host they become `images.gallery` in the manifest and this file passes `image={...}`
 * instead of `src/alt/width/height`; nothing else here changes.
 */
export const metadata: Metadata = {
  alternates: { canonical: "/gallery/" },
  title: "גלריית עבודות איטום",
  description:
    "תמונות מעבודות איטום גגות של גגוליין — יריעות ביטומניות על גגות שטוחים, איטום נוזלי בגגות פח ואיטום מתחת לרעפים.",
};

export default function GalleryPage() {
  return (
    <>
      <PageHeader
        title="גלריית עבודות איטום"
        crumbs={[{ label: "בית", href: "/" }, { label: "גלריה" }]}
      />
      <Section tone="white">
        <p className="mx-auto max-w-2xl text-center text-gray-600">
          {galleryContent.intro}
        </p>

        <ul className="mt-12 grid gap-8 sm:grid-cols-2">
          {galleryImages.map((img, i) => (
            <li key={img.src}>
              <figure>
                <SiteImage
                  images={manifest.images}
                  src={img.src}
                  alt={img.alt}
                  width={img.width}
                  height={img.height}
                  /* Exactly one priority per page: the first tile is the LCP candidate. */
                  priority={i === 0}
                  className="w-full rounded-xl border border-gray-100 bg-gray-50"
                />
                <figcaption className="mt-3 text-sm leading-relaxed text-gray-600">
                  {img.caption}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>

        <p className="mx-auto mt-12 max-w-2xl text-center text-gray-600">
          {galleryContent.cta}
        </p>
      </Section>
      <FinalCta />
    </>
  );
}
