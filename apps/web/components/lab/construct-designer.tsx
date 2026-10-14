"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@geistloom/ui";
import { useMemo, useState } from "react";

/**
 * The construct designer.
 *
 * Deterministic expression model:
 *   expression(t) = promoterStrength · copyNumber · induction · (1 − e^(−t/τ))
 * with τ = 6h for constitutive promoters, 2h for inducible
 * (tissue-specific sits between at 4h). Rendered as an SVG
 * polyline over 48 hours — no randomness anywhere.
 */

type PromoterKind = "constitutive" | "inducible" | "tissue-specific";
type PayloadKind = "reporter" | "therapeutic" | "editor";

const PROMOTERS: readonly {
  readonly id: PromoterKind;
  readonly label: string;
  readonly strength: number;
  readonly tauHours: number;
  readonly note: string;
}[] = [
  {
    id: "constitutive",
    label: "Constitutive (CMV)",
    strength: 1.0,
    tauHours: 6,
    note: "Always on. Strong, steady, no off switch.",
  },
  {
    id: "inducible",
    label: "Inducible (Tet-On)",
    strength: 0.6,
    tauHours: 2,
    note: "Drug-gated. Weaker, but fast and reversible.",
  },
  {
    id: "tissue-specific",
    label: "Tissue-specific (albumin)",
    strength: 0.35,
    tauHours: 4,
    note: "Cell-type locked. Quiet everywhere else.",
  },
];

const PAYLOADS: readonly {
  readonly id: PayloadKind;
  readonly label: string;
  readonly note: string;
}[] = [
  {
    id: "reporter",
    label: "Reporter (GFP)",
    note: "Measures expression; treats nothing. The safe first build.",
  },
  {
    id: "therapeutic",
    label: "Therapeutic (OSK)",
    note: "The partial-reprogramming payload — expression level is the dose.",
  },
  {
    id: "editor",
    label: "Editor (base editor)",
    note: "Permanent, precise, irreversible. Highest containment class.",
  },
];

function expressionAt(
  strength: number,
  copyNumber: number,
  induction: number,
  tau: number,
  t: number,
): number {
  return strength * copyNumber * induction * (1 - Math.exp(-t / tau));
}

const W = 720;
const H = 280;
const PAD_L = 56;
const PAD_R = 24;
const PAD_T = 24;
const PAD_B = 44;
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;
const HOURS = 48;

export function ConstructDesigner() {
  const [promoterId, setPromoterId] = useState<PromoterKind>("constitutive");
  const [payloadId, setPayloadId] = useState<PayloadKind>("reporter");
  const [copyNumber, setCopyNumber] = useState(4);
  const [induction, setInduction] = useState(0.75);

  const promoter = PROMOTERS.find((p) => p.id === promoterId) ?? PROMOTERS[0];
  const payload = PAYLOADS.find((p) => p.id === payloadId) ?? PAYLOADS[0];

  const promoterStrength = promoter?.strength ?? 1;
  const tau = promoter?.tauHours ?? 6;

  const points = useMemo(() => {
    const out: { t: number; v: number }[] = [];
    for (let t = 0; t <= HOURS; t += 1) {
      out.push({
        t,
        v: expressionAt(promoterStrength, copyNumber, induction, tau, t),
      });
    }
    return out;
  }, [promoterStrength, copyNumber, induction, tau]);

  const peak = promoterStrength * copyNumber * induction;
  const t90 = peak > 0 ? tau * Math.log(10) : null;

  const yMax = Math.max(peak * 1.2, 0.5);
  const px = (t: number) => PAD_L + (t / HOURS) * PLOT_W;
  const py = (v: number) => PAD_T + PLOT_H - (v / yMax) * PLOT_H;
  const polyline = points.map((p) => `${px(p.t).toFixed(1)},${py(p.v).toFixed(1)}`).join(" ");

  return (
    <section className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-5">
        {/* controls */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display text-base">Construct design</CardTitle>
            <CardDescription>deterministic expression model · 48-hour window</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {/* promoter */}
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-mist">
                promoter
              </span>
              <div className="flex flex-col gap-2">
                {PROMOTERS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={promoterId === p.id}
                    onClick={() => setPromoterId(p.id)}
                    className={`rounded-lg border px-3 py-2 text-left transition ${
                      promoterId === p.id
                        ? "border-genome-violet/60 bg-genome-violet/10"
                        : "border-charcoal hover:border-genome-violet/40"
                    }`}
                  >
                    <span className="block text-sm font-medium text-star-white">{p.label}</span>
                    <span className="block font-mono text-[10px] text-mist">
                      strength {p.strength.toFixed(2)} · τ = {p.tauHours}h
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-mist">{promoter?.note}</p>
            </div>

            {/* payload */}
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-mist">
                payload
              </span>
              <div className="flex flex-wrap gap-2">
                {PAYLOADS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={payloadId === p.id}
                    onClick={() => setPayloadId(p.id)}
                    className={`rounded-full border px-3 py-1 font-mono text-[11px] transition ${
                      payloadId === p.id
                        ? "border-bio-teal/60 bg-bio-teal/10 text-bio-teal"
                        : "border-charcoal text-mist hover:text-star-white"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-mist">{payload?.note}</p>
            </div>

            {/* sliders */}
            <label className="flex flex-col gap-1.5">
              <span className="flex items-baseline justify-between font-mono text-[11px] text-mist">
                <span>copy number</span>
                <span className="text-bio-teal">{copyNumber}</span>
              </span>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={copyNumber}
                onChange={(event) => setCopyNumber(Number(event.target.value))}
                aria-label="Copy number"
                className="w-full accent-bio-teal"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="flex items-baseline justify-between font-mono text-[11px] text-mist">
                <span>induction level</span>
                <span className="text-bio-teal">{induction.toFixed(2)}</span>
              </span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={induction}
                onChange={(event) => setInduction(Number(event.target.value))}
                aria-label="Induction level"
                className="w-full accent-bio-teal"
              />
            </label>

            {/* readouts */}
            <div className="grid grid-cols-2 gap-3 border-t border-charcoal pt-4">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[10px] uppercase tracking-widest text-mist">
                  peak expression
                </span>
                <span className="font-mono text-xl font-semibold text-bio-teal">
                  {peak.toFixed(2)} a.u.
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[10px] uppercase tracking-widest text-mist">
                  time to 90%
                </span>
                <span className="font-mono text-xl font-semibold text-genome-violet">
                  {t90 === null ? "—" : `${t90.toFixed(1)} h`}
                </span>
              </div>
            </div>

            <div className="rounded-lg border border-charcoal bg-abyss p-3">
              <p className="font-mono text-[10px] uppercase tracking-widest text-mist">the model</p>
              <pre className="mt-1 font-mono text-[11px] leading-relaxed text-bio-teal">
                {`expression(t) = strength × copy
  × induction × (1 − e^(−t/τ))

τ = ${tau}h · strength = ${promoterStrength.toFixed(2)}
t₉₀ = τ·ln(10) ≈ ${t90 === null ? "—" : t90.toFixed(1)}h`}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* curve */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-display text-base">Expression over 48 hours</CardTitle>
            <CardDescription>
              {promoter?.label} · {payload?.label} · {copyNumber} copies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="h-auto w-full"
              role="img"
              aria-label={`Expression curve peaking at ${peak.toFixed(2)} arbitrary units`}
            >
              {/* gridlines */}
              {[0.25, 0.5, 0.75].map((f) => {
                const y = PAD_T + PLOT_H - f * PLOT_H;
                return (
                  <g key={`g-${f}`}>
                    <line
                      x1={PAD_L}
                      x2={PAD_L + PLOT_W}
                      y1={y}
                      y2={y}
                      stroke="#101826"
                      strokeWidth={1}
                    />
                    <text
                      x={PAD_L - 8}
                      y={y + 3}
                      textAnchor="end"
                      fontSize={9}
                      fill="#8fa3b8"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {(yMax * f).toFixed(1)}
                    </text>
                  </g>
                );
              })}
              {/* x ticks */}
              {[0, 12, 24, 36, 48].map((t) => (
                <text
                  key={`x-${t}`}
                  x={px(t)}
                  y={H - 18}
                  textAnchor="middle"
                  fontSize={9}
                  fill="#8fa3b8"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {t}h
                </text>
              ))}
              {/* asymptote */}
              {peak > 0 && (
                <line
                  x1={PAD_L}
                  x2={PAD_L + PLOT_W}
                  y1={py(peak)}
                  y2={py(peak)}
                  stroke="#8b5cf6"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
              )}
              {/* axes */}
              <line
                x1={PAD_L}
                x2={PAD_L + PLOT_W}
                y1={PAD_T + PLOT_H}
                y2={PAD_T + PLOT_H}
                stroke="#2a3a52"
                strokeWidth={1.5}
              />
              <line
                x1={PAD_L}
                x2={PAD_L}
                y1={PAD_T}
                y2={PAD_T + PLOT_H}
                stroke="#2a3a52"
                strokeWidth={1.5}
              />
              {/* curve */}
              <polyline
                points={polyline}
                fill="none"
                stroke="#2dd4bf"
                strokeWidth={2}
                strokeLinejoin="round"
              />
              {/* labels */}
              <text
                x={PAD_L + PLOT_W}
                y={H - 4}
                textAnchor="end"
                fontSize={9}
                fill="#8fa3b8"
                fontFamily="JetBrains Mono, monospace"
              >
                time (hours) →
              </text>
              <text
                x={14}
                y={PAD_T + PLOT_H / 2 + 50}
                textAnchor="start"
                fontSize={9}
                fill="#8fa3b8"
                fontFamily="JetBrains Mono, monospace"
                transform={`rotate(-90 14 ${PAD_T + PLOT_H / 2 + 50})`}
              >
                expression (a.u.) →
              </text>
              {peak > 0 && (
                <text
                  x={PAD_L + PLOT_W - 6}
                  y={py(peak) - 6}
                  textAnchor="end"
                  fontSize={9}
                  fill="#8b5cf6"
                  fontFamily="JetBrains Mono, monospace"
                >
                  asymptote {peak.toFixed(2)}
                </text>
              )}
            </svg>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
