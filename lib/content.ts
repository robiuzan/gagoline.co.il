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
 * internal signal on the two pages that best demonstrated it was unfinished.
 *
 * "גלריה" was restored 2026-08-27 with four verified photographs. "המלצות" stays out until
 * real reviews land — inventing them is what got the originals deleted.
 */
export const navItems = [
  { label: "השירותים שלנו", href: "/services/" },
  { label: "אזורי שירות", href: "/areas/" },
  { label: "גלריה", href: "/gallery/" },
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
  /** The /pricing/ quote block (backlog §8.8). Promises nothing the site does not already promise. */
  formTitle: "רוצים מחיר מדויק לגג שלכם?",
  formIntro:
    "הטווחים למעלה נותנים סדר גודל. המספר האמיתי תלוי בשטח, במצב המשטח ובכמה פרטי קצה יש — ואת זה רואים רק על הגג. השאירו פרטים ונחזור אליכם לתיאום ביקור.",
  formPoints: [
    "ביקור ואבחון בשטח — איתור מקור הנזילה לפני שמדברים על פתרון",
    "הצעה בכתב, מפורטת לפי שלבים",
    "ללא התחייבות",
  ],
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

/**
 * `/gallery/` — photographs of waterproofing work.
 *
 * ⚠️ PROVENANCE, NOT LAYOUT, IS THE POINT OF THIS BLOCK. A portfolio gallery asserts "this is our
 * work", so every image here is a business fact under CLAUDE.md rule 1 — the same rule that got the
 * three invented testimonials deleted on 2026-08-17. An unsourced photo is a fabricated review with
 * better production values.
 *
 * Ten photos were supplied on 2026-08-27 and SIX WERE REJECTED. Do not re-add them:
 *   gagoline_9, gagoline_10 — AI-generated. _9 carries an invented product ("MEMBRANE PRO-SERIES /
 *                             ROOFSEAL-X4") and a smear of garbled glyphs where a logo would sit.
 *   gagoline_4              — a THIRD PARTY's branding ("ULTRA-SEAL PRECISION FLASHING SYSTEMS")
 *                             over a North American skyline.
 *   gagoline_2, _5, _8      — stock photography; _2 is a northern-European tile roof.
 *
 * The four kept are Israeli sites, with real manufacturer stamping and no foreign branding.
 *
 * `alt` and `caption` describe ONLY what is inside the frame. No city, no date, no customer, no
 * מ״ר, and no לפני/אחרי — none of that is sourced (docs/business-facts.md §A), and a caption can
 * fabricate a fact exactly as easily as a testimonial can. Dimensions are the intrinsic pixel size
 * of each file and are emitted on the <img>, so the grid reserves its boxes and CLS stays flat.
 */
export const galleryImages = [
  {
    src: "/gagoline_1.jpg",
    width: 1000,
    height: 1000,
    alt: "גג שטוח מכוסה יריעות ביטומניות, עם פתח ניקוז ורשת ומעטפת איטום סביב ארובה נמוכה",
    caption:
      "יריעות ביטומניות פרוסות על כל שטח הגג, עם טיפול נקודתי סביב פתח הניקוז והארובה.",
  },
  {
    src: "/gagoline_7.jpg",
    width: 1000,
    height: 1000,
    alt: "גג שטוח מכוסה יריעות ביטומניות עם הטבעת יצרן, ואיטום סביב צרור צינורות בולטים",
    caption: "יריעות ביטומניות בעובי 4 מ״מ, עם איטום סביב צרור הצינורות שבמרכז הגג.",
  },
  {
    src: "/gagoline_6.jpg",
    width: 1334,
    height: 1000,
    alt: "עובד ברתמת בטיחות מורח איטום נוזלי במברשת סביב צינור חודר בגג פח",
    caption:
      "איטום נוזלי סביב חדירת צינור בגג פח — נקודות החדירה הן המקום שממנו נזילות מתחילות.",
  },
  {
    src: "/gagoline_3.jpg",
    width: 1777,
    height: 1000,
    alt: "גג משופע בשלב עבודה — יריעת איטום פרוסה על המשטח, לטות עץ מעליה וערימות רעפים מוכנות להנחה",
    caption:
      "בגג רעפים האיטום נמצא מתחת לרעפים: היריעה נפרסת על המשטח, ורק אחר כך חוזרות הלטות והרעפים.",
  },
] as const;

/** Copy for `/gallery/`. Deliberately free of counts, locations and dates — none are sourced. */
export const galleryContent = {
  intro:
    "תמונות מעבודות איטום — יריעות ביטומניות על גגות שטוחים, איטום נוזלי סביב חדירות בגג פח, ואיטום שנפרס מתחת לרעפים. לכל גג יש נקודת תורפה משלו, ורוב הנזילות מתחילות בדיוק במקומות שנראים כאן: פתחי ניקוז, צינורות חודרים וחיבורים.",
  cta: "רוצים לדעת מה מתאים לגג שלכם? התקשרו אלינו ונסביר בדיוק מה נדרש.",
} as const;

/**
 * Copy for the lead form (backlog §8.4, §8.5).
 *
 * The errors are PER FIELD. The form used to render one generic "נא למלא שם וטלפון" at the bottom
 * for every failure, which told a visitor whose phone number was malformed nothing about what to
 * change — and told a screen-reader user nothing about which field to go back to.
 *
 * The consent line is a plain statement rather than a checkbox: a required checkbox is friction on
 * the site's third-priority conversion path, and the wording only restates what `/privacy/` already
 * commits to ("לצורך מתן מענה והצעת מחיר בלבד"). Do not widen it beyond what that page says.
 */
export const leadFormContent = {
  errors: {
    name: "נשמח לדעת איך לפנות אליכם.",
    phoneMissing: "בלי מספר טלפון לא נוכל לחזור אליכם.",
    phoneInvalid: "המספר לא נראה שלם. אפשר לכתוב 050-0000000 או 03-0000000.",
    send: "השליחה נכשלה — פתחנו לכם וואטסאפ עם הפרטים, כדי שהפנייה לא תלך לאיבוד.",
  },
  /** Split around the `/privacy/` link, which is rendered between `lead` and `tail`. */
  consent: {
    lead: "בשליחת הטופס אתם מאשרים שנחזור אליכם בטלפון או בוואטסאפ. הפרטים משמשים למתן מענה והצעת מחיר בלבד, בהתאם ל",
    linkLabel: "מדיניות הפרטיות",
    tail: ".",
  },
} as const;

/**
 * Copy for `/thank-you/` — the post-submission route the form navigates to on a CONFIRMED send
 * (backlog §8.6, §13.6). Its whole reason to exist is that a URL can be counted and an inline state
 * swap cannot.
 *
 * ⚠️ NO RESPONSE TIME APPEARS HERE, deliberately. "Real response time per distance band" is 🔶 in
 * docs/business-facts.md §E — the site claims "מענה מהיר" sitewide with no number behind it, and a
 * thank-you page is exactly where a fabricated "תוך שעה" would feel natural and be a promise the
 * business never made. Add one only when §E is filled in.
 *
 * The three steps restate the diagnosis-first positioning already live in `FinalCta`; they add no
 * commitment the site does not already make.
 */
export const thankYouContent = {
  intro: "הפרטים הגיעו אלינו. נחזור אליכם כדי לשמוע מה קורה בגג ולתאם ביקור אבחון.",
  stepsHeading: "מה קורה עכשיו",
  steps: [
    {
      title: "שיחת טלפון",
      body: "נתקשר כדי להבין מה בדיוק קורה — איפה מופיעה הרטיבות, מתי היא התחילה, ומה כבר ניסיתם.",
    },
    {
      title: "ביקור ואבחון בשטח",
      body: "מגיעים לגג ומאתרים את מקור הנזילה. לפני שאנחנו אוטמים — אנחנו מבינים מאיפה הנזילה מגיעה.",
    },
    {
      title: "הצעת מחיר שקופה",
      body: "מפרטים מה נדרש, באיזו שיטה ולמה, בלי הפתעות. ללא התחייבות.",
    },
  ],
  urgentHeading: "צריכים מענה מיידי?",
  urgentBody: "אם יש נזילה פעילה עכשיו, אל תחכו לשיחה חוזרת — התקשרו או שלחו וואטסאפ.",
  meanwhile:
    "בינתיים אפשר לראות עבודות איטום שביצענו, או לקרוא מדריכים על הכנת הגג לחורף.",
} as const;

/**
 * Which services genuinely relate to which (backlog §9.4).
 *
 * `app/services/[service]/page.tsx` used to pick related services with
 * `serviceCards.filter(c => c.slug !== card.slug).slice(0, 4)` — which always returns the first four
 * entries of the array. So the four services that happen to sit at the top of `services` were linked
 * from all eight pages, and `leak-detection`, `exterior-wall-sealing`, `roof-whitening` and
 * `basement-sealing` were linked from almost none. Internal equity followed declaration order, and
 * so did the reader.
 *
 * Every pairing below is a real relationship a customer would recognise — the method used, the
 * cheaper alternative, the diagnosis that comes first, or the place the leak turns out to actually
 * be. `roof-sealing` and `leak-detection` appear most often, and that is correct rather than
 * accidental: one is the head service and the other is the step that precedes almost everything.
 */
export const relatedServices: Record<ServiceSlug, readonly ServiceSlug[]> = {
  // The head service: the method, the diagnosis before it, the cheaper alternative, the finish after.
  "roof-sealing": [
    "bituminous-sheets",
    "leak-detection",
    "roof-tarring",
    "roof-whitening",
  ],
  // Tarring is chosen against sealing, so it links to what it is being compared with.
  "roof-tarring": [
    "roof-sealing",
    "bituminous-sheets",
    "leak-detection",
    "roof-whitening",
  ],
  // The material. Same material at smaller scale is a balcony.
  "bituminous-sheets": [
    "roof-sealing",
    "roof-tarring",
    "balcony-sealing",
    "leak-detection",
  ],
  // Detection ends in one of four places — the roof, a wall, a balcony or a basement.
  "leak-detection": [
    "roof-sealing",
    "exterior-wall-sealing",
    "balcony-sealing",
    "basement-sealing",
  ],
  "balcony-sealing": [
    "leak-detection",
    "bituminous-sheets",
    "exterior-wall-sealing",
    "roof-sealing",
  ],
  // The "it isn't the roof" answer, so detection is its most relevant neighbour.
  "exterior-wall-sealing": [
    "leak-detection",
    "balcony-sealing",
    "basement-sealing",
    "roof-sealing",
  ],
  // Whitening is NOT a substitute for sealing — linking to sealing first is the honest ordering.
  "roof-whitening": [
    "roof-sealing",
    "roof-tarring",
    "bituminous-sheets",
    "leak-detection",
  ],
  // Water under pressure from the ground, not falling from above — closer to walls than to roofs.
  "basement-sealing": [
    "leak-detection",
    "exterior-wall-sealing",
    "balcony-sealing",
    "roof-sealing",
  ],
};

/**
 * The homepage answer block (backlog §6.2).
 *
 * 44 of the site's 53 routes already open with a question-form H2 and a self-contained answer; the
 * homepage was one of the nine that did not — and it is the page most likely to be retrieved for the
 * head term. An answer engine quoting this site for "איטום גגות תל אביב" had nothing short and
 * self-contained to lift.
 *
 * Every claim here is on the "free to state" list in docs/content-standards.md §6: the
 * diagnosis-first method as a described process, a written quote, and "אחריות בכתב" as an
 * unqualified statement that a written warranty is given. NO duration, NO price, NO volume — all
 * three are still 🔶.
 */
export const homeAnswer = {
  q: "איך בוחרים קבלן לאיטום גג?",
  a: "לפני שאוטמים צריך לדעת מאיפה המים נכנסים. קבלן שנוקב במחיר בטלפון, בלי לראות את הגג, מנחש — ולכן גם טועה. אנחנו מגיעים לגג, מאתרים את נקודת החדירה, ומסבירים איזו שיטה מתאימה למשטח שלכם. ההצעה נמסרת בכתב, מפורטת לפי שלבים, ועם אחריות בכתב.",
} as const;

/**
 * Copy for `/404/` (backlog §1.9).
 *
 * The page was a scaffold: an H1 reading "404", one line of Hebrew and a link home. In season, a
 * visitor who lands here has a leak and no patience — sending them to the homepage to start the
 * navigation again is the expensive option. The recovery routes are the three things they could
 * plausibly have been looking for, plus the phone.
 */
export const notFoundContent = {
  title: "הדף לא נמצא",
  intro:
    "הכתובת שהגעתם אליה לא קיימת — ייתכן שהיא הוסרה או שנפלה טעות בהקלדה. אם יש נזילה עכשיו, מהיר יותר פשוט להתקשר.",
  linksHeading: "אולי חיפשתם",
} as const;

/**
 * Which service pages carry one of the four verified photographs (backlog §7.3).
 *
 * THREE OF EIGHT, AND THE FIVE OMISSIONS ARE THE POINT.
 *
 * The four photographs in `galleryImages` show bituminous sheets on flat roofs, liquid sealing
 * around a pipe penetration on a metal roof, and membrane going down under roof tiles. That is what
 * is inside the frames. Putting one of them on the זיפות, מרפסות, קירות חיצוניים, סיוד or מרתפים
 * page would present a photograph of one kind of work as an example of a different kind — which is
 * the same category of fabrication as an invented testimonial, just harder to notice.
 * docs/business-facts.md §A: "a photo presented as our work that isn't" is never permitted, and
 * "our work, but not this work" fails for the same reason.
 *
 * NO PHOTOGRAPH GOES ON A CITY PAGE, for the same reason at one remove: a photo on /areas/netanya/
 * asserts that this roof is in נתניה, and no location is sourced for any of the four.
 *
 * The other five pages link to /gallery/ in context instead, which is true and still useful.
 */
export const serviceImage: Partial<Record<ServiceSlug, (typeof galleryImages)[number]>> =
  {
    // Bituminous sheets over a whole flat roof, with the drain and chimney detailed — roof sealing.
    "roof-sealing": galleryImages[0],
    // The same material, photographed close enough to read the manufacturer stamping.
    "bituminous-sheets": galleryImages[1],
    // Liquid sealing worked around a pipe penetration: penetrations are where leaks start.
    "leak-detection": galleryImages[2],
  };
