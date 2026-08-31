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

/**
 * Normalise an Israeli phone number typed by a human into its national form (`0XXXXXXXX`),
 * or return `null` when it cannot be one.
 *
 * The form previously accepted ANY non-empty string as a phone number, so a lead could arrive
 * with "0501234" or "תתקשרו אליי" and there was no way to call it back. The rule here is
 * deliberately permissive about FORMAT and strict about STRUCTURE: separators, spaces,
 * parentheses and the country code are all stripped, but the result still has to be a real
 * Israeli numbering-plan number.
 *
 *   050-660-1006 · 0556601006 · +972-55-660-1006 · 972556601006 · (03) 382-9118  -> accepted
 *   0501234 · 12345678901 · 04-123 · an empty string                             -> rejected
 *
 * Accepted structures:
 *   - mobile and VOIP — `05X` / `07X` followed by 7 digits (10 total)
 *   - landline        — `02` `03` `04` `08` `09` followed by 7 digits (9 total)
 *
 * Service numbers (1-700, 1-800, *nnnn) are intentionally NOT accepted: this field is a
 * callback number for a private customer, and nobody reaches a homeowner on a 1-800.
 */
export function normalizeIsraeliPhone(raw: string): string | null {
  let local = raw.replace(/\D/g, "");
  if (!local) return null;

  // Country code, in the three shapes people actually type it: 00972, +972 and a bare 972.
  // The leading + is already gone, so all three arrive here as digits.
  if (local.startsWith("00")) local = local.slice(2);
  if (local.startsWith("972")) local = local.slice(3);
  // "+972 55 660 1006" loses its trunk zero; "+972 055..." keeps it. Handle both.
  if (!local.startsWith("0")) local = `0${local}`;

  if (/^0[57]\d{8}$/.test(local)) return local; // 10 digits — mobile / VOIP
  if (/^0[23489]\d{7}$/.test(local)) return local; // 9 digits — landline
  return null;
}
