import { simulateCentury } from "@geistloom/core";
import { SEED } from "@geistloom/seed";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@geistloom/ui";

/** Every 100th engine state — 0.25y steps, so one row per 25 years. */
const REPLAY_EVERY = 100;

export function ReplayTable() {
  const { states } = simulateCentury({ seed: SEED });
  const rows = states.filter((state) => state.yearIndex % REPLAY_EVERY === 0);

  return (
    <Card className="p-0">
      <CardHeader className="p-5 pb-0">
        <CardTitle>Replay — every 100th state</CardTitle>
        <CardDescription>
          The untreated world from seed {SEED}, replayed deterministically. One row per 25 simulated
          years.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5">
        <div className="max-h-[460px] overflow-auto rounded-lg border border-charcoal">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-charcoal text-left font-mono text-[11px] uppercase tracking-wider text-mist">
                <th className="sticky top-0 bg-abyss-2 px-4 py-2.5">Year</th>
                <th className="sticky top-0 bg-abyss-2 px-4 py-2.5">Life expectancy</th>
                <th className="sticky top-0 bg-abyss-2 px-4 py-2.5">Population</th>
                <th className="sticky top-0 bg-abyss-2 px-4 py-2.5">Biosphere</th>
                <th className="sticky top-0 bg-abyss-2 px-4 py-2.5">AI capability</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((state) => (
                <tr key={state.year} className="border-b border-charcoal/60 last:border-0">
                  <td className="px-4 py-2 font-mono text-star-white">{state.year}</td>
                  <td className="px-4 py-2 font-mono text-bio-teal">
                    {state.lifeExpectancy.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 font-mono text-star-white/90">
                    {state.population.toFixed(2)} bn
                  </td>
                  <td className="px-4 py-2 font-mono text-star-white/90">
                    {state.biosphereHealth.toFixed(1)}
                  </td>
                  <td className="px-4 py-2 font-mono text-genome-violet">
                    {state.aiCapability.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
