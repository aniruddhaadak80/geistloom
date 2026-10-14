import type { Metadata } from "next";
import { GeneDriveConsole } from "@/components/gene-drive/gene-drive-console";
import { GeneDriveExplainer } from "@/components/gene-drive/gene-drive-explainer";

export const metadata: Metadata = {
  title: "The Gene-Drive Console",
  description:
    "Population-scale genetic engineering, simulated: a three-allele homing-drive model with efficiency, resistance, and fitness-cost controls — and the governance verdicts the math forces.",
};

export default function GeneDrivePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-16 px-6 py-16">
      <header className="flex flex-col gap-4">
        <p className="font-mono text-sm uppercase tracking-[0.3em] text-bio-teal">
          route 06 · population scale
        </p>
        <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
          Engineering a <span className="text-genome-violet">whole species</span>
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-mist">
          A gene drive doesn&apos;t just inherit — it super-inherits. Run the three-allele model:
          watch wild-type, drive, and resistant alleles fight it out over generations, and see why
          containment is a governance problem before it is a biological one.
        </p>
      </header>

      <GeneDriveExplainer />
      <GeneDriveConsole />

      <footer className="border-t border-charcoal pt-6">
        <a href="/" className="font-mono text-xs text-mist hover:text-bio-teal">
          ← back to the frame
        </a>
      </footer>
    </main>
  );
}
