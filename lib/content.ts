/**
 * content.ts — display content for the site, derived from brief.md (Parts C, D, B).
 * Business data (NAP, slugs, cities) stays in site-config.ts; this file holds the
 * Hebrew marketing copy and per-section content.
 *
 * 🔶 = assumption from the brief; confirm with client (esp. prices, stats, testimonials).
 */
import { services, type RegionId, type ServiceSlug } from "@/lib/site-config";

export type IconName =
  | "ShieldCheck"
  | "Brush"
  | "Layers"
  | "Building2"
  | "Search"
  | "Building"
  | "Sun"
  | "Waves";

interface ServiceMeta {
  tagline: string;
  description: string;
  icon: IconName;
}

/** Per-service display copy, keyed by the slugs in site-config. */
const serviceMeta: Record<ServiceSlug, ServiceMeta> = {
  "roof-sealing": {
    tagline: "גג בטון · מרוצף · רעפים · איסכורית",
    description:
      "איטום מקצועי לכל סוגי הגגות. מאתרים את מקור הנזילה ואוטמים בחומרים מתקדמים כדי שהגג יישאר יבש לאורך שנים.",
    icon: "ShieldCheck",
  },
  "roof-tarring": {
    tagline: "איטום ביטומני חם",
    description:
      "זיפות גג בביטומן חם עם רשת לחיזוק — פתרון יעיל וכלכלי לחידוש שכבת ההגנה של הגג.",
    icon: "Brush",
  },
  "bituminous-sheets": {
    tagline: "יריעות עמידות במיוחד",
    description:
      "הלחמת יריעות ביטומניות איכותיות — שכבת איטום עמידה במיוחד לגגות בטון ולמרתפים.",
    icon: "Layers",
  },
  "balcony-sealing": {
    tagline: "כולל מרפסת מרוצפת",
    description:
      "פתרון לנזילות ורטיבות שחודרות לדירה שמתחת — איטום מרפסות עם או בלי הרמת ריצוף.",
    icon: "Building2",
  },
  "leak-detection": {
    tagline: "אבחון מדויק של המקור",
    description:
      "מאתרים את המקור המדויק של הנזילה (כולל בדיקת הצפה) ומתקנים נקודתית — בלי לפרק חצי בית.",
    icon: "Search",
  },
  "exterior-wall-sealing": {
    tagline: "כולל עבודות בגובה",
    description:
      "איטום קירות חוץ וסדקים שדרכם חודרת רטיבות — כולל עבודות בגובה בסנפלינג בעת הצורך.",
    icon: "Building",
  },
  "roof-whitening": {
    tagline: "בידוד תרמי לקיץ",
    description:
      "הלבנת הגג להחזרת קרינת השמש — מורידה את חום הבית בקיץ ומאריכה את חיי שכבת האיטום.",
    icon: "Sun",
  },
  "basement-sealing": {
    tagline: "כולל איטום שלילי",
    description:
      "איטום מרתפים וקירות תת-קרקעיים למניעת חדירת מים ורטיבות — לרבות איטום שלילי.",
    icon: "Waves",
  },
};

export interface ServiceCard {
  slug: ServiceSlug;
  name: string;
  tagline: string;
  description: string;
  icon: IconName;
}

/** Service cards (name from site-config + display copy here), most important first. */
export const serviceCards: ServiceCard[] = services.map((s) => ({
  slug: s.slug,
  name: s.name,
  ...serviceMeta[s.slug],
}));

/** Brand positioning — top 3 differentiators (brief B2). */
export const differentiators = [
  {
    title: "אבחון לפני איטום",
    body: "קודם מאתרים את מקור הנזילה האמיתי, ורק אז אוטמים — פתרון לשורש הבעיה, לא טלאי שמחזיק עד הגשם הבא.",
  },
  {
    title: "אחריות בכתב ומחיר שקוף",
    body: "הצעת מחיר מפורטת מראש, בלי הפתעות — ואחריות כתובה על העבודה לאורך שנים.",
  },
  {
    title: "צוות שלנו, עבודה נקייה",
    body: "צוות מקצועי משלנו בלי קבלני משנה, עבודה מסודרת ומענה מהיר — כולל חירום נזילות בחורף.",
  },
] as const;

/** End-to-end process (brief C2). */
export const processSteps = [
  { title: "פנייה ושיחת ייעוץ", body: "מתקשרים, מבינים את הבעיה ומתאמים ביקור." },
  { title: "ביקור ואבחון", body: "בדיקת הצפה ואיתור מקור הנזילה בשטח." },
  { title: "הצעת מחיר שקופה", body: "הצעה מפורטת וברורה — בלי אותיות קטנות." },
  { title: "ביצוע האיטום", body: "עבודה נקייה ומתועדת בחומרים מתקדמים." },
  { title: "בדיקת איכות + אחריות", body: "בדיקה סופית ואחריות בכתב על העבודה." },
] as const;

/**
 * Trust stats for the trust bar.
 *
 * Every value here must be free to state per docs/content-standards.md §6. Two former rows were
 * removed 2026-08-17: "מאות גגות יבשים" (an unsourced volume claim — business-facts §B) and
 * "עד 10 שנים אחריות" (a warranty term the FAQ on the same page explicitly declines to state —
 * business-facts §D). Do not reinstate a number here without a confirmed source.
 */
export const trustStats = [
  { value: "2014", label: "פעילים מאז" },
  { value: "אבחון", label: "לפני כל איטום" },
  { value: "בכתב", label: "אחריות על כל עבודה" },
  { value: "תל אביב והמרכז", label: "אזור שירות" },
] as const;

/**
 * Indicative price ranges (🔶 ALL assumptions — confirm before publishing).
 * Per brief C1/C3 and competitor market data.
 */
export const priceRows = [
  { service: "איטום ביריעות ביטומניות", from: '80–120 ₪ למ"ר' },
  { service: "זיפות גגות", from: '40–60 ₪ למ"ר' },
  { service: "סיוד והלבנת גגות", from: '14–18 ₪ למ"ר' },
  { service: "איתור נזילות (ביקור ואבחון)", from: "החל מ-250 ₪" },
] as const;

/**
 * Testimonials — REMOVED 2026-08-17.
 *
 * Three invented five-star quotes attributed to "לקוח/ה — להחלפה 🔶" were rendering live on `/`
 * and `/reviews/`. A fabricated review is a Google policy violation and a consumer-protection
 * exposure, not a placeholder (docs/content-standards.md §6, backlog §7.1).
 *
 * When real reviews arrive (docs/business-facts.md §A), reinstate them with this shape — note
 * `sourceUrl` is NOT optional, so an unverifiable entry cannot be added:
 *
 *   export interface Review {
 *     author: string;
 *     dateISO: string;
 *     text: string;
 *     rating: number;
 *     sourceUrl: string; // public, resolvable — required by design
 *   }
 *
 * `Review` / `AggregateRating` JSON-LD ships only once these exist (docs/schema-graph.md §4.1).
 */

/** General FAQs (brief D5). */
export const faqs = [
  {
    q: "כמה עולה איטום גג?",
    a: "המחיר תלוי בסוג הגג, בשטח ובשיטת האיטום. אנחנו מגיעים לביקור, מאתרים את מקור הבעיה ונותנים הצעת מחיר שקופה ומפורטת — ללא התחייבות.",
  },
  {
    q: "כמה זמן מחזיק איטום גג ומה האחריות?",
    a: "איטום מקצועי בחומרים מתאימים מחזיק שנים רבות. אנחנו מעניקים אחריות בכתב על העבודה, ומפרטים בה בדיוק מה מכוסה ולכמה זמן — לפני שמתחילים.",
  },
  {
    q: "מתי הכי נכון לאטום — לפני החורף?",
    a: "כן. הזמן האידיאלי לאיטום ולחידוש הוא לקראת סוף הקיץ, כדי להיכנס לחורף עם גג יבש ומוגן. אבל אנחנו פותרים נזילות גם באמצע החורף.",
  },
  {
    q: "מה ההבדל בין זיפות, יריעות ביטומניות ואיטום אקרילי?",
    a: "לכל שיטה יתרונות לפי סוג הגג ומצבו: זיפות הוא פתרון כלכלי לחידוש, יריעות ביטומניות נותנות שכבה עמידה במיוחד, ואיטום אקרילי/פוליאוריטן מתאים לגגות מסוימים. בביקור נמליץ על השיטה הנכונה עבורכם.",
  },
  {
    q: "אפשר לאטום גג מרוצף בלי להרים את הריצוף?",
    a: "בהרבה מקרים כן — קיימות שיטות איטום שמבוצעות מעל הריצוף הקיים. נבחן את המצב בביקור ונציע את הפתרון המתאים.",
  },
  {
    q: "איך מאתרים מאיפה הנזילה מגיעה?",
    a: "אנחנו מבצעים בדיקה שיטתית, כולל בדיקת הצפה, כדי לאתר את המקור המדויק — וכך מתקנים את הבעיה בשורש ולא רק את הסימפטום.",
  },
  {
    q: "אתם עובדים גם עם ועדי בתים?",
    a: "בהחלט. אנחנו מלווים ועדי בתים ובניינים משותפים — כולל אבחון, הצעת מחיר מסודרת לוועד וביצוע מקצועי.",
  },
  {
    q: "באילו אזורים אתם נותנים שירות?",
    a: 'תל אביב והמרכז, עד רדיוס של כ-50 ק"מ. אם אתם לא בטוחים שאתם בטווח — התקשרו ונבדוק.',
  },
] as const;

/**
 * Header / footer navigation.
 *
 * "המלצות" and "גלריה" were removed 2026-08-17: both routes are noindexed and hold no real content
 * yet (backlog §7.1–7.2), and pointing sitewide navigation at them spent the site's strongest
 * internal signal on the two pages that best demonstrated it was unfinished. Restore each entry the
 * day real reviews / photos land.
 */
export const navItems = [
  { label: "השירותים שלנו", href: "/services/" },
  { label: "אזורי שירות", href: "/areas/" },
  { label: "אודות", href: "/about/" },
  { label: "מחירון", href: "/pricing/" },
  { label: "שאלות נפוצות", href: "/faq/" },
  { label: "צור קשר", href: "/contact/" },
] as const;

/**
 * Copy for the `/areas/` hub.
 *
 * Everything here is free to state per docs/content-standards.md §6: the service area and radius
 * come from the manifest, and the roof-stock notes are statements about the **built environment**
 * — publicly verifiable architecture, not claims about work this business has done. That
 * distinction is what lets the hub carry real local substance while the owner questions in
 * docs/business-facts.md §E are still open.
 *
 * Deliberately absent, and must stay absent until §E is answered: per-city response times, any
 * availability promise, and any "we have worked in X".
 */
export const areasContent = {
  /** 40–60 word answer block (content-standards §5), under a question-form H2. */
  answerQ: "באילו אזורים אנחנו נותנים שירות?",
  answerA:
    "אנחנו עובדים בתל אביב ובכל אזור המרכז, ברדיוס של עד כ-50 ק״מ — מגוש דן, דרך השרון ועד דרום המרכז והשפלה. השירות כולל איטום גגות, זיפות, יריעות ביטומניות ואיתור נזילות, לבתים פרטיים, לבניינים משותפים ולעסקים. לא בטוחים שאתם בטווח? התקשרו ונבדוק יחד.",

  intro: [
    "לגג בתל אביב ולגג בכפר סבא קוראים אותו דבר, אבל הם כמעט אף פעם לא אותה עבודה. סוג הגג, הגיל שלו, ומה שכבר נעשה עליו בעבר — כל אלה משתנים מאזור לאזור, והם שקובעים איזו שיטת איטום בכלל מתאימה.",
    "לכן הביקור הראשון אצלנו הוא תמיד אבחון ולא הצעת מחיר בטלפון. אנחנו עולים לגג, מבינים מאיפה המים באמת נכנסים, ורק אז אומרים מה צריך לעשות וכמה זה עולה.",
  ],

  /** One line of built-environment character per sub-region. Public architectural fact. */
  regionNotes: {
    "gush-dan":
      "המגוון הגדול ביותר: גגות בטון שטוחים מתקופת הבנייה הבינלאומית בלב תל אביב, שנושאים לא פעם שכבות זיפות שנצברו לאורך עשורים; שיכונים משנות ה-50 וה-60 עם גגות מרוצפים ברמת גן, בבני ברק ובפתח תקווה; מגדלים חדשים עם מערכות יריעות; ואזורי תעשייה עם גגות איסכורית סביב אזור וקרית אריה.",
    sharon:
      "כאן בולטת הבנייה של שנות ה-80 וה-90 — הרבה גגות רעפים משופעים ברעננה, בהוד השרון ובכפר סבא, שבהם הבעיות הן בדרך כלל רעפים שזזו, חיפוי רכס שהתבלה ויריעת תת-רעף שהתייבשה. הרצליה ונתניה מוסיפות את קרבת הים, שמאיצה בלאי של שכבות איטום חשופות.",
    "south-center":
      "שילוב של שיכונים ותיקים עם גגות מרוצפים בחולון, בבת ים ובראשון לציון, לצד אזורי תעשייה עם גגות פח ואיסכורית. בבת ים, כמו בכל קו החוף, מלח ולחות הם גורם שחיקה שצריך לקחת בחשבון כשבוחרים שכבה עליונה.",
  } satisfies Record<RegionId, string>,

  /** Closing note. States the radius, and explicitly does NOT promise per-city timing. */
  outro:
    "אם העיר שלכם לא ברשימה אבל אתם באזור המרכז — עדיין שווה להתקשר. אנחנו בודקים כל פנייה לפי המיקום המדויק ולפי סוג העבודה, ואומרים מראש אם זה בטווח שלנו.",
} as const;
