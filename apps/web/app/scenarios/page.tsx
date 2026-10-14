import type { Metadata } from "next";
import { ScenarioComparison } from "@/components/scenarios/scenario-comparison";
import { ScenariosGrid } from "@/components/scenarios/scenarios-grid";

export const metadata: Metadata = {
  title: "Six Futures",
  description:
    "The scenario planner: six branches the biotech century can fork into, with probabilities, drivers, and the engine shifts each one applies.",
};

export default function ScenariosPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-16 px-6 py-16">
      <header className="flex flex-col gap-4">
        <p className="font-mono text-sm uppercase tracking-[0.3em] text-bio-teal">
          route 08 · the forking
        </p>
        <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
          Six futures, <span className="text-genome-violet">one century</span>
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-mist">
          The worldboard doesn&apos;t predict — it forks. Each scenario is a branch with a
          probability weight, named drivers, and the exact parameter shifts it applies to the
          Century Engine.
        </p>
      </header>

      <ScenariosGrid />
      <ScenarioComparison />

      <footer className="border-t border-charcoal pt-6">
        <a href="/" className="font-mono text-xs text-mist hover:text-bio-teal">
          ← back to the frame
        </a>
      </footer>
    </main>
  );
}
