import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { Figure } from "@/components/ui/Figure";
import { imageFor } from "@/lib/images";
import { aboutContent } from "@/lib/content";

/**
 * The homepage's "who we are" band: the `team` image (the same manifest entry /about/ renders,
 * contract §2) beside the about page's answer block, linking to /about/. Renders nothing without
 * the image — the homepage reads exactly as before until the team rendering is approved.
 *
 * No first names here: a caption may name the technicians only when EVERY placement of its entry
 * is /about/ (manifest rule), and this entry is also placed on `/` and `/contact/`. The about
 * page carries the named line (`imagesNote.about`).
 *
 * `priority` is passed by the page: true only when no content image precedes this one (the
 * homepage strip rendered nothing), so the page keeps exactly one LCP candidate.
 */
export function TeamTeaser({ priority = false }: { priority?: boolean }) {
  const image = imageFor("/", "team");
  if (!image) return null;

  return (
    <Section id="team" tone="muted">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <Figure image={image} priority={priority} />
        <div>
          <p className="text-sm font-semibold text-accent-700">מי אנחנו</p>
          <h2 className="mt-2 font-heading text-2xl font-bold text-primary sm:text-3xl">
            {aboutContent.answerQ}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-gray-700">
            {aboutContent.answerA}
          </p>
          <p className="mt-6">
            <Link
              href="/about/"
              className="font-semibold text-secondary-600 underline decoration-secondary-200 underline-offset-2 hover:decoration-secondary-600"
            >
              עוד עלינו ועל שיטת העבודה
            </Link>
          </p>
        </div>
      </div>
    </Section>
  );
}
