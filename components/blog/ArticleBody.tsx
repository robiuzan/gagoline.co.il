import Link from "next/link";
import { Info, TriangleAlert } from "lucide-react";
import type { Block } from "@/content/articles/types";
import { Prose } from "@/components/ui/Prose";
import { Button } from "@/components/ui/Button";
import { telHref, whatsappHref, siteConfig } from "@/lib/site-config";

/**
 * Renders the typed block model. Every branch of the `Block` union must be handled — the
 * `never` fallthrough at the end makes a new block kind a TYPE ERROR rather than a silently
 * missing section, which is the whole reason the model is typed.
 *
 * The `answer` and `faq` blocks are rendered here AND drive the JSON-LD in the route. One source,
 * so schema cannot describe content that is not on the page.
 */
function BlockView({ block }: { block: Block }) {
  switch (block.kind) {
    case "paragraph":
      return <p className="mt-4 leading-relaxed text-gray-700">{block.text}</p>;

    case "rich":
      return <Prose parts={block.parts} className="mt-4 leading-relaxed text-gray-700" />;

    case "heading":
      return block.level === 2 ? (
        <h2 className="mt-10 font-heading text-xl font-bold text-primary">
          {block.text}
        </h2>
      ) : (
        <h3 className="mt-8 font-heading text-lg font-bold text-primary">{block.text}</h3>
      );

    case "list":
      return block.ordered ? (
        <ol className="mt-4 space-y-2">
          {block.items.map((it, i) => (
            <li key={it} className="flex gap-3 text-gray-700">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                {i + 1}
              </span>
              <span>{it}</span>
            </li>
          ))}
        </ol>
      ) : (
        <ul className="mt-4 space-y-2">
          {block.items.map((it) => (
            <li key={it} className="flex gap-3 text-gray-700">
              <span
                aria-hidden
                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary"
              />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      );

    // Wide tables must scroll inside their own container, never the page body.
    case "table":
      return (
        <div className="-mx-4 mt-6 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[34rem] border-collapse text-start text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                {block.head.map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="px-3 py-2 text-start font-heading font-bold text-primary"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i} className="border-b border-gray-100 align-top">
                  {row.map((cell, j) => (
                    <td key={j} className="px-3 py-2.5 text-gray-700">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "answer":
      return (
        <div className="mt-6 rounded-2xl border border-secondary-200 bg-secondary-50 p-6">
          <h2 className="font-heading text-lg font-bold text-primary">{block.q}</h2>
          <p className="mt-2 leading-relaxed text-gray-800">{block.a}</p>
        </div>
      );

    case "faq":
      return (
        <dl className="mt-4 space-y-5">
          {block.items.map((f) => (
            <div key={f.q}>
              <dt className="font-semibold text-primary">{f.q}</dt>
              <dd className="mt-1 text-gray-700">{f.a}</dd>
            </div>
          ))}
        </dl>
      );

    case "callout":
      return (
        <div
          className={
            block.tone === "warn"
              ? "mt-6 flex gap-3 rounded-2xl border border-accent-200 bg-accent-50 p-5"
              : "mt-6 flex gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-5"
          }
        >
          {block.tone === "warn" ? (
            <TriangleAlert
              className="mt-0.5 h-5 w-5 shrink-0 text-accent-700"
              aria-hidden
            />
          ) : (
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-secondary-600" aria-hidden />
          )}
          <p className="text-gray-700">{block.text}</p>
        </div>
      );

    case "cta":
      return (
        <div className="mt-10 rounded-2xl border border-gray-100 bg-gray-50 p-6">
          <p className="text-gray-700">{block.text}</p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button href={telHref} data-cta="article-call" variant="accent" size="lg">
              <span dir="ltr">{siteConfig.phone}</span>
            </Button>
            <Button
              href={whatsappHref("היי, קראתי מאמר באתר ויש לי שאלה על הגג שלי")}
              data-cta="article-whatsapp"
              variant="whatsapp"
              size="lg"
            >
              וואטסאפ
            </Button>
          </div>
        </div>
      );

    default: {
      // Exhaustiveness guard: a new Block kind fails the build here.
      const _never: never = block;
      return _never;
    }
  }
}

export function ArticleBody({ blocks }: { blocks: readonly Block[] }) {
  return (
    <div>
      {blocks.map((b, i) => (
        <BlockView key={i} block={b} />
      ))}
    </div>
  );
}
