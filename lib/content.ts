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
  { label: "מדריכים", href: "/blog/" },
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

/**
 * Copy for `/pricing/` (was 87 words — the thinnest commercial page on the site).
 *
 * THE CONSTRAINT THAT SHAPED THIS PAGE: all four ranges in `priceRows` are UNCONFIRMED —
 * docs/business-facts.md §D tags every one of them 🔶. So the page could not be deepened by saying
 * more about the numbers. It is deepened by explaining what DRIVES a price and what a written quote
 * must contain, which is trade-general and free to state, and which is also what someone typing
 * "כמה עולה איטום גג" actually needs.
 *
 * Deliberately absent until §D is answered: whether the call-out fee is credited against the job
 * (the doc calls it the #1 pre-purchase question), any warranty term in years, any discount, and
 * any claim about being cheaper than anyone. The FAQ below asks what to check with ANY contractor
 * rather than stating this business's policy — that is the difference between advice and a claim.
 */
export const pricingContent = {
  answerQ: "כמה עולה איטום גג?",
  answerA:
    "מחיר איטום גג נקבע לפי שטח הגג, סוג הגג, מספר שכבות האיטום שצריך להסיר, כמות פרטי הקצה והנגישות אליו. שני גגות באותו גודל יכולים להיבדל מאוד במחיר אם באחד צריך להסיר שלוש שכבות ישנות ולתקן שיפועים. לכן המחיר המחייב ניתן אחרי ביקור, ולא בטלפון.",

  intro: [
    "הטווחים שבטבלה נועדו לתת סדר גודל לפני שמזמינים ביקור, לא להיות הצעת מחיר. הם משתנים לפי מצב הגג בפועל, ואנחנו מעדיפים להגיד את זה מראש מאשר לתת מספר בטלפון ולתקן אותו אחר כך.",
  ],

  /** What actually moves the number. Trade-general; no business fact stated. */
  factorsTitle: "מה קובע את המחיר בפועל",
  factors: [
    {
      title: "שטח הגג",
      body: "הבסיס לחישוב ברוב שיטות האיטום, אבל לא הגורם היחיד — ולעיתים קרובות לא הדומיננטי.",
    },
    {
      title: "כמה שכבות צריך להסיר",
      body: "גג שחודש כמה פעמים נושא ערימת שכבות ישנות. הסרה ופינוי שלהן היא עבודה בפני עצמה, ולעיתים היא החלק היקר יותר מהאיטום עצמו.",
    },
    {
      title: "כמות פרטי הקצה",
      body: "מעקות, נקזים, מעברי צנרת, עיגונים של דודים ומזגנים וחיבורים לקירות. גג קטן עם הרבה פרטים יכול לדרוש יותר עבודה מגג גדול וחלק.",
    },
    {
      title: "מצב המשטח והשיפועים",
      body: "בטון מתפורר, סדקים או שיפוע שמחזיק שלוליות דורשים תיקון לפני האיטום. בלעדיו השכבה החדשה תיכשל באותה נקודה, ולכן זה לא סעיף שאפשר לוותר עליו.",
    },
    {
      title: "סוג הגג והשיטה",
      body: "יריעות, זיפות וציפוי אלסטומרי אינם באותו מחיר ואינם מתאימים לאותם גגות. השיטה נקבעת לפי הגג — לא לפי התקציב.",
    },
    {
      title: "נגישות",
      body: "גובה, אופן הגישה לגג והאם אפשר להביא חומרים בקלות. גג שדורש הנפה או סחיבה ידנית ארוכה מייקר את העבודה בלי קשר לשטח.",
    },
  ],

  /** A checklist the reader can use against ANY contractor. Advice, not a policy claim. */
  quoteTitle: "מה צריכה לכלול הצעת מחיר כתובה",
  quoteIntro:
    "הצעה שאפשר להשוות היא הצעה שכתוב בה מה נעשה, לא רק כמה זה עולה. לפני שאתם מחליטים — בין אם אצלנו ובין אם אצל כל קבלן אחר — כדאי לוודא שההצעה מפרטת את הסעיפים האלה:",
  quoteChecklist: [
    "השטח המדויק שעליו מדובר, במטרים רבועים",
    "שיטת האיטום והחומר שבו משתמשים",
    "האם הסרת שכבות קיימות ופינוי הפסולת כלולים",
    "טיפול בפרטי הקצה — מעקות, נקזים ומעברי צנרת — ולא רק במשטח",
    "תיקוני שיפועים או סדקים, אם נדרשים",
    "מה לא כלול, במפורש",
    "תנאי האחריות בכתב",
  ],

  /** The counter-intuitive section: a cheap quote that grows is the expensive one. */
  warningTitle: "סימנים להצעה שתגדל אחר כך",
  warnings: [
    "מחיר שנמסר בטלפון בלי לראות את הגג",
    "הצעה שלא מזכירה הסרת שכבות קיימות בגג שכבר טופל בעבר",
    "אין שום התייחסות לפרטי קצה, למרות שרוב הנזילות מתחילות שם",
    "אחריות שנאמרת בעל פה ולא נכתבת",
    "הצעה שמורכבת ממספר אחד, בלי פירוט מה הוא כולל",
  ],

  faqs: [
    {
      q: "למה אי אפשר לקבל מחיר בטלפון?",
      a: "כי המשתנים שקובעים את המחיר לא נראים מהטלפון: כמה שכבות ישנות יש על הגג, מה מצב השיפועים, כמה פרטי קצה יש ומה מצב הבטון. מספר שנמסר בלי לראות אותם הוא ניחוש — ובדרך כלל הוא מתברר כנמוך מדי בדיוק אחרי שהעבודה כבר התחילה.",
    },
    {
      q: "מה כדאי לשאול לפני שמזמינים ביקור?",
      a: "שאלו האם הביקור והאבחון כרוכים בתשלום, וכמה; האם הסכום מקוזז מהעבודה אם היא מתבצעת; והאם תקבלו הצעה כתובה בסיום. שלוש השאלות האלה מונעות את רוב אי-ההבנות, וכדאי לשאול אותן כל קבלן שאתם שוקלים.",
    },
    {
      q: "למה שתי הצעות לאותו גג יכולות להיות רחוקות כל כך זו מזו?",
      a: "כמעט תמיד מפני שהן לא מתארות את אותה עבודה. הצעה אחת כוללת הסרת שכבות, תיקון שיפועים וטיפול בפרטי הקצה, והשנייה מציעה שכבה חדשה מעל הקיים. שתיהן נכונות כתיאור של מה שהן מציעות — אבל רק אחת מהן תחזיק. השוו סעיפים, לא סכומים.",
    },
  ],
} as const;

/**
 * Copy for `/about/` (was 149 words).
 *
 * WHAT THIS PAGE MAY AND MAY NOT SAY. Confirmed and free to use: founded 2014, roof waterproofing,
 * Tel Aviv and the centre within ~50 km, and the diagnosis-first positioning from brief.md.
 * Everything below describes METHOD — how the work is sequenced and why — which is a description of
 * practice, not an unverifiable credential.
 *
 * NOT added here, and must not be until docs/business-facts.md §B/§C is answered: the owner's name
 * or years in the trade, team size, licences, insurance, any project count, and any response-time
 * number. Those are the E-E-A-T assets the site is missing, and inventing them would be the exact
 * failure CLAUDE.md §2 rule 1 exists to prevent.
 *
 * NOTE for whoever edits this next: two claims already live on the page — "צוות מקצועי משלנו, בלי
 * קבלני משנה" and the winter-emergency line — are owner-drafted but still tagged 🔶 in brief.md:52
 * and business-facts.md §B/§E. They were left exactly as the owner wrote them and deliberately NOT
 * expanded on. Do not build further copy on top of them until they are confirmed.
 */
export const aboutContent = {
  answerQ: "מי אנחנו ואיך אנחנו עובדים?",
  answerA:
    "גגוליין עוסקת באיטום גגות בתל אביב ובאזור המרכז מאז 2014. שיטת העבודה שלנו מתחילה באבחון: לפני שבוחרים חומר, אנחנו מאתרים מאיפה המים נכנסים בפועל. רק אחר כך נקבעת השיטה, ניתנת הצעה כתובה, ומתבצעת העבודה — עם אחריות בכתב.",

  storyTitle: "למה אנחנו מתחילים באבחון",
  story: [
    "רוב הנזילות שאנחנו נקראים אליהן כבר טופלו קודם. מישהו הגיע, מרח שכבה, וזה החזיק עד הגשם הבא. זה קורה מפני שמים בגג לא נעים בקו ישר: הם זורמים על השיפועים ובין השכבות, והכתם שמופיע בתקרה כמעט לעולם לא נמצא מתחת לנקודת החדירה.",
    "המשמעות המעשית פשוטה — אפשר לאטום גג שלם, בחומר מצוין ובעבודה טובה, ושהנזילה תימשך. לא בגלל שהאיטום נכשל, אלא בגלל שהוא נעשה במקום הלא נכון. לכן הביקור הראשון שלנו הוא בדיקה ולא הצעת מחיר, וכולל בדיקת הצפה כשצריך.",
    "זה גם מה שמאפשר לנו לומר לפעמים שהעבודה קטנה ממה שחשבתם — שמרזב סתום, שעיגון של דוד שמש הוא כל הבעיה, או שהליקוי עדיין באחריות הקבלן שבנה. אמירה כזו מקטינה את העבודה שלנו, ואנחנו אומרים אותה בכל זאת.",
  ],

  principlesTitle: "העקרונות שאנחנו עובדים לפיהם",
  principles: [
    {
      title: "אבחון לפני חומר",
      body: "אף עבודה לא מתחילה לפני שידוע מאיפה המים נכנסים. שיטה נבחרת לפי הגג, לא לפי מה שנוח לספק.",
    },
    {
      title: "הצעה כתובה ומפורטת",
      body: "מה נכלל, מה לא נכלל ובאיזו שיטה — לפני שמתחילים. הצעה שמורכבת ממספר אחד היא הצעה שאי אפשר להשוות.",
    },
    {
      title: "הכנת משטח, לא רק שכבה",
      body: "רוב כשלי האיטום שאנחנו רואים הם כשלי הכנה ולא כשלי חומר. שכבה חדשה על משטח מתקלף תיכשל גם אם החומר מצוין.",
    },
    {
      title: "אחריות בכתב",
      body: "מה מכוסה ולכמה זמן — כתוב, ונמסר לפני תחילת העבודה ולא אחריה.",
    },
    {
      title: "לומר גם כשזה לא הפתרון",
      body: "כשגג במצב מבני ירוד, איטום הוא טלאי יקר. במקרה כזה נסביר מה באמת צריך לעשות, גם אם זו לא העבודה שלנו.",
    },
  ],

  whoTitle: "עם מי אנחנו עובדים",
  who: "בעלי בתים פרטיים, ועדי בתים ובניינים משותפים, מנהלי נכסים ובתי עסק. בבניין משותף אנחנו מוסרים הצעה כתובה שהוועד יכול להציג לדיירים, ומפרטים בה במיוחד את הטיפול בפרטי הקצה ובנקזים — שם מתחילות רוב הנזילות שמופיעות בדירות העליונות.",

  areaTitle: "איפה אנחנו עובדים",
  area: "תל אביב וכל אזור המרכז, ברדיוס של עד כ-50 ק״מ — מגוש דן, דרך השרון ועד דרום המרכז והשפלה. אנחנו בודקים כל פנייה לפי המיקום המדויק ואומרים מראש אם היא בטווח.",

  /**
   * Scope, stated as what we do NOT do. This is a statement about the boundary of the trade, not a
   * credential, so it is free to state — and it saves both sides a wasted visit. It matches the
   * `excluded` lists already on every service page in lib/service-depth.ts.
   */
  notUsTitle: "מה אנחנו לא עושים",
  notUs: [
    "עבודות בנייה כלליות, שיפוצים או שינוי מבני של הגג",
    "החלפת צנרת, מערכות מיזוג או דודים — אנחנו אוטמים סביבם ומטפלים בנקודות החדירה שלהם",
    "טיפול מבני בבטון מתפורר או בברזל זיון חשוף. במקרה כזה נגיד לכם שזה מה שנדרש, ושאיטום לבדו יהיה טלאי יקר",
    "הצעות מחיר בטלפון, בלי לראות את הגג",
  ],
  notUsOutro:
    "הגבולות האלה הם לא סייג באותיות קטנות — הם מה שמאפשר לנו להתמחות בדבר אחד ולעשות אותו כמו שצריך.",
} as const;

/**
 * Copy for the `/services/` hub (was 242 words, and every one of them came from the shared
 * ServicesGrid — the page had no prose of its own at all).
 *
 * Its job is to help someone choose, which the grid of eight tiles does not do. Everything here is
 * trade-general: which service answers which symptom. No business fact, no price, no warranty term.
 */
export const servicesContent = {
  answerQ: "איזה שירות איטום מתאים לגג שלכם?",
  answerA:
    "זה תלוי בשאלה אחת: האם ידוע מאיפה המים נכנסים. אם לא — מתחילים באיתור מקור הנזילה, כי איטום במקום הלא נכון לא יעצור אותה. אם כן, השיטה נקבעת לפי סוג הגג ומצב השכבה הקיימת: יריעות, זיפות או ציפוי אלסטומרי.",

  intro: [
    "שמונה השירותים שלמטה אינם שמונה מוצרים מתחרים — הם תשובות לבעיות שונות. גג בטון שטוח, מרפסת מרוצפת, קיר חיצוני ומרתף נכשלים בדרכים שונות, וכל אחד מהם דורש שיטה אחרת.",
  ],

  /** Symptom → service. The routing the tile grid cannot express. */
  chooseTitle: "לפי מה לבחור",
  choose: [
    {
      symptom: "יש נזילה ולא ברור מאיפה",
      answer: "מתחילים באיתור מקור הנזילה, כולל בדיקת הצפה כשצריך",
      slug: "leak-detection",
    },
    {
      symptom: "כתם רטיבות בתקרת הקומה העליונה",
      answer: "בדרך כלל איטום גג — אחרי שמאתרים את נקודת החדירה",
      slug: "roof-sealing",
    },
    {
      symptom: "הגג טופל בעבר והשכבה התבלתה",
      answer: "זיפות הוא לרוב החידוש הכלכלי, אם המשטח עצמו תקין",
      slug: "roof-tarring",
    },
    {
      symptom: "נדרשת שכבה עמידה במיוחד",
      answer: "יריעות ביטומניות בהלחמה",
      slug: "bituminous-sheets",
    },
    {
      symptom: "רטיבות בתקרה מתחת למרפסת מרוצפת",
      answer: "איטום מרפסת — לרוב בלי להרים את הריצוף",
      slug: "balcony-sealing",
    },
    {
      symptom: "רטיבות בקיר, בעיקר אחרי גשם עם רוח",
      answer: "איטום קירות חיצוניים — הבעיה איננה בגג",
      slug: "exterior-wall-sealing",
    },
    {
      symptom: "רטיבות במרתף או בקיר תת-קרקעי",
      answer: "איטום מרתפים — לחץ מים מהקרקע, לא מלמעלה",
      slug: "basement-sealing",
    },
    {
      symptom: "הדירה העליונה חמה מאוד בקיץ",
      answer: "סיוד והלבנת גגות — מוריד חום, אך אינו תחליף לאיטום",
      slug: "roof-whitening",
    },
  ],
} as const;
