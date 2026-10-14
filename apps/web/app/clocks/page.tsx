import { getClock } from "@geistloom/core";
import type { Metadata } from "next";
import { ClockPlayground } from "@/components/clocks/clock-playground";
import { ClocksDetail } from "@/components/clocks/clocks-detail";
import { ClocksTable } from "@/components/clocks/clocks-table";

export const metadata: Metadata = {
  title: "The Epigenetic Clock Explorer",
  description:
    "Eight real epigenetic clocks — Horvath 2013 to TIME-seq 2024 — compared spec-sheet to spec-sheet, then all run against the same synthetic methylome.",
};

export default async function ClocksPage({
  searchParams,
}: {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = params.clock;
  const clockId = typeof raw === "string" ? raw : undefined;
  const selected = clockId ? (getClock(clockId) ?? null) : null;

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-16 px-6 py-16">
      <header className="flex flex-col gap-4">
        <p className="font-mono text-sm uppercase tracking-[0.3em] text-bio-teal">
          route 05 · the yardsticks
        </p>
        <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
          Eight clocks, one <span className="text-genome-violet">biological age</span>
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-mist">
          Before the Century Engine can simulate reversal, it has to measure aging. These are the
          real epigenetic clocks — their CpG counts, their training sets, their blind spots — and a
          playground where one synthetic methylome gets eight different answers.
        </p>
      </header>

      <section className="grid items-start gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ClocksTable selectedId={selected?.id ?? null} />
        </div>
        <div className="lg:col-span-2">
          <ClocksDetail clock={selected} />
        </div>
      </section>

      <ClockPlayground />

      <footer className="border-t border-charcoal pt-6">
        <a href="/" className="font-mono text-xs text-mist hover:text-bio-teal">
          ← back to the frame
        </a>
      </footer>
    </main>
  );
}
