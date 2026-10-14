import { scenarioProbabilities } from "@geistloom/core";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@geistloom/ui";
import { ScenarioRunLink } from "./scenario-run-link";

/**
 * The six futures as cards: name, tagline, description, probability
 * bar (from scenarioProbabilities()), drivers, and the engineShifts
 * mini-table with directional coloring.
 * Server component.
 */

const SHIFT_ROWS: readonly {
  readonly key:
    | "knowledgeMultiplier"
    | "adoptionSpeedMultiplier"
    | "biosphereDrift"
    | "aiAcceleration";
  readonly label: string;
}[] = [
  { key: "knowledgeMultiplier", label: "knowledge" },
  { key: "adoptionSpeedMultiplier", label: "adoption speed" },
  { key: "biosphereDrift", label: "biosphere drift" },
  { key: "aiAcceleration", label: "AI acceleration" },
];

function shiftClass(v: number): string {
  if (v > 1) return "text-bio-teal";
  if (v < 1) return "text-red-400";
  return "text-mist";
}

function shiftPrefix(v: number): string {
  if (v > 1) return "+";
  return "";
}

export function ScenariosGrid() {
  const probabilities = scenarioProbabilities();

  return (
    <section className="flex flex-col gap-6">
      <div className="grid gap-5 md:grid-cols-2">
        {probabilities.map(({ scenario, probability }) => (
          <Card key={scenario.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <CardTitle>{scenario.name}</CardTitle>
                <span className="font-mono text-sm font-semibold text-genome-violet">
                  {(probability * 100).toFixed(1)}%
                </span>
              </div>
              <CardDescription>{scenario.tagline}</CardDescription>
              <div
                className="h-1.5 w-full overflow-hidden rounded-full bg-charcoal"
                role="img"
                aria-label={`probability ${(probability * 100).toFixed(1)} percent`}
              >
                <div
                  className="h-full rounded-full bg-genome-violet"
                  style={{ width: `${probability * 100}%` }}
                />
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4">
              <p className="text-sm leading-relaxed text-mist">{scenario.description}</p>

              <div className="flex flex-col gap-1.5">
                <span className="font-mono text-[10px] uppercase tracking-widest text-mist">
                  drivers
                </span>
                <ul className="flex flex-col gap-1">
                  {scenario.drivers.map((driver) => (
                    <li key={driver} className="flex gap-2 text-sm text-mist">
                      <span aria-hidden className="text-bio-teal">
                        ▸
                      </span>
                      {driver}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-1">
                <span className="font-mono text-[10px] uppercase tracking-widest text-mist">
                  engine shifts
                </span>
                <table className="w-full text-sm">
                  <tbody>
                    {SHIFT_ROWS.map((row) => {
                      const value = scenario.engineShifts[row.key];
                      return (
                        <tr key={row.key} className="border-b border-charcoal/50 last:border-0">
                          <td className="py-1.5 text-mist">{row.label}</td>
                          <td className={`py-1.5 text-right font-mono ${shiftClass(value)}`}>
                            {shiftPrefix(value)}
                            {value.toFixed(2)}×
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-auto pt-2">
                <ScenarioRunLink scenarioId={scenario.id} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
