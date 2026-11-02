import type { ReactNode } from "react";
import { SiteImage } from "@ishub/site-kit/components";
import { manifest } from "@/lib/site-config";
import { imagesDraftMode, PHONE_MEDIA, type PlacedImage } from "@/lib/images";
import { cn } from "@/lib/utils";

/**
 * The one way a content image renders on this site: a `PlacedImage` from lib/images.ts, through
 * the kit's `SiteImage` (plain <img> with intrinsic width/height — `images.unoptimized` is true, so
 * next/image would emit no srcset and only add client JS). Dimensions reserve the box; CLS stays 0.
 *
 * The phone copy goes through <picture>, not srcset: SiteImage serves a local file verbatim and the
 * kit is vendored, so a <source> around it is how a phone gets the smaller file while the <img>, its
 * dimensions and its loading attributes stay exactly as the kit writes them. Both files have the
 * same shape (manifest-rules.mjs checks it), so the box does not move.
 *
 * One cost, measured and accepted (2026-11-01): React writes no preload link for an <img> inside
 * <picture>, so a priority image loses that hint. The file finished 5–13 ms later on desktop and LCP
 * stayed within noise. Do not add ReactDOM.preload here: this React build drops `media`, so phones
 * would fetch both files, 109–169 KB extra per page.
 *
 * `priority` is the page's single LCP candidate — the FIRST content image in DOM order, exactly one
 * per page (scripts/images/check-images-out.mjs fails a page with two, or with a lazy first image).
 * The wrapper carries `id="img-<id>"` so the review board can deep-link a candidate on the real
 * page, and `data-image-id` / `data-image-status` so the gate can match figures to the manifest.
 *
 * In draft mode (`IMAGES_DRAFT=1`) a candidate shows a small badge; a production build never
 * renders a candidate at all, so the badge cannot reach a visitor.
 *
 * Server component. No client JS, no brand hex — accent tokens from app/globals.css.
 */
export function Figure({
  image,
  priority = false,
  caption = true,
  captionExtra,
  className,
}: {
  image: PlacedImage;
  priority?: boolean;
  /** `false` hides the figcaption (strip tiles, thumbnails); the alt still ships. */
  caption?: boolean;
  /** Extra figcaption content after the caption — the gallery's link to the service page. */
  captionExtra?: ReactNode;
  className?: string;
}) {
  const draft = imagesDraftMode && image.status === "candidate";
  const showCaption = caption && (image.caption !== null || captionExtra !== undefined);
  const img = (
    <SiteImage
      images={manifest.images}
      src={image.src}
      alt={image.alt}
      width={image.width}
      height={image.height}
      priority={priority}
      className="w-full rounded-xl border border-gray-100 bg-gray-50"
    />
  );

  return (
    <figure
      id={`img-${image.id}`}
      data-image-id={image.id}
      data-image-status={image.status}
      className={cn("relative", className)}
    >
      {image.phone ? (
        <picture className="block">
          <source
            media={PHONE_MEDIA}
            srcSet={image.phone.src}
            width={image.phone.width}
            height={image.phone.height}
          />
          {img}
        </picture>
      ) : (
        img
      )}
      {draft && (
        <span className="absolute end-2 top-2 rounded-md border border-accent-200 bg-accent-50 px-2 py-0.5 text-xs font-semibold text-accent-700">
          טיוטה — ממתין לאישור
        </span>
      )}
      {showCaption && (
        <figcaption className="mt-2 text-sm leading-relaxed text-gray-600">
          {image.caption}
          {image.caption !== null && captionExtra !== undefined && " · "}
          {captionExtra}
        </figcaption>
      )}
    </figure>
  );
}
