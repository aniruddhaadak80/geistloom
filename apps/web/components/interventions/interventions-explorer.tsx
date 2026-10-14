"use client";

import { getIntervention } from "@geistloom/core";
import { useState } from "react";
import { InterventionDetail } from "./intervention-detail";
import { InterventionsGrid } from "./interventions-grid";

/**
 * Selection state for the Intervention Atlas: the grid (filters + cards) on
 * the left, the detail panel on the right. Held here so both halves stay in
 * sync; the page itself remains a server component.
 */
export function InterventionsExplorer() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = selectedId ? getIntervention(selectedId) : undefined;

  return (
    <section className="grid items-start gap-6 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <InterventionsGrid selectedId={selectedId} onSelect={setSelectedId} />
      </div>
      <div className="lg:col-span-2">
        <InterventionDetail intervention={selected ?? null} onClose={() => setSelectedId(null)} />
      </div>
    </section>
  );
}
