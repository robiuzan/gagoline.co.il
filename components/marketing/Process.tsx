import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { processSteps } from "@/lib/content";

export function Process() {
  return (
    <Section id="process" tone="primary">
      <SectionHeading eyebrow="איך זה עובד" title="חמישה צעדים לגג יבש" tone="light" />

      <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {processSteps.map((step, i) => (
          <Reveal key={step.title} delay={i * 0.06}>
            <li className="flex h-full flex-col rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent font-heading text-lg font-bold text-accent-foreground">
                {i + 1}
              </span>
              <h3 className="mt-4 font-heading text-base font-bold text-white">
                {step.title}
              </h3>
              <p className="mt-1.5 text-sm text-white/75">{step.body}</p>
            </li>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
