"use client";

import {
  type EvidenceGrade,
  getScenario,
  INTERVENTIONS,
  SCENARIOS,
  type SimulationResult,
} from "@geistloom/core";
import {
  Badge,
  type BadgeTone,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@geistloom/ui";
import { useState } from "react";
import { CenturyCharts } from "./century-charts";
import { CenturySummary } from "./century-summary";
import { InterventionTimeline } from "./intervention-timeline";
import { TimeMachine } from "./time-machine";

const EVIDENCE_TONE: Record<EvidenceGrade, BadgeTone> = {
  approved: "teal",
  clinical: "amber",
  preclinical: "violet",
  theoretical: "mist",
};

const END_YEARS = [2100, 2150, 2226] as const;

/** The exact configuration that produced the currently displayed run. */
interface CenturyRunConfig {
  readonly seed: number;
  readonly endYear: number;
  readonly scenarioId: string;
  readonly enabledInterventionIds: readonly string[];
}

interface CenturyConsoleProps {
  readonly initialResult: SimulationResult;
  readonly initialSeed: number;
}

export function CenturyConsole({ initialResult, initialSeed }: CenturyConsoleProps) {
  const [result, setResult] = useState<SimulationResult>(initialResult);
  const [runConfig, setRunConfig] = useState<CenturyRunConfig>({
    seed: initialSeed,
    endYear: 2226,
    scenarioId: SCENARIOS[0]?.id ?? "",
    enabledInterventionIds: [],
  });
  const [seedInput, setSeedInput] = useState<string>(String(initialSeed));
  const [scenarioId, setScenarioId] = useState<string>(SCENARIOS[0]?.id ?? "");
  const [endYear, setEndYear] = useState<number>(2226);
  const [enabled, setEnabled] = useState<readonly string[]>([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scenario = getScenario(scenarioId);

  function toggleIntervention(id: string): void {
    setEnabled((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function runSimulation(): Promise<void> {
    const parsedSeed = Math.floor(Number(seedInput));
    if (!Number.isFinite(parsedSeed) || parsedSeed <= 0) {
      setError("Seed must be a positive integer.");
      return;
    }
    setRunning(true);
    setError(null);
    try {
      const response = await fetch("/api/century/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seed: parsedSeed,
          enabledInterventionIds: enabled,
          endYear,
          scenarioId,
        }),
      });
      if (!response.ok) {
        throw new Error(`Simulation failed (HTTP ${response.status}).`);
      }
      const data = (await response.json()) as SimulationResult;
      if (!Array.isArray(data.states) || data.states.length === 0) {
        throw new Error("Simulation returned no world states.");
      }
      setResult(data);
      setRunConfig({
        seed: parsedSeed,
        endYear,
        scenarioId,
        enabledInterventionIds: enabled,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Simulation failed.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[400px_1fr]">
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Simulation controls</CardTitle>
            <CardDescription>
              Every run is deterministic — same seed, same universe.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <label className="flex flex-col gap-1.5">
              <span className="font-mono text-xs uppercase tracking-wider text-mist">Scenario</span>
              <select
                value={scenarioId}
                onChange={(event) => setScenarioId(event.target.value)}
                className="rounded-lg border border-charcoal bg-abyss px-3 py-2 text-sm text-star-white focus:border-bio-teal focus:outline-none"
              >
                {SCENARIOS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            {scenario && (
              <p className="rounded-lg border border-charcoal bg-abyss p-3 text-sm leading-relaxed text-mist">
                <span className="font-semibold text-star-white">{scenario.tagline}</span>
                {" — "}
                {scenario.description}
              </p>
            )}
            <label className="flex flex-col gap-1.5">
              <span className="font-mono text-xs uppercase tracking-wider text-mist">Seed</span>
              <input
                type="number"
                min={1}
                step={1}
                value={seedInput}
                onChange={(event) => setSeedInput(event.target.value)}
                className="rounded-lg border border-charcoal bg-abyss px-3 py-2 font-mono text-sm text-star-white focus:border-bio-teal focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="font-mono text-xs uppercase tracking-wider text-mist">End year</span>
              <select
                value={endYear}
                onChange={(event) => setEndYear(Number(event.target.value))}
                className="rounded-lg border border-charcoal bg-abyss px-3 py-2 text-sm text-star-white focus:border-bio-teal focus:outline-none"
              >
                {END_YEARS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>
            <Button onClick={runSimulation} disabled={running}>
              {running ? "Simulating…" : "Run simulation"}
            </Button>
            {error && <p className="text-sm text-red-400">{error}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Interventions</CardTitle>
            <CardDescription>
              {enabled.length} of {INTERVENTIONS.length} enabled
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex max-h-[440px] flex-col gap-0.5 overflow-y-auto pr-1">
              {INTERVENTIONS.map((iv) => (
                <label
                  key={iv.id}
                  className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-charcoal/60"
                >
                  <input
                    type="checkbox"
                    checked={enabled.includes(iv.id)}
                    onChange={() => toggleIntervention(iv.id)}
                    className="h-4 w-4 accent-bio-teal"
                  />
                  <span className="flex-1 leading-snug text-star-white/90">{iv.name}</span>
                  <Badge tone={EVIDENCE_TONE[iv.evidence]}>{iv.evidence}</Badge>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-6">
        <CenturySummary result={result} />
        <CenturyCharts
          result={result}
          seed={runConfig.seed}
          endYear={runConfig.endYear}
          scenarioId={runConfig.scenarioId}
        />
        <TimeMachine
          states={result.states}
          seed={runConfig.seed}
          enabledInterventionIds={runConfig.enabledInterventionIds}
          endYear={runConfig.endYear}
        />
        <InterventionTimeline
          enabledInterventionIds={runConfig.enabledInterventionIds}
          endYear={runConfig.endYear}
        />
      </div>
    </div>
  );
}
