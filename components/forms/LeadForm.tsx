"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Check, MessageCircle, Send } from "lucide-react";
import { siteConfig, telHref, whatsappHref, services } from "@/lib/site-config";
import { leadFormContent } from "@/lib/content";
import { Button } from "@/components/ui/Button";
import { cn, normalizeIsraeliPhone } from "@/lib/utils";
import { trackEvent } from "@ishub/site-kit/analytics";

/**
 * Primary lead/quote form (brief G1). Low-friction: name + phone required.
 *
 * Delivers via Web3Forms (https://api.web3forms.com/submit) so the lead is emailed to the
 * business inbox (contact.email) from any static host — no backend/PHP needed. The PUBLIC
 * access key comes from the manifest (siteConfig.formAccessKey), with a NEXT_PUBLIC_WEB3FORMS_KEY
 * env override for local dev. WhatsApp is offered as a one-tap alternative and as the fallback
 * if delivery fails. Honeypot blocks bots.
 *
 * Validation is CUSTOM, not the browser's — `noValidate` stays, because the native bubbles are
 * English on a Hebrew form and cannot be styled. That is only defensible if the custom messages are
 * at least as good as the ones they replace: per field, tied to the input with `aria-describedby`
 * and `aria-invalid`, and with focus moved to the first offender (backlog §8.4, §11.5). One generic
 * string at the bottom of the form was strictly worse than the native behaviour it replaced.
 */
const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";
const WEB3FORMS_KEY =
  siteConfig.formAccessKey ?? process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? "";

/** The post-conversion route. Must stay in sync with app/thank-you/page.tsx. */
const THANK_YOU_PATH = "/thank-you/";

type FieldErrors = { name?: string; phone?: string };

export function LeadForm({ className }: { className?: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [sendError, setSendError] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  /** Drop a field's error as soon as the visitor starts fixing it. */
  function clearError(field: keyof FieldErrors) {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  }

  /**
   * The WhatsApp rescue path, plus the event that makes it visible.
   *
   * Deliberately NOT detecting a blocked popup: `window.open(url, "_blank", "noopener")` returns
   * `null` even on success, because `noopener` severs the handle by spec. A "popup_blocked" signal
   * derived from that return value would fire on every successful open. Do not add one.
   */
  function fallbackToWhatsapp(form: HTMLFormElement, phone: string, reason: string) {
    trackEvent("lead_fallback", { form: "lead", reason });
    window.open(buildWhatsapp(form, phone), "_blank", "noopener");
  }

  function buildWhatsapp(form: HTMLFormElement, phone: string): string {
    const d = new FormData(form);
    const text = [
      `שלום, אני ${(d.get("name") as string) || ""}.`.trim(),
      (d.get("service") as string) ? `מעוניין/ת ב: ${d.get("service")}.` : "",
      (d.get("message") as string) || "",
      `טלפון לחזרה: ${phone}`,
    ]
      .filter(Boolean)
      .join("\n");
    return whatsappHref(text);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    if ((data.get("company") as string)?.length) {
      // Honeypot. Low volume by design, but reporting it is what turns "the honeypot exists" into
      // "the honeypot caught N this month" — and a sudden spike is the first sign of a bot wave.
      trackEvent("lead_submit_blocked", { form: "lead", reason: "honeypot" });
      return;
    }

    const name = ((data.get("name") as string) ?? "").trim();
    const rawPhone = ((data.get("phone") as string) ?? "").trim();
    const phone = normalizeIsraeliPhone(rawPhone);

    // Guarded on the values rather than on the error object so TypeScript narrows `phone` to a
    // string past this point: the normalised number is what gets sent, and it must not be nullable
    // at the call sites below.
    if (!name || !phone) {
      const nextErrors: FieldErrors = {};
      if (!name) nextErrors.name = leadFormContent.errors.name;
      if (!rawPhone) nextErrors.phone = leadFormContent.errors.phoneMissing;
      else if (!phone) nextErrors.phone = leadFormContent.errors.phoneInvalid;
      setErrors(nextErrors);
      setSendError(null);
      /**
       * ONE event per attempt, naming the FIRST offender — the same field focus moves to below.
       * Firing one event per invalid field would count a single abandoned attempt twice and make
       * the drop-off look worse than it is.
       *
       * `field` is the field's NAME, never its value: "phone", never what the visitor typed. No PII
       * in dataLayer (CLAUDE.md §12). That rule is why this is worth having at all — it tells you
       * WHICH field loses people without collecting anything about the person.
       */
      trackEvent("form_error", {
        form: "lead",
        field: nextErrors.name ? "name" : "phone",
        reason: nextErrors.name || !rawPhone ? "missing" : "invalid",
      });
      // Focus the FIRST offender in DOM order, so a keyboard or screen-reader user lands on the
      // field they have to fix instead of hearing an alert with no way back to it.
      (nextErrors.name ? nameRef : phoneRef).current?.focus();
      return;
    }

    setErrors({});
    setSendError(null);
    setStatus("sending");

    // No access key (local dev only): simulate so `next dev` works. Production builds always
    // ship a provisioned key, so an empty key in production is a misconfig — fall back to
    // WhatsApp rather than silently pretending the lead was sent.
    if (!WEB3FORMS_KEY) {
      if (process.env.NODE_ENV !== "production") {
        await new Promise((r) => setTimeout(r, 600));
        setStatus("done");
        // Navigates so the flow is testable in dev, but fires NO conversion event — same reason
        // the simulation never did.
        window.location.assign(THANK_YOU_PATH);
        return;
      }
      setStatus("error");
      setSendError(leadFormContent.errors.send);
      // A production build with no access key is a misconfiguration, not a network failure. Giving
      // it its own reason keeps a deploy mistake from hiding inside the ordinary send-failure count.
      trackEvent("lead_submit_failed", { form: "lead", reason: "no_access_key" });
      fallbackToWhatsapp(form, phone, "no_access_key");
      return;
    }

    try {
      const res = await fetch(WEB3FORMS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `פנייה חדשה מהאתר — ${name}`,
          from_name: siteConfig.name,
          name,
          // The NORMALISED number, so the inbox always receives something dialable.
          phone,
          service: (data.get("service") as string) || "לא צוין",
          message: (data.get("message") as string) || "—",
        }),
      });
      const result: { success?: boolean } = await res.json();
      if (!res.ok || !result.success) throw new Error("bad status");
      setStatus("done");
      // GTM conversion hook: fires only on a CONFIRMED send (the dev simulation above does not).
      trackEvent("lead_submit", { form: "lead" });
      // Then hand the conversion a URL. The dataLayer push above is the precise signal; the
      // /thank-you/ page view is the durable one, and it is the only one a Google Ads URL-based
      // conversion — or a container with no custom-event trigger — can see. The full navigation is
      // deliberate: a client-side route change would need a History Change trigger inside
      // GTM-KWGGH438, and nothing in this repo can prove that trigger exists.
      window.location.assign(THANK_YOU_PATH);
    } catch {
      // Fall back to WhatsApp so the lead is never lost.
      setStatus("error");
      setSendError(leadFormContent.errors.send);
      // Two events, because they are two different facts: the send failed (cause), and the visitor
      // was handed a rescue route (outcome). Summing them would double-count one incident, but
      // keeping only one of them loses either the failure rate or the recovery rate.
      trackEvent("lead_submit_failed", { form: "lead", reason: "send_failed" });
      fallbackToWhatsapp(form, phone, "send_failed");
    }
  }

  // Rendered in the moment before the navigation lands — and it is the entire confirmation if that
  // navigation is ever blocked, so it stays a complete message rather than a spinner.
  if (status === "done") {
    return (
      <div className={cn("rounded-xl bg-green-50 p-6 text-center", className)}>
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
          <Check className="h-6 w-6" aria-hidden />
        </span>
        <p className="mt-3 font-heading text-lg font-bold text-primary">
          תודה! קיבלנו את הפנייה
        </p>
        <p className="mt-1 text-sm text-gray-600">
          נחזור אליכם בהקדם. צריכים מענה מיידי?{" "}
          <a
            href={telHref}
            data-cta="formsuccess-call"
            className="font-semibold text-primary hover:underline"
            dir="ltr"
          >
            {siteConfig.phone}
          </a>{" "}
          <span className="text-gray-400">·</span>{" "}
          <a
            href={whatsappHref("היי, השארתי פרטים באתר")}
            data-cta="formsuccess-whatsapp"
            className="font-semibold text-whatsapp-700 hover:underline"
          >
            וואטסאפ
          </a>
        </p>
      </div>
    );
  }

  const fieldClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/40";
  // red-700 rather than red-600: #b91c1c is 6.44:1 on white, #dc2626 only 4.53:1 — and the error
  // message is the one string on this form a person absolutely has to be able to read.
  const errorClass = "mt-1 text-sm font-medium text-red-700";
  const invalidClass = "border-red-700 focus:border-red-700 focus:ring-red-700/40";

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4", className)} noValidate>
      <div>
        <label htmlFor="lf-name" className="mb-1 block text-sm font-medium text-gray-700">
          שם מלא
        </label>
        <input
          id="lf-name"
          ref={nameRef}
          name="name"
          type="text"
          autoComplete="name"
          required
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? "lf-name-error" : undefined}
          onChange={() => clearError("name")}
          className={cn(fieldClass, errors.name && invalidClass)}
          placeholder="ישראל ישראלי"
        />
        {errors.name && (
          <p id="lf-name-error" role="alert" className={errorClass}>
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="lf-phone"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          טלפון
        </label>
        <input
          id="lf-phone"
          ref={phoneRef}
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          dir="ltr"
          aria-invalid={errors.phone ? true : undefined}
          aria-describedby={errors.phone ? "lf-phone-error" : undefined}
          onChange={() => clearError("phone")}
          // `text-end` inside a dir="ltr" island resolves to the right edge — the digits sit where
          // the surrounding RTL form starts every other field. Logical, not physical.
          className={cn(fieldClass, "text-end", errors.phone && invalidClass)}
          placeholder="050-0000000"
        />
        {errors.phone && (
          <p id="lf-phone-error" role="alert" className={errorClass}>
            {errors.phone}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="lf-service"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          השירות שמעניין אתכם (אופציונלי)
        </label>
        <select id="lf-service" name="service" className={fieldClass} defaultValue="">
          <option value="">בחירת שירות…</option>
          {services.map((s) => (
            <option key={s.slug} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="lf-message"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          פרטים על הבעיה (אופציונלי)
        </label>
        <textarea
          id="lf-message"
          name="message"
          rows={3}
          className={fieldClass}
          placeholder="לדוגמה: כתם רטיבות בתקרה בסלון…"
        />
      </div>

      {/* Honeypot */}
      <div className="hidden" aria-hidden>
        <label htmlFor="lf-company">אל תמלאו שדה זה</label>
        <input
          id="lf-company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {sendError && (
        <p role="alert" className="text-sm font-medium text-red-700">
          {sendError}
        </p>
      )}

      <p className="text-xs leading-relaxed text-gray-500">
        {leadFormContent.consent.lead}
        <Link href="/privacy/" className="font-semibold text-primary underline">
          {leadFormContent.consent.linkLabel}
        </Link>
        {leadFormContent.consent.tail}
      </p>

      <Button
        type="submit"
        variant="accent"
        size="lg"
        className="w-full"
        disabled={status === "sending"}
      >
        <Send className="h-5 w-5" aria-hidden />
        {status === "sending" ? "שולח…" : "שליחה וקבלת הצעת מחיר"}
      </Button>

      <p className="text-center text-xs text-gray-500">
        מעדיפים וואטסאפ?{" "}
        <a
          href={whatsappHref("היי, אני מעוניין/ת בהצעת מחיר לאיטום גג")}
          data-cta="form-whatsapp"
          className="inline-flex items-center gap-1 font-semibold text-whatsapp-700 hover:underline"
        >
          <MessageCircle className="h-3.5 w-3.5" aria-hidden />
          שלחו לנו הודעה
        </a>
      </p>
    </form>
  );
}
