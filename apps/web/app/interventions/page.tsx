import type { Metadata } from "next";
import { InterventionsExplorer } from "@/components/interventions/interventions-explorer";
import { InterventionsQuadrant } from "@/components/interventions/interventions-quadrant";

export const metadata: Metadata = {
  title: "The Intervention Atlas",
  description:
    "Thirty real interventions mapped against the hallmarks of aging — evidence grade, leverage, adoption curves, and mechanism links. Fully deterministic.",
};

export default function InterventionsPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-16 px-6 py-16">
      <header className="flex flex-col gap-4">
        <p className="font-mono text-sm uppercase tracking-[0.3em] text-bio-teal">
          route 04 · the atlas
        </p>
        <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
          Thirty ways to <span className="text-bio-teal">slow the clock</span>
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-mist">
          Every real intervention class with an honest evidence grade — from approved rapalogs to
          theoretical epigenetic editing — plotted by readiness and leverage, and wired into the
          hallmarks they target.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-semibold text-star-white">Readiness × leverage</h2>
        <InterventionsQuadrant />
      </section>

      <InterventionsExplorer />

      <footer className="border-t border-charcoal pt-6">
        <a href="/" className="font-mono text-xs text-mist hover:text-bio-teal">
          ← back to the frame
        </a>
      </footer>
    </main>
  );
}
