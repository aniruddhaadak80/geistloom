"use client";

import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@geistloom/ui";
import { useState } from "react";

/**
 * Lab safety — the containment contract.
 *
 * In Geistloom no construct ships without its containment checklist.
 * The gates below are the standing agreement of the frame: every
 * simulated therapeutic goes through the same audit before the
 * Century Engine is allowed to propagate it into a world.
 *
 * The checklist starts fully unchecked on purpose — a design session
 * that ends with an empty box has not finished its containment work.
 */

interface Gate {
  readonly id: string;
  readonly title: string;
  readonly requirement: string;
  readonly level: "mandatory" | "escalating" | "prohibited";
}

const GATES: readonly Gate[] = [
  {
    id: "identity",
    title: "Sequence identity verified",
    requirement:
      "Full insert + junctions Sanger-verified against the design file; hash of the construct record committed to the run log.",
    level: "mandatory",
  },
  {
    id: "off-target",
    title: "Off-target profile published",
    requirement:
      "Genome-wide assessment (GUIDE-seq / CIRCLE-seq or equivalent) attached to the plan, including the no-edit control.",
    level: "mandatory",
  },
  {
    id: "containment",
    title: "Biological containment designed in",
    requirement:
      "Kill switch, auxotrophy or split-intein architecture present and bench-tested at the intended expression level.",
    level: "mandatory",
  },
  {
    id: "escape",
    title: "Escape consequences simulated",
    requirement:
      "Gene Drive Lab model run for the payload's drive-compatible components over 60 generations, resistance takeover documented.",
    level: "escalating",
  },
  {
    id: "dual-use",
    title: "Dual-use review recorded",
    requirement:
      "Payload capability screened against the pathogen-hunting list; reviewer, date, and decision retained with the design.",
    level: "escalating",
  },
  {
    id: "germline",
    title: "Germline boundary respected",
    requirement:
      "Somatic-only delivery. Heritable edits remain outside the frame's mandate — modeled as scenarios, never as designs.",
    level: "prohibited",
  },
];

const LEVEL_TONE: Record<Gate["level"], "teal" | "amber" | "violet"> = {
  mandatory: "teal",
  escalating: "amber",
  prohibited: "violet",
};

export function LabSafety() {
  const [checked, setChecked] = useState<ReadonlySet<string>>(new Set());

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const cleared = GATES.filter((g) => checked.has(g.id)).length;

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-2xl font-bold tracking-tight">The containment contract</h2>
        <p className="text-sm text-mist">
          Six gates every construct clears before the Century Engine will propagate it. Cleared so
          far:{" "}
          <span className="font-mono text-bio-teal">
            {cleared}/{GATES.length}
          </span>
          .
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base">Gates</CardTitle>
          <CardDescription>
            deterministic audit · local to the frame · no external approval service
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {GATES.map((gate) => {
            const on = checked.has(gate.id);
            return (
              <label
                key={gate.id}
                className={`flex cursor-pointer gap-3 rounded-lg border p-4 transition ${
                  on ? "border-bio-teal/50 bg-bio-teal/5" : "border-charcoal hover:border-mist/40"
                }`}
              >
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => toggle(gate.id)}
                  className="mt-1 h-4 w-4 accent-bio-teal"
                />
                <span className="flex flex-col gap-1">
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-medium text-star-white">{gate.title}</span>
                    <Badge tone={LEVEL_TONE[gate.level]}>{gate.level}</Badge>
                  </span>
                  <span className="text-xs leading-relaxed text-mist">{gate.requirement}</span>
                </span>
              </label>
            );
          })}
        </CardContent>
      </Card>

      <Card variant="outline">
        <CardContent className="pt-6">
          <p className="font-mono text-[10px] uppercase tracking-widest text-mist">the rule</p>
          <p className="mt-2 text-sm leading-relaxed text-mist">
            Geistloom is a <em>computational</em> frame: it designs and scores constructs, it does
            not synthesize them. Every experiment this lab inspires still happens at a real bench,
            under real institutional review, with real accountability. The engine's job is to make
            the reasoning auditable — never to skip the people who sign for the work.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
