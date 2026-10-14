import type { Metadata } from "next";
import { ConstructDesigner } from "@/components/lab/construct-designer";
import { ConstructLibrary } from "@/components/lab/construct-library";
import { LabSafety } from "@/components/lab/lab-safety";

export const metadata: Metadata = {
  title: "The Construct Simulator",
  description:
    "In-silico genetic construct design: promoter, payload, copy number, induction — expression curves over 48 hours, containment included.",
};

export default function LabPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-16 px-6 py-16">
      <header className="flex flex-col gap-4">
        <p className="font-mono text-sm uppercase tracking-[0.3em] text-bio-teal">
          route 11 · the bench
        </p>
        <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
          Design a <span className="text-genome-violet">construct</span>, safely
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-mist">
          Every genetic construct starts as math. Pick a promoter and payload, set copy number and
          induction, and watch expression rise over 48 hours — with the containment checklist
          attached, always.
        </p>
      </header>

      <ConstructDesigner />
      <ConstructLibrary />
      <LabSafety />

      <footer className="border-t border-charcoal pt-6">
        <a href="/" className="font-mono text-xs text-mist hover:text-bio-teal">
          ← back to the frame
        </a>
      </footer>
    </main>
  );
}
