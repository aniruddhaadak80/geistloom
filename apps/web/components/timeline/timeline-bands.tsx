import { MILESTONES } from "@geistloom/core";

/**
 * The projection band, 2012 → 2100.
 *
 * For every projection milestone: a vertical error bar at its year,
 * centered on the UN WPP life-expectancy anchor, with cap width
 * proportional to confidence (confident forecasts are narrow).
 * The UN life-expectancy anchor line (73.8 → 81.7) runs through
 * the frame. Server component — pure SVG.
 */

const W = 720;
const H = 400;
const PAD_L = 56;
const PAD_R = 24;
const PAD_T = 30;
const PAD_B = 48;
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;

const YEAR_MIN = 2012;
const YEAR_MAX = 2100;
const LE_MIN = 70;
const LE_MAX = 85;

const xAt = (year: number): number => PAD_L + ((year - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)) * PLOT_W;
const yAt = (le: number): number => PAD_T + (1 - (le - LE_MIN) / (LE_MAX - LE_MIN)) * PLOT_H;

/** UN WPP-anchored life expectancy at a given year (2026 → 2100). */
function anchorLE(year: number): number {
  if (year <= 2026) return 73.8;
  return Math.min(81.7, 73.8 + (7.9 * (year - 2026)) / 74);
}

const X_TICKS = [2012, 2030, 2050, 2070, 2100];
const Y_TICKS = [70, 75, 80, 85];

export function TimelineBands() {
  const projections = MILESTONES.filter((m) => m.kind === "projection");
  const history = MILESTONES.filter((m) => m.kind === "history");

  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-display text-xl font-semibold text-star-white">The projection band</h2>
      <figure
        className="w-full rounded-xl border border-charcoal bg-abyss-2 p-4"
        role="img"
        aria-label="Chart of projection milestones 2012 to 2100 with confidence error bars and the UN life expectancy anchor"
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
          <title>
            Chart of projection milestones 2012 to 2100 with confidence error bars and the UN life
            expectancy anchor
          </title>
          {/* gridlines */}
          {Y_TICKS.map((t) => (
            <g key={`y-${t}`}>
              <line
                x1={PAD_L}
                x2={PAD_L + PLOT_W}
                y1={yAt(t)}
                y2={yAt(t)}
                stroke="#101826"
                strokeWidth={1}
              />
              <text
                x={PAD_L - 8}
                y={yAt(t) + 3}
                textAnchor="end"
                fontSize={10}
                fill="#8fa3b8"
                fontFamily="JetBrains Mono, monospace"
              >
                {t}
              </text>
            </g>
          ))}
          {X_TICKS.map((t) => (
            <text
              key={`x-${t}`}
              x={xAt(t)}
              y={H - 20}
              textAnchor="middle"
              fontSize={10}
              fill="#8fa3b8"
              fontFamily="JetBrains Mono, monospace"
            >
              {t}
            </text>
          ))}
          {/* axis labels */}
          <text
            x={PAD_L + PLOT_W}
            y={H - 4}
            textAnchor="end"
            fontSize={10}
            fill="#8fa3b8"
            fontFamily="JetBrains Mono, monospace"
          >
            year →
          </text>
          <text
            x={16}
            y={PAD_T + PLOT_H / 2 + 60}
            textAnchor="start"
            fontSize={10}
            fill="#8fa3b8"
            fontFamily="JetBrains Mono, monospace"
            transform={`rotate(-90 16 ${PAD_T + PLOT_H / 2 + 60})`}
          >
            life expectancy (years) →
          </text>

          {/* history markers along the baseline */}
          {history.map((m) => (
            <g key={m.id}>
              <line
                x1={xAt(m.year)}
                x2={xAt(m.year)}
                y1={yAt(LE_MIN)}
                y2={yAt(LE_MIN) + 6}
                stroke="#2a3a52"
                strokeWidth={1}
              />
              <circle cx={xAt(m.year)} cy={yAt(LE_MIN)} r={2} fill="#8fa3b8" />
            </g>
          ))}

          {/* UN WPP anchor line: 73.8 (2026) → 81.7 (2100) */}
          <line
            x1={xAt(2026)}
            x2={xAt(2100)}
            y1={yAt(73.8)}
            y2={yAt(81.7)}
            stroke="#2dd4bf"
            strokeWidth={1.5}
            strokeDasharray="6 4"
          />
          <text
            x={xAt(2026) + 8}
            y={yAt(73.8) - 8}
            fontSize={10}
            fill="#2dd4bf"
            fontFamily="JetBrains Mono, monospace"
          >
            UN WPP anchor · 73.8 → 81.7 yrs
          </text>

          {/* projection error bars */}
          {projections.map((m, i) => {
            const cx = xAt(m.year);
            const center = anchorLE(m.year);
            // Less confident → taller bar; confidence → wider caps.
            const halfHeight = 2.5 + (1 - m.confidence) * 5;
            const capWidth = 8 + m.confidence * 56;
            const yTop = yAt(center + halfHeight);
            const yBottom = yAt(center - halfHeight);
            // Stagger labels so adjacent years don't collide.
            const labelY = yTop - (i % 2 === 0 ? 8 : 22);
            return (
              <g key={m.id}>
                <line x1={cx} x2={cx} y1={yTop} y2={yBottom} stroke="#8b5cf6" strokeWidth={1.5} />
                <line
                  x1={cx - capWidth / 2}
                  x2={cx + capWidth / 2}
                  y1={yTop}
                  y2={yTop}
                  stroke="#8b5cf6"
                  strokeWidth={1.5}
                />
                <line
                  x1={cx - capWidth / 2}
                  x2={cx + capWidth / 2}
                  y1={yBottom}
                  y2={yBottom}
                  stroke="#8b5cf6"
                  strokeWidth={1.5}
                />
                <circle cx={cx} cy={yAt(center)} r={3} fill="#8b5cf6" />
                <text
                  x={cx}
                  y={labelY}
                  textAnchor="middle"
                  fontSize={9}
                  fill="#e8f1f2"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {m.year}
                </text>
                <text
                  x={cx}
                  y={yBottom + 12}
                  textAnchor="middle"
                  fontSize={8}
                  fill="#8fa3b8"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {Math.round(m.confidence * 100)}%
                </text>
              </g>
            );
          })}
        </svg>
        <figcaption className="px-2 pb-1 pt-2 text-xs text-mist">
          Error-bar cap width ∝ stated confidence. Tall, narrow bars are speculative; short, wide
          bars are the frame&apos;s bets.
        </figcaption>
      </figure>
    </section>
  );
}
