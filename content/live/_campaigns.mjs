/**
 * gagoline.co.il — the announcement bar's lines and when each one shows, plus the one seasonal
 * card. Fleet live-kit register (3locksmiths.co.il/fleet/live-kit; the pilot's
 * content/enriched/_campaigns.mjs explains every field). Checked by
 * scripts/live/check-live-register.mjs before every build.
 *
 * ✅ APPROVED by the owner on 2026-10-12, on the fleet wording sign-off page — approved fingerprint
 *   90bebafded0d (sha256 of _campaigns.mjs + _updates.mjs as approved). A wording change needs a
 *   new approval; the build refuses a register without its `approved` stamp.
 *
 * THE RULES (fleet-wide)
 *   - A tip must be something this site already says: `source` quotes the sentence, in the file
 *     that holds it, and the gate checks the sentence is still there.
 *   - No offers, prices, warranty terms, hours, emergency or speed promises (live.config.mjs
 *     claims + the fleet list). Nothing here is 🔶 in docs/business-facts.md.
 *   - One row: a seasonal line ≤ 46 characters as read (with its link label); evergreen ≤ 70.
 *   - Never type a phone number: {phone}, {whatsapp:<word>}.
 *   - Quiet days silence every line; Shabbat and chag silence the seasonal ones (the fleet
 *     calendar, content/live/_calendar.json — synced from the pilot, never edited here).
 *   - from/until carry Israel's offset for that date: +03:00 until 25/10/2026, +02:00 from then
 *     until 26/03/2027, +03:00 again until 31/10/2027.
 */
export default {
  approved:
    "2026-10-12 — Robi (owner), fleet wording sign-off page, fingerprint 90bebafded0d",
  ui: { close: "סגירה" },

  // From 1024px whenever nothing seasonal shows, and the JavaScript-off state. A photo of the
  // stain is the one thing a visitor can send that helps — and the site says to take it.
  evergreen: {
    topbar: { text: "יש כתם או נזילה? צלמו ושלחו לנו ב{whatsapp:וואטסאפ}" },
    source:
      "content/articles/roof-sealing-before-winter.ts — ״צלמו את הכתם ורשמו את השעה ואת תנאי הגשם.״ · lib/content.ts — ״התקשרו או שלחו וואטסאפ.״",
  },

  // The fleet's pre-written wartime line (wording confirmed for 3locksmiths 2026-10-04), shown
  // only while the status switch says `reduced`, on every page. Confirmed for THIS business by
  // the owner on 2026-10-12 (fleet wording sign-off page): גגוליין keeps working under Home
  // Front Command restrictions.
  reduced: {
    topbar: { text: "פועלים בכפוף להנחיות פיקוד העורף" },
    source:
      "3locksmiths.co.il docs/business-facts.md §D.12 (wording confirmed by the owner 2026-10-04) · fleet rollout decision 2026-10-11 · confirmed for gagoline.co.il by the owner 2026-10-12 (fleet wording sign-off page)",
  },

  windows: [
    // The first rains — the check the guide asks for, and the season's one card.
    {
      id: "after-rains-2026",
      variant: "after-rains",
      kind: "seasonal",
      from: "2026-10-15T08:00:00+03:00",
      until: "2026-12-15T00:00:00+02:00",
      priority: 30,
      topbar: {
        text: "מים על הגג יומיים אחרי גשם מסמנים בעיה",
        link: { label: "למדריך", href: "/blog/roof-sealing-before-winter/" },
      },
      dialog: {
        title: "ירד אצלכם גשם?",
        body: "עלו לגג יומיים אחרי גשם: מים שנשארים מסמנים היכן האיטום ייכשל. ראיתם כתם בתקרה? צלמו אותו ורשמו מתי הופיע.",
        call: "חייגו {phone}",
        whatsapp: "וואטסאפ",
        link: { label: "מה בודקים בגג", href: "/blog/roof-sealing-before-winter/" },
        capDays: 14,
      },
      source:
        "content/articles/roof-sealing-before-winter.ts — ״שלוליות — עלו לגג יומיים אחרי גשם. מים שנשארים מסמנים היכן האיטום ייכשל.״ · ״צלמו את הכתם ורשמו את השעה…״",
    },

    // Mid-winter: an active leak is easier to trace, so this is a good time to look for it.
    {
      id: "winter-leak-2027",
      variant: "winter-leak",
      kind: "seasonal",
      from: "2026-12-15T00:00:00+02:00",
      until: "2027-03-01T00:00:00+02:00",
      priority: 20,
      topbar: {
        text: "בחורף, נזילה פעילה קלה יותר לאיתור",
        link: { label: "פרטים", href: "/services/leak-detection/" },
      },
      source: "lib/service-depth.ts — ״נזילה פעילה קלה יותר לאיתור מנזילה שהתייבשה.״",
    },

    // After the winter: a leak that stopped did not seal itself.
    {
      id: "spring-check-2027",
      variant: "spring-check",
      kind: "seasonal",
      from: "2027-03-01T00:00:00+02:00",
      until: "2027-05-15T00:00:00+03:00",
      priority: 20,
      topbar: {
        text: "נזילה שנעלמה לא נסגרה מעצמה",
        link: { label: "למדריך", href: "/blog/roof-sealing-before-winter/" },
      },
      source:
        "content/articles/roof-sealing-before-winter.ts — ״נזילה שנעלמה לא נסגרה מעצמה.״",
    },

    // Before the heat: roof whitening is a before-summer job.
    {
      id: "whitening-2027",
      variant: "whitening",
      kind: "seasonal",
      from: "2027-05-15T00:00:00+03:00",
      until: "2027-07-15T00:00:00+03:00",
      priority: 20,
      topbar: {
        text: "הלבנת גג עושים לקראת הקיץ, לא לפני החורף",
        link: { label: "פרטים", href: "/services/roof-whitening/" },
      },
      source:
        "lib/service-depth.ts — ״זו עבודה עונתית שכדאי לבצע לקראת הקיץ, לא לפני החורף.״",
    },

    // Late summer: the window for sealing before the next winter.
    {
      id: "late-summer-2027",
      variant: "late-summer",
      kind: "seasonal",
      from: "2027-08-01T00:00:00+03:00",
      until: "2027-10-15T00:00:00+03:00",
      priority: 20,
      topbar: {
        text: "סוף הקיץ: הזמן לאטום לקראת החורף",
        link: { label: "למדריך", href: "/blog/roof-sealing-before-winter/" },
      },
      source:
        "content/articles/roof-sealing-before-winter.ts — ״סוף הקיץ ותחילת הסתיו — בערך מאוגוסט עד אוקטובר.״",
    },
  ],
};
