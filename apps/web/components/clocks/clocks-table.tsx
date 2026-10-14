import { CLOCKS, type ClockGeneration } from "@geistloom/core";
import { Badge, cn } from "@geistloom/ui";
import Link from "next/link";

/**
 * Comparison table of the eight real epigenetic clocks.
 * Server component — rows deep-link to ?clock=<id>, which the page resolves
 * into the detail panel.
 */

const GENERATION_TONE: Record<ClockGeneration, "mist" | "violet" | "teal"> = {
  first: "mist",
  second: "violet",
  third: "teal",
};

function formatInt(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function ClocksTable({ selectedId }: { readonly selectedId: string | null }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-charcoal">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-charcoal bg-abyss-2 font-mono text-[11px] uppercase tracking-wider text-mist">
            <th className="px-4 py-3 font-medium">Clock</th>
            <th className="px-4 py-3 font-medium">Year</th>
            <th className="px-4 py-3 font-medium">Generation</th>
            <th className="px-4 py-3 text-right font-medium">CpG sites</th>
            <th className="px-4 py-3 text-right font-medium">Training samples</th>
            <th className="px-4 py-3 font-medium">Predicts</th>
            <th className="px-4 py-3 font-medium">Creator</th>
          </tr>
        </thead>
        <tbody>
          {CLOCKS.map((clock) => {
            const selected = selectedId === clock.id;
            return (
              <tr
                key={clock.id}
                className={cn(
                  "border-b border-charcoal/60 transition last:border-0 hover:bg-charcoal/30",
                  selected && "bg-charcoal/40",
                )}
              >
                <td className="px-4 py-3">
                  <Link
                    href={`?clock=${clock.id}`}
                    className={cn(
                      "font-medium transition",
                      selected ? "text-bio-teal" : "text-star-white hover:text-bio-teal",
                    )}
                  >
                    {clock.name}
                  </Link>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-mist">{clock.year}</td>
                <td className="px-4 py-3">
                  <Badge tone={GENERATION_TONE[clock.generation]}>{clock.generation}</Badge>
                </td>
                <td className="px-4 py-3 text-right font-mono text-xs text-star-white">
                  {formatInt(clock.cpgSites)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-xs text-star-white">
                  {formatInt(clock.trainingSamples)}
                </td>
                <td className="px-4 py-3 text-xs text-mist">{clock.predicts}</td>
                <td className="px-4 py-3 text-xs text-mist">{clock.creator}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
