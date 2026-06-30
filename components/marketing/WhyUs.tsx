import { FileCheck, Search, Users } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { differentiators } from "@/lib/content";

const icons = [Search, FileCheck, Users];

export function WhyUs() {
  return (
    <Section id="why-us" tone="white">
      <SectionHeading
        eyebrow="למה גגוליין"
        title="אנחנו מתקנים את הבעיה, לא רק את הסימפטום"
      />

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {differentiators.map((item, i) => {
          const Icon = icons[i] ?? Search;
          return (
            <Reveal key={item.title} delay={i * 0.07}>
              <div className="flex h-full flex-col rounded-2xl bg-gray-50 p-7">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
                  <Icon className="h-6 w-6" aria-hidden />
                </span>
                <h3 className="mt-4 font-heading text-lg font-bold text-primary">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.body}</p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
