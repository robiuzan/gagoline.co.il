/**
 * gagoline.co.il — the homepage updates strip (fleet live-kit). The newest three show after the
 * answer block; /assets/live.js hides the strip once the newest item is 45 days old, so a quiet
 * month shows nothing rather than old news. A new item is a real content change.
 *
 * Each item: { date: "YYYY-MM-DD" (the day it happened, never in the future), text (≤ 140,
 * no typed phone number, no price, no promise), href (a page of this site), linkLabel (≤ 18),
 * source (the fact it rests on) }. One item per date. scripts/live/check-live-register.mjs
 * enforces it. Never a customer, street, review, count, price or response time.
 *
 * ✅ APPROVED by the owner on 2026-10-12, on the fleet wording sign-off page — approved fingerprint
 *   90bebafded0d (sha256 of _campaigns.mjs + _updates.mjs as approved). A wording change needs a
 *   new approval; the build refuses a register without its `approved` stamp.
 */
export default {
  approved:
    "2026-10-12 — Robi (owner), fleet wording sign-off page, fingerprint 90bebafded0d",
  heading: "עדכונים אחרונים",
  items: [
    {
      date: "2026-09-16",
      text: "מדריך חדש: למה שני גגות באותו גודל מקבלים הצעות שונות לגמרי – ההבדלים בין סוגי הגגות.",
      href: "/blog/roof-sealing-cost-by-roof-type/",
      linkLabel: "לקריאת המדריך",
      source:
        "content/articles/roof-sealing-cost-by-roof-type.ts — datePublished 2026-09-16",
    },
    {
      date: "2026-08-24",
      text: "עלו לאתר מדריכים לגג: איך מאתרים מאיפה המים נכנסים, רטיבות בקיר או בגג, וכמה זמן מחזיק איטום.",
      href: "/blog/",
      linkLabel: "לכל המדריכים",
      source: "content/articles/*.ts — seven guides with datePublished 2026-08-24",
    },
  ],
};
