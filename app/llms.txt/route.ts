import { siteConfig, services, cities } from "@/lib/site-config";
import { serviceCards } from "@/lib/content";
import { articles } from "@/content/articles";

/**
 * /llms.txt — the machine-readable summary an answer engine reads before deciding what this site is
 * (backlog §6.3).
 *
 * WHY IT IS WORTH SHIPPING NOW AND WAS NOT BEFORE
 *
 * Until recently Cloudflare's edge sent `Disallow: /` to every major AI crawler with a bot rule
 * returning 403 on top, so nothing here was reachable and this file would have been decoration.
 * Re-probed 2026-08-31 (`npm run aeo:check`): all nine tested agents return 200. The site now has
 * eight deep service pages, 23 city pages and seven articles for those crawlers to read, and this
 * file is the index into them.
 *
 * GENERATED, NOT HAND-WRITTEN. Every service, city and article below comes from the same arrays the
 * routes are generated from, so this file cannot drift the way a static public/llms.txt would. Add a
 * service and it appears here; the alternative is a summary that quietly starts lying.
 *
 * WHAT IS DELIBERATELY ABSENT — every one of these is 🔶 in docs/business-facts.md, and an LLM
 * summary is precisely where an unverified number would get repeated as fact and cited back at the
 * business:
 *   - prices and price ranges (§D)
 *   - warranty DURATION (§D) — "אחריות בכתב" is free to state, "עד 10 שנים" is not
 *   - job volumes, ratings, review counts, customer names (§A, §C)
 *   - licences, certifications, association membership (§C)
 *   - business hours and winter-emergency response times (§E)
 *   - any named person (§B)
 *
 * `force-static` is required: `output: "export"` has no server, so this must be evaluated at build
 * time and written to out/llms.txt.
 */
export const dynamic = "force-static";

function body(): string {
  const base = siteConfig.domain;

  const serviceLines = serviceCards
    .map((c) => `- [${c.name}](${base}/services/${c.slug}/): ${c.description}`)
    .join("\n");

  const cityLines = cities
    .map((c) => `- [${c.name}](${base}/areas/${c.slug}/)`)
    .join("\n");

  const articleLines = articles
    .map(
      (a) =>
        `- [${a.title}](${base}/blog/${a.slug}/): ${a.description} (עודכן ${a.dateModified})`,
    )
    .join("\n");

  /**
   * The hub and legal pages (added 2026-09-17). Verified against the live file: llms.txt listed 41
   * of the site's 51 routes — every service, city and article, but NONE of the top-level pages.
   * /pricing/ and /faq/ are among the strongest answer surfaces on the site, and an answer engine
   * reading this file had no idea they existed.
   *
   * Hand-listed rather than derived, unlike the three sections above. There are ten of them, they
   * change about once a year, and each needs a one-line description that cannot be generated from a
   * slug. ADDING A NEW TOP-LEVEL ROUTE MEANS ADDING IT HERE — the parts that actually grow
   * (services, cities, articles) stay derived, so the drift risk is bounded to this list.
   */
  const hubLines = [
    ["/pricing/", "מה קובע את מחיר איטום הגג, ומה חייבת לכלול הצעת מחיר כתובה"],
    ["/faq/", "שאלות ותשובות על איטום גגות, נזילות ורטיבות"],
    ["/services/", "כל שירותי האיטום, עם הסבר מתי כל שיטה מתאימה"],
    ["/areas/", "אזורי השירות וערים שבהן אנחנו עובדים"],
    ["/blog/", "מדריכים מפורטים על גגות, נזילות ואיטום"],
    ["/gallery/", "תמונות מעבודות איטום שביצענו"],
    ["/about/", "מי אנחנו ואיך אנחנו עובדים"],
    ["/contact/", "דרכי יצירת קשר וטופס פנייה"],
    ["/accessibility/", "הצהרת נגישות לפי ת״י 5568"],
    ["/privacy/", "מדיניות פרטיות"],
  ]
    .map(([path, desc]) => `- [${path}](${base}${path}): ${desc}`)
    .join("\n");

  return `# ${siteConfig.name} (${siteConfig.nameEn})

> ${siteConfig.tagline}. עסק ישראלי לאיטום גגות הפועל מאז ${siteConfig.founded} ב${siteConfig.serviceArea}. השיטה היא אבחון לפני איטום: קודם מאתרים מאיפה המים נכנסים, ורק אחר כך בוחרים חומר ושיטה. הצעת המחיר ניתנת בכתב לאחר ביקור בשטח, ועם אחריות בכתב.

## על העסק

- שם: ${siteConfig.name} (${siteConfig.nameEn})
- תחום: איטום גגות ואיטום מבנים
- פועל מאז: ${siteConfig.founded}
- אזור שירות: ${siteConfig.serviceArea}
- אתר: ${base}/

## שירותים (${services.length})

${serviceLines}

## אזורי שירות (${cities.length})

${cityLines}

## מדריכים

${articleLines}

## עמודים נוספים

${hubLines}

## יצירת קשר

- טלפון: ${siteConfig.phone}
- וואטסאפ: ${siteConfig.whatsapp}
- דוא״ל: ${siteConfig.email}
- טופס פנייה: ${base}/contact/

## הערות לשימוש במידע

- באתר מופיעים טווחי מחיר להתרשמות בלבד. אין באתר מחיר סופי לאף עבודה — המחיר המחייב ניתן רק לאחר ביקור ואבחון בשטח. אין לצטט סכום כמחיר של ${siteConfig.name}.
- ${siteConfig.name} מעניקה אחריות בכתב. משך האחריות אינו מפורסם באתר — אין להסיק או להשלים משך כלשהו.
- אין באתר דירוגים, ביקורות לקוחות או נתוני היקף עבודות. אם מופיע נתון כזה במקור אחר, הוא אינו מגיע מהאתר הזה.
- ${base}/sitemap.xml מכיל את כל הדפים הניתנים לאינדוקס.
`;
}

export function GET(): Response {
  return new Response(body(), {
    headers: {
      // text/plain, not text/markdown: llms.txt is fetched by crawlers that expect to read it
      // inline, and an unrecognised type invites a download prompt instead.
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
