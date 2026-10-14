import type { NextRequest } from "next/server";

/**
 * The social card, rendered deterministically as SVG.
 *
 * `/og?title=...&subtitle=...` returns a 1200×630 image/svg+xml card —
 * no image library, no font fetching, no network call, and byte-identical
 * for the same parameters on every machine. The static twin of this
 * route lives at public/images/og.svg (scripts/gen-assets.mjs).
 */

const W = 1200;
const H = 630;

const PALETTE = {
  abyss: "#070b12",
  charcoal: "#101826",
  bioTeal: "#2dd4bf",
  genomeViolet: "#8b5cf6",
  helixAmber: "#f59e0b",
  starWhite: "#e8f1f2",
  mist: "#8fa3b8",
};

const MONO = "JetBrains Mono, monospace";
const DISPLAY = "Space Grotesk, sans-serif";

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Deterministic word wrap for the title — fixed width, no measuring. */
function wrapTitle(value: string, maxChars: number, maxLines: number): string[] {
  const words = value.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxChars && current) {
      lines.push(current);
      current = word;
      if (lines.length === maxLines) break;
    } else {
      current = candidate;
    }
  }
  if (lines.length < maxLines && current) lines.push(current);
  if (lines.length === maxLines && words.join(" ").length > lines.join(" ").length) {
    lines[maxLines - 1] = `${lines[maxLines - 1] ?? ""}…`;
  }
  return lines;
}

function dotGrid(): string {
  const cells: string[] = [];
  for (let x = 0; x < W; x += 32) {
    for (let y = 0; y < H; y += 32) {
      cells.push(`<circle cx="${x + 2}" cy="${y + 2}" r="1" fill="${PALETTE.charcoal}"/>`);
    }
  }
  return cells.join("");
}

function starField(): string {
  // Fixed positions — the constellation is part of the brand.
  const stars: readonly (readonly [number, number, number, number])[] = [
    [88, 92, 1.4, 0.7],
    [204, 46, 0.9, 0.45],
    [352, 132, 1.1, 0.6],
    [520, 62, 0.8, 0.4],
    [664, 148, 1.3, 0.55],
    [812, 58, 0.9, 0.35],
    [960, 118, 1.2, 0.65],
    [1096, 80, 1.0, 0.5],
    [176, 264, 0.8, 0.4],
    [1084, 246, 1.1, 0.5],
    [64, 544, 1.2, 0.6],
    [1136, 572, 0.9, 0.45],
    [424, 596, 1.0, 0.4],
    [784, 600, 1.3, 0.5],
  ];
  return stars
    .map(
      ([x, y, r, opacity]) =>
        `<circle cx="${x}" cy="${y}" r="${r}" fill="${PALETTE.starWhite}" opacity="${opacity}"/>`,
    )
    .join("");
}

/** Hexagonal loom mark framing three helix strands. */
function loomMark(cx: number, cy: number, r: number): string {
  const out: string[] = [];
  const hex: [number, number][] = [];
  for (let k = 0; k < 6; k += 1) {
    const a = ((-90 + 60 * k) * Math.PI) / 180;
    hex.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  const round = (n: number) => Math.round(n * 100) / 100;
  out.push(
    `<path d="M ${hex.map(([x, y]) => `${round(x)} ${round(y)}`).join(" L ")} Z" fill="none" stroke="${PALETTE.bioTeal}" stroke-width="3" opacity="0.5" stroke-linejoin="round"/>`,
  );
  const inner = hex.map(
    ([x, y]) => [round(cx + (x - cx) * 0.72), round(cy + (y - cy) * 0.72)] as [number, number],
  );
  out.push(
    `<path d="M ${inner.map(([x, y]) => `${round(x)} ${round(y)}`).join(" L ")} Z" fill="none" stroke="${PALETTE.charcoal}" stroke-width="1" opacity="0.8" stroke-linejoin="round"/>`,
  );
  // Three helices at -90 / 30 / 150 degrees.
  for (const angle of [-90, 30, 150]) {
    const a = (angle * Math.PI) / 180;
    const pts: string[] = [];
    for (let i = 0; i <= 48; i += 1) {
      const t = i / 48;
      const along = (t - 0.5) * r * 1.3;
      const off = r * 0.26 * Math.sin(t * Math.PI * 2.2);
      const x = cx + Math.cos(a) * along - Math.sin(a) * off;
      const y = cy + Math.sin(a) * along + Math.cos(a) * off;
      pts.push(`${round(x)},${round(y)}`);
    }
    out.push(
      `<polyline points="${pts.join(" ")}" fill="none" stroke="${PALETTE.bioTeal}" stroke-width="2" stroke-linecap="round"/>`,
    );
  }
  return out.join("");
}

export function GET(request: NextRequest): Response {
  const title = (request.nextUrl.searchParams.get("title") ?? "Geistloom").slice(0, 90);
  const subtitle = (
    request.nextUrl.searchParams.get("subtitle") ??
    "the world-frame where superintelligence solves aging"
  ).slice(0, 120);

  const titleLines = wrapTitle(title, 26, 2);
  const titleBlock = titleLines
    .map(
      (line, i) =>
        `<text x="360" y="${262 + i * 66}" font-family="${DISPLAY}" font-size="62" font-weight="600" fill="${PALETTE.starWhite}">${esc(line)}</text>`,
    )
    .join("");

  const chips: readonly (readonly [string, number])[] = [
    ["oracle", 132],
    ["century engine", 236],
    ["time machine", 214],
  ];
  let chipsBlock = "";
  let chipX = 360;
  for (const [label, width] of chips) {
    chipsBlock += `<rect x="${chipX}" y="444" width="${width}" height="62" rx="16" fill="${PALETTE.charcoal}" stroke="${PALETTE.bioTeal}" stroke-width="1.5" opacity="0.96"/>`;
    chipsBlock += `<text x="${chipX + width / 2}" y="483" font-family="${MONO}" font-size="22" fill="${PALETTE.starWhite}" text-anchor="middle">${esc(label)}</text>`;
    chipX += width + 24;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${PALETTE.abyss}"/>
      <stop offset="0.55" stop-color="#0b111c"/>
      <stop offset="1" stop-color="${PALETTE.charcoal}"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <g opacity="0.4">${dotGrid()}</g>
  ${starField()}
  <circle cx="196" cy="290" r="128" fill="none" stroke="${PALETTE.charcoal}" stroke-width="2"/>
  <circle cx="196" cy="290" r="170" fill="none" stroke="${PALETTE.mist}" stroke-width="1" opacity="0.1" stroke-dasharray="2 12"/>
  ${loomMark(196, 290, 78)}
  <text x="360" y="128" font-family="${MONO}" font-size="18" letter-spacing="8" fill="${PALETTE.bioTeal}">GEISTLOOM — THE WORLD-FRAME</text>
  <text x="360" y="190" font-family="${DISPLAY}" font-size="52" font-weight="600" fill="${PALETTE.bioTeal}">geist</text><text x="${360 + 190}" y="190" font-family="${DISPLAY}" font-size="52" font-weight="600" fill="${PALETTE.bioTeal}">loom</text>
  <text x="360" y="222" font-family="${DISPLAY}" font-size="22" fill="${PALETTE.mist}">${esc(subtitle)}</text>
  ${titleBlock}
  ${chipsBlock}
  <text x="360" y="566" font-family="${MONO}" font-size="16" letter-spacing="2" fill="${PALETTE.mist}">deterministic · local · zero API keys</text>
  <text x="${W - 40}" y="52" font-family="${MONO}" font-size="12" fill="${PALETTE.mist}" text-anchor="end" opacity="0.8">v0.1.0 · seed 4093</text>
</svg>`;

  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}
