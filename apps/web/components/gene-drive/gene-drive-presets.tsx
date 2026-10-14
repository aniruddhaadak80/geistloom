"use client";

import type { GeneDriveParams } from "@geistloom/core";
import { Button } from "@geistloom/ui";

/**
 * Deterministic presets for the gene-drive console.
 * Each preset is a frozen set of constants — no derivation, no randomness.
 */

export const GENE_DRIVE_PRESETS: readonly {
  readonly id: string;
  readonly label: string;
  readonly hint: string;
  readonly params: Partial<GeneDriveParams>;
}[] = [
  {
    id: "malaria-homing",
    label: "Malaria homing drive",
    hint: "Anopheles gambiae, standard homing config",
    params: {
      driveEfficiency: 0.95,
      resistanceRate: 0.02,
      fitnessCost: 0.05,
      initialFrequency: 0.01,
      generations: 60,
    },
  },
  {
    id: "aggressive-spread",
    label: "Aggressive spread",
    hint: "near-perfect homing, low cost, wide release",
    params: {
      driveEfficiency: 0.99,
      resistanceRate: 0.01,
      fitnessCost: 0.02,
      initialFrequency: 0.05,
      generations: 100,
    },
  },
  {
    id: "contained-trial",
    label: "Contained trial",
    hint: "high fitness cost keeps the drive local",
    params: {
      driveEfficiency: 0.85,
      resistanceRate: 0.05,
      fitnessCost: 0.25,
      initialFrequency: 0.005,
      generations: 40,
    },
  },
  {
    id: "resistance-heavy",
    label: "Resistance-heavy",
    hint: "the burnout scenario — resistance wins",
    params: {
      driveEfficiency: 0.9,
      resistanceRate: 0.25,
      fitnessCost: 0.1,
      initialFrequency: 0.02,
      generations: 80,
    },
  },
];

export function GeneDrivePresets({
  onApply,
}: {
  readonly onApply: (params: Partial<GeneDriveParams>) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <span className="font-mono text-[11px] uppercase tracking-widest text-mist">presets</span>
      <div className="flex flex-wrap gap-2">
        {GENE_DRIVE_PRESETS.map((preset) => (
          <Button
            key={preset.id}
            variant="secondary"
            size="sm"
            onClick={() => onApply(preset.params)}
            title={preset.hint}
          >
            {preset.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
