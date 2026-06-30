import { Calculator } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { priceRows } from "@/lib/content";

export function PricingTeaser() {
  return (
    <Section id="pricing" tone="white">
      <SectionHeading
        eyebrow="מחירון"
        title="מחיר שקוף, בלי הפתעות"
        subtitle="טווחי מחיר להתרשמות בלבד. המחיר הסופי נקבע אחרי ביקור ואבחון בשטח."
      />

      <div className="mx-auto mt-10 max-w-2xl overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
        <table className="w-full text-right">
          <caption className="sr-only">טווחי מחיר לשירותי איטום נפוצים</caption>
          <thead className="bg-gray-50 text-sm text-gray-500">
            <tr>
              <th scope="col" className="px-5 py-3 font-medium">
                שירות
              </th>
              <th scope="col" className="px-5 py-3 font-medium">
                טווח מחיר 🔶
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {priceRows.map((row) => (
              <tr key={row.service}>
                <td className="px-5 py-4 font-medium text-gray-800">{row.service}</td>
                <td className="px-5 py-4 text-gray-600" dir="ltr">
                  {row.from}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 flex justify-center">
        <Button href="/contact" variant="accent" size="lg">
          <Calculator className="h-5 w-5" aria-hidden />
          קבלו הצעת מחיר מדויקת
        </Button>
      </div>
    </Section>
  );
}
