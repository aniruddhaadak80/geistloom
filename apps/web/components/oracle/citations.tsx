import { BookOpen } from "lucide-react";

export interface CitationsProps {
  readonly citations: readonly string[];
}

/**
 * Renders a plan's citations. Server component — intended for
 * server-rendered trees (route pages, archived plans).
 */
export function Citations({ citations }: CitationsProps) {
  if (citations.length === 0) return null;
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-display text-xl font-semibold">Citations</h2>
      <ul className="flex flex-col gap-2">
        {citations.map((citation) => (
          <li
            key={citation}
            className="flex items-start gap-2.5 rounded-lg border border-charcoal bg-abyss-2 p-3 text-sm leading-relaxed text-mist"
          >
            <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-bio-teal" aria-hidden />
            <span>{citation}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
