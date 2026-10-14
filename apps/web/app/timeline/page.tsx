import type { Metadata } from "next";
import { TimelineBands } from "@/components/timeline/timeline-bands";
import { TimelineTrack } from "@/components/timeline/timeline-track";

export const metadata: Metadata = {
  title: "The Timeline — History and the Projection Band",
  description:
    "Real milestones from CRISPR 2012 to today, and the projection band to 2100 — every forecast carrying an explicit confidence so the line between history and speculation stays visible.",
};

export default function TimelinePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-16 px-6 py-16">
      <header className="flex flex-col gap-4">
        <p className="font-mono text-sm uppercase tracking-[0.3em] text-bio-teal">
          route 07 · the long now
        </p>
        <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
          2012 → 2100: <span className="text-helix-amber">what happened, what might</span>
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-mist">
          The solid nodes are history. The dashed nodes are projections — and every projection
          carries its confidence openly, because a frame that hides its uncertainty is a frame that
          lies.
        </p>
      </header>

      <TimelineTrack />
      <TimelineBands />

      <footer className="border-t border-charcoal pt-6">
        <a href="/" className="font-mono text-xs text-mist hover:text-bio-teal">
          ← back to the frame
        </a>
      </footer>
    </main>
  );
}
