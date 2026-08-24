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
  formAccessKey:
    (manifest.contact as { formAccessKey?: string | null }).formAccessKey ?? null,
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
 * Sub-regions used to group the city list on `/areas/`, in the footer and in `ServiceAreas`.
 *
 * A flat 23-chip row is a wall to a homeowner scanning for their own city, and a flat list to a
 * crawler. Grouping adds a middle layer to the silo **without adding a route**, which matters
 * because docs/keyword-map.md §6 caps route expansion hard.
 *
 * Order here is the display order.
 */
export const regions = [
  { id: "gush-dan", name: "גוש דן" },
  { id: "sharon", name: "השרון" },
  { id: "south-center", name: "דרום המרכז" },
] as const;

export type RegionId = (typeof regions)[number]["id"];

/**
 * Local-SEO city matrix (brief Part H1) — within ~50 km of Tel Aviv / the Center.
 * Drives `app/areas/[city]` (`איטום גגות ב[עיר]`) and the `/areas/` hub.
 *
 * `region` is geography, which is public fact and needs no owner confirmation. Whether every city
 * is served on identical terms is a *different* question and is still open — docs/business-facts.md
 * §E. Do not write per-city response times or availability until that is answered.
 */
export const cities = [
  { slug: "tel-aviv", name: "תל אביב", region: "gush-dan" },
  { slug: "ramat-gan", name: "רמת גן", region: "gush-dan" },
  { slug: "givatayim", name: "גבעתיים", region: "gush-dan" },
  { slug: "bnei-brak", name: "בני ברק", region: "gush-dan" },
  { slug: "herzliya", name: "הרצליה", region: "sharon" },
  { slug: "ramat-hasharon", name: "רמת השרון", region: "sharon" },
  { slug: "givat-shmuel", name: "גבעת שמואל", region: "gush-dan" },
  { slug: "kiryat-ono", name: "קרית אונו", region: "gush-dan" },
  { slug: "or-yehuda", name: "אור יהודה", region: "gush-dan" },
  { slug: "yehud", name: "יהוד", region: "gush-dan" },
  { slug: "petah-tikva", name: "פתח תקווה", region: "gush-dan" },
  { slug: "rosh-haayin", name: "ראש העין", region: "gush-dan" },
  { slug: "holon", name: "חולון", region: "south-center" },
  { slug: "bat-yam", name: "בת ים", region: "south-center" },
  { slug: "rishon-lezion", name: "ראשון לציון", region: "south-center" },
  { slug: "rehovot", name: "רחובות", region: "south-center" },
  { slug: "nes-ziona", name: "נס ציונה", region: "south-center" },
  { slug: "kfar-saba", name: "כפר סבא", region: "sharon" },
  { slug: "raanana", name: "רעננה", region: "sharon" },
  { slug: "hod-hasharon", name: "הוד השרון", region: "sharon" },
  { slug: "netanya", name: "נתניה", region: "sharon" },
  { slug: "ganei-tikva", name: "גני תקווה", region: "gush-dan" },
  { slug: "azor", name: "אזור", region: "gush-dan" },
] as const satisfies readonly { slug: string; name: string; region: RegionId }[];

export type CitySlug = (typeof cities)[number]["slug"];

/** Cities of one sub-region, in array order. */
export function citiesInRegion(id: RegionId) {
  return cities.filter((c) => c.region === id);
}

// ── Link helpers ───────────────────────────────────────────────────────────

/** `tel:` href for click-to-call (shared @ishub/site-kit, bound to the manifest). */
export const telHref = kitTelHref(manifest);

/** WhatsApp click-to-chat href, with an optional pre-filled message (shared kit). */
export function whatsappHref(message?: string): string {
  return kitWhatsappHref(manifest, message);
}
