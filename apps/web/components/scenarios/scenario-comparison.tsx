import { SCENARIOS } from "@geistloom/core";

/**
 * Grouped bar chart: knowledgeMultiplier vs adoptionSpeedMultiplier
 * for all six scenarios. Server component — pure SVG.
 */

const W = 720;
const H = 360;
const PAD_L = 48;
const PAD_R = 24;
const PAD_T = 40;
const PAD_B = 64;
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;

const MAX_V = 3;
const Y_TICKS = [0, 1, 2, 3];

const SHORT_NAME: Record<string, string> = {
  "bio-dividend": "Bio-Dividend",
  "lev-2035": "LEV 2035",
  "post-scarcity": "Post-Scarcity",
  stagnation: "Stagnation",
  "divided-world": "Divided World",
  "misalignment-shadow": "Misalignment",
};

const COLOR_KNOWLEDGE = "#2dd4bf";
const COLOR_ADOPTION = "#8b5cf6";

export function ScenarioComparison() {
  const groupW = PLOT_W / SCENARIOS.length;
  const barW = Math.min(34, groupW / 3);

  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-display text-xl font-semibold text-star-white">
        Engine shifts, side by side
      </h2>
      <figure
        className="w-full rounded-xl border border-charcoal bg-abyss-2 p-4"
        role="img"
        aria-label="Grouped bar chart comparing knowledge and adoption speed multipliers across six scenarios"
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
          <title>
            Grouped bar chart comparing knowledge and adoption speed multipliers across six
            scenarios
          </title>
          {/* legend */}
          <g>
            <rect x={PAD_L} y={10} width={10} height={10} fill={COLOR_KNOWLEDGE} />
            <text
              x={PAD_L + 16}
              y={19}
              fontSize={10}
              fill="#8fa3b8"
              fontFamily="JetBrains Mono, monospace"
            >
              knowledge ×
            </text>
            <rect x={PAD_L + 130} y={10} width={10} height={10} fill={COLOR_ADOPTION} />
            <text
              x={PAD_L + 146}
              y={19}
              fontSize={10}
              fill="#8fa3b8"
              fontFamily="JetBrains Mono, monospace"
            >
              adoption speed ×
            </text>
          </g>

          {/* gridlines + y ticks */}
          {Y_TICKS.map((t) => {
            const y = PAD_T + PLOT_H - (t / MAX_V) * PLOT_H;
            return (
              <g key={`y-${t}`}>
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
                  fontSize={10}
                  fill="#8fa3b8"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {t.toFixed(0)}×
                </text>
              </g>
            );
          })}

          {/* grouped bars */}
          {SCENARIOS.map((s, i) => {
            const gx = PAD_L + i * groupW;
            const cx = gx + groupW / 2;
            const knowledge = s.engineShifts.knowledgeMultiplier;
            const adoption = s.engineShifts.adoptionSpeedMultiplier;
            const kH = (knowledge / MAX_V) * PLOT_H;
            const aH = (adoption / MAX_V) * PLOT_H;
            const kY = PAD_T + PLOT_H - kH;
            const aY = PAD_T + PLOT_H - aH;
            const short = SHORT_NAME[s.id] ?? s.id;
            return (
              <g key={s.id}>
                {/* knowledge bar */}
                <rect
                  x={cx - barW - 2}
                  y={kY}
                  width={barW}
                  height={kH}
                  fill={COLOR_KNOWLEDGE}
                  rx={2}
                />
                <text
                  x={cx - barW / 2 - 2}
                  y={kY - 5}
                  textAnchor="middle"
                  fontSize={9}
                  fill={COLOR_KNOWLEDGE}
                  fontFamily="JetBrains Mono, monospace"
                >
                  {knowledge.toFixed(1)}
                </text>
                {/* adoption bar */}
                <rect x={cx + 2} y={aY} width={barW} height={aH} fill={COLOR_ADOPTION} rx={2} />
                <text
                  x={cx + barW / 2 + 2}
                  y={aY - 5}
                  textAnchor="middle"
                  fontSize={9}
                  fill={COLOR_ADOPTION}
                  fontFamily="JetBrains Mono, monospace"
                >
                  {adoption.toFixed(1)}
                </text>
                {/* scenario label */}
                <text
                  x={cx}
                  y={PAD_T + PLOT_H + 18}
                  textAnchor="middle"
                  fontSize={10}
                  fill="#8fa3b8"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {short}
                </text>
              </g>
            );
          })}
        </svg>
        <figcaption className="px-2 pb-1 pt-2 text-xs text-mist">
          Multipliers applied to the Century Engine when each future runs. The Long Stagnation is
          the only scenario below 1× on both axes.
        </figcaption>
      </figure>
    </section>
  );
}
