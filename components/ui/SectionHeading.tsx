import { cn } from "@/lib/utils";

/** Standard centered section heading with optional eyebrow + subtitle. */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  tone = "dark",
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  tone?: "dark" | "light";
  className?: string;
}) {
  const isLight = tone === "light";
  return (
    <div className={cn("mx-auto max-w-2xl text-center", className)}>
      {eyebrow && (
        <p
          className={cn(
            "mb-2 text-sm font-semibold",
            isLight ? "text-accent-200" : "text-accent-600",
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          "font-heading text-2xl font-bold sm:text-3xl",
          isLight ? "text-white" : "text-primary",
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={cn("mt-3 text-base", isLight ? "text-white/80" : "text-gray-600")}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
