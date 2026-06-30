import { Container } from "@/components/ui/Container";
import { trustStats } from "@/lib/content";

export function TrustBar() {
  return (
    <div className="border-b border-gray-100 bg-white">
      <Container>
        <dl className="grid grid-cols-2 gap-y-6 py-8 sm:grid-cols-4">
          {trustStats.map((stat) => (
            <div key={stat.label} className="text-center">
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <span className="block font-heading text-xl font-extrabold text-primary sm:text-2xl">
                  {stat.value}
                </span>
                <span className="mt-1 block text-sm text-gray-500">{stat.label}</span>
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </div>
  );
}
