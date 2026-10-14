import { type EvidenceGrade, INTERVENTIONS, type Intervention } from "@geistloom/core";

/**
 * Readiness × leverage quadrant.
 *
 * x = readiness (evidence grade mapped to a translatability score),
 * y = leverage (fraction of the natural aging rate removed, scaled).
 * Server component — pure SVG, no hooks, no randomness.
 */

const READINESS: Record<EvidenceGrade, number> = {
  approved: 0.9,
  clinical: 0.7,
  preclinical: 0.45,
  theoretical: 0.2,
};

const EVIDENCE_COLOR: Record<EvidenceGrade, string> = {
  approved: "#2dd4bf",
  clinical: "#8b5cf6",
  preclinical: "#f59e0b",
  theoretical: "#8fa3b8",
};

const EVIDENCE_LABEL: Record<EvidenceGrade, string> = {
  approved: "approved",
  clinical: "clinical",
  preclinical: "preclinical",
  theoretical: "theoretical",
};

const W = 720;
const H = 480;
const PAD_L = 64;
const PAD_R = 28;
const PAD_T = 30;
const PAD_B = 56;
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;

const xAt = (readiness: number): number => PAD_L + readiness * PLOT_W;
const yAt = (leverage: number): number =>
  PAD_T + PLOT_H - Math.min(1, Math.max(0, leverage)) * PLOT_H;

const leverageOf = (iv: Intervention): number => iv.agingRateReduction / 0.35;

const EVIDENCE_ORDER: readonly EvidenceGrade[] = [
  "approved",
  "clinical",
  "preclinical",
  "theoretical",
];

export function InterventionsQuadrant() {
  const ranked = [...INTERVENTIONS].sort(
    (a, b) => b.agingRateReduction - a.agingRateReduction || a.name.localeCompare(b.name),
  );
  const topSix = ranked.slice(0, 6);
  const labeled = new Set(topSix.map((iv) => iv.id));

  return (
    <figure
      className="w-full rounded-xl border border-charcoal bg-abyss-2 p-4"
      role="img"
      aria-label="Quadrant chart of interventions by readiness and leverage"
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
        <title>Quadrant chart of interventions by readiness and leverage</title>
        {/* gridlines */}
        {[0.25, 0.5, 0.75].map((f) => (
          <g key={`grid-${f}`}>
            <line
              x1={xAt(f)}
              x2={xAt(f)}
              y1={PAD_T}
              y2={PAD_T + PLOT_H}
              stroke="#101826"
              strokeWidth={1}
            />
            <line
              x1={PAD_L}
              x2={PAD_L + PLOT_W}
              y1={yAt(f)}
              y2={yAt(f)}
              stroke="#101826"
              strokeWidth={1}
            />
          </g>
        ))}
        {/* quadrant dividers */}
        <line
          x1={xAt(0.5)}
          x2={xAt(0.5)}
          y1={PAD_T}
          y2={PAD_T + PLOT_H}
          stroke="#1d2a3d"
          strokeWidth={1}
          strokeDasharray="4 4"
        />
        <line
          x1={PAD_L}
          x2={PAD_L + PLOT_W}
          y1={yAt(0.5)}
          y2={yAt(0.5)}
          stroke="#1d2a3d"
          strokeWidth={1}
          strokeDasharray="4 4"
        />
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
        {/* x grade ticks */}
        {EVIDENCE_ORDER.map((grade) => (
          <text
            key={grade}
            x={xAt(READINESS[grade])}
            y={PAD_T + PLOT_H + 18}
            textAnchor="middle"
            fontSize={10}
            fill={EVIDENCE_COLOR[grade]}
            fontFamily="JetBrains Mono, monospace"
          >
            {EVIDENCE_LABEL[grade]}
          </text>
        ))}
        {/* y leverage ticks */}
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <text
            key={`y-${f}`}
            x={PAD_L - 10}
            y={yAt(f) + 3}
            textAnchor="end"
            fontSize={10}
            fill="#8fa3b8"
            fontFamily="JetBrains Mono, monospace"
          >
            {f.toFixed(2)}
          </text>
        ))}
        {/* axis labels */}
        <text
          x={PAD_L + PLOT_W}
          y={H - 14}
          textAnchor="end"
          fontSize={11}
          fill="#8fa3b8"
          fontFamily="JetBrains Mono, monospace"
        >
          readiness →
        </text>
        <text
          x={20}
          y={PAD_T + PLOT_H / 2 + 40}
          textAnchor="start"
          fontSize={11}
          fill="#8fa3b8"
          fontFamily="JetBrains Mono, monospace"
          transform={`rotate(-90 20 ${PAD_T + PLOT_H / 2 + 40})`}
        >
          leverage →
        </text>
        {/* quadrant captions */}
        <text
          x={PAD_L + 14}
          y={PAD_T + 26}
          fontSize={13}
          fontWeight={600}
          fill="#8fa3b8"
          fontFamily="Space Grotesk, sans-serif"
        >
          Bet big, build fast
        </text>
        <text
          x={PAD_L + PLOT_W - 14}
          y={PAD_T + 26}
          textAnchor="end"
          fontSize={13}
          fontWeight={600}
          fill="#2dd4bf"
          fontFamily="Space Grotesk, sans-serif"
        >
          Ship it now
        </text>
        <text
          x={PAD_L + 14}
          y={PAD_T + PLOT_H - 14}
          fontSize={13}
          fontWeight={600}
          fill="#8fa3b8"
          fontFamily="Space Grotesk, sans-serif"
        >
          Strategic patience
        </text>
        <text
          x={PAD_L + PLOT_W - 14}
          y={PAD_T + PLOT_H - 14}
          textAnchor="end"
          fontSize={13}
          fontWeight={600}
          fill="#8fa3b8"
          fontFamily="Space Grotesk, sans-serif"
        >
          Watch and wait
        </text>
        {/* intervention points */}
        {INTERVENTIONS.map((iv) => {
          const cx = xAt(READINESS[iv.evidence]);
          const cy = yAt(leverageOf(iv));
          const isLabeled = labeled.has(iv.id);
          const labelX = Math.min(cx + 9, PAD_L + PLOT_W - 96);
          return (
            <g key={iv.id}>
              <title>{`${iv.name} — readiness ${READINESS[iv.evidence]}, leverage ${leverageOf(iv).toFixed(2)}`}</title>
              <circle
                cx={cx}
                cy={cy}
                r={5}
                fill={EVIDENCE_COLOR[iv.evidence]}
                fillOpacity={0.9}
                stroke="#070b12"
                strokeWidth={1}
              />
              {isLabeled && (
                <text
                  x={labelX}
                  y={cy - 8}
                  fontSize={10}
                  fill="#e8f1f2"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {iv.name}
                </text>
              )}
            </g>
          );
        })}
        {/* legend */}
        {EVIDENCE_ORDER.map((grade, i) => (
          <g key={`legend-${grade}`}>
            <circle cx={PAD_L + i * 96} cy={H - 34} r={4} fill={EVIDENCE_COLOR[grade]} />
            <text
              x={PAD_L + i * 96 + 9}
              y={H - 30}
              fontSize={10}
              fill="#8fa3b8"
              fontFamily="JetBrains Mono, monospace"
            >
              {EVIDENCE_LABEL[grade]}
            </text>
          </g>
        ))}
      </svg>
      <figcaption className="px-2 pb-1 pt-2 text-xs text-mist">
        Top-six leverage interventions are labeled. Leverage = fraction of the natural aging rate
        removed at full coverage, scaled by 0.35.
      </figcaption>
    </figure>
  );
}
