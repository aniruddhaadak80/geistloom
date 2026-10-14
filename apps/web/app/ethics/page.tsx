import type { Metadata } from "next";
import { EthicsDivergence } from "@/components/ethics/ethics-divergence";
import { EthicsPrinciples } from "@/components/ethics/ethics-principles";
import { EthicsValueLab } from "@/components/ethics/ethics-value-lab";

export const metadata: Metadata = {
  title: "The Alignment Sandbox",
  description:
    "Value-learning playground, the divided-world simulation, and the frame's five governance principles — ethics as math, not vibes.",
};

export default function EthicsPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-16 px-6 py-16">
      <header className="flex flex-col gap-4">
        <p className="font-mono text-sm uppercase tracking-[0.3em] text-bio-teal">
          route 09 · the alignment sandbox
        </p>
        <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
          Ethics is a <span className="text-helix-amber">constraint, not a footnote</span>
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-mist">
          Before the Oracle plans anything, the frame asks what the plans are for. Tune the weights,
          watch the indices move, and see the century split in two by a single policy choice.
        </p>
      </header>

      <EthicsValueLab />
      <EthicsDivergence />
      <EthicsPrinciples />

      <footer className="border-t border-charcoal pt-6">
        <a href="/" className="font-mono text-xs text-mist hover:text-bio-teal">
          ← back to the frame
        </a>
      </footer>
    </main>
  );
}
