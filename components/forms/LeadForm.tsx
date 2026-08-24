"use client";

import { useState } from "react";
import { Check, MessageCircle, Send } from "lucide-react";
import { siteConfig, telHref, whatsappHref, services } from "@/lib/site-config";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { trackEvent } from "@ishub/site-kit/analytics";

/**
 * Primary lead/quote form (brief G1). Low-friction: name + phone required.
 *
 * Delivers via Web3Forms (https://api.web3forms.com/submit) so the lead is emailed to the
 * business inbox (contact.email) from any static host — no backend/PHP needed. The PUBLIC
 * access key comes from the manifest (siteConfig.formAccessKey), with a NEXT_PUBLIC_WEB3FORMS_KEY
 * env override for local dev. WhatsApp is offered as a one-tap alternative and as the fallback
 * if delivery fails. Honeypot blocks bots.
 */
const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";
const WEB3FORMS_KEY =
  siteConfig.formAccessKey ?? process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? "";

export function LeadForm({ className }: { className?: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  function buildWhatsapp(form: HTMLFormElement): string {
    const d = new FormData(form);
    const text = [
      `שלום, אני ${(d.get("name") as string) || ""}.`.trim(),
      (d.get("service") as string) ? `מעוניין/ת ב: ${d.get("service")}.` : "",
      (d.get("message") as string) || "",
      `טלפון לחזרה: ${(d.get("phone") as string) || ""}`,
    ]
      .filter(Boolean)
      .join("\n");
    return whatsappHref(text);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    if ((data.get("company") as string)?.length) return; // honeypot
    const name = (data.get("name") as string)?.trim();
    const phone = (data.get("phone") as string)?.trim();
    if (!name || !phone) {
      setError("נא למלא שם וטלפון");
      return;
    }
    setError(null);
    setStatus("sending");

    // No access key (local dev only): simulate so `next dev` works. Production builds always
    // ship a provisioned key, so an empty key in production is a misconfig — fall back to
    // WhatsApp rather than silently pretending the lead was sent.
    if (!WEB3FORMS_KEY) {
      if (process.env.NODE_ENV !== "production") {
        await new Promise((r) => setTimeout(r, 600));
        setStatus("done");
        return;
      }
      setStatus("error");
      window.open(buildWhatsapp(form), "_blank", "noopener");
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
    } catch {
      // Fall back to WhatsApp so the lead is never lost.
      setStatus("error");
      window.open(buildWhatsapp(form), "_blank", "noopener");
    }
  }

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

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4", className)} noValidate>
      <div>
        <label htmlFor="lf-name" className="mb-1 block text-sm font-medium text-gray-700">
          שם מלא
        </label>
        <input
          id="lf-name"
          name="name"
          type="text"
          autoComplete="name"
          required
          className={fieldClass}
          placeholder="ישראל ישראלי"
        />
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
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          dir="ltr"
          className={cn(fieldClass, "text-right")}
          placeholder="050-0000000"
        />
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

      {error && (
        <p role="alert" className="text-sm font-medium text-red-600">
          {error}
        </p>
      )}

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
