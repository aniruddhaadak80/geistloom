import type { Metadata } from "next";
import { ArchiveBrowser } from "@/components/archive/archive-browser";
import { ArchiveStats } from "@/components/archive/archive-stats";

export const metadata: Metadata = {
  title: "The Library",
  description:
    "The deterministic corpus: every milestone, intervention, clock, hallmark, and scenario — searchable, countable, auditable.",
};

export default function ArchivePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-16 px-6 py-16">
      <header className="flex flex-col gap-4">
        <p className="font-mono text-sm uppercase tracking-[0.3em] text-bio-teal">
          route 10 · the library
        </p>
        <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
          Everything the frame <span className="text-bio-teal">knows</span>
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-mist">
          The corpus is built locally from the core domain models — no oracle calls, no network, no
          embedding index. What you search here is exactly what the engine simulates with.
        </p>
      </header>

      <ArchiveStats />
      <ArchiveBrowser />

      <footer className="border-t border-charcoal pt-6">
        <a href="/" className="font-mono text-xs text-mist hover:text-bio-teal">
          ← back to the frame
        </a>
      </footer>
    </main>
  );
}
