/**
 * ai-crawler-check.mjs — proves, against the LIVE site, that AI crawlers can still reach it.
 *
 * WHY THIS EXISTS
 *
 * From 2026-08-16 to some point before 2026-08-31, Cloudflare's managed robots.txt prepended
 * `Disallow: /` for every major AI crawler, and an enforced bot rule returned 403 to five assistant
 * agents on top of it. That capped the entire AEO/GEO goal, and NO repo change could override it —
 * `app/robots.ts` emits a file the edge was rewriting. It was found by probing production, and it
 * would never have been found any other way.
 *
 * The block is gone now. It can come back the same way it arrived: a zone toggle, by someone who is
 * not in this repo, with no commit, no deploy and no signal. This script is the tripwire.
 *
 * TWO THINGS ARE CHECKED, AND THE SECOND IS THE ONE THAT MATTERS
 *
 *   1. The SERVED /robots.txt — advisory. It states a policy crawlers may honour.
 *   2. A user-agent PROBE — enforcement. A bot rule can return 403 while robots.txt says Allow.
 *
 * Checking only (1) is how an enforced block hides. Both must pass.
 *
 * NOT part of `npm run gate`: it needs network and it hits production, so it cannot gate a build.
 * Run it after any Cloudflare change, and before any AEO work is reported as done.
 *
 * Usage: node scripts/ai-crawler-check.mjs [origin]     (default: https://gagoline.co.il)
 */

const ORIGIN =
  process.argv.slice(2).find((a) => !a.startsWith("-")) ?? "https://gagoline.co.il";

/**
 * The agents that decide whether this site can appear in AI answers. Split deliberately:
 * a SEARCH/citation agent fetches a page to answer a question right now — losing one costs
 * visibility today. A TRAINING agent affects long-term model knowledge. If a trade-off is ever
 * forced, keep the citation agents.
 */
const AGENTS = [
  {
    name: "OAI-SearchBot",
    kind: "citation",
    ua: "Mozilla/5.0 (compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot)",
  },
  {
    name: "ChatGPT-User",
    kind: "citation",
    ua: "Mozilla/5.0 (compatible; ChatGPT-User/1.0; +https://openai.com/bot)",
  },
  {
    name: "Claude-SearchBot",
    kind: "citation",
    ua: "Mozilla/5.0 (compatible; Claude-SearchBot/1.0; +claudebot@anthropic.com)",
  },
  {
    name: "Claude-User",
    kind: "citation",
    ua: "Mozilla/5.0 (compatible; Claude-User/1.0; +claudebot@anthropic.com)",
  },
  {
    name: "PerplexityBot",
    kind: "citation",
    ua: "Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)",
  },
  {
    name: "GPTBot",
    kind: "training",
    ua: "Mozilla/5.0 (compatible; GPTBot/1.1; +https://openai.com/gptbot)",
  },
  {
    name: "ClaudeBot",
    kind: "training",
    ua: "Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)",
  },
  {
    name: "Google-Extended",
    kind: "training",
    ua: "Mozilla/5.0 (compatible; Google-Extended)",
  },
  {
    name: "CCBot",
    kind: "training",
    ua: "Mozilla/5.0 (compatible; CCBot/2.0; +https://commoncrawl.org/faq/)",
  },
];

const failures = [];

/** Parse robots.txt into { agent -> "allow" | "disallow" }, honouring stacked User-Agent groups. */
function parseRobots(txt) {
  const verdict = new Map();
  let group = [];
  let sawRule = false;
  for (const raw of txt.split("\n")) {
    const line = raw.replace(/#.*$/, "").trim();
    if (!line) continue;
    const [field, ...rest] = line.split(":");
    const key = (field ?? "").trim().toLowerCase();
    const value = rest.join(":").trim();
    if (key === "user-agent") {
      // A User-Agent after a rule starts a NEW group; consecutive ones stack into the same group.
      if (sawRule) {
        group = [];
        sawRule = false;
      }
      group.push(value.toLowerCase());
    } else if (key === "allow" || key === "disallow") {
      sawRule = true;
      // Only the root path decides site-wide access.
      if (value !== "/" && value !== "") continue;
      const blocked = key === "disallow" && value === "/";
      for (const g of group)
        if (!verdict.has(g)) verdict.set(g, blocked ? "disallow" : "allow");
    }
  }
  return verdict;
}

async function main() {
  console.log(`ai-crawler-check: ${ORIGIN}\n`);

  // ---- 1. Advisory: the served robots.txt ----
  let robotsTxt = "";
  try {
    const res = await fetch(`${ORIGIN}/robots.txt`, { redirect: "follow" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    robotsTxt = await res.text();
  } catch (err) {
    console.error(`  FAIL  could not fetch /robots.txt — ${err.message}`);
    process.exit(1);
  }

  const verdict = parseRobots(robotsTxt);
  const wildcard = verdict.get("*") ?? "allow";
  console.log("  robots.txt (advisory):");
  for (const a of AGENTS) {
    const v = verdict.get(a.name.toLowerCase()) ?? wildcard;
    const ok = v === "allow";
    console.log(`    ${ok ? "ok  " : "FAIL"}  ${a.name.padEnd(18)} ${v}`);
    if (!ok)
      failures.push(`${a.name} is Disallow'd in the served robots.txt (${a.kind})`);
  }

  // A managed block announces itself with Content-Signal. Worth naming explicitly.
  if (/content-signal:.*ai-train=no/i.test(robotsTxt)) {
    console.log(
      "\n    note: Content-Signal ai-train=no is present — training discouraged, citation unaffected.",
    );
  }

  // ---- 2. Enforcement: does the edge actually serve these agents? ----
  console.log("\n  user-agent probe (enforcement):");
  for (const a of AGENTS) {
    let status = 0;
    try {
      const res = await fetch(`${ORIGIN}/`, {
        headers: { "User-Agent": a.ua },
        redirect: "follow",
      });
      status = res.status;
    } catch (err) {
      failures.push(`${a.name} probe threw — ${err.message}`);
    }
    // 403/429 is the signature of an enforced bot rule sitting on top of the advisory file.
    const ok = status === 200;
    console.log(
      `    ${ok ? "ok  " : "FAIL"}  ${a.name.padEnd(18)} ${status || "network error"}`,
    );
    if (status && !ok) {
      failures.push(
        `${a.name} received HTTP ${status} — an ENFORCED bot rule is active, which robots.txt alone would not reveal (${a.kind})`,
      );
    }
  }

  if (failures.length) {
    console.error(`\nai-crawler-check: ${failures.length} FAILURE(S)\n`);
    for (const f of failures) console.error(`  ✗ ${f}`);
    console.error(
      "\n  This is a Cloudflare zone setting, not a repo change — no commit can fix it.",
      "\n  Zone → AI Crawl Control, and check WAF/bot rules for the 403s.",
      "\n  See docs/cloudflare-runbook.md §1.\n",
    );
    process.exit(1);
  }

  console.log(
    "\nai-crawler-check: AI crawlers can reach the site, advisory and enforced.",
  );
}

main();
