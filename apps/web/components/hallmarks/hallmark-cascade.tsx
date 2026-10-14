import { type Hallmark, type HallmarkCategory, hallmarksByCategory } from "@geistloom/core";

const NODE_FILL = "#0b111c";
const NODE_TEXT = "#e8f1f2";
const SUBTEXT = "#8fa3b8";

const STROKE: Record<HallmarkCategory, string> = {
  primary: "#2dd4bf",
  antagonistic: "#8b5cf6",
  integrative: "#f59e0b",
};

const COLUMN_LABEL: Record<HallmarkCategory, string> = {
  primary: "PRIMARY",
  antagonistic: "ANTAGONISTIC",
  integrative: "INTEGRATIVE",
};

const CATEGORIES = ["primary", "antagonistic", "integrative"] as const;

interface NodePlacement {
  readonly hallmark: Hallmark;
  readonly x: number;
  readonly y: number;
  readonly centerY: number;
}

const VIEW_WIDTH = 900;
const VIEW_HEIGHT = 420;
const NODE_WIDTH = 230;
const NODE_HEIGHT = 44;
const COLUMN_TOP = 56;
const COLUMN_BOTTOM = 404;
const COLUMN_X: Record<HallmarkCategory, number> = {
  primary: 24,
  antagonistic: 335,
  integrative: 646,
};

function layoutColumn(items: readonly Hallmark[], x: number): NodePlacement[] {
  const count = items.length;
  const span = COLUMN_BOTTOM - COLUMN_TOP;
  const gap = count > 1 ? Math.min(28, (span - count * NODE_HEIGHT) / (count - 1)) : 0;
  const total = count * NODE_HEIGHT + (count - 1) * gap;
  const startY = COLUMN_TOP + (span - total) / 2;
  return items.map((hallmark, index) => {
    const y = startY + index * (NODE_HEIGHT + gap);
    return { hallmark, x, y, centerY: y + NODE_HEIGHT / 2 };
  });
}

function arrowPath(fromX: number, fromY: number, toX: number, toY: number): string {
  const bend = (toX - fromX) / 2;
  return `M ${fromX} ${fromY} C ${fromX + bend} ${fromY}, ${toX - bend} ${toY}, ${toX} ${toY}`;
}

export function HallmarkCascade() {
  const columns: Record<HallmarkCategory, NodePlacement[]> = {
    primary: layoutColumn(hallmarksByCategory("primary"), COLUMN_X.primary),
    antagonistic: layoutColumn(hallmarksByCategory("antagonistic"), COLUMN_X.antagonistic),
    integrative: layoutColumn(hallmarksByCategory("integrative"), COLUMN_X.integrative),
  };

  const edges = [
    ...columns.primary.flatMap((source) =>
      columns.antagonistic.map((target) => ({
        key: `${source.hallmark.id}->${target.hallmark.id}`,
        d: arrowPath(source.x + NODE_WIDTH, source.centerY, target.x, target.centerY),
        stroke: STROKE.antagonistic,
        marker: "url(#arrow-antagonistic)",
      })),
    ),
    ...columns.antagonistic.flatMap((source) =>
      columns.integrative.map((target) => ({
        key: `${source.hallmark.id}->${target.hallmark.id}`,
        d: arrowPath(source.x + NODE_WIDTH, source.centerY, target.x, target.centerY),
        stroke: STROKE.integrative,
        marker: "url(#arrow-integrative)",
      })),
    ),
  ];

  return (
    <figure className="flex flex-col gap-3">
      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        className="h-auto w-full"
        role="img"
        aria-label="Cascade of the twelve hallmarks of aging from primary to antagonistic to integrative"
      >
        <defs>
          <marker
            id="arrow-antagonistic"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={STROKE.antagonistic} opacity={0.6} />
          </marker>
          <marker
            id="arrow-integrative"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={STROKE.integrative} opacity={0.6} />
          </marker>
        </defs>

        {CATEGORIES.map((category) => {
          const first = columns[category][0];
          if (!first) return null;
          return (
            <rect
              key={`band-${category}`}
              x={first.x - 14}
              y={COLUMN_TOP - 40}
              width={NODE_WIDTH + 28}
              height={COLUMN_BOTTOM - COLUMN_TOP + 56}
              rx={18}
              fill={NODE_FILL}
              opacity={0.45}
            />
          );
        })}

        {CATEGORIES.map((category) => {
          const placement = columns[category];
          const first = placement[0];
          if (!first) return null;
          return (
            <g key={`head-${category}`}>
              <text
                x={first.x + NODE_WIDTH / 2}
                y={26}
                textAnchor="middle"
                fontSize={12}
                fontWeight={600}
                letterSpacing={2}
                fill={STROKE[category]}
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {COLUMN_LABEL[category]}
              </text>
              <text
                x={first.x + NODE_WIDTH / 2}
                y={42}
                textAnchor="middle"
                fontSize={9}
                fill={SUBTEXT}
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {placement.length} HALLMARKS
              </text>
            </g>
          );
        })}

        {edges.map((edge) => (
          <path
            key={edge.key}
            d={edge.d}
            fill="none"
            stroke={edge.stroke}
            strokeWidth={1}
            opacity={0.2}
            markerEnd={edge.marker}
          />
        ))}

        {CATEGORIES.flatMap((category) =>
          columns[category].map((node) => (
            <g key={node.hallmark.id}>
              <rect
                x={node.x}
                y={node.y}
                width={NODE_WIDTH}
                height={NODE_HEIGHT}
                rx={10}
                fill={NODE_FILL}
                stroke={STROKE[category]}
                strokeWidth={1.5}
              />
              <text
                x={node.x + NODE_WIDTH / 2}
                y={node.y + 19}
                textAnchor="middle"
                fontSize={11.5}
                fill={NODE_TEXT}
                style={{ fontFamily: "var(--font-display)" }}
              >
                {node.hallmark.name}
              </text>
              <text
                x={node.x + NODE_WIDTH / 2}
                y={node.y + 34}
                textAnchor="middle"
                fontSize={9}
                fill={SUBTEXT}
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {node.hallmark.layer}
              </text>
            </g>
          )),
        )}
      </svg>
      <figcaption className="text-sm leading-relaxed text-mist">
        Primary damage accumulates, triggers antagonistic responses, and resolves into integrative
        decline — the structure the Century Engine propagates.
      </figcaption>
    </figure>
  );
}
