import type { Metadata } from "next";
import { MetricCards } from "@/components/worldboard/metric-cards";
import { ReplayTable } from "@/components/worldboard/replay-table";
import { RunRegistry } from "@/components/worldboard/run-registry";

export const metadata: Metadata = {
  title: "Worldboard",
  description:
    "A live observatory of the simulated world — streaming vitals, a deterministic replay of the untreated century, and the registry of saved runs.",
};

export default function WorldboardPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-10 px-6 py-12">
      <header className="flex flex-col gap-4">
        <p className="font-mono text-sm uppercase tracking-[0.3em] text-bio-teal">
          worldboard · live observatory
        </p>
        <h1 className="max-w-4xl font-display text-5xl font-bold leading-[1.05] tracking-tight">
          The world, <span className="text-bio-teal">as it happens</span>.
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-mist">
          A streaming window into the simulation: live vitals from the engine, a deterministic
          replay of the untreated century, and every saved run in the registry — all generated
          locally, all reproducible.
        </p>
      </header>
      <MetricCards />
      <ReplayTable />
      <RunRegistry />
    </main>
  );
}
