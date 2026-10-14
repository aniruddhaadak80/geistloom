import type { Metadata } from "next";
import { HallmarkCascade } from "@/components/hallmarks/hallmark-cascade";
import { HallmarkGrid } from "@/components/hallmarks/hallmark-grid";

export const metadata: Metadata = {
  title: "The Twelve Hallmarks",
  description:
    "The 2023 taxonomy of aging — from genomic instability to dysbiosis — mapped to every intervention that targets it, and the cascade from primary damage to integrative decline.",
};

export default function HallmarksPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-10 px-6 py-12">
      <header className="flex flex-col gap-4">
        <p className="font-mono text-sm uppercase tracking-[0.3em] text-bio-teal">
          the twelve hallmarks · lópez-otín et al., cell 2023
        </p>
        <h1 className="max-w-4xl font-display text-5xl font-bold leading-[1.05] tracking-tight">
          The twelve hallmarks of <span className="text-bio-teal">aging</span>.
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-mist">
          Aging is not one disease but a cascade: primary damage accumulates, antagonistic responses
          turn against the body, and integrative decline follows. Every hallmark is measurable — and
          every one is targeted by at least one intervention.
        </p>
      </header>
      <HallmarkCascade />
      <HallmarkGrid />
    </main>
  );
}
