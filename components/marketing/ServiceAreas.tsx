import Link from "next/link";
import { MapPin } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cities } from "@/lib/site-config";

export function ServiceAreas() {
  return (
    <Section id="areas" tone="muted">
      <SectionHeading
        eyebrow="אזורי שירות"
        title="נותנים שירות בתל אביב והמרכז"
        subtitle="עד רדיוס של כ-50 ק״מ. לא בטוחים שאתם בטווח? התקשרו ונבדוק."
      />

      <ul className="mx-auto mt-8 flex max-w-4xl flex-wrap justify-center gap-2.5">
        {cities.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/areas/${c.slug}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-secondary hover:text-secondary"
            >
              <MapPin className="h-3.5 w-3.5 text-secondary" aria-hidden />
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
