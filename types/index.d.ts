/**
 * Global / shared TypeScript types for the Gagoline site.
 * Add app-wide interfaces here. Route-specific or component-specific types should live
 * next to the code that uses them.
 */

/** A roof-sealing service offering (see lib/site-config.ts `services`). */
export interface Service {
  slug: string;
  /** Hebrew display name. */
  name: string;
  /** Short marketing description (added during content phase). */
  description?: string;
}

/** A targeted city for the local-SEO matrix (see lib/site-config.ts `cities`). */
export interface City {
  slug: string;
  /** Hebrew display name. */
  name: string;
}

/** Payload submitted by the primary lead/quote form (brief Part G1). */
export interface LeadFormData {
  name: string;
  phone: string;
  city?: string;
  service?: string;
  message?: string;
  /** Honeypot field — must stay empty (brief Part G1 spam protection). */
  company?: string;
}

/** A customer testimonial / review (brief Part D4). */
export interface Testimonial {
  author: string;
  rating: number; // 1–5
  text: string;
  source?: "Google" | "Facebook" | string;
  date?: string; // dd/mm/yyyy
}

export {};
