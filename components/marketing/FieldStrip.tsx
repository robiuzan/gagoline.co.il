import { Container } from "@/components/ui/Container";
import { Figure } from "@/components/ui/Figure";
import { stripFor } from "@/lib/images";
import { cn } from "@/lib/utils";

/**
 * A row of two or three field snapshots — the `strip-1..3` / `pair-1..2` slots of a route
 * (contract §2). Renders NOTHING below two images: one tile in a row reads as a broken grid, and
 * every page already renders correctly with zero images (today's state).
 *
 * The first tile is the page's `priority` image, so a page that uses the strip must put it before
 * any other content image. With three columns the third tile is hidden on phones (two across is
 * the readable width there); it is lazy, so a hidden tile costs no bytes until it intersects.
 *
 * `band` wraps the row in a white band + Container for the homepage, where it sits between the
 * full-bleed hero and the trust bar rather than inside a Section.
 */
export function FieldStrip({
  route,
  cols = 3,
  className,
  band = false,
}: {
  route: string;
  cols?: 2 | 3;
  className?: string;
  band?: boolean;
}) {
  const images = stripFor(route).slice(0, cols);
  if (images.length < 2) return null;

  const list = (
    <ul
      className={cn(
        "grid grid-cols-2 gap-3 sm:gap-4",
        cols === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2",
        !band && className,
      )}
    >
      {images.map((img, i) => (
        <li key={img.id} className={cn(cols === 3 && i === 2 && "hidden sm:block")}>
          <Figure image={img} priority={i === 0} caption={false} />
        </li>
      ))}
    </ul>
  );

  if (!band) return list;
  return (
    <div className={cn("bg-white pt-6 sm:pt-8", className)}>
      <Container>{list}</Container>
    </div>
  );
}
