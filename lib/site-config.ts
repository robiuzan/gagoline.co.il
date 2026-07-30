/**
 * site-config.ts — single source of truth for business data (NAP, services, cities).
 *
 * Derived from brief.md (Parts A, C, H). Components must import these values rather than
 * hardcoding the phone number, service names, or city slugs.
 *
 * 🔶 = assumption from the brief; confirm with client before launch.
 */

import siteManifest from "@/site.config.json";
import {
  telHref as kitTelHref,
  whatsappHref as kitWhatsappHref,
  type SiteManifest,
} from "@ishub/site-kit";

/** Normalized per-site manifest (single source of truth for NAP/identity/schema). */
export const manifest = siteManifest as unknown as SiteManifest;

export const siteConfig = {
  name: manifest.brandName ?? "",
  nameEn: manifest.brandNameEn ?? "",
  /** One-line elevator pitch (brief A2). */
  tagline: manifest.tagline ?? "",
  domain: manifest.url,
  founded: manifest.foundedYear ?? 0,

  // ── Contact (brief A4) ───────────────────────────────────────────────────
  phone: manifest.contact.phoneDisplay,
  /** E.164 form for `tel:` links. */
  phoneE164: manifest.contact.phoneE164,
  whatsapp: manifest.contact.whatsappE164.replace(/\D/g, ""),
  email: manifest.contact.email,
  /** Web3Forms PUBLIC access key (per-site UUID). Delivery inbox = email. null until provisioned. */
  formAccessKey: (manifest.contact as { formAccessKey?: string | null }).formAccessKey ?? null,
  serviceArea: manifest.schema.areaServed ?? "",

  /** 🔶 Confirm business hours. */
  hours: {
    weekday: "א'–ה' 08:00–18:00",
    friday: "ו' 08:00–13:00",
    emergency: "שירות חירום לנזילות בחורף", // 🔶 confirm scope
  },

  // ── Social / listings (brief H5) — fill when available ───────────────────
  social: {
    facebook: "", // 🔶
    instagram: "", // 🔶
    googleBusiness: "", // 🔶
  },
} as const;

/**
 * Services (brief Part C), most important first.
 * `slug` = English route segment (`app/services/[service]`); `name` = Hebrew display name.
 * Marketing descriptions live with the page content, not here.
 */
export const services = [
  { slug: "roof-sealing", name: "איטום גגות" },
  { slug: "roof-tarring", name: "זיפות גגות" },
  { slug: "bituminous-sheets", name: "איטום ביריעות ביטומניות" },
  { slug: "balcony-sealing", name: "איטום מרפסות" },
  { slug: "leak-detection", name: "איתור ותיקון נזילות" },
  { slug: "exterior-wall-sealing", name: "איטום קירות חיצוניים" },
  { slug: "roof-whitening", name: "סיוד והלבנת גגות" },
  { slug: "basement-sealing", name: "איטום מרתפים" },
] as const;

export type ServiceSlug = (typeof services)[number]["slug"];

/**
 * Local-SEO city matrix (brief Part H1) — within ~50 km of Tel Aviv / the Center.
 * Drives `app/areas/[city]` (`איטום גגות ב[עיר]`).
 */
export const cities = [
  { slug: "tel-aviv", name: "תל אביב" },
  { slug: "ramat-gan", name: "רמת גן" },
  { slug: "givatayim", name: "גבעתיים" },
  { slug: "bnei-brak", name: "בני ברק" },
  { slug: "herzliya", name: "הרצליה" },
  { slug: "ramat-hasharon", name: "רמת השרון" },
  { slug: "givat-shmuel", name: "גבעת שמואל" },
  { slug: "kiryat-ono", name: "קרית אונו" },
  { slug: "or-yehuda", name: "אור יהודה" },
  { slug: "yehud", name: "יהוד" },
  { slug: "petah-tikva", name: "פתח תקווה" },
  { slug: "rosh-haayin", name: "ראש העין" },
  { slug: "holon", name: "חולון" },
  { slug: "bat-yam", name: "בת ים" },
  { slug: "rishon-lezion", name: "ראשון לציון" },
  { slug: "rehovot", name: "רחובות" },
  { slug: "nes-ziona", name: "נס ציונה" },
  { slug: "kfar-saba", name: "כפר סבא" },
  { slug: "raanana", name: "רעננה" },
  { slug: "hod-hasharon", name: "הוד השרון" },
  { slug: "netanya", name: "נתניה" },
  { slug: "ganei-tikva", name: "גני תקווה" },
  { slug: "azor", name: "אזור" },
] as const;

export type CitySlug = (typeof cities)[number]["slug"];

// ── Link helpers ───────────────────────────────────────────────────────────

/** `tel:` href for click-to-call (shared @ishub/site-kit, bound to the manifest). */
export const telHref = kitTelHref(manifest);

/** WhatsApp click-to-chat href, with an optional pre-filled message (shared kit). */
export function whatsappHref(message?: string): string {
  return kitWhatsappHref(manifest, message);
}
