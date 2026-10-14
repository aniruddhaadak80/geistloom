"use client";

import { type BrainState, thinkAbout } from "@geistloom/core";
import { Badge, type BadgeTone } from "@geistloom/ui";
import { useMemo } from "react";

const STATE_TONE: Readonly<Record<BrainState, BadgeTone>> = {
  perceive: "teal",
  decompose: "violet",
  research: "amber",
  synthesize: "teal",
  plan: "violet",
  reflect: "amber",
};

/**
 * The Oracle's brain trace, computed locally with thinkAbout(prompt, 2)
 * — a pure import from @geistloom/core, no fetch. Rendered as a
 * vertical timeline: step number, brain-state badge, thought, the
 * knowledge node it landed on, and its utility score.
 */
export function BrainTrace({ prompt }: { prompt: string }) {
  const trace = useMemo(() => thinkAbout(prompt, 2), [prompt]);
  const maxUtility = useMemo(
    () => trace.reduce((max, step) => Math.max(max, step.utilityScore), Number.EPSILON),
    [trace],
  );

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-display text-xl font-semibold">Brain trace</h2>
        <p className="font-mono text-xs text-mist">
          perceive → decompose → research → synthesize → plan → reflect
        </p>
      </div>
      <ol className="relative flex flex-col gap-5 border-l border-charcoal pl-7">
        {trace.map((step) => (
          <li key={step.step} className="relative">
            <span
              className="absolute -left-[31.5px] top-1.5 h-2.5 w-2.5 rounded-full bg-bio-teal ring-4 ring-abyss"
              aria-hidden
            />
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-bio-teal">step {step.step}</span>
              <Badge tone={STATE_TONE[step.state]}>{step.state}</Badge>
              <span className="font-mono text-xs text-mist">{step.nodeLabel}</span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-star-white">{step.thought}</p>
            <div className="mt-3 flex items-center gap-3">
              <span className="font-mono text-[10px] uppercase tracking-wider text-mist">
                utility
              </span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-charcoal">
                <div
                  className="h-full rounded-full bg-genome-violet"
                  style={{
                    width: `${Math.min(100, (step.utilityScore / maxUtility) * 100)}%`,
                  }}
                />
              </div>
              <span className="font-mono text-xs text-genome-violet">
                {step.utilityScore.toFixed(3)}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
