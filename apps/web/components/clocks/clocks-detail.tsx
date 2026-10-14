"use client";

import type { ClockGeneration, EpigeneticClock } from "@geistloom/core";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  cn,
} from "@geistloom/ui";
import { useState } from "react";

/**
 * Selected-clock detail: the spec sheet (strength, limitation, training set)
 * plus the "what would this clock measure" explainer, toggled per
 * generation. Client component so the spec/assessment toggle is local state.
 */

const MEASURES: Record<ClockGeneration, { title: string; body: string }> = {
  first: {
    title: "What a first-generation clock measures",
    body: "Chronological age, across tissues. It answers “how old is this sample?” — correlation with calendar time is the feature. First-gen clocks drift when disease or lifestyle diverges from the training population, which is exactly why the second generation was trained on outcomes instead of birthdays.",
  },
  second: {
    title: "What a second-generation clock measures",
    body: "Biological risk, not birthdays. Trained on mortality, disease incidence, or phenotypic age, a second-gen clock answers “how fast is this person heading toward age-related failure?” GrimAge predicted all-cause mortality better than smoking or blood pressure in several cohorts — the clock became a prognostic instrument.",
  },
  third: {
    title: "What a third-generation clock measures",
    body: "The rate of aging itself. DunedinPACE measures pace — years of physiological decline per chronological year — which makes it the ideal endpoint for an intervention trial: you can watch the speed change, not just the position. Third-gen clocks are built for causality, not just correlation.",
  },
};

type View = "specs" | "assessment";

function formatInt(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function ClocksDetail({ clock }: { readonly clock: EpigeneticClock | null }) {
  const [view, setView] = useState<View>("specs");

  if (!clock) {
    return (
      <Card className="flex min-h-96 flex-col items-center justify-center">
        <CardContent className="flex flex-col items-center gap-2 p-8 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-mist">
            no clock selected
          </p>
          <p className="max-w-xs text-sm leading-relaxed text-mist">
            Select a row in the table to open its spec sheet and assessment.
          </p>
        </CardContent>
      </Card>
    );
  }

  const explainer = MEASURES[clock.generation];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle>{clock.name}</CardTitle>
          <Badge tone="outline">gen {clock.generation}</Badge>
        </div>
        <CardDescription>
          {clock.creator} · {clock.year} · predicts {clock.predicts.toLowerCase()}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {/* view toggle */}
        <div className="flex gap-1.5">
          {(["specs", "assessment"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => setView(v)}
              className={cn(
                "rounded-full border px-3 py-1 font-mono text-[11px] capitalize transition",
                view === v
                  ? "border-bio-teal/60 bg-bio-teal/10 text-bio-teal"
                  : "border-charcoal text-mist hover:text-star-white",
              )}
            >
              {v}
            </button>
          ))}
        </div>

        {view === "specs" ? (
          <dl className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <dt className="font-mono text-[10px] uppercase tracking-widest text-mist">
                training set
              </dt>
              <dd className="text-sm leading-relaxed text-star-white">{clock.trainingSet}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="font-mono text-[10px] uppercase tracking-widest text-mist">
                strength
              </dt>
              <dd className="text-sm leading-relaxed text-bio-teal">{clock.strength}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="font-mono text-[10px] uppercase tracking-widest text-mist">
                limitation
              </dt>
              <dd className="text-sm leading-relaxed text-helix-amber">{clock.limitation}</dd>
            </div>
            <div className="grid grid-cols-2 gap-3 border-t border-charcoal pt-4">
              <div className="flex flex-col">
                <dt className="font-mono text-[10px] uppercase tracking-widest text-mist">
                  CpG sites
                </dt>
                <dd className="font-mono text-sm text-star-white">{formatInt(clock.cpgSites)}</dd>
              </div>
              <div className="flex flex-col">
                <dt className="font-mono text-[10px] uppercase tracking-widest text-mist">
                  training samples
                </dt>
                <dd className="font-mono text-sm text-star-white">
                  {formatInt(clock.trainingSamples)}
                </dd>
              </div>
            </div>
          </dl>
        ) : (
          <div className="flex flex-col gap-3">
            <h4 className="font-display text-base font-semibold text-star-white">
              {explainer.title}
            </h4>
            <p className="text-sm leading-relaxed text-mist">{explainer.body}</p>
            <div className="rounded-lg border border-charcoal bg-abyss p-3">
              <p className="font-mono text-[10px] uppercase tracking-widest text-mist">
                in the engine
              </p>
              <p className="mt-1 text-xs leading-relaxed text-mist">
                This clock&apos;s generation decides how the Century Engine treats its readings:
                first-gen anchors the baseline, second-gen sets the risk forecast, third-gen is the
                intervention endpoint the Oracle optimizes against.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
