import { useId } from "react";
import { cn } from "./cn";

export interface Series {
  readonly label: string;
  readonly points: readonly number[];
}

export interface LineChartProps {
  readonly series: readonly Series[];
  readonly labels?: readonly (string | number)[];
  readonly height?: number;
  readonly yLabel?: string;
  readonly className?: string;
  readonly colors?: readonly [string, string, string];
}

const PALETTE = ["#2dd4bf", "#8b5cf6", "#f59e0b"] as const;

/**
 * Dependency-free SVG line chart. Deterministic, accessible
 * (role="img" + aria-label), theme-aware. Used by the
 * Century Engine, Worldboard and Gene Drive routes.
 */
export function LineChart({
  series,
  labels,
  height = 240,
  yLabel,
  className,
  colors = PALETTE,
}: LineChartProps) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  if (series.length === 0) return null;

  const width = 720;
  const padX = 44;
  const padTop = 16;
  const padBottom = 28;
  const innerW = width - padX * 2;
  const innerH = height - padTop - padBottom;

  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (const s of series) {
    for (const v of s.points) {
      if (v < min) min = v;
      if (v > max) max = v;
    }
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
  const span = max - min || 1;
  min -= span * 0.08;
  max += span * 0.08;

  const maxLen = Math.max(...series.map((s) => s.points.length));
  const xAt = (i: number) => padX + (maxLen <= 1 ? innerW / 2 : (i / (maxLen - 1)) * innerW);
  const yAt = (v: number) => padTop + innerH - ((v - min) / (max - min)) * innerH;

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => min + f * (max - min));

  return (
    <figure className={cn("w-full", className)} role="img" aria-label={yLabel ?? "line chart"}>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full">
        <title>{yLabel ?? "line chart"}</title>
        {ticks.map((t) => (
          <g key={`tick-${t}`}>
            <line
              x1={padX}
              x2={width - padX}
              y1={yAt(t)}
              y2={yAt(t)}
              stroke="#101826"
              strokeWidth={1}
            />
            <text
              x={padX - 8}
              y={yAt(t) + 4}
              textAnchor="end"
              fontSize={10}
              fill="#8fa3b8"
              fontFamily="JetBrains Mono, monospace"
            >
              {t.toFixed(t < 10 ? 1 : 0)}
            </text>
          </g>
        ))}
        {series.map((s, si) => {
          const color = colors[si % colors.length] ?? colors[0] ?? "#2dd4bf";
          const d = s.points
            .map((v, i) => `${i === 0 ? "M" : "L"}${xAt(i).toFixed(1)},${yAt(v).toFixed(1)}`)
            .join(" ");
          const areaId = `area-${id}-${si}`;
          const area =
            s.points.length > 1
              ? `${d} L${xAt(s.points.length - 1).toFixed(1)},${padTop + innerH} L${padX},${padTop + innerH} Z`
              : "";
          return (
            <g key={s.label}>
              <defs>
                <linearGradient id={areaId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              {area && <path d={area} fill={`url(#${areaId})`} />}
              <path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
            </g>
          );
        })}
        {yLabel && (
          <text x={padX} y={12} fontSize={10} fill="#8fa3b8" fontFamily="JetBrains Mono, monospace">
            {yLabel}
          </text>
        )}
        {labels?.map((l, i) => {
          if (i % Math.ceil(labels.length / 6) !== 0 && i !== labels.length - 1) return null;
          return (
            <text
              key={`xl-${l}`}
              x={xAt(i)}
              y={height - 8}
              textAnchor="middle"
              fontSize={10}
              fill="#8fa3b8"
              fontFamily="JetBrains Mono, monospace"
            >
              {String(l)}
            </text>
          );
        })}
      </svg>
      <figcaption className="mt-2 flex flex-wrap gap-4">
        {series.map((s, si) => (
          <span key={s.label} className="flex items-center gap-1.5 text-xs text-mist">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: colors[si % colors.length] ?? colors[0] }}
            />
            {s.label}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
