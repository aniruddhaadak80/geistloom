"use client";

import { CLOCKS, estimateAge, mulberry32 } from "@geistloom/core";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@geistloom/ui";
import { useMemo, useState } from "react";

/**
 * Synthetic methylation playground.
 *
 * 24 sliders (0–1) seeded from a deterministic pattern via mulberry32(4093).
 * The same profile is pushed through estimateAge() for all eight clocks —
 * and the disagreement between the eight answers is the point.
 */

const PROFILE_LENGTH = 24;
const MAX_AGE = 120;

function initialProfile(): readonly number[] {
  const rng = mulberry32(4093);
  const values: number[] = [];
  for (let i = 0; i < PROFILE_LENGTH; i++) {
    // Deterministic wave + seeded jitter — an "aged" profile on average.
    const wave = 0.56 + Math.sin(i / 3.2) * 0.14;
    const jitter = (rng() - 0.5) * 0.42;
    values.push(Math.min(1, Math.max(0, wave + jitter)));
  }
  return values;
}

export function ClockPlayground() {
  const [profile, setProfile] = useState<readonly number[]>(initialProfile);

  const estimates = useMemo(
    () =>
      CLOCKS.map((clock) => ({
        clock,
        age: estimateAge(clock.id, profile),
      })),
    [profile],
  );

  const ages = estimates.map((e) => e.age);
  const spread = Math.max(...ages) - Math.min(...ages);

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h2 className="font-display text-xl font-semibold text-star-white">
          Same methylome, eight answers — clocks disagree, and that disagreement is the science.
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-mist">
          Drag the CpG sliders to build a synthetic methylation profile. Every clock reads the same
          24 sites through its own trained lens — the spread between the youngest and oldest reading
          is the measurement uncertainty any longevity trial has to price in.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* sliders */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display text-base">Synthetic methylome</CardTitle>
            <CardDescription>24 CpG loci, β-values 0–1 · deterministic seed 4093</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
              {Array.from({ length: PROFILE_LENGTH }, (_, i) => i).map((i) => (
                <label key={i} className="flex flex-col gap-1">
                  <span className="flex items-baseline justify-between font-mono text-[10px] text-mist">
                    <span>cpg {String(i + 1).padStart(2, "0")}</span>
                    <span className="text-bio-teal">{(profile[i] ?? 0).toFixed(2)}</span>
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={profile[i] ?? 0}
                    onChange={(event) =>
                      setProfile((prev) =>
                        prev.map((v, j) => (j === i ? Number(event.target.value) : v)),
                      )
                    }
                    aria-label={`CpG site ${i + 1} methylation level`}
                    className="w-full accent-bio-teal"
                  />
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* comparison bars */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-display text-base">
              Estimated biological age, per clock
            </CardTitle>
            <CardDescription>
              spread: {spread.toFixed(1)} years between the youngest and oldest reading
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3.5">
            {estimates.map(({ clock, age }) => (
              <div key={clock.id} className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm text-star-white">{clock.name}</span>
                  <span className="font-mono text-xs text-genome-violet">{age.toFixed(1)} yrs</span>
                </div>
                <div
                  className="h-2 w-full overflow-hidden rounded-full bg-charcoal"
                  role="img"
                  aria-label={`${clock.name} estimates ${age.toFixed(1)} years`}
                >
                  <div
                    className="h-full rounded-full bg-genome-violet transition-[width]"
                    style={{ width: `${(age / MAX_AGE) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-mist">
              bar length = estimated age / {MAX_AGE} years
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
