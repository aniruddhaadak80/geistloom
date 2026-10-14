"use client";

import { useState } from "react";

/**
 * The value-learning playground.
 *
 * Four weights (0–1, default 0.5) feed two deterministic indices:
 *   justiceIndex = 0.4·equality + 0.3·(1 − governanceLag) + 0.3·biospherePriority
 *   riskIndex    = 0.5·speed + 0.5·governanceLag
 * Both render as SVG arc gauges, with a deterministic verdict line.
 */

const WEIGHT_SPECS: readonly {
  readonly key: "longevityEquality" | "biospherePriority" | "speedToClinic" | "governanceLag";
  readonly label: string;
  readonly hint: string;
}[] = [
  {
    key: "longevityEquality",
    label: "longevity equality",
    hint: "how evenly the therapies distribute",
  },
  {
    key: "biospherePriority",
    label: "biosphere priority",
    hint: "weight given to planetary health",
  },
  {
    key: "speedToClinic",
    label: "speed to clinic",
    hint: "how fast interventions ship",
  },
  {
    key: "governanceLag",
    label: "governance lag",
    hint: "how far rules trail capability",
  },
];

type Weights = Record<(typeof WEIGHT_SPECS)[number]["key"], number>;

const DEFAULT_WEIGHTS: Weights = {
  longevityEquality: 0.5,
  biospherePriority: 0.5,
  speedToClinic: 0.5,
  governanceLag: 0.5,
};

function justiceIndex(w: Weights): number {
  return 0.4 * w.longevityEquality + 0.3 * (1 - w.governanceLag) + 0.3 * w.biospherePriority;
}

function riskIndex(w: Weights): number {
  return 0.5 * w.speedToClinic + 0.5 * w.governanceLag;
}

function verdict(j: number, r: number): string {
  if (j >= 0.65 && r <= 0.45) {
    return "A just and cautious frame — speed is subordinated to equity and containment. This is the configuration the Oracle is allowed to plan under.";
  }
  if (r >= 0.65) {
    return "The frame optimizes for speed — governance lag makes this the riskiest configuration. Every fast lane needs a guardrail or it becomes a cliff.";
  }
  if (j <= 0.35) {
    return "The frame neglects justice — longevity inequality and biosphere cost are unpriced. This is how the Divided World scenario happens.";
  }
  return "A balanced frame — neither justice nor risk dominates. Governance lag is the hinge variable: pull it down and both indices improve.";
}

function Gauge({
  value,
  label,
  color,
}: {
  readonly value: number;
  readonly label: string;
  readonly color: string;
}) {
  const W = 200;
  const H = 120;
  const cx = W / 2;
  const cy = 96;
  const r = 72;
  const endAngle = Math.PI * (1 - value);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy - r * Math.sin(endAngle);
  const largeArc = value > 0.5 ? 1 : 0;
  const arc = `M ${cx - r} ${cy} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      role="img"
      aria-label={`${label} gauge: ${value.toFixed(2)}`}
    >
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke="#101826"
        strokeWidth={10}
        strokeLinecap="round"
      />
      {value > 0.005 && (
        <path d={arc} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round" />
      )}
      <text
        x={cx}
        y={cy - 26}
        textAnchor="middle"
        fontSize={24}
        fontWeight={700}
        fill={color}
        fontFamily="Space Grotesk, sans-serif"
      >
        {value.toFixed(2)}
      </text>
      <text
        x={cx}
        y={cy + 18}
        textAnchor="middle"
        fontSize={10}
        fill="#8fa3b8"
        fontFamily="JetBrains Mono, monospace"
      >
        {label}
      </text>
    </svg>
  );
}

export function EthicsValueLab() {
  const [weights, setWeights] = useState<Weights>({ ...DEFAULT_WEIGHTS });

  const justice = justiceIndex(weights);
  const risk = riskIndex(weights);

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h2 className="font-display text-xl font-semibold text-star-white">
          The value-learning playground
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-mist">
          Every superintelligence optimizes against an objective. These four weights are ours — tune
          them and watch the justice and risk indices respond. The formulas are on the page; nothing
          is hidden.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* weights */}
        <div className="flex flex-col gap-5 rounded-xl border border-charcoal bg-abyss-2 p-6">
          <span className="font-mono text-[11px] uppercase tracking-widest text-mist">weights</span>
          {WEIGHT_SPECS.map((spec) => (
            <label key={spec.key} className="flex flex-col gap-1.5">
              <span className="flex items-baseline justify-between">
                <span className="text-sm text-star-white">{spec.label}</span>
                <span className="font-mono text-xs text-bio-teal">
                  {weights[spec.key].toFixed(2)}
                </span>
              </span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={weights[spec.key]}
                onChange={(event) =>
                  setWeights((prev) => ({
                    ...prev,
                    [spec.key]: Number(event.target.value),
                  }))
                }
                aria-label={spec.label}
                className="w-full accent-bio-teal"
              />
              <span className="font-mono text-[10px] text-mist/70">{spec.hint}</span>
            </label>
          ))}
          <div className="mt-2 rounded-lg border border-charcoal bg-abyss p-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-mist">
              the math, verbatim
            </p>
            <pre className="mt-2 font-mono text-[11px] leading-relaxed text-genome-violet">
              {`justice = 0.4·equality
        + 0.3·(1 − governanceLag)
        + 0.3·biospherePriority

risk    = 0.5·speedToClinic
        + 0.5·governanceLag`}
            </pre>
          </div>
        </div>

        {/* gauges + verdict */}
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-charcoal bg-abyss-2 p-4">
              <Gauge value={justice} label="justice index" color="#2dd4bf" />
            </div>
            <div className="rounded-xl border border-charcoal bg-abyss-2 p-4">
              <Gauge value={risk} label="risk index" color="#f59e0b" />
            </div>
          </div>
          <div
            className="rounded-xl border border-bio-teal/40 bg-bio-teal/5 p-5"
            aria-live="polite"
          >
            <p className="font-mono text-[10px] uppercase tracking-widest text-bio-teal">verdict</p>
            <p className="mt-2 text-sm leading-relaxed text-star-white">{verdict(justice, risk)}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
