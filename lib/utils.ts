import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Compose Tailwind class names safely: clsx handles conditionals, tailwind-merge
 * de-duplicates conflicting utilities (e.g. `px-2 px-4` -> `px-4`).
 *
 * @example cn("p-2", isActive && "bg-accent", className)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
