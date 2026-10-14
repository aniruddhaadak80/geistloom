"use client";

import {
  DEFAULT_GENE_DRIVE_PARAMS,
  type GeneDriveParams,
  type GeneDriveState,
  resistanceTakeover,
  simulateGeneDrive,
  timeToFrequency,
} from "@geistloom/core";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, LineChart } from "@geistloom/ui";
import { Play, RotateCcw } from "lucide-react";
import { useState } from "react";
import { GeneDrivePresets } from "./gene-drive-presets";

/**
 * The gene-drive console.
 *
 * Five parameter sliders → POST /api/gene-drive (with a deterministic local
 * fallback via simulateGeneDrive). Renders the allele-frequency chart and the
 * three readouts: time-to-fix (0.9), resistance-takeover generation, and
 * final mean fitness. The verdict banner is computed from those readouts.
 */

const SLIDERS: readonly {
  readonly key: keyof GeneDriveParams;
  readonly label: string;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly format: (v: number) => string;
}[] = [
  {
    key: "driveEfficiency",
    label: "Drive efficiency (e)",
    min: 0.5,
    max: 1,
    step: 0.01,
    format: (v) => v.toFixed(2),
  },
  {
    key: "resistanceRate",
    label: "Resistance rate (r)",
    min: 0,
    max: 0.3,
    step: 0.005,
    format: (v) => v.toFixed(3),
  },
  {
    key: "fitnessCost",
    label: "Fitness cost (c)",
    min: 0,
    max: 0.5,
    step: 0.01,
    format: (v) => v.toFixed(2),
  },
  {
    key: "initialFrequency",
    label: "Initial frequency (p₀)",
    min: 0.001,
    max: 0.2,
    step: 0.001,
    format: (v) => v.toFixed(3),
  },
  {
    key: "generations",
    label: "Generations",
    min: 10,
    max: 200,
    step: 1,
    format: (v) => String(Math.round(v)),
  },
];

type RunSource = "api" | "local";

export function GeneDriveConsole() {
  const [params, setParams] = useState<GeneDriveParams>({
    ...DEFAULT_GENE_DRIVE_PARAMS,
  });
  const [states, setStates] = useState<readonly GeneDriveState[]>(() =>
    simulateGeneDrive(DEFAULT_GENE_DRIVE_PARAMS),
  );
  const [source, setSource] = useState<RunSource | null>(null);
  const [lastRunKey, setLastRunKey] = useState<string>("");
  const [running, setRunning] = useState(false);

  const run = async () => {
    setRunning(true);
    try {
      const res = await fetch("/api/gene-drive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { states?: readonly GeneDriveState[] };
      if (!Array.isArray(data?.states) || data.states.length === 0) {
        throw new Error("empty simulation payload");
      }
      setStates(data.states);
      setSource("api");
    } catch {
      // Deterministic local fallback — same engine, zero network.
      setStates(simulateGeneDrive(params));
      setSource("local");
    } finally {
      setRunning(false);
      setLastRunKey(JSON.stringify(params));
    }
  };

  const reset = () => {
    const defaults = { ...DEFAULT_GENE_DRIVE_PARAMS };
    setParams(defaults);
    setStates(simulateGeneDrive(defaults));
    setSource(null);
    setLastRunKey("");
  };

  const applyPreset = (preset: Partial<GeneDriveParams>) => {
    const next = { ...params, ...preset };
    setParams(next);
    // Presets re-render locally and deterministically; Run hits the API.
    setStates(simulateGeneDrive(next));
    setSource(null);
    setLastRunKey("");
  };

  const ttf = timeToFrequency(params, 0.9);
  const takeover = resistanceTakeover(params);
  const finalState = states[states.length - 1];
  const finalFitness = finalState?.meanFitness ?? 0;
  const resistanceFirst = takeover !== null && (ttf === null || takeover < ttf);
  const stale = lastRunKey !== "" && lastRunKey !== JSON.stringify(params);

  return (
    <section className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="font-display text-base">Drive parameters</CardTitle>
            <div className="flex items-center gap-2">
              {source && (
                <Badge tone={source === "api" ? "teal" : "amber"}>
                  {source === "api" ? "via /api/gene-drive" : "local engine"}
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={reset}>
                <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <GeneDrivePresets onApply={applyPreset} />

          <div className="grid gap-5 md:grid-cols-2">
            {SLIDERS.map((spec) => (
              <label key={spec.key} className="flex flex-col gap-1.5">
                <span className="flex items-baseline justify-between font-mono text-[11px] text-mist">
                  <span>{spec.label}</span>
                  <span className="text-bio-teal">{spec.format(params[spec.key])}</span>
                </span>
                <input
                  type="range"
                  min={spec.min}
                  max={spec.max}
                  step={spec.step}
                  value={params[spec.key]}
                  onChange={(event) =>
                    setParams((prev) => ({
                      ...prev,
                      [spec.key]: Number(event.target.value),
                    }))
                  }
                  aria-label={spec.label}
                  className="w-full accent-genome-violet"
                />
              </label>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={run} disabled={running}>
              <Play className="h-4 w-4" aria-hidden />
              {running ? "Running…" : "Run simulation"}
            </Button>
            {stale && (
              <p className="font-mono text-[11px] text-helix-amber">
                parameters changed — run to refresh the chart
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* verdict banner */}
      <div aria-live="polite" className="flex flex-col gap-2">
        {resistanceFirst ? (
          <div className="rounded-xl border border-helix-amber/50 bg-helix-amber/10 p-5">
            <p className="font-display text-lg font-semibold text-helix-amber">
              Resistance wins — the drive burns out.
            </p>
            <p className="mt-1 text-sm leading-relaxed text-mist">
              This is why every field trial needs a reversal strategy. Resistant alleles overtook
              the drive at generation {takeover ?? "?"} — before the drive ever reached 90%.
            </p>
          </div>
        ) : ttf !== null ? (
          <div className="rounded-xl border border-bio-teal/50 bg-bio-teal/10 p-5">
            <p className="font-display text-lg font-semibold text-bio-teal">
              Drive fixes within {ttf} generations — containment is a governance problem, not a
              biological one.
            </p>
            <p className="mt-1 text-sm leading-relaxed text-mist">
              The drive crosses 90% allele frequency and stays there. Every organism in the
              population carries the edit — which means the decision to release is irreversible at
              ecosystem scale.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-charcoal bg-abyss-2 p-5">
            <p className="font-display text-lg font-semibold text-star-white">
              The drive spreads — but neither fixes nor burns out within {params.generations}{" "}
              generations.
            </p>
            <p className="mt-1 text-sm leading-relaxed text-mist">
              Extend the horizon, raise efficiency, or lower the fitness cost to see which way this
              configuration tips.
            </p>
          </div>
        )}
      </div>

      {/* chart + readouts */}
      <div className="grid items-start gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display text-base">
              Allele frequencies over {states.length - 1} generations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart
              series={[
                {
                  label: "Wild-type",
                  points: states.map((s) => s.wildFrequency),
                },
                {
                  label: "Drive",
                  points: states.map((s) => s.driveFrequency),
                },
                {
                  label: "Resistant",
                  points: states.map((s) => s.resistantFrequency),
                },
              ]}
              labels={states.map((s) => s.generation)}
              height={280}
              yLabel="allele frequency"
              colors={["#8fa3b8", "#2dd4bf", "#f59e0b"]}
            />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-base">Readouts</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[10px] uppercase tracking-widest text-mist">
                  time to 90% drive frequency
                </span>
                <span className="font-mono text-2xl font-semibold text-bio-teal">
                  {ttf === null ? "never" : `${ttf} gen`}
                </span>
              </div>
              <div className="flex flex-col gap-1 border-t border-charcoal pt-4">
                <span className="font-mono text-[10px] uppercase tracking-widest text-mist">
                  resistance takeover
                </span>
                <span className="font-mono text-2xl font-semibold text-helix-amber">
                  {takeover === null ? "never" : `${takeover} gen`}
                </span>
              </div>
              <div className="flex flex-col gap-1 border-t border-charcoal pt-4">
                <span className="font-mono text-[10px] uppercase tracking-widest text-mist">
                  final mean fitness
                </span>
                <span className="font-mono text-2xl font-semibold text-star-white">
                  {finalFitness.toFixed(4)}
                </span>
              </div>
            </CardContent>
          </Card>
          <p className="text-xs leading-relaxed text-mist">
            Readouts are computed client-side from the returned states with the same deterministic
            engine — re-run any configuration and get the identical trajectory.
          </p>
        </div>
      </div>
    </section>
  );
}
