"use client";

import type { DagEdge, DagNode } from "@geistloom/core";
import { useMemo } from "react";

const KIND_COLORS: Readonly<Record<DagNode["kind"], string>> = {
  question: "#f59e0b",
  evidence: "#2dd4bf",
  mechanism: "#8b5cf6",
  intervention: "#2dd4bf",
  risk: "#ef4444",
  milestone: "#14b8a6",
};

const NODE_WIDTH = 168;
const NODE_HEIGHT = 46;
const LAYER_GAP = 180;
const ROW_GAP = 70;
const PAD = 24;

interface PositionedNode extends DagNode {
  readonly x: number;
  readonly y: number;
}

/**
 * Layered layout: BFS from q0 assigns each node a depth; within a
 * layer, nodes stack at ROW_GAP intervals. Unreachable nodes fall
 * into a trailing layer so nothing is ever dropped.
 */
function computeLayout(nodes: readonly DagNode[], edges: readonly DagEdge[]): PositionedNode[] {
  const adjacency = new Map<string, readonly string[]>();
  for (const edge of edges) {
    const existing = adjacency.get(edge.from) ?? [];
    adjacency.set(edge.from, [...existing, edge.to]);
  }

  const startId = nodes.some((node) => node.id === "q0") ? "q0" : nodes[0]?.id;
  const depthById = new Map<string, number>();
  if (startId !== undefined) depthById.set(startId, 0);

  const queue: string[] = startId !== undefined ? [startId] : [];
  while (queue.length > 0) {
    const current = queue.shift();
    if (current === undefined) break;
    const currentDepth = depthById.get(current) ?? 0;
    for (const next of adjacency.get(current) ?? []) {
      if (!depthById.has(next)) {
        depthById.set(next, currentDepth + 1);
        queue.push(next);
      }
    }
  }

  let maxDepth = 0;
  for (const depth of depthById.values()) {
    if (depth > maxDepth) maxDepth = depth;
  }
  for (const node of nodes) {
    if (!depthById.has(node.id)) depthById.set(node.id, maxDepth + 1);
  }

  const layers = new Map<number, DagNode[]>();
  for (const node of nodes) {
    const depth = depthById.get(node.id) ?? 0;
    const layer = layers.get(depth) ?? [];
    layer.push(node);
    layers.set(depth, layer);
  }

  const positioned: PositionedNode[] = [];
  for (const [depth, layer] of layers) {
    layer.forEach((node, index) => {
      positioned.push({
        ...node,
        x: PAD + depth * LAYER_GAP,
        y: PAD + index * ROW_GAP,
      });
    });
  }
  return positioned;
}

function truncate(label: string, max: number): string {
  return label.length > max ? `${label.slice(0, max - 1)}…` : label;
}

/**
 * The plan's reasoning DAG as an SVG: rounded-rect nodes colored by
 * kind, directed edges with their relation labels.
 */
export function ReasoningDag({
  dag,
}: {
  dag: { readonly nodes: readonly DagNode[]; readonly edges: readonly DagEdge[] };
}) {
  const positioned = useMemo(() => computeLayout(dag.nodes, dag.edges), [dag]);

  if (positioned.length === 0) {
    return <p className="text-sm text-mist">No reasoning graph for this plan.</p>;
  }

  let width = 0;
  let height = 0;
  for (const node of positioned) {
    width = Math.max(width, node.x + NODE_WIDTH + PAD);
    height = Math.max(height, node.y + NODE_HEIGHT + PAD);
  }

  const positionById = new Map(positioned.map((node) => [node.id, node] as const));

  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-display text-xl font-semibold">Reasoning graph</h2>
      <div className="overflow-x-auto rounded-xl border border-charcoal bg-abyss-2 p-2">
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="min-w-full"
          role="img"
          aria-label="Reasoning graph of the oracle plan"
        >
          {dag.edges.map((edge) => {
            const from = positionById.get(edge.from);
            const to = positionById.get(edge.to);
            if (!from || !to) return null;
            const x1 = from.x + NODE_WIDTH;
            const y1 = from.y + NODE_HEIGHT / 2;
            const x2 = to.x;
            const y2 = to.y + NODE_HEIGHT / 2;
            return (
              <g key={`${edge.from}->${edge.to}`}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#2a3a4f" strokeWidth={1.5} />
                <polygon
                  points={`${x2},${y2} ${x2 - 7},${y2 - 3.5} ${x2 - 7},${y2 + 3.5}`}
                  fill="#2a3a4f"
                />
                <text
                  x={(x1 + x2) / 2}
                  y={(y1 + y2) / 2 - 6}
                  textAnchor="middle"
                  fontSize={9}
                  fill="#8fa3b8"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {edge.label}
                </text>
              </g>
            );
          })}
          {positioned.map((node) => {
            const color = KIND_COLORS[node.kind];
            return (
              <g key={node.id}>
                <rect
                  x={node.x}
                  y={node.y}
                  width={NODE_WIDTH}
                  height={NODE_HEIGHT}
                  rx={9}
                  fill="#0b111c"
                  stroke={color}
                  strokeWidth={1.5}
                />
                <circle cx={node.x + 13} cy={node.y + NODE_HEIGHT / 2} r={4} fill={color} />
                <text
                  x={node.x + 25}
                  y={node.y + NODE_HEIGHT / 2 + 4}
                  fontSize={11}
                  fill="#e8f1f2"
                  fontFamily="Inter, sans-serif"
                >
                  {truncate(node.label, 24)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
}
