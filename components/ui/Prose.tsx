import Link from "next/link";
import type { RichText } from "@/lib/service-depth";

/**
 * Renders a `RichText` paragraph — the only mechanism by which an in-copy link can exist on this
 * site.
 *
 * Copy lives in `lib/content.ts` as plain strings (docs/content-standards.md §7), and you cannot put
 * a `<Link>` inside a string. That is why the site had **zero** contextual internal links: they were
 * not expressible at any price, only unwritten. `RichText` is `(string | {text, href})[]`, so a
 * paragraph can carry links without moving copy into JSX.
 *
 * Anchor rules — text, target and count — are docs/content-standards.md §9.
 */
export function Prose({ parts, className }: { parts: RichText; className?: string }) {
  return (
    <p className={className}>
      {parts.map((part, i) =>
        typeof part === "string" ? (
          part
        ) : (
          <Link
            key={i}
            href={part.href}
            className="font-medium text-secondary-600 underline decoration-secondary-200 underline-offset-2 hover:decoration-secondary-600"
          >
            {part.text}
          </Link>
        ),
      )}
    </p>
  );
}
