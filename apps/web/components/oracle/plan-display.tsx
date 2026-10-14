"use client";

import type { OraclePlan } from "@geistloom/core";
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@geistloom/ui";

/**
 * The plan header: title, domain/scenario/model badges, summary,
 * and the key-numbers grid.
 */
export function PlanDisplay({ plan }: { plan: OraclePlan }) {
  return (
    <Card variant="elevated">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="teal">{plan.domain}</Badge>
          <Badge tone="violet">{plan.scenario}</Badge>
          <Badge tone="outline">{plan.model}</Badge>
        </div>
        <CardTitle className="text-2xl">{plan.title}</CardTitle>
        <CardDescription>{plan.summary}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          {plan.keyNumbers.map((kn) => (
            <div key={kn.label} className="rounded-lg border border-charcoal bg-abyss p-3">
              <p className="font-mono text-[10px] uppercase tracking-wider text-mist">{kn.label}</p>
              <p className="mt-1 font-display text-xl font-bold text-bio-teal">
                {kn.value}
                <span className="ml-1 text-xs font-normal text-mist">{kn.unit}</span>
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
