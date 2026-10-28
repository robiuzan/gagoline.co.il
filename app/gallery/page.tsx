import type { Metadata } from "next";
import Link from "next/link";
import { services } from "@/lib/site-config";
import { galleryContent, imagesNote } from "@/lib/content";
import { imagesFor } from "@/lib/images";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { Figure } from "@/components/ui/Figure";
import { FinalCta } from "@/components/marketing/FinalCta";

/**
 * Indexable since 2026-08-27. The route previously rendered six empty dashed tiles reading
 * "לפני / אחרי 🔶" (backlog §7.2); those were deleted 2026-08-17 and the route stayed `noindex`
 * and out of navigation until it had images.
 *
 * TWO GROUPS, ONE NOTE (owner decisions 2026-10-28, images contract §0/§7). First the four
 * owner-supplied images, in their original order — AI-made per the owner, so they are
 * illustrations like everything that follows, not "verified real". Under them the site-wide
 * disclosure (`imagesNote.gallery`, marker `data-images-notice="gallery"`, asserted by the
 * images gate). Then, only once a generated entry is approved, the H2 and the generated group:
 * one scene per service, each figcaption linking to its service page.
 *
 * The title never says "לפני ואחרי": nothing here is a before/after PAIR, so that framing would be
 * a claim the images cannot support. Every image comes from content/images/manifest.json through
 * lib/images.ts; alt and captions describe what is in frame and never a job, a city or a date.
 *
 * Exactly one priority image: the first tile of the first group that renders.
 */
export const metadata: Metadata = {
  alternates: { canonical: "/gallery/" },
  title: "גלריית עבודות איטום",
  description:
    "תמונות והדמיות של עבודות איטום גגות — יריעות ביטומניות, איטום נוזלי, מרפסות, קירות ורעפים.",
};

export default function GalleryPage() {
  const supplied = imagesFor("/gallery/", "supplied");
  const generated = imagesFor("/gallery/", "generated");
  const firstId = supplied[0]?.id ?? generated[0]?.id;

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

        {supplied.length > 0 && (
          <ul className="mt-12 grid gap-8 sm:grid-cols-2">
            {supplied.map((img) => (
              <li key={img.id}>
                <Figure image={img} priority={img.id === firstId} />
              </li>
            ))}
          </ul>
        )}

        <p
          data-images-notice="gallery"
          className="mx-auto mt-12 max-w-2xl text-center text-sm leading-relaxed text-gray-500"
        >
          {imagesNote.gallery}
        </p>

        {generated.length > 0 && (
          <>
            <h2 className="mt-14 text-center font-heading text-2xl font-bold text-primary">
              {galleryContent.generatedTitle}
            </h2>
            <ul className="mt-8 grid gap-8 sm:grid-cols-2">
              {generated.map((img) => {
                const service = services.find((s) => s.slug === img.service);
                return (
                  <li key={img.id}>
                    <Figure
                      image={img}
                      priority={img.id === firstId}
                      captionExtra={
                        service && (
                          <Link
                            href={`/services/${service.slug}/`}
                            className="font-medium text-secondary-600 underline decoration-secondary-200 underline-offset-2 hover:decoration-secondary-600"
                          >
                            {service.name}
                          </Link>
                        )
                      }
                    />
                  </li>
                );
              })}
            </ul>
          </>
        )}

        <p className="mx-auto mt-12 max-w-2xl text-center text-gray-600">
          {galleryContent.cta}
        </p>
      </Section>
      <FinalCta />
    </>
  );
}
