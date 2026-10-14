#!/usr/bin/env bun
/**
 * Geistloom — deterministic SVG asset generator.
 *
 * Zero dependencies (node:fs / node:path / node:url only).
 * Every "random" element comes from the seeded mulberry32 PRNG below,
 * so `bun scripts/gen-assets.mjs` is byte-identical on every run.
 *
 * Run: bun scripts/gen-assets.mjs
 *
 * Outputs:
 *   apps/web/public/favicon.svg
 *   apps/web/public/apple-touch-icon.svg
 *   apps/web/public/images/logo.svg
 *   apps/web/public/images/banner.svg
 *   apps/web/public/images/og.svg
 *   apps/web/public/images/screens/*.svg        (six screen mockups)
 *   docs/images/architecture.svg
 *   docs/images/banner.svg, docs/images/og.svg  (mirrors for the docs site)
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/* ------------------------------------------------------------------ */
/* Seeded PRNG — mulberry32 (standard implementation, copied inline)   */
/* ------------------------------------------------------------------ */

function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(input) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seedFromString(input, salt = 0) {
  return (hashString(input) ^ Math.imul(salt, 0x9e3779b9)) >>> 0;
}

function _pickOne(items, rng) {
  return items[Math.floor(rng() * items.length)];
}

function range(min, max, rng) {
  return min + rng() * (max - min);
}

/* ------------------------------------------------------------------ */
/* Palette — single source of truth (mirrors Tailwind v4 theme tokens) */
/* ------------------------------------------------------------------ */

const P = {
  abyss: "#070b12",
  abyss2: "#0b111c",
  charcoal: "#101826",
  bioTeal: "#2dd4bf",
  bioTealDim: "#14b8a6",
  genomeViolet: "#8b5cf6",
  helixAmber: "#f59e0b",
  starWhite: "#e8f1f2",
  mist: "#8fa3b8",
};

const DISPLAY_FONT = "Space Grotesk, sans-serif";
const MONO_FONT = "JetBrains Mono, monospace";

/* ------------------------------------------------------------------ */
/* SVG helpers                                                         */
/* ------------------------------------------------------------------ */

function r2(n) {
  return Math.round(n * 100) / 100;
}

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function svgRoot(width, height, title, defs, body) {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<title>${esc(title)}</title>`,
    defs ? `<defs>${defs}</defs>` : "",
    body,
    `</svg>`,
    "",
  ].join("\n");
}

function text(x, y, str, o = {}) {
  const font = o.mono ? MONO_FONT : DISPLAY_FONT;
  const size = o.size ?? 16;
  const fill = o.fill ?? P.starWhite;
  const anchor = o.anchor ?? "start";
  const weight = o.weight ?? (o.mono ? 400 : 500);
  const spacing = o.spacing ?? 0;
  const opacity = o.opacity ?? 1;
  const transform = o.transform ?? "";
  return `<text x="${r2(x)}" y="${r2(y)}" font-family="${font}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"${spacing ? ` letter-spacing="${r2(spacing)}"` : ""}${opacity < 1 ? ` opacity="${opacity}"` : ""}${transform ? ` transform="${transform}"` : ""}>${esc(str)}</text>`;
}

function rect(x, y, w, h, o = {}) {
  const rx = o.rx ?? 0;
  const fill = o.fill ?? "none";
  const stroke = o.stroke;
  const sw = o.sw ?? 1;
  const opacity = o.opacity ?? 1;
  const dash = o.dash;
  const clip = o.clip;
  return `<rect x="${r2(x)}" y="${r2(y)}" width="${r2(w)}" height="${r2(h)}" rx="${r2(rx)}" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="${r2(sw)}"` : ""}${dash ? ` stroke-dasharray="${dash}"` : ""}${opacity < 1 ? ` opacity="${opacity}"` : ""}${clip ? ` clip-path="url(#${clip})"` : ""}/>`;
}

function circle(cx, cy, r, o = {}) {
  const fill = o.fill ?? "none";
  const stroke = o.stroke;
  const sw = o.sw ?? 1;
  const opacity = o.opacity ?? 1;
  return `<circle cx="${r2(cx)}" cy="${r2(cy)}" r="${r2(r)}" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="${r2(sw)}"` : ""}${opacity < 1 ? ` opacity="${opacity}"` : ""}/>`;
}

function line(x1, y1, x2, y2, o = {}) {
  const stroke = o.stroke ?? P.mist;
  const sw = o.sw ?? 1;
  const opacity = o.opacity ?? 1;
  const dash = o.dash;
  const cap = o.cap ?? "butt";
  return `<line x1="${r2(x1)}" y1="${r2(y1)}" x2="${r2(x2)}" y2="${r2(y2)}" stroke="${stroke}" stroke-width="${r2(sw)}" stroke-linecap="${cap}"${dash ? ` stroke-dasharray="${dash}"` : ""}${opacity < 1 ? ` opacity="${opacity}"` : ""}/>`;
}

function pathD(d, o = {}) {
  const fill = o.fill ?? "none";
  const stroke = o.stroke;
  const sw = o.sw ?? 1;
  const opacity = o.opacity ?? 1;
  const cap = o.cap ?? "round";
  const join = o.join ?? "round";
  const dash = o.dash;
  return `<path d="${d}" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="${r2(sw)}"` : ""} stroke-linecap="${cap}" stroke-linejoin="${join}"${dash ? ` stroke-dasharray="${dash}"` : ""}${opacity < 1 ? ` opacity="${opacity}"` : ""}/>`;
}

function dotGridPattern(id, step = 32, dot = 1) {
  return `<pattern id="${id}" width="${step}" height="${step}" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="${dot}" fill="${P.charcoal}"/></pattern>`;
}

function arrowMarker(id, color) {
  return `<marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 1 L 9 5 L 0 9 z" fill="${color}"/></marker>`;
}

/** Deterministic star field from a seeded PRNG. */
function starField(seedKey, w, h, count, maxR = 1.8) {
  const rng = mulberry32(seedFromString(seedKey));
  let out = "";
  for (let i = 0; i < count; i++) {
    const x = r2(range(8, w - 8, rng));
    const y = r2(range(8, h - 8, rng));
    const rad = r2(range(0.6, maxR, rng));
    const op = r2(range(0.18, 0.85, rng));
    out += circle(x, y, rad, { fill: P.starWhite, opacity: op });
  }
  return out;
}

/** Sampled sine-wave points along a rotated axis (helix strand geometry). */
function wavePoints(cx, cy, length, amp, waves, phase, angleDeg, samples = 72) {
  const a = (angleDeg * Math.PI) / 180;
  const dx = Math.cos(a);
  const dy = Math.sin(a);
  const px = -dy;
  const py = dx;
  const pts = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const along = (t - 0.5) * length;
    const off = amp * Math.sin(t * waves * 2 * Math.PI + phase);
    pts.push([cx + dx * along + px * off, cy + dy * along + py * off]);
  }
  return pts;
}

function pathFromPoints(pts) {
  return `M ${pts.map((p) => `${r2(p[0])} ${r2(p[1])}`).join(" L ")}`;
}

/** Catmull-Rom smoothed path through points. */
function smoothPath(pts) {
  if (pts.length < 2) return "";
  let d = `M ${r2(pts[0][0])} ${r2(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${r2(c1x)} ${r2(c1y)}, ${r2(c2x)} ${r2(c2y)}, ${r2(p2[0])} ${r2(p2[1])}`;
  }
  return d;
}

/** The Geistloom loom mark: a hexagon framing three interlocking DNA helices. */
function loomMark(cx, cy, r) {
  let out = "";
  // Outer hexagon (pointy-top).
  const hex = [];
  for (let k = 0; k < 6; k++) {
    const a = ((-90 + 60 * k) * Math.PI) / 180;
    hex.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  out += pathD(`${pathFromPoints(hex)} Z`, {
    stroke: P.bioTealDim,
    sw: r * 0.05,
    opacity: 0.55,
    join: "round",
  });
  // Inner hexagon.
  const hexIn = hex.map(([x, y]) => [cx + (x - cx) * 0.8, cy + (y - cy) * 0.8]);
  out += pathD(`${pathFromPoints(hexIn)} Z`, {
    stroke: P.charcoal,
    sw: r * 0.022,
    opacity: 0.9,
    join: "round",
  });
  // Three interlocking helices at -90 / 30 / 150 degrees.
  const angles = [-90, 30, 150];
  for (let si = 0; si < angles.length; si++) {
    const phase = si * 2.0;
    const pts = wavePoints(cx, cy, r * 1.44, r * 0.3, 1.25, phase, angles[si]);
    // Glow underlay.
    out += pathD(pathFromPoints(pts), { stroke: P.bioTeal, sw: r * 0.15, opacity: 0.1 });
    // Strand.
    out += pathD(pathFromPoints(pts), { stroke: P.bioTeal, sw: r * 0.075 });
    // Peak nodes where the sine hits +/-1 (deterministic positions).
    const denom = 1.25 * 2 * Math.PI;
    for (let k = 0; k < 4; k++) {
      const t = (Math.PI / 2 + k * Math.PI - phase) / denom;
      if (t <= 0.02 || t >= 0.98) continue;
      const along = (t - 0.5) * r * 1.44;
      const a = (angles[si] * Math.PI) / 180;
      const off = r * 0.3 * Math.sin(t * denom + phase);
      const nx = cx + Math.cos(a) * along - Math.sin(a) * off;
      const ny = cy + Math.sin(a) * along + Math.cos(a) * off;
      out += circle(nx, ny, r * 0.075, {
        fill: k % 2 === 0 ? P.genomeViolet : P.helixAmber,
      });
    }
    // Endpoint nodes.
    [pts[0], pts[pts.length - 1]].forEach(([x, y]) => {
      out += circle(x, y, r * 0.1, { fill: P.abyss, stroke: P.bioTeal, sw: r * 0.04 });
    });
  }
  return out;
}

/** Horizontal DNA double helix: two sine strands + rungs. */
function dnaHelix(x0, x1, cy, amp, period) {
  const samples = 220;
  const ptsA = [];
  const ptsB = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const x = x0 + t * (x1 - x0);
    const ph = ((x - x0) / period) * 2 * Math.PI;
    ptsA.push([x, cy + amp * Math.sin(ph)]);
    ptsB.push([x, cy + amp * Math.sin(ph + Math.PI)]);
  }
  let out = "";
  // Rungs every period/4.
  const step = period / 4;
  for (let x = x0 + step / 2; x < x1; x += step) {
    const ph = ((x - x0) / period) * 2 * Math.PI;
    const yA = cy + amp * Math.sin(ph);
    const yB = cy + amp * Math.sin(ph + Math.PI);
    out += line(x, yA, x, yB, { stroke: P.bioTealDim, sw: 2, opacity: 0.32 });
    out += circle(x, yA, 2.4, { fill: P.bioTeal, opacity: 0.75 });
    out += circle(x, yB, 2.4, { fill: P.genomeViolet, opacity: 0.75 });
  }
  // Strand glows.
  out += pathD(pathFromPoints(ptsA), { stroke: P.bioTeal, sw: 9, opacity: 0.1 });
  out += pathD(pathFromPoints(ptsB), { stroke: P.genomeViolet, sw: 9, opacity: 0.1 });
  // Strands.
  out += pathD(pathFromPoints(ptsA), { stroke: P.bioTeal, sw: 3 });
  out += pathD(pathFromPoints(ptsB), { stroke: P.genomeViolet, sw: 3 });
  return out;
}

/* ------------------------------------------------------------------ */
/* 1. favicon.svg — 64x64                                              */
/* ------------------------------------------------------------------ */

function favicon() {
  const defs = `<clipPath id="clip"><rect x="4" y="4" width="56" height="56" rx="14"/></clipPath>`;
  const body = [
    rect(4, 4, 56, 56, { rx: 14, fill: P.abyss }),
    `<g clip-path="url(#clip)">`,
    starField("favicon-stars", 64, 64, 6, 1.1),
    loomMark(32, 32, 21),
    `</g>`,
    rect(4, 4, 56, 56, { rx: 14, stroke: P.charcoal, sw: 1.5 }),
  ].join("\n");
  return svgRoot(64, 64, "Geistloom — hexagonal loom mark", defs, body);
}

/* ------------------------------------------------------------------ */
/* 2. apple-touch-icon.svg — 180x180                                   */
/* ------------------------------------------------------------------ */

function appleTouchIcon() {
  const defs = [
    `<clipPath id="clip"><rect x="8" y="8" width="164" height="164" rx="36"/></clipPath>`,
    dotGridPattern("grid", 24, 1),
  ].join("\n");
  const body = [
    rect(8, 8, 164, 164, { rx: 36, fill: P.abyss2 }),
    `<g clip-path="url(#clip)">`,
    rect(8, 8, 164, 164, { fill: "url(#grid)", opacity: 0.5 }),
    starField("apple-touch-stars", 180, 180, 14, 1.3),
    circle(90, 90, 74, { stroke: P.charcoal, sw: 1.5, opacity: 0.8 }),
    loomMark(90, 90, 56),
    `</g>`,
    rect(8, 8, 164, 164, { rx: 36, stroke: P.charcoal, sw: 2 }),
  ].join("\n");
  return svgRoot(180, 180, "Geistloom — apple touch icon", defs, body);
}

/* ------------------------------------------------------------------ */
/* 3. logo.svg — 512x128 horizontal wordmark                           */
/* ------------------------------------------------------------------ */

function logo() {
  const body = [
    loomMark(76, 64, 50),
    text(152, 84, "geist", { size: 58, weight: 600, fill: P.starWhite }),
    text(152 + 166, 84, "loom", { size: 58, weight: 600, fill: P.bioTeal }),
    text(154, 110, "THE WORLD-FRAME", {
      mono: true,
      size: 13,
      spacing: 5,
      fill: P.mist,
    }),
  ].join("\n");
  return svgRoot(512, 128, "Geistloom — logo", null, body);
}

/* ------------------------------------------------------------------ */
/* 4. banner.svg — 1280x640 hero                                       */
/* ------------------------------------------------------------------ */

function banner() {
  const W = 1280;
  const H = 640;
  const defs = [
    `<linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${P.abyss}"/>
      <stop offset="0.55" stop-color="${P.abyss2}"/>
      <stop offset="1" stop-color="${P.charcoal}"/>
    </linearGradient>`,
    dotGridPattern("grid", 32, 1),
  ].join("\n");
  const body = [
    rect(0, 0, W, H, { fill: "url(#bgGrad)" }),
    rect(0, 0, W, H, { fill: "url(#grid)", opacity: 0.45 }),
    starField("banner-stars", W, H, 120, 1.8),
    // The world-frame circle.
    circle(640, 352, 240, { stroke: P.charcoal, sw: 2, opacity: 0.9 }),
    circle(640, 352, 288, { stroke: P.mist, sw: 1.5, opacity: 0.1, dash: "2 12" }),
    // The double helix.
    dnaHelix(180, 1100, 352, 96, 176),
    // Kicker.
    text(640, 96, "GEISTLOOM — THE WORLD-FRAME", {
      mono: true,
      size: 18,
      spacing: 8,
      fill: P.bioTealDim,
      anchor: "middle",
    }),
    // Tagline.
    text(640, 168, "the world-frame where", { size: 54, weight: 600, anchor: "middle" }),
    text(640, 228, "superintelligence solves aging", { size: 54, weight: 600, anchor: "middle" }),
    // Caption.
    text(640, 576, "deterministic · local · zero API keys", {
      mono: true,
      size: 20,
      spacing: 3,
      fill: P.mist,
      anchor: "middle",
    }),
    // Corner marks.
    text(40, 48, "geistloom.local", { mono: true, size: 12, fill: P.bioTealDim, opacity: 0.8 }),
    text(1240, 48, "v0.1.0 · seed 4093", {
      mono: true,
      size: 12,
      fill: P.mist,
      anchor: "end",
      opacity: 0.8,
    }),
  ].join("\n");
  return svgRoot(
    W,
    H,
    "Geistloom — the world-frame where superintelligence solves aging",
    defs,
    body,
  );
}

/* ------------------------------------------------------------------ */
/* 5. og.svg — 1200x630 social card                                    */
/* ------------------------------------------------------------------ */

function ogCard() {
  const W = 1200;
  const H = 630;
  const defs = [
    `<linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${P.abyss}"/>
      <stop offset="0.6" stop-color="${P.abyss2}"/>
      <stop offset="1" stop-color="${P.charcoal}"/>
    </linearGradient>`,
    dotGridPattern("grid", 32, 1),
  ].join("\n");
  const chips = [
    ["oracle", 128],
    ["century engine", 224],
    ["time machine", 200],
  ];
  let chipSvg = "";
  let cx = 352;
  for (const [label, w] of chips) {
    chipSvg += [
      rect(cx, 470, w, 64, { rx: 14, fill: P.charcoal, stroke: P.bioTeal, sw: 1.5, opacity: 0.96 }),
      text(cx + w / 2, 509, label, { mono: true, size: 22, fill: P.starWhite, anchor: "middle" }),
    ].join("\n");
    cx += w + 24;
  }
  const body = [
    rect(0, 0, W, H, { fill: "url(#bgGrad)" }),
    rect(0, 0, W, H, { fill: "url(#grid)", opacity: 0.4 }),
    starField("og-stars", W, H, 54, 1.6),
    circle(200, 315, 140, { stroke: P.charcoal, sw: 2, opacity: 0.9 }),
    loomMark(200, 315, 88),
    text(352, 292, "geist", { size: 84, weight: 600, fill: P.starWhite }),
    text(352 + 386, 292, "loom", { size: 84, weight: 600, fill: P.bioTeal }),
    text(354, 352, "the world-frame where superintelligence solves aging", {
      size: 26,
      fill: P.mist,
    }),
    chipSvg,
    text(354, 584, "deterministic · local · zero API keys", {
      mono: true,
      size: 16,
      spacing: 2,
      fill: P.mist,
    }),
  ].join("\n");
  return svgRoot(W, H, "Geistloom — social card", defs, body);
}

/* ------------------------------------------------------------------ */
/* Screen mockups — shared browser chrome                              */
/* ------------------------------------------------------------------ */

const SW = 1200;
const SH = 760;

function screenRoot(title, url, content) {
  const defs = [
    `<clipPath id="contentClip"><rect x="24" y="76" width="1152" height="660" rx="0"/></clipPath>`,
    dotGridPattern("grid", 28, 1),
  ].join("\n");
  const chrome = [
    // Drop shadow.
    rect(24, 34, 1152, 712, { rx: 18, fill: P.abyss, opacity: 0.7 }),
    // Window.
    rect(24, 24, 1152, 712, { rx: 18, fill: P.abyss2, stroke: P.charcoal, sw: 2 }),
    // Traffic lights.
    circle(56, 50, 6, { fill: P.helixAmber }),
    circle(80, 50, 6, { fill: P.genomeViolet }),
    circle(104, 50, 6, { fill: P.bioTeal }),
    // URL bar.
    rect(136, 38, 460, 24, { rx: 12, fill: P.charcoal }),
    text(156, 54, url, { mono: true, size: 12.5, fill: P.bioTeal }),
    text(1144, 54, "local · deterministic · seed 4093", {
      mono: true,
      size: 11,
      fill: P.mist,
      anchor: "end",
    }),
    line(24, 76, 1176, 76, { stroke: P.charcoal, sw: 1.5 }),
  ].join("\n");
  return svgRoot(
    SW,
    SH,
    title,
    defs,
    [
      chrome,
      `<g clip-path="url(#contentClip)">`,
      rect(24, 76, 1152, 660, { fill: "url(#grid)", opacity: 0.25 }),
      content,
      `</g>`,
    ].join("\n"),
  );
}

function screenHeader(title, subtitle) {
  return [
    text(48, 116, title, { size: 24, weight: 600 }),
    text(48, 140, subtitle, { mono: true, size: 12, fill: P.mist }),
  ].join("\n");
}

function checkRow(x, y, label) {
  return [
    circle(x + 8, y - 4, 8, { stroke: P.bioTeal, sw: 1.5 }),
    pathD(`M ${x + 4} ${y - 4} l 3 3 l 6 -6`, { stroke: P.bioTeal, sw: 1.8 }),
    text(x + 26, y, label, { size: 13, fill: P.mist }),
  ].join("\n");
}

/* ------------------------------------------------------------------ */
/* 6a. screen-oracle.svg — the Oracle console                          */
/* ------------------------------------------------------------------ */

function screenOracle() {
  const phases = [
    [
      "01",
      "Map the problem",
      2,
      0.92,
      "Reference cohort (n≥1,000) profiled on cellular senescence with published baselines",
    ],
    [
      "02",
      "Decode the mechanism",
      3,
      0.81,
      "Causal model validated in two independent model systems; every DAG edge confirmed",
    ],
    [
      "03",
      "Design the intervention",
      3,
      0.7,
      "Lead candidate with clinical-grade evidence; off-target profile within bounds",
    ],
    [
      "04",
      "Prove it in models",
      4,
      0.59,
      "Reproducible effect in two species; effect size ≥ 0.24 of theoretical max, p<0.01",
    ],
    [
      "05",
      "Open the trial",
      3,
      0.48,
      "Phase I/IIa readout: safety clean, DunedinPACE pace moves with dose response",
    ],
    [
      "06",
      "Ship it to the world",
      6,
      0.37,
      "Approved in ≥3 major jurisdictions with a published access covenant",
    ],
  ];
  let phaseCards = "";
  phases.forEach(([num, name, years, conf, milestone], i) => {
    const y = 168 + i * 88;
    phaseCards += [
      rect(400, y, 752, 80, { rx: 12, fill: P.charcoal }),
      rect(400, y, 4, 80, { rx: 2, fill: P.bioTeal }),
      text(424, y + 30, num, { mono: true, size: 13, fill: P.bioTealDim }),
      text(470, y + 30, name, { size: 16, weight: 600 }),
      text(424, y + 52, `${years} yrs · milestone:`, {
        mono: true,
        size: 10.5,
        fill: P.mist,
        opacity: 0.8,
      }),
      text(424, y + 68, milestone, { size: 11.5, fill: P.mist }),
      // Confidence bar.
      rect(980, y + 24, 140, 8, { rx: 4, fill: P.abyss }),
      rect(980, y + 24, 140 * conf, 8, { rx: 4, fill: P.bioTeal }),
      text(1128, y + 30, conf.toFixed(2), { mono: true, size: 12, anchor: "end" }),
      text(1128, y + 46, "confidence", {
        mono: true,
        size: 9,
        fill: P.mist,
        anchor: "end",
        opacity: 0.8,
      }),
    ].join("\n");
  });

  const content = [
    screenHeader(
      "The Oracle",
      "deterministic research intelligence · zero API keys · auditable line by line",
    ),
    // Left: prompt panel.
    text(48, 172, "PROMPT", { mono: true, size: 12, spacing: 2, fill: P.bioTealDim }),
    rect(48, 180, 320, 84, { rx: 12, fill: P.charcoal, stroke: P.bioTeal, sw: 1.5 }),
    text(72, 218, "solve aging", { size: 20, weight: 600 }),
    rect(190, 202, 10, 22, { fill: P.bioTeal }) +
      `<animate attributeName="opacity" values="1;0.2;1" dur="1.4s" repeatCount="indefinite"/>`,
    // Meta rows.
    text(48, 292, "model", { mono: true, size: 10, fill: P.mist }),
    text(48, 310, "geistloom-oracle-1", { mono: true, size: 12.5 }),
    text(48, 334, "seed", { mono: true, size: 10, fill: P.mist }),
    text(48, 352, "4093 · derived from prompt", { mono: true, size: 12.5 }),
    text(48, 376, "domain", { mono: true, size: 10, fill: P.mist }),
    text(48, 394, "longevity & aging", { mono: true, size: 12.5 }),
    // Ask button.
    rect(48, 416, 320, 48, { rx: 12, fill: P.bioTeal }),
    text(208, 446, "ask the oracle", { size: 16, weight: 600, fill: P.abyss, anchor: "middle" }),
    // Trust list.
    text(48, 500, "WHY IT IS TRUSTWORTHY", {
      mono: true,
      size: 11,
      spacing: 2,
      fill: P.bioTealDim,
    }),
    checkRow(48, 524, "zero API keys — nothing leaves this machine"),
    checkRow(48, 552, "same prompt + seed ⇒ byte-identical plan"),
    checkRow(48, 580, "every reasoning edge is checkable"),
    // Key numbers strip.
    [
      rect(48, 604, 320, 88, { rx: 12, fill: P.charcoal }),
      text(64, 632, "21", { size: 24, weight: 600, fill: P.bioTeal }),
      text(120, 632, "year program", { mono: true, size: 10.5, fill: P.mist }),
      text(64, 660, "37%", { size: 24, weight: 600, fill: P.bioTeal }),
      text(124, 660, "theoretical cut", { mono: true, size: 10.5, fill: P.mist }),
      text(216, 632, "3/12", { size: 24, weight: 600, fill: P.genomeViolet }),
      text(216, 660, "hallmarks · 22% prior", { mono: true, size: 10.5, fill: P.mist }),
    ].join("\n"),
    // Right: plan header.
    text(400, 116, "Audit-Ready Program for Cellular Senescence", { size: 24, weight: 600 }),
    text(400, 140, "domain longevity & aging · seed 4093 · scenario The Bio-Dividend (22% prior)", {
      mono: true,
      size: 12,
      fill: P.mist,
    }),
    phaseCards,
  ].join("\n");

  return screenRoot("Geistloom — Oracle console mockup", "geistloom.local/oracle", content);
}

/* ------------------------------------------------------------------ */
/* 6b. screen-century.svg — the Century Engine                         */
/* ------------------------------------------------------------------ */

function screenCentury() {
  const summary = [
    ["LIFE EXPECTANCY · 2100", "104.8 y", "+23.1 vs baseline"],
    ["ESCAPE VELOCITY", "2041", "LEV detected · +1.2 y/yr"],
    ["PEAK POPULATION", "9.9 B", "peak year 2140"],
    ["BIOSPHERE · 2226", "71 / 100", "+5 vs baseline"],
  ];
  let summaryCards = "";
  summary.forEach(([label, value, delta], i) => {
    const x = 48 + i * 288;
    summaryCards += [
      rect(x, 160, 272, 92, { rx: 12, fill: P.charcoal }),
      text(x + 20, 188, label, { mono: true, size: 10.5, spacing: 1, fill: P.mist }),
      text(x + 20, 228, value, { size: 34, weight: 600 }),
      text(x + 20, 244, delta, { mono: true, size: 11, fill: P.bioTeal }),
    ].join("\n");
  });

  const interventions = [
    ["Dasatinib + Quercetin", "small-molecule · clinical", true],
    ["Rapalogs (mTOR)", "small-molecule · clinical", true],
    ["Partial reprogramming (OSK)", "gene-therapy · preclinical", true],
    ["NAD+ precursors", "small-molecule · clinical", true],
    ["Metformin", "small-molecule · clinical", true],
    ["Telomerase therapy", "gene-therapy · preclinical", false],
    ["Fisetin", "small-molecule · clinical", false],
    ["Plasma exchange", "protocol · clinical", false],
  ];
  let toggleRows = "";
  interventions.forEach(([name, klass, on], i) => {
    const y = 300 + i * 52;
    toggleRows += [
      text(64, y + 18, name, { size: 13.5, weight: 500 }),
      text(64, y + 36, klass, { mono: true, size: 9.5, fill: P.mist }),
      rect(304, y + 6, 44, 22, { rx: 11, fill: on ? P.bioTealDim : P.abyss }),
      circle(on ? 334 : 318, y + 17, 7, { fill: on ? P.bioTeal : P.mist }),
    ].join("\n");
  });

  // Chart geometry: x 2026..2226 -> 448..1120, y 60..140 -> 648..288.
  const xOf = (yr) => 448 + (yr - 2026) * 3.4;
  const yOf = (le) => 648 - (le - 60) * 4.75;
  const baseline = [
    [2026, 73.8],
    [2050, 76.4],
    [2075, 79.3],
    [2100, 81.7],
    [2150, 83.5],
    [2226, 85.6],
  ].map(([a, b]) => [xOf(a), yOf(b)]);
  const intervent = [
    [2026, 73.8],
    [2050, 79.1],
    [2075, 92.4],
    [2100, 104.8],
    [2150, 124.2],
    [2226, 139.4],
  ].map(([a, b]) => [xOf(a), yOf(b)]);

  let grid = "";
  for (let yr = 2026; yr <= 2226; yr += 20) {
    grid += line(xOf(yr), 288, xOf(yr), 648, { stroke: P.charcoal, sw: 1, opacity: 0.7 });
    grid += text(xOf(yr), 668, String(yr), {
      mono: true,
      size: 10,
      fill: P.mist,
      anchor: "middle",
    });
  }
  for (let le = 60; le <= 140; le += 20) {
    grid += line(448, yOf(le), 1120, yOf(le), { stroke: P.charcoal, sw: 1, opacity: 0.7 });
    grid += text(440, yOf(le) + 3, String(le), {
      mono: true,
      size: 10,
      fill: P.mist,
      anchor: "end",
    });
  }

  const content = [
    screenHeader(
      "Century Engine",
      "200-year world simulation · UN WPP-anchored baseline · 30 interventions · RK4 propagation",
    ),
    summaryCards,
    // Left: intervention toggles.
    rect(48, 264, 320, 448, { rx: 12, fill: P.charcoal }),
    text(64, 292, "INTERVENTIONS", { mono: true, size: 12, spacing: 2, fill: P.bioTealDim }),
    text(352, 292, "5 enabled", { mono: true, size: 11, fill: P.mist, anchor: "end" }),
    toggleRows,
    // Right: chart card.
    rect(400, 264, 752, 448, { rx: 12, fill: P.charcoal }),
    text(424, 292, "life expectancy — baseline vs intervention stack", { size: 15, weight: 600 }),
    // Legend.
    line(880, 288, 908, 288, { stroke: P.mist, sw: 2.5, dash: "5 5" }),
    text(916, 292, "baseline (UN WPP)", { mono: true, size: 10.5, fill: P.mist }),
    line(1040, 288, 1068, 288, { stroke: P.bioTeal, sw: 3 }),
    text(1076, 292, "intervention stack", { mono: true, size: 10.5, fill: P.mist }),
    grid,
    // Area under intervention curve.
    pathD(
      `M ${r2(intervent[0][0])} ${r2(intervent[0][1])} ` +
        intervent
          .slice(1)
          .map((p) => `L ${r2(p[0])} ${r2(p[1])}`)
          .join(" ") +
        ` L ${r2(intervent[intervent.length - 1][0])} 648 L ${r2(intervent[0][0])} 648 Z`,
      { fill: P.bioTeal, opacity: 0.07 },
    ),
    // Curves.
    pathD(smoothPath(baseline), { stroke: P.mist, sw: 2.5, dash: "6 6", cap: "butt" }),
    pathD(smoothPath(intervent), { stroke: P.bioTeal, sw: 8, opacity: 0.12 }),
    pathD(smoothPath(intervent), { stroke: P.bioTeal, sw: 3.5 }),
    intervent.map((p) => circle(p[0], p[1], 3.5, { fill: P.bioTeal })).join("\n"),
    baseline.map((p) => circle(p[0], p[1], 3, { fill: P.mist })).join("\n"),
    // Escape velocity marker at 2041.
    line(xOf(2041), 288, xOf(2041), 648, {
      stroke: P.helixAmber,
      sw: 1.5,
      dash: "4 6",
      opacity: 0.8,
    }),
    circle(xOf(2041), yOf(77.6), 5, { fill: P.helixAmber, stroke: P.abyss2, sw: 2 }),
    text(xOf(2041) + 10, 308, "escape velocity 2041", { mono: true, size: 11, fill: P.helixAmber }),
    // Axis titles.
    text(784, 700, "year", { mono: true, size: 11, fill: P.mist, anchor: "middle" }),
    text(424, 468, "life expectancy (years)", {
      mono: true,
      size: 11,
      fill: P.mist,
      anchor: "middle",
      transform: "rotate(-90 424 468)",
    }),
  ].join("\n");

  return screenRoot("Geistloom — Century Engine mockup", "geistloom.local/century", content);
}

/* ------------------------------------------------------------------ */
/* 6c. screen-hallmarks.svg — 12 hallmark cards                        */
/* ------------------------------------------------------------------ */

function screenHallmarks() {
  const catColor = { primary: P.helixAmber, antagonistic: P.genomeViolet, integrative: P.bioTeal };
  const cards = [
    [
      "Genomic instability",
      "primary",
      "nuclear layer",
      "DNA damage outruns repair: replication errors, oxidative hits and transposons accumulate as mutations.",
      "WGS mutational burden · γH2AX foci",
      ["base editing", "DNA repair boosters"],
    ],
    [
      "Telomere attrition",
      "primary",
      "nuclear layer",
      "The end-replication problem shortens caps each division until cells hit the Hayflick limit.",
      "qPCR telomere ratio · Flow-FISH",
      ["TERT therapy", "hyper-long telomeres"],
    ],
    [
      "Epigenetic alterations",
      "primary",
      "epigenomic layer",
      "Methylation entropy and histone marks drift; clocks quantify the divergence from youthful state.",
      "Illumina EPIC arrays · DunedinPACE",
      ["OSK reprogramming", "epigenetic editing"],
    ],
    [
      "Loss of proteostasis",
      "primary",
      "proteomic layer",
      "Chaperones and the unfolded-protein response decline; amyloid and tau aggregates outrun clearance.",
      "Proteasome assays · aggregate proteomics",
      ["chaperone inducers", "autophagy enhancers"],
    ],
    [
      "Disabled macroautophagy",
      "primary",
      "organellar layer",
      "Autophagosome formation and lysosomal acidification decline; damaged mitochondria persist.",
      "LC3-II/I ratio · p62 turnover assay",
      ["spermidine class", "rapalogs"],
    ],
    [
      "Deregulated nutrient sensing",
      "primary",
      "systemic layer",
      "Chronic nutrient excess keeps mTORC1 high and AMPK/SIRT low; the axes drift together.",
      "p-S6K1 · NAD+/NADH · IGF-1",
      ["rapalogs", "metformin"],
    ],
    [
      "Mitochondrial dysfunction",
      "primary",
      "organellar layer",
      "mtDNA mutations accumulate, ETC efficiency drops, and mitophagy fails to clear the damage.",
      "Oxygen consumption · mtDNA copy number",
      ["SS-31 class", "NAD+ precursors"],
    ],
    [
      "Cellular senescence",
      "antagonistic",
      "cellular layer",
      "Damaged cells arrest and secrete IL-6, IL-8 and MMPs — the SASP that poisons surrounding niches.",
      "p16INK4a · SA-β-gal · SASP panel",
      ["D+Q senolytics", "fisetin"],
    ],
    [
      "Stem cell exhaustion",
      "antagonistic",
      "cellular layer",
      "HSC myeloid skewing and satellite-cell loss shrink the regenerative pool; niches deteriorate.",
      "CFU assays · niche single-cell atlases",
      ["stem cell therapies", "niche rejuvenation"],
    ],
    [
      "Altered intercellular communication",
      "integrative",
      "intercellular layer",
      "Inflammaging and SASP corrupt endocrine and immune signaling between tissues.",
      "Cytokine panels · inflammaging scores",
      ["plasma exchange", "SASP blockers"],
    ],
    [
      "Chronic inflammation",
      "integrative",
      "systemic layer",
      "NF-κB tone rises with age — a sterile, low-grade fire that predicts multimorbidity.",
      "IL-6 · CRP · TNF-α · inflammaging clocks",
      ["JAK inhibitors", "senolytics D+Q"],
    ],
    [
      "Dysbiosis",
      "integrative",
      "systemic layer",
      "Butyrate-producers fade, pathobionts rise, and gut-barrier leak fuels systemic inflammation.",
      "16S metagenomics · SCFA levels",
      ["FMT", "pre-/post-biotics"],
    ],
  ];

  let grid = "";
  cards.forEach(([name, cat, layer, mech, measured, chips], i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 48 + col * 368;
    const y = 156 + row * 146;
    const color = catColor[cat];
    const mechLines = wrapText(mech, 54);
    const chipWidths = chips.map((c) => c.length * 5.9 + 18);
    grid += [
      rect(x, y, 352, 132, { rx: 12, fill: P.charcoal, stroke: color, sw: 1.5, opacity: 0.96 }),
      text(x + 20, y + 30, name, { size: 16, weight: 600 }),
      // category pill
      rect(x + 252, y + 14, 84, 20, { rx: 10, fill: color, opacity: 0.14 }),
      rect(x + 252, y + 14, 84, 20, { rx: 10, stroke: color, sw: 1, opacity: 0.6 }),
      text(x + 294, y + 28, cat.toUpperCase(), {
        mono: true,
        size: 9,
        spacing: 1,
        fill: color,
        anchor: "middle",
      }),
      text(x + 20, y + 50, layer.toUpperCase(), {
        mono: true,
        size: 10,
        spacing: 1.5,
        fill: P.mist,
        opacity: 0.85,
      }),
      ...mechLines.map((ln, li) => text(x + 20, y + 72 + li * 16, ln, { size: 11, fill: P.mist })),
      text(x + 20, y + 72 + mechLines.length * 16 + 4, `measured · ${measured}`, {
        mono: true,
        size: 9.5,
        fill: P.bioTealDim,
      }),
      // intervention chips
      (() => {
        let cxx = x + 20;
        const cy = y + 112;
        return chips
          .map((c, ci) => {
            const w = chipWidths[ci];
            const s = [
              rect(cxx, cy, w, 15, { rx: 7.5, fill: P.abyss2, stroke: P.charcoal, sw: 1 }),
              text(cxx + w / 2, cy + 11, c, {
                mono: true,
                size: 9,
                fill: P.mist,
                anchor: "middle",
              }),
            ].join("\n");
            cxx += w + 8;
            return s;
          })
          .join("\n");
      })(),
    ].join("\n");
  });

  const content = [
    screenHeader(
      "Hallmarks Atlas",
      "the 12 hallmarks of aging · López-Otín et al., Cell (2023) · three tiers · every mechanism measured",
    ),
    grid,
  ].join("\n");

  return screenRoot("Geistloom — Hallmarks Atlas mockup", "geistloom.local/hallmarks", content);
}

/** Naive word-wrap for fixed-width estimates (deterministic, no randomness). */
function wrapText(str, maxChars) {
  const words = str.split(" ");
  const lines = [];
  let cur = "";
  for (const w of words) {
    if (`${cur} ${w}`.trim().length > maxChars && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = `${cur} ${w}`.trim();
    }
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 2);
}

/* ------------------------------------------------------------------ */
/* 6d. screen-gene-drive.svg — allele frequency chart                  */
/* ------------------------------------------------------------------ */

function screenGeneDrive() {
  const sliders = [
    ["homing efficiency", 0.92, "0.00", "1.00"],
    ["resistance rate", 0.041, "0.000", "0.200"],
    ["fitness cost", 0.08, "0.00", "1.00"],
    ["release ratio", 0.1, "0.00", "1.00"],
    ["threshold", 0.5, "0.00", "1.00"],
  ];
  let sliderRows = "";
  sliders.forEach(([label, v, lo, hi], i) => {
    const y = 196 + i * 72;
    sliderRows += [
      text(64, y + 14, label, { size: 13.5 }),
      text(336, y + 14, v.toFixed(3).replace(/0+$/, "").replace(/\.$/, ".0"), {
        mono: true,
        size: 13,
        fill: P.bioTeal,
        anchor: "end",
      }),
      rect(64, y + 26, 288, 8, { rx: 4, fill: P.abyss }),
      rect(64, y + 26, 288 * v, 8, { rx: 4, fill: P.bioTealDim }),
      circle(64 + 288 * v, y + 30, 6, { fill: P.bioTeal, stroke: P.abyss2, sw: 2 }),
      text(64, y + 52, lo, { mono: true, size: 9.5, fill: P.mist, opacity: 0.8 }),
      text(352, y + 52, hi, { mono: true, size: 9.5, fill: P.mist, anchor: "end", opacity: 0.8 }),
    ].join("\n");
  });

  // Chart: x gen 0..60 -> 452..1120, y freq 0..1 -> 640..180.
  const xOf = (g) => 452 + g * 11.1333;
  const yOf = (f) => 640 - f * 460;
  const wild = [
    [0, 1.0],
    [5, 0.72],
    [10, 0.45],
    [15, 0.26],
    [20, 0.16],
    [25, 0.12],
    [30, 0.1],
    [40, 0.08],
    [60, 0.06],
  ].map(([a, b]) => [xOf(a), yOf(b)]);
  const drive = [
    [0, 0.1],
    [5, 0.38],
    [10, 0.68],
    [15, 0.88],
    [20, 0.95],
    [23, 0.96],
    [30, 0.94],
    [40, 0.9],
    [60, 0.86],
  ].map(([a, b]) => [xOf(a), yOf(b)]);
  const resistant = [
    [0, 0.0],
    [10, 0.01],
    [20, 0.04],
    [30, 0.1],
    [40, 0.19],
    [50, 0.28],
    [60, 0.35],
  ].map(([a, b]) => [xOf(a), yOf(b)]);

  let grid = "";
  for (let g = 0; g <= 60; g += 10) {
    grid += line(xOf(g), 180, xOf(g), 640, { stroke: P.charcoal, sw: 1, opacity: 0.7 });
    grid += text(xOf(g), 660, `gen ${g}`, { mono: true, size: 10, fill: P.mist, anchor: "middle" });
  }
  for (let f = 0; f <= 1.0001; f += 0.2) {
    grid += line(452, yOf(f), 1120, yOf(f), { stroke: P.charcoal, sw: 1, opacity: 0.7 });
    grid += text(444, yOf(f) + 3, f.toFixed(1), {
      mono: true,
      size: 10,
      fill: P.mist,
      anchor: "end",
    });
  }

  const content = [
    screenHeader(
      "Gene Drive Lab",
      "three-allele recursion · wild / drive / resistant · homing endonuclease dynamics",
    ),
    // Left: parameters.
    rect(48, 164, 320, 548, { rx: 12, fill: P.charcoal }),
    text(64, 188, "DRIVE PARAMETERS", { mono: true, size: 12, spacing: 2, fill: P.bioTealDim }),
    sliderRows,
    // Containment card.
    rect(64, 556, 288, 140, {
      rx: 10,
      fill: P.abyss2,
      stroke: P.helixAmber,
      sw: 1.5,
      opacity: 0.96,
    }),
    text(80, 580, "CONTAINMENT HORIZON", {
      mono: true,
      size: 10,
      spacing: 1.5,
      fill: P.helixAmber,
    }),
    text(80, 606, "drive fixation", { size: 12.5, fill: P.mist }),
    text(336, 606, "gen 23", { mono: true, size: 12.5, fill: P.bioTeal, anchor: "end" }),
    text(80, 630, "resistance takeover", { size: 12.5, fill: P.mist }),
    text(336, 630, "gen 41", { mono: true, size: 12.5, fill: P.helixAmber, anchor: "end" }),
    text(80, 654, "wild collapse", { size: 12.5, fill: P.mist }),
    text(336, 654, "gen 18", { mono: true, size: 12.5, fill: P.mist, anchor: "end" }),
    text(80, 682, "verdict: contained within 60 generations", {
      mono: true,
      size: 10.5,
      fill: P.bioTeal,
    }),
    // Right: chart.
    rect(400, 164, 752, 548, { rx: 12, fill: P.charcoal }),
    text(424, 192, "allele frequency over 60 generations", { size: 15, weight: 600 }),
    // Legend.
    line(640, 188, 668, 188, { stroke: P.mist, sw: 2.5 }),
    text(676, 192, "wild type", { mono: true, size: 10.5, fill: P.mist }),
    line(752, 188, 780, 188, { stroke: P.bioTeal, sw: 3 }),
    text(788, 192, "drive", { mono: true, size: 10.5, fill: P.bioTeal }),
    line(848, 188, 876, 188, { stroke: P.helixAmber, sw: 2.5 }),
    text(884, 192, "resistant", { mono: true, size: 10.5, fill: P.helixAmber }),
    grid,
    pathD(smoothPath(wild), { stroke: P.mist, sw: 2.5 }),
    pathD(smoothPath(drive), { stroke: P.bioTeal, sw: 8, opacity: 0.12 }),
    pathD(smoothPath(drive), { stroke: P.bioTeal, sw: 3.5 }),
    pathD(smoothPath(resistant), { stroke: P.helixAmber, sw: 2.5 }),
    // Fixation marker.
    line(xOf(23), 180, xOf(23), 640, { stroke: P.bioTeal, sw: 1.5, dash: "4 6", opacity: 0.7 }),
    circle(xOf(23), yOf(0.96), 5, { fill: P.bioTeal, stroke: P.abyss2, sw: 2 }),
    text(xOf(23) + 10, 210, "drive fixation · 0.96", { mono: true, size: 11, fill: P.bioTeal }),
    text(786, 692, "generation", { mono: true, size: 11, fill: P.mist, anchor: "middle" }),
    text(424, 410, "allele frequency", {
      mono: true,
      size: 11,
      fill: P.mist,
      anchor: "middle",
      transform: "rotate(-90 424 410)",
    }),
  ].join("\n");

  return screenRoot("Geistloom — Gene Drive Lab mockup", "geistloom.local/gene-drive", content);
}

/* ------------------------------------------------------------------ */
/* 6e. screen-worldboard.svg — live dashboard                          */
/* ------------------------------------------------------------------ */

function screenWorldboard() {
  const metrics = [
    ["lifeExpectancy", "88.4", "years", "+0.61 / yr · 2075.00"],
    ["population", "9.9", "billion", "+0.04 / yr · 2075.00"],
    ["biosphereHealth", "71", "/ 100", "+0.4 / yr · recovering"],
    ["aiCapability", "64", "/ 100", "+3.1 / yr · accelerating"],
  ];
  let metricCards = "";
  metrics.forEach(([label, value, unit, delta], i) => {
    const x = 48 + i * 288;
    metricCards += [
      rect(x, 160, 272, 108, { rx: 12, fill: P.charcoal }),
      text(x + 20, 190, label, { mono: true, size: 11, spacing: 1, fill: P.mist }),
      text(x + 20, 236, value, { size: 40, weight: 600 }),
      text(x + 20 + value.length * 24, 236, ` ${unit}`, { size: 14, fill: P.mist }),
      text(x + 20, 256, delta, { mono: true, size: 11, fill: P.bioTeal }),
    ].join("\n");
  });

  // Live chart: LE 2026..2075 -> x 88..744, y 70..90 -> 500..320.
  const xOf = (yr) => 88 + ((yr - 2026) / 49) * 656;
  const yOf = (le) => 500 - (le - 70) * 9;
  const stream = [
    [2026, 73.8],
    [2035, 77.2],
    [2045, 81.6],
    [2055, 84.9],
    [2065, 86.9],
    [2075, 88.4],
  ].map(([a, b]) => [xOf(a), yOf(b)]);
  const area =
    `M ${r2(stream[0][0])} ${r2(stream[0][1])} ` +
    stream
      .slice(1)
      .map((p) => `L ${r2(p[0])} ${r2(p[1])}`)
      .join(" ") +
    ` L ${r2(stream[stream.length - 1][0])} 500 L ${r2(stream[0][0])} 500 Z`;

  const events = [
    ["2075.00", "LE 88.41 · pop 9.90B · bio 71.2 · ai 64.0", true],
    ["2074.75", "LE 88.26 · pop 9.89B · bio 70.9 · ai 62.4", false],
    ["2074.50", "LE 88.11 · pop 9.89B · bio 70.6 · ai 60.7", false],
    ["2074.25", "LE 87.97 · pop 9.88B · bio 70.3 · ai 59.1", false],
    ["2074.00", "LE 87.82 · pop 9.88B · bio 70.0 · ai 57.6", false],
    ["2073.75", "LE 87.68 · pop 9.87B · bio 69.7 · ai 56.0", false],
  ];
  let eventRows = "";
  events.forEach(([t, body, live], i) => {
    const y = 316 + i * 38;
    eventRows += [
      live ? rect(816, y - 16, 320, 30, { rx: 6, fill: P.bioTeal, opacity: 0.08 }) : "",
      circle(830, y - 1, live ? 4 : 2.5, {
        fill: live ? P.bioTeal : P.mist,
        opacity: live ? 1 : 0.6,
      }),
      text(846, y + 3, t, { mono: true, size: 10.5, fill: live ? P.bioTeal : P.mist }),
      text(900, y + 3, body, { mono: true, size: 10, fill: P.mist }),
    ].join("\n");
  });

  const scenarios = [
    ["The Long Stagnation", 0.2],
    ["The Bio-Dividend", 0.22],
    ["Escape Velocity, 2035", 0.18],
    ["The Divided World", 0.17],
    ["Post-Scarcity Biology", 0.15],
    ["Misalignment Shadow", 0.08],
  ];
  let scenarioBars = "";
  scenarios.forEach(([name, w], i) => {
    const y = 616 + i * 15;
    scenarioBars += [
      text(64, y + 9, name, { mono: true, size: 10, fill: P.mist }),
      rect(220, y, 140, 8, { rx: 4, fill: P.abyss }),
      rect(220, y, 140 * w, 8, { rx: 4, fill: P.genomeViolet }),
      text(372, y + 9, `${Math.round(w * 100)}%`, {
        mono: true,
        size: 10,
        fill: P.starWhite,
        anchor: "end",
      }),
    ].join("\n");
  });

  const content = [
    screenHeader(
      "Worldboard",
      "live world state · SSE relay :9119 · every metric is a deterministic function of the seed",
    ),
    metricCards,
    // Live chart card.
    rect(48, 284, 736, 268, { rx: 12, fill: P.charcoal }),
    text(72, 312, "life expectancy — live stream", { size: 15, weight: 600 }),
    rect(640, 296, 64, 20, { rx: 10, fill: P.bioTeal, opacity: 0.14 }),
    rect(640, 296, 64, 20, { rx: 10, stroke: P.bioTeal, sw: 1, opacity: 0.6 }),
    circle(654, 306, 4, { fill: P.bioTeal }) +
      `<animate attributeName="opacity" values="1;0.25;1" dur="1.6s" repeatCount="indefinite"/>`,
    text(664, 310, "LIVE", { mono: true, size: 10, spacing: 1, fill: P.bioTeal }),
    text(760, 312, "SSE · relay :9119", { mono: true, size: 10.5, fill: P.mist, anchor: "end" }),
    // grid
    ...(() => {
      const g = [];
      for (let yr = 2026; yr <= 2075; yr += 10) {
        g.push(line(xOf(yr), 320, xOf(yr), 500, { stroke: P.charcoal, sw: 1, opacity: 0.7 }));
        g.push(
          text(xOf(yr), 518, String(yr), { mono: true, size: 9.5, fill: P.mist, anchor: "middle" }),
        );
      }
      for (let le = 70; le <= 90; le += 5) {
        g.push(line(88, yOf(le), 744, yOf(le), { stroke: P.charcoal, sw: 1, opacity: 0.7 }));
        g.push(
          text(80, yOf(le) + 3, String(le), { mono: true, size: 9.5, fill: P.mist, anchor: "end" }),
        );
      }
      return g;
    })(),
    pathD(area, { fill: P.bioTeal, opacity: 0.12 }),
    pathD(smoothPath(stream), { stroke: P.bioTeal, sw: 7, opacity: 0.15 }),
    pathD(smoothPath(stream), { stroke: P.bioTeal, sw: 3 }),
    stream.map((p) => circle(p[0], p[1], 3.5, { fill: P.bioTeal })).join("\n"),
    circle(xOf(2075), yOf(88.4), 5.5, { fill: P.bioTeal, stroke: P.starWhite, sw: 2 }) +
      `<animate attributeName="r" values="5.5;8;5.5" dur="1.6s" repeatCount="indefinite"/>`,
    // Event stream card.
    rect(800, 284, 352, 268, { rx: 12, fill: P.charcoal }),
    text(816, 312, "event stream", { mono: true, size: 12, spacing: 2, fill: P.bioTealDim }),
    eventRows,
    // Bottom row.
    rect(48, 568, 376, 140, { rx: 12, fill: P.charcoal }),
    text(64, 594, "SCENARIO PRIORS", { mono: true, size: 11, spacing: 2, fill: P.bioTealDim }),
    scenarioBars,
    rect(440, 568, 376, 140, { rx: 12, fill: P.charcoal }),
    text(456, 594, "RUN HISTORY", { mono: true, size: 11, spacing: 2, fill: P.bioTealDim }),
    [
      ["seed 4093", "@2075.00", "replaying", P.bioTeal],
      ["seed 4094", "@2075.00", "committed", P.mist],
      ["seed 4092", "@2026.00", "archived", P.mist],
      ["seed 4091", "@2100.00", "archived", P.mist],
    ]
      .map(([s, t, st, c], i) => {
        const y = 616 + i * 26;
        return [
          circle(466, y - 3, 3, { fill: c }),
          text(480, y, s, { mono: true, size: 11, fill: P.starWhite }),
          text(576, y, t, { mono: true, size: 11, fill: P.mist }),
          text(792, y, st, { mono: true, size: 11, fill: c, anchor: "end" }),
        ].join("\n");
      })
      .join("\n"),
    rect(832, 568, 320, 140, { rx: 12, fill: P.charcoal }),
    text(848, 594, "FORK THE WORLD", { mono: true, size: 11, spacing: 2, fill: P.bioTealDim }),
    rect(848, 608, 288, 44, { rx: 10, fill: P.bioTeal }),
    text(992, 636, "fork at 2075", { size: 15, weight: 600, fill: P.abyss, anchor: "middle" }),
    text(848, 676, "fork seed 4093 → branch 2075.00", { mono: true, size: 10.5, fill: P.mist }),
    text(848, 694, "replay is byte-identical, forever", { mono: true, size: 10.5, fill: P.mist }),
  ].join("\n");

  return screenRoot("Geistloom — Worldboard mockup", "geistloom.local/worldboard", content);
}

/* ------------------------------------------------------------------ */
/* 6f. screen-time-machine.svg — year scrubber + forked timelines      */
/* ------------------------------------------------------------------ */

function screenTimeMachine() {
  // Scrubber: x 2026..2226 -> 88..1064.
  const sxOf = (yr) => 88 + ((yr - 2026) / 200) * 976;
  const ticks = [2026, 2050, 2075, 2100, 2150, 2226];
  let scrubber = "";
  scrubber += line(88, 208, 1064, 208, { stroke: P.charcoal, sw: 6, cap: "round" });
  scrubber += line(88, 208, sxOf(2075), 208, { stroke: P.bioTeal, sw: 6, cap: "round" });
  ticks.forEach((yr) => {
    const major = yr === 2075;
    scrubber += [
      line(sxOf(yr), 200, sxOf(yr), 216, { stroke: major ? P.bioTeal : P.mist, sw: major ? 3 : 2 }),
      text(sxOf(yr), 238, String(yr), {
        mono: true,
        size: major ? 13 : 11,
        fill: major ? P.bioTeal : P.mist,
        anchor: "middle",
      }),
    ].join("\n");
  });
  scrubber += [
    circle(sxOf(2075), 208, 20, { stroke: P.bioTeal, sw: 2, opacity: 0.3 }),
    circle(sxOf(2075), 208, 13, { fill: P.bioTeal, stroke: P.starWhite, sw: 3 }),
  ].join("\n");

  const states = [
    ["lifeExpectancy", "88.4", "years · +0.61 / yr"],
    ["healthspan", "79.2", "healthy years expected"],
    ["agingRate", "0.62", "× natural aging rate"],
    ["interventionCoverage", "41%", "weighted adoption"],
  ];
  let stateCards = "";
  states.forEach(([label, value, sub], i) => {
    const x = 48 + i * 288;
    stateCards += [
      rect(x, 272, 272, 128, { rx: 12, fill: P.charcoal }),
      text(x + 20, 302, `world state @ 2075 · ${label}`, {
        mono: true,
        size: 10,
        spacing: 0.5,
        fill: P.mist,
      }),
      text(x + 20, 352, value, { size: 36, weight: 600, fill: P.bioTeal }),
      text(x + 20, 376, sub, { mono: true, size: 11, fill: P.mist }),
    ].join("\n");
  });

  // Fork chart: x 2026..2226 -> 88..1120, y 70..140 -> 610..470.
  const xOf = (yr) => 88 + ((yr - 2026) / 200) * 1032;
  const yOf = (le) => 610 - (le - 70) * 2;
  const runLine = [
    [2026, 73.8],
    [2050, 80.2],
    [2075, 88.4],
  ].map(([a, b]) => [xOf(a), yOf(b)]);
  const baseFork = [
    [2075, 88.4],
    [2100, 90.1],
    [2150, 91.8],
    [2226, 93.4],
  ].map(([a, b]) => [xOf(a), yOf(b)]);
  const interFork = [
    [2075, 88.4],
    [2100, 101.2],
    [2150, 119.6],
    [2226, 136.8],
  ].map(([a, b]) => [xOf(a), yOf(b)]);
  const forkArea =
    `M ${r2(interFork[0][0])} ${r2(interFork[0][1])} ` +
    interFork
      .slice(1)
      .map((p) => `L ${r2(p[0])} ${r2(p[1])}`)
      .join(" ") +
    ` L ${r2(interFork[interFork.length - 1][0])} 610 L ${r2(interFork[0][0])} 610 Z`;

  let grid = "";
  for (let yr = 2026; yr <= 2226; yr += 25) {
    grid += line(xOf(yr), 470, xOf(yr), 610, { stroke: P.charcoal, sw: 1, opacity: 0.7 });
    grid += text(xOf(yr), 628, String(yr), {
      mono: true,
      size: 10,
      fill: P.mist,
      anchor: "middle",
    });
  }
  for (let le = 70; le <= 140; le += 10) {
    grid += line(88, yOf(le), 1120, yOf(le), { stroke: P.charcoal, sw: 1, opacity: 0.7 });
    grid += text(80, yOf(le) + 3, String(le), {
      mono: true,
      size: 10,
      fill: P.mist,
      anchor: "end",
    });
  }

  const content = [
    screenHeader(
      "Time Machine",
      "every year is a coordinate · fork any state · replay any run · byte-identical forever",
    ),
    // Scrubber card.
    rect(48, 160, 1104, 96, { rx: 12, fill: P.charcoal }),
    text(72, 188, "SCRUBBER", { mono: true, size: 11, spacing: 2, fill: P.bioTealDim }),
    text(1128, 192, "2075", { size: 36, weight: 600, fill: P.bioTeal, anchor: "end" }),
    scrubber,
    // State cards.
    stateCards,
    // Fork chart.
    rect(48, 416, 1104, 240, { rx: 12, fill: P.charcoal }),
    text(72, 444, "forked timelines — diverging from 2075", { size: 15, weight: 600 }),
    line(700, 440, 728, 440, { stroke: P.starWhite, sw: 3, opacity: 0.7 }),
    text(736, 444, "run 2026 → 2075", { mono: true, size: 10.5, fill: P.mist }),
    line(864, 440, 892, 440, { stroke: P.mist, sw: 2.5, dash: "5 5" }),
    text(900, 444, "no new interventions", { mono: true, size: 10.5, fill: P.mist }),
    line(1032, 440, 1060, 440, { stroke: P.bioTeal, sw: 3 }),
    text(1068, 444, "fork: add OSK reprogramming", { mono: true, size: 10.5, fill: P.bioTeal }),
    grid,
    pathD(forkArea, { fill: P.bioTeal, opacity: 0.08 }),
    pathD(smoothPath(runLine), { stroke: P.starWhite, sw: 3, opacity: 0.75 }),
    runLine.map((p) => circle(p[0], p[1], 3, { fill: P.starWhite, opacity: 0.75 })).join("\n"),
    pathD(smoothPath(baseFork), { stroke: P.mist, sw: 2.5, dash: "6 6", cap: "butt" }),
    pathD(smoothPath(interFork), { stroke: P.bioTeal, sw: 7, opacity: 0.12 }),
    pathD(smoothPath(interFork), { stroke: P.bioTeal, sw: 3.5 }),
    interFork.map((p) => circle(p[0], p[1], 3.5, { fill: P.bioTeal })).join("\n"),
    // Fork marker.
    line(xOf(2075), 470, xOf(2075), 610, {
      stroke: P.helixAmber,
      sw: 1.5,
      dash: "4 6",
      opacity: 0.85,
    }),
    circle(xOf(2075), yOf(88.4), 6, { fill: P.helixAmber, stroke: P.abyss2, sw: 2 }),
    text(xOf(2075) + 12, 486, "fork · seed 4093 → branch 2075.00", {
      mono: true,
      size: 11,
      fill: P.helixAmber,
    }),
    text(576, 672, "year", { mono: true, size: 11, fill: P.mist, anchor: "middle" }),
    text(64, 540, "life expectancy", {
      mono: true,
      size: 11,
      fill: P.mist,
      anchor: "middle",
      transform: "rotate(-90 64 540)",
    }),
    text(
      600,
      700,
      "2100 projection → 101.2 y (fork) vs 90.1 y (no new interventions) · replay is byte-identical",
      {
        mono: true,
        size: 12,
        fill: P.mist,
        anchor: "middle",
      },
    ),
  ].join("\n");

  return screenRoot("Geistloom — Time Machine mockup", "geistloom.local/time-machine", content);
}

/* ------------------------------------------------------------------ */
/* 7. architecture.svg — 1600x1000 poster                              */
/* ------------------------------------------------------------------ */

function architecture() {
  const W = 1600;
  const H = 1000;
  const defs = [
    dotGridPattern("grid", 32, 1),
    arrowMarker("arrowTeal", P.bioTeal),
    arrowMarker("arrowMist", P.mist),
  ].join("\n");

  const colX = [64, 368, 672, 976, 1280];
  const colW = 264;
  const colY = 170;
  const colH = 520;

  const columns = [
    {
      index: "01",
      layer: "EDGE",
      sub: "the observer's browser",
      boxes: [
        [
          "browser",
          "observer browser",
          "Next.js 15 + React 19",
          "static shell · landing · /oracle · /century",
        ],
        ["og", "dynamic og:image", "per-world social cards", "deterministic render · /og route"],
        ["frame", "the frame", "one promise, everywhere", "banner · logo · six product surfaces"],
      ],
    },
    {
      index: "02",
      layer: "apps/web",
      sub: "route handlers · thin adapters",
      boxes: [
        [
          "routes",
          "route handlers",
          "/api/oracle · /api/century",
          "zod in · zod out · no domain logic",
        ],
        ["sse", "SSE consumer", "worldboard live stream", "EventSource · relay :9119"],
        ["render", "render layer", "server components", "Tailwind v4 theme tokens"],
      ],
    },
    {
      index: "03",
      layer: "packages/core",
      sub: "pure functions · the determinism boundary",
      boxes: [
        ["fsm", "OracleBrain", "6-state FSM over the graph", "perceive → reflect · seeded utility"],
        [
          "engine",
          "CenturyEngine",
          "RK4 propagation · 200 yrs",
          "UN WPP-anchored baseline 73.8 → 81.7",
        ],
        ["drive", "GeneDriveEngine", "three-allele recursion", "homing · resistance · containment"],
        [
          "tables",
          "domain tables",
          "12 hallmarks · 30 interventions",
          "8 clocks · 6 scenarios · citation-backed",
        ],
      ],
    },
    {
      index: "04",
      layer: "polyglot services",
      sub: "each earns its place · all optional",
      boxes: [
        ["py", "services/oracle", "Python 3.12 · FastAPI :8787", "oracle brain service · optional"],
        ["rs", "crates/loom-engine", "Rust → wasm", "hot loops · RK4 · gene-drive recursion"],
        ["go", "services/relay", "Go :9119", "SSE fan-out · structured telemetry"],
      ],
    },
    {
      index: "05",
      layer: "packages/seed",
      sub: "offline datasets · zero config",
      boxes: [
        ["seed", "seed 4093", "offline JSON worlds", "generated · committed · replayable"],
        ["anchor", "UN WPP anchors", "life expectancy baselines", "73.8 y (2026) → 81.7 y (2100)"],
        [
          "graph",
          "knowledge graph",
          "hallmark → intervention edges",
          "mechanism · measurement · evidence",
        ],
      ],
    },
  ];

  /** Small rect-based icon inside a 48x48 box at (x, y). */
  function icon(kind, x, y, color) {
    const c = color;
    switch (kind) {
      case "browser":
        return [
          rect(x, y, 48, 48, { rx: 10, fill: P.abyss, stroke: c, sw: 1.5 }),
          line(x, y + 12, x + 48, y + 12, { stroke: c, sw: 1.5 }),
          circle(x + 8, y + 6, 1.8, { fill: c }),
          circle(x + 14, y + 6, 1.8, { fill: c }),
          circle(x + 20, y + 6, 1.8, { fill: c }),
          line(x + 8, y + 22, x + 40, y + 22, { stroke: c, sw: 2, opacity: 0.7 }),
          line(x + 8, y + 30, x + 32, y + 30, { stroke: c, sw: 2, opacity: 0.5 }),
          line(x + 8, y + 38, x + 36, y + 38, { stroke: c, sw: 2, opacity: 0.5 }),
        ].join("\n");
      case "og":
        return [
          rect(x, y, 48, 48, { rx: 10, fill: P.abyss, stroke: c, sw: 1.5 }),
          pathD(
            `M ${x + 8} ${y + 36} L ${x + 20} ${y + 20} L ${x + 28} ${y + 30} L ${x + 34} ${y + 22} L ${x + 40} ${y + 36} Z`,
            { stroke: c, sw: 1.5, join: "round" },
          ),
          circle(x + 34, y + 16, 3, { fill: c }),
        ].join("\n");
      case "frame":
        return [
          rect(x, y, 48, 48, { rx: 10, fill: P.abyss, stroke: c, sw: 1.5 }),
          (() => {
            const pts = [];
            for (let k = 0; k < 6; k++) {
              const a = ((-90 + 60 * k) * Math.PI) / 180;
              pts.push([x + 24 + 14 * Math.cos(a), y + 24 + 14 * Math.sin(a)]);
            }
            return pathD(`${pathFromPoints(pts)} Z`, { stroke: c, sw: 1.5, join: "round" });
          })(),
          line(x + 24, y + 14, x + 24, y + 34, { stroke: c, sw: 1.2, opacity: 0.7 }),
          line(x + 16, y + 20, x + 32, y + 28, { stroke: c, sw: 1.2, opacity: 0.7 }),
          line(x + 32, y + 20, x + 16, y + 28, { stroke: c, sw: 1.2, opacity: 0.7 }),
        ].join("\n");
      case "routes":
        return [
          rect(x, y, 48, 48, { rx: 10, fill: P.abyss, stroke: c, sw: 1.5 }),
          [20, 29, 38]
            .map((yy) =>
              [
                rect(x + 8, yy - 4, 6, 6, { rx: 2, fill: c }),
                line(x + 20, yy - 1, x + 40, yy - 1, { stroke: c, sw: 2, opacity: 0.7 }),
              ].join("\n"),
            )
            .join("\n"),
        ].join("\n");
      case "sse":
        return [
          rect(x, y, 48, 48, { rx: 10, fill: P.abyss, stroke: c, sw: 1.5 }),
          (() => {
            const pts = [];
            for (let i = 0; i <= 24; i++) {
              pts.push([x + 6 + i * 1.5, y + 24 + 8 * Math.sin((i / 24) * Math.PI * 2)]);
            }
            return pathD(pathFromPoints(pts), { stroke: c, sw: 1.8 });
          })(),
          circle(x + 40, y + 24, 2.5, { fill: c }),
        ].join("\n");
      case "render":
        return [
          rect(x, y, 48, 48, { rx: 10, fill: P.abyss, stroke: c, sw: 1.5 }),
          [14, 24, 34]
            .map((xx) => line(x + xx, y + 8, x + xx, y + 40, { stroke: c, sw: 1, opacity: 0.5 }))
            .join("\n"),
          [18, 30]
            .map((yy) => line(x + 8, y + yy, x + 40, y + yy, { stroke: c, sw: 1, opacity: 0.5 }))
            .join("\n"),
          rect(x + 18, y + 24, 10, 10, { rx: 2, fill: c, opacity: 0.85 }),
        ].join("\n");
      case "fsm":
        return [
          rect(x, y, 48, 48, { rx: 10, fill: P.abyss, stroke: c, sw: 1.5 }),
          circle(x + 12, y + 24, 5, { stroke: c, sw: 1.5 }),
          circle(x + 24, y + 14, 5, { stroke: c, sw: 1.5 }),
          circle(x + 36, y + 24, 5, { stroke: c, sw: 1.5 }),
          circle(x + 24, y + 34, 5, { stroke: c, sw: 1.5 }),
          line(x + 16, y + 20, x + 20, y + 17, { stroke: c, sw: 1.2 }),
          line(x + 28, y + 17, x + 32, y + 20, { stroke: c, sw: 1.2 }),
          line(x + 33, y + 28, x + 28, y + 31, { stroke: c, sw: 1.2 }),
          line(x + 20, y + 31, x + 16, y + 28, { stroke: c, sw: 1.2 }),
        ].join("\n");
      case "engine":
        return [
          rect(x, y, 48, 48, { rx: 10, fill: P.abyss, stroke: c, sw: 1.5 }),
          (() => {
            const pts = [];
            for (let i = 0; i <= 20; i++) {
              pts.push([x + 6 + i * 1.8, y + 24 + 10 * Math.sin((i / 20) * Math.PI * 1.5)]);
            }
            return pathD(pathFromPoints(pts), { stroke: c, sw: 1.8 });
          })(),
          line(x + 6, y + 38, x + 42, y + 38, { stroke: c, sw: 1.2, opacity: 0.6 }),
        ].join("\n");
      case "drive":
        return [
          rect(x, y, 48, 48, { rx: 10, fill: P.abyss, stroke: c, sw: 1.5 }),
          (() => {
            const a = [];
            const b = [];
            for (let i = 0; i <= 16; i++) {
              const yy = y + 8 + i * 2;
              const off = 6 * Math.sin((i / 16) * Math.PI * 2.5);
              a.push([x + 14 + off, yy]);
              b.push([x + 34 - off, yy]);
            }
            return (
              pathD(pathFromPoints(a), { stroke: c, sw: 1.5 }) +
              pathD(pathFromPoints(b), { stroke: c, sw: 1.5 }) +
              [4, 8, 12]
                .map((i) =>
                  line(a[i][0], a[i][1], b[i][0], b[i][1], { stroke: c, sw: 1, opacity: 0.6 }),
                )
                .join("\n")
            );
          })(),
        ].join("\n");
      case "tables":
        return [
          rect(x, y, 48, 48, { rx: 10, fill: P.abyss, stroke: c, sw: 1.5 }),
          [14, 24, 34]
            .map((xx) =>
              [14, 24, 34]
                .map((yy) => circle(x + xx, y + yy, 1.6, { fill: c, opacity: 0.8 }))
                .join("\n"),
            )
            .join("\n"),
        ].join("\n");
      case "py":
        return [
          rect(x, y, 48, 48, { rx: 10, fill: P.abyss, stroke: c, sw: 1.5 }),
          text(x + 24, y + 30, "Py", {
            mono: true,
            size: 16,
            weight: 600,
            fill: c,
            anchor: "middle",
          }),
        ].join("\n");
      case "rs":
        return [
          rect(x, y, 48, 48, { rx: 10, fill: P.abyss, stroke: c, sw: 1.5 }),
          text(x + 24, y + 30, "Rs", {
            mono: true,
            size: 16,
            weight: 600,
            fill: c,
            anchor: "middle",
          }),
        ].join("\n");
      case "go":
        return [
          rect(x, y, 48, 48, { rx: 10, fill: P.abyss, stroke: c, sw: 1.5 }),
          text(x + 24, y + 30, "Go", {
            mono: true,
            size: 16,
            weight: 600,
            fill: c,
            anchor: "middle",
          }),
        ].join("\n");
      case "seed":
        return [
          rect(x, y, 48, 48, { rx: 10, fill: P.abyss, stroke: c, sw: 1.5 }),
          `<ellipse cx="${x + 24}" cy="${y + 14}" rx="12" ry="5" fill="none" stroke="${c}" stroke-width="1.5"/>`,
          line(x + 12, y + 14, x + 12, y + 34, { stroke: c, sw: 1.5 }),
          line(x + 36, y + 14, x + 36, y + 34, { stroke: c, sw: 1.5 }),
          `<ellipse cx="${x + 24}" cy="${y + 34}" rx="12" ry="5" fill="none" stroke="${c}" stroke-width="1.5"/>`,
        ].join("\n");
      case "anchor":
        return [
          rect(x, y, 48, 48, { rx: 10, fill: P.abyss, stroke: c, sw: 1.5 }),
          circle(x + 24, y + 24, 9, { stroke: c, sw: 1.5 }),
          circle(x + 24, y + 24, 3, { fill: c }),
          line(x + 24, y + 8, x + 24, y + 15, { stroke: c, sw: 1.5 }),
          line(x + 24, y + 33, x + 24, y + 40, { stroke: c, sw: 1.5 }),
          line(x + 8, y + 24, x + 15, y + 24, { stroke: c, sw: 1.5 }),
          line(x + 33, y + 24, x + 40, y + 24, { stroke: c, sw: 1.5 }),
        ].join("\n");
      case "graph":
        return [
          rect(x, y, 48, 48, { rx: 10, fill: P.abyss, stroke: c, sw: 1.5 }),
          rect(x + 8, y + 10, 12, 10, { rx: 3, stroke: c, sw: 1.5, fill: "none" }),
          rect(x + 28, y + 10, 12, 10, { rx: 3, stroke: c, sw: 1.5, fill: "none" }),
          rect(x + 18, y + 28, 12, 10, { rx: 3, stroke: c, sw: 1.5, fill: "none" }),
          line(x + 14, y + 20, x + 22, y + 28, { stroke: c, sw: 1.2 }),
          line(x + 34, y + 20, x + 26, y + 28, { stroke: c, sw: 1.2 }),
        ].join("\n");
      default:
        return rect(x, y, 48, 48, { rx: 10, fill: P.abyss, stroke: c, sw: 1.5 });
    }
  }

  let columnsSvg = "";
  columns.forEach((col, ci) => {
    const x = colX[ci];
    const accent = ci === 2 ? P.bioTeal : ci === 4 ? P.helixAmber : P.genomeViolet;
    let boxes = "";
    col.boxes.forEach((box, bi) => {
      const by = colY + 76 + bi * 108;
      boxes += [
        rect(x, by, colW, 92, { rx: 12, fill: P.charcoal }),
        icon(box[0], x + 16, by + 22, accent),
        text(x + 76, by + 40, box[1], { size: 14.5, weight: 600 }),
        text(x + 76, by + 60, box[2], { mono: true, size: 10.5, fill: P.mist }),
        text(x + 76, by + 76, box[3], { mono: true, size: 10.5, fill: P.mist, opacity: 0.85 }),
      ].join("\n");
    });
    columnsSvg += [
      text(x, colY + 24, col.index, { mono: true, size: 13, fill: accent }),
      text(x + 44, colY + 26, col.layer, { size: 18, weight: 600 }),
      text(x, colY + 50, col.sub, { mono: true, size: 11, fill: P.mist }),
      line(x, colY + 62, x + colW, colY + 62, { stroke: P.charcoal, sw: 1.5 }),
      boxes,
      rect(x, colY, colW, colH, {
        rx: 16,
        stroke: P.charcoal,
        sw: 1.5,
        fill: "none",
        opacity: 0.9,
      }),
    ].join("\n");
  });

  // Arrows between columns.
  const arrowLabels = ["HTTP", "direct import", "HTTP + wasm", "direct import"];
  let arrows = "";
  for (let i = 0; i < 4; i++) {
    const x1 = colX[i] + colW + 6;
    const x2 = colX[i + 1] - 8;
    const y = colY + 300;
    arrows += [
      line(x1, y, x2, y, { stroke: P.bioTeal, sw: 2.5 }),
      `<path d="M ${r2(x2 - 8)} ${r2(y - 5)} L ${r2(x2)} ${r2(y)} L ${r2(x2 - 8)} ${r2(y + 5)} z" fill="${P.bioTeal}"/>`,
      rect((x1 + x2) / 2 - 44, y - 40, 88, 22, {
        rx: 11,
        fill: P.abyss2,
        stroke: P.bioTeal,
        sw: 1,
        opacity: 0.95,
      }),
      text((x1 + x2) / 2, y - 25, arrowLabels[i], {
        mono: true,
        size: 10.5,
        fill: P.bioTeal,
        anchor: "middle",
      }),
      // secondary data-flow arrow (dotted) lower
      line(x1, y + 90, x2, y + 90, { stroke: P.mist, sw: 1.5, dash: "2 6", opacity: 0.7 }),
      `<path d="M ${r2(x2 - 8)} ${r2(y + 85)} L ${r2(x2)} ${r2(y + 90)} L ${r2(x2 - 8)} ${r2(y + 95)} z" fill="${P.mist}" opacity="0.7"/>`,
    ].join("\n");
  }

  // Determinism boundary around packages/core (column 3).
  const boundary = [
    rect(colX[2] - 18, colY - 18, colW + 36, colH + 36, {
      rx: 22,
      stroke: P.bioTeal,
      sw: 2,
      dash: "8 8",
      opacity: 0.65,
      fill: "none",
    }),
    rect(colX[2] - 18, colY + colH + 24, colW + 36, 30, { rx: 15, fill: P.bioTeal, opacity: 0.12 }),
    text(colX[2] + colW / 2, colY + colH + 44, "determinism boundary — same input ⇒ same output", {
      mono: true,
      size: 12,
      fill: P.bioTeal,
      anchor: "middle",
    }),
  ].join("\n");

  // Legend.
  const legend = [
    text(64, 800, "LEGEND", { mono: true, size: 12, spacing: 2, fill: P.bioTealDim }),
    line(64, 824, 92, 824, { stroke: P.bioTeal, sw: 2.5 }),
    text(100, 828, "runtime call", { mono: true, size: 11, fill: P.mist }),
    line(220, 824, 248, 824, { stroke: P.mist, sw: 1.5, dash: "2 6" }),
    text(256, 828, "data flow · offline", { mono: true, size: 11, fill: P.mist }),
    line(440, 824, 468, 824, { stroke: P.bioTeal, sw: 2, dash: "8 8" }),
    text(476, 828, "determinism boundary", { mono: true, size: 11, fill: P.mist }),
    text(
      64,
      856,
      "every arrow is a real interface: HTTP between services, direct import inside the frame, wasm for hot loops.",
      {
        mono: true,
        size: 11,
        fill: P.mist,
        opacity: 0.85,
      },
    ),
  ].join("\n");

  // Palette swatches.
  const swatches = [
    ["abyss", P.abyss],
    ["abyss-2", P.abyss2],
    ["charcoal", P.charcoal],
    ["bio-teal", P.bioTeal],
    ["bio-teal-dim", P.bioTealDim],
    ["genome-violet", P.genomeViolet],
    ["helix-amber", P.helixAmber],
    ["star-white", P.starWhite],
    ["mist", P.mist],
  ];
  let palette = "";
  swatches.forEach(([name, hex], i) => {
    const x = 64 + i * 168;
    palette += [
      rect(x, 896, 24, 24, { rx: 6, fill: hex, stroke: P.charcoal, sw: 1 }),
      text(x + 32, 908, name, { mono: true, size: 10, fill: P.starWhite }),
      text(x + 32, 922, hex, { mono: true, size: 9, fill: P.mist, opacity: 0.8 }),
    ].join("\n");
  });

  const body = [
    rect(0, 0, W, H, { fill: P.abyss }),
    rect(0, 0, W, H, { fill: "url(#grid)", opacity: 0.3 }),
    starField("architecture-stars", W, H, 70, 1.7),
    text(64, 92, "Geistloom — the frame, layer by layer", { size: 40, weight: 600 }),
    text(
      64,
      126,
      "deterministic world-frame · zero API keys · same input ⇒ same output · seed 4093",
      {
        mono: true,
        size: 14,
        fill: P.mist,
      },
    ),
    columnsSvg,
    arrows,
    boundary,
    legend,
    text(64, 884, "PALETTE", { mono: true, size: 12, spacing: 2, fill: P.bioTealDim }),
    palette,
  ].join("\n");

  return svgRoot(W, H, "Geistloom — system architecture poster", defs, body);
}

/* ------------------------------------------------------------------ */
/* Write everything                                                    */
/* ------------------------------------------------------------------ */

const ROOT = dirname(fileURLToPath(import.meta.url));
const REPO = join(ROOT, "..");

const targets = [
  [join(REPO, "apps/web/public/favicon.svg"), favicon()],
  [join(REPO, "apps/web/public/apple-touch-icon.svg"), appleTouchIcon()],
  [join(REPO, "apps/web/public/images/logo.svg"), logo()],
  [join(REPO, "apps/web/public/images/banner.svg"), banner()],
  [join(REPO, "apps/web/public/images/og.svg"), ogCard()],
  [join(REPO, "apps/web/public/images/screens/screen-oracle.svg"), screenOracle()],
  [join(REPO, "apps/web/public/images/screens/screen-century.svg"), screenCentury()],
  [join(REPO, "apps/web/public/images/screens/screen-hallmarks.svg"), screenHallmarks()],
  [join(REPO, "apps/web/public/images/screens/screen-gene-drive.svg"), screenGeneDrive()],
  [join(REPO, "apps/web/public/images/screens/screen-worldboard.svg"), screenWorldboard()],
  [join(REPO, "apps/web/public/images/screens/screen-time-machine.svg"), screenTimeMachine()],
  [join(REPO, "docs/images/architecture.svg"), architecture()],
  [join(REPO, "docs/images/banner.svg"), banner()],
  [join(REPO, "docs/images/og.svg"), ogCard()],
];

for (const [file, svg] of targets) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, svg);
  console.log(`wrote ${file}`);
}

console.log(`\n${targets.length} assets generated deterministically.`);
