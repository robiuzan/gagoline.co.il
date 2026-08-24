import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { siteConfig, telHref, whatsappHref } from "@/lib/site-config";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { EmailLink } from "@/components/ui/EmailAddress";
import { LeadForm } from "@/components/forms/LeadForm";

export const metadata: Metadata = {
  alternates: { canonical: "/contact/" },
  title: "צור קשר",
  description:
    "צרו קשר עם גגוליין לאיטום גגות בתל אביב והמרכז. טלפון, וואטסאפ או טופס — נחזור אליכם עם הצעת מחיר.",
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        title="צור קשר"
        subtitle="מענה מהיר, ייעוץ ראשוני והצעת מחיר ללא התחייבות."
        crumbs={[{ label: "בית", href: "/" }, { label: "צור קשר" }]}
      />

      <Section tone="white">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Details */}
          <div>
            <h2 className="font-heading text-xl font-bold text-primary">פרטי התקשרות</h2>
            <ul className="mt-5 space-y-4 text-gray-700">
              <li className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
                  <Phone className="h-5 w-5" aria-hidden />
                </span>
                <a
                  href={telHref}
                  data-cta="contact-call"
                  className="font-medium hover:text-primary"
                  dir="ltr"
                >
                  {siteConfig.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-whatsapp/10 text-whatsapp-700">
                  <MessageCircle className="h-5 w-5" aria-hidden />
                </span>
                <a
                  href={whatsappHref("היי, אני מעוניין/ת בהצעת מחיר לאיטום גג")}
                  data-cta="contact-whatsapp"
                  className="font-medium hover:text-primary"
                >
                  וואטסאפ
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-50 text-secondary">
                  <Mail className="h-5 w-5" aria-hidden />
                </span>
                <EmailLink
                  className="font-medium hover:text-primary"
                  dataCta="contact-email"
                />
              </li>
              <li className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                  <MapPin className="h-5 w-5" aria-hidden />
                </span>
                {siteConfig.serviceArea}
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                  <Clock className="h-5 w-5" aria-hidden />
                </span>
                <span>
                  {siteConfig.hours.weekday}
                  <br />
                  {siteConfig.hours.friday}
                  <br />
                  <span className="text-sm text-accent-600">
                    {siteConfig.hours.emergency}
                  </span>
                </span>
              </li>
            </ul>
          </div>

          {/* Form */}
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 sm:p-8">
            <h2 className="font-heading text-xl font-bold text-primary">
              קבלו הצעת מחיר חינם
            </h2>
            <p className="mt-1 text-sm text-gray-600">השאירו פרטים ונחזור אליכם בהקדם.</p>
            <div className="mt-5">
              <LeadForm />
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
