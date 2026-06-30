import { Star } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { testimonials } from "@/lib/content";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} מתוך 5 כוכבים`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={
            i < rating ? "h-4 w-4 fill-accent text-accent" : "h-4 w-4 text-gray-300"
          }
          aria-hidden
        />
      ))}
    </div>
  );
}

export function Reviews() {
  return (
    <Section id="reviews" tone="muted">
      <SectionHeading
        eyebrow="לקוחות ממליצים"
        title="מאות גגות יבשים — והרשימה גדלה"
        subtitle="🔶 ביקורות לדוגמה — יוחלפו בביקורות Google אמיתיות לפני העלייה לאוויר."
      />

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <Reveal key={i} delay={i * 0.07}>
            <figure className="flex h-full flex-col rounded-2xl bg-white p-7 shadow-sm">
              <Stars rating={t.rating} />
              <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-gray-700">
                “{t.text}”
              </blockquote>
              <figcaption className="mt-4 text-sm font-semibold text-primary">
                {t.author}
                {t.source && (
                  <span className="font-normal text-gray-400"> · {t.source}</span>
                )}
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
