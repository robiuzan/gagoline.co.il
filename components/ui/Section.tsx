import { cn } from "@/lib/utils";
import { Container } from "./Container";

type Tone = "white" | "muted" | "primary";

const toneClasses: Record<Tone, string> = {
  white: "bg-white text-gray-900",
  muted: "bg-gray-50 text-gray-900",
  primary: "bg-primary text-white",
};

/** A full-width page section with consistent vertical rhythm and a centered container. */
export function Section({
  id,
  tone = "white",
  className,
  containerClassName,
  children,
}: {
  id?: string;
  tone?: Tone;
  className?: string;
  containerClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={cn("py-14 sm:py-20", toneClasses[tone], className)}>
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}
