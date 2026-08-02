import { siteConfig } from "@/lib/site-config";

/**
 * EmailAddress — renders the business email so Cloudflare cannot mangle it.
 *
 * Cloudflare's Scrape Shield feature "Email Address Obfuscation" rewrites every address it
 * finds in the served HTML: a `mailto:` anchor becomes `/cdn-cgi/l/email-protection#<hex>`,
 * a URL that returns **404** to crawlers and to any visitor without JS, and a plain-text
 * address becomes the English placeholder "[email protected]" mid-Hebrew-sentence.
 *
 * The `email_off` / `email_on` markers opt this markup out of that rewrite. They have to be
 * genuine HTML comments in the emitted output and JSX comments are compile-time only, so the
 * markup is built as a string. Nothing here is user input — the address is a build-time
 * constant from `site.config.json` — but it is escaped regardless.
 */

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char] ?? char);
}

const email = escapeHtml(siteConfig.email);

/** The address as a click-to-mail link (footer, contact page). */
export function EmailLink({ className }: { className?: string }) {
  const classAttr = className ? ` class="${escapeHtml(className)}"` : "";

  return (
    <span
      dangerouslySetInnerHTML={{
        __html: `<!--email_off--><a href="mailto:${email}" dir="ltr"${classAttr}>${email}</a><!--email_on-->`,
      }}
    />
  );
}

/** The address as plain text inside Hebrew prose (privacy, accessibility statements). */
export function EmailText() {
  return (
    <span
      dir="ltr"
      dangerouslySetInnerHTML={{ __html: `<!--email_off-->${email}<!--email_on-->` }}
    />
  );
}
