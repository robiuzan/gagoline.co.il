import { Container } from "@/components/ui/Container";
import { trustStats } from "@/lib/content";

export function TrustBar() {
  return (
    <div className="border-b border-gray-100 bg-white">
      <Container>
        {/*
         * `flex-col-reverse` keeps the DOM in <dt> then <dd> order — term before description, which
         * is what a description list means — while rendering the value above the label, which is
         * what the design wants. The label used to appear twice: once `sr-only` in the <dt> and
         * again visibly inside the <dd>, so a screen reader announced every stat's label, then its
         * value, then its label again (backlog §11.7).
         *
         * Column direction is unaffected by dir="rtl", so there is no logical-property concern.
         */}
        <dl className="grid grid-cols-2 gap-y-6 py-8 sm:grid-cols-4">
          {trustStats.map((stat) => (
            <div key={stat.label} className="flex flex-col-reverse gap-1 text-center">
              <dt className="text-sm text-gray-500">{stat.label}</dt>
              <dd className="font-heading text-xl font-extrabold text-primary sm:text-2xl">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </div>
  );
}
