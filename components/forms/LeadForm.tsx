"use client";

import { useState } from "react";
import { Check, MessageCircle, Send } from "lucide-react";
import { whatsappHref, services } from "@/lib/site-config";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/**
 * Primary lead/quote form (brief G1). Low-friction: name + phone required.
 *
 * Submits to `/lead.php` (PHP mail handler in the cPanel docroot) so the lead is emailed
 * to the business. WhatsApp is offered as a one-tap alternative. Honeypot blocks bots.
 * Note: `/lead.php` exists only on the deployed host (not in `next dev`).
 */
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

    try {
      const res = await fetch("/lead.php", {
        method: "POST",
        body: new URLSearchParams(data as unknown as Record<string, string>),
      });
      if (!res.ok) throw new Error("bad status");
      setStatus("done");
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
          נחזור אליכם בהקדם. צריכים מענה מיידי? התקשרו אלינו.
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
          className="inline-flex items-center gap-1 font-semibold text-[#1da851] hover:underline"
        >
          <MessageCircle className="h-3.5 w-3.5" aria-hidden />
          שלחו לנו הודעה
        </a>
      </p>
    </form>
  );
}
