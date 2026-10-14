/**
 * Shared utilities for the Geistloom scale-engine generators.
 *
 * Every generator imports from here so that:
 *  - the PRNG is always mulberry32 seeded with 4093 (same run → same bytes),
 *  - file writes are idempotent (overwrite, never append),
 *  - the manifest entries have one consistent shape.
 *
 * No Math.random, no Date.now — anywhere.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

export const ENGINE_SEED = 4093;

/** mulberry32 — the same 32-bit generator the TypeScript core uses. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(input) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function seedFromString(input, salt = 0) {
  return (hashString(input) ^ Math.imul(salt, 0x9e3779b9)) >>> 0;
}

export function pickOne(items, rng) {
  return items[Math.floor(rng() * items.length)];
}

export function intRange(min, max, rng) {
  return min + Math.floor(rng() * (max - min + 1));
}

/** Repo root (…/geistloom), computed from this file's location. */
export const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

/**
 * Write a generated file. Idempotent: overwrites deterministically.
 * Returns the repo-relative posix path for the manifest.
 */
export function writeGenerated(absPath, contents) {
  mkdirSync(dirname(absPath), { recursive: true });
  writeFileSync(absPath, contents, "utf8");
  return toPosix(relative(REPO_ROOT, absPath));
}

function toPosix(p) {
  return p.split("\\").join("/");
}

/** Deterministic string builder for readable, stable diffs. */
export function block(lines) {
  return `${lines.join("\n")}\n`;
}

/** kebab-case → PascalCase (used for component names). */
export function pascalCase(id) {
  return id
    .split(/[^a-z0-9]+/i)
    .filter(Boolean)
    .map((w) => (w[0] ?? "").toUpperCase() + w.slice(1))
    .join("");
}

/** kebab-case → camelCase. */
export function camelCase(id) {
  const parts = id.split(/[^a-z0-9]+/i).filter(Boolean);
  return parts.map((w, i) => (i === 0 ? w : (w[0] ?? "").toUpperCase() + w.slice(1))).join("");
}
