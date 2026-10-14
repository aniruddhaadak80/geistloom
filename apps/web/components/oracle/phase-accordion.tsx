"use client";

import type { PlanPhase } from "@geistloom/core";
import { Card, CardContent, cn } from "@geistloom/ui";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

/**
 * The six plan phases as an accordion: name, duration, and a
 * confidence bar in the header; description and milestone in the
 * open body. The first phase starts open.
 */
export function PhaseAccordion({ phases }: { phases: readonly PlanPhase[] }) {
  const [openId, setOpenId] = useState<string | null>(phases[0]?.id ?? null);

  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-display text-xl font-semibold">The six phases</h2>
      {phases.map((phase, index) => {
        const open = openId === phase.id;
        return (
          <Card key={phase.id} className="p-0">
            <button
              type="button"
              onClick={() => setOpenId(open ? null : phase.id)}
              aria-expanded={open}
              className="flex w-full items-center justify-between gap-4 p-5 text-left"
            >
              <div className="flex min-w-0 items-center gap-4">
                <span className="shrink-0 font-mono text-xs text-bio-teal">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-display font-semibold">{phase.name}</p>
                  <p className="font-mono text-xs text-mist">{phase.years} years</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <div className="hidden h-1.5 w-28 overflow-hidden rounded-full bg-charcoal sm:block">
                  <div
                    className="h-full rounded-full bg-bio-teal"
                    style={{ width: `${phase.confidence * 100}%` }}
                  />
                </div>
                <ChevronDown
                  className={cn("h-4 w-4 text-mist transition-transform", open && "rotate-180")}
                  aria-hidden
                />
              </div>
            </button>
            {open && (
              <CardContent className="flex flex-col gap-4 border-t border-charcoal px-5 pb-5 pt-4">
                <p className="text-sm leading-relaxed text-mist">{phase.description}</p>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-bio-teal">
                    milestone
                  </p>
                  <p className="mt-1 text-sm">{phase.milestone}</p>
                </div>
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-mist">
                      confidence
                    </span>
                    <span className="font-mono text-xs text-bio-teal">
                      {(phase.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-charcoal">
                    <div
                      className="h-full rounded-full bg-bio-teal"
                      style={{ width: `${phase.confidence * 100}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </section>
  );
}
