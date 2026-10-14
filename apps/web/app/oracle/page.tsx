import type { Metadata } from "next";
import { OracleConsole } from "@/components/oracle/oracle-console";

export const metadata: Metadata = {
  title: "The Oracle",
  description:
    "A deterministic superintelligence simulator. Ask anything and receive a phased research program — reasoning DAG, key numbers, brain trace, citations. Zero API keys.",
};

interface OraclePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function OraclePage({ searchParams }: OraclePageProps) {
  const params = await searchParams;
  const promptParam = params.prompt;
  // Keying the console on the prompt param remounts it with the
  // new prompt whenever the URL changes (e.g. from the palette).
  const consoleKey = typeof promptParam === "string" ? promptParam : "";

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <header className="mb-12 flex flex-col gap-4">
        <p className="font-mono text-sm uppercase tracking-[0.3em] text-bio-teal">
          oracle · local deterministic simulation
        </p>
        <h1 className="max-w-3xl font-display text-5xl font-bold tracking-tight">The Oracle</h1>
        <p className="max-w-2xl text-lg leading-relaxed text-mist">
          A superintelligence that runs entirely on your machine. The same prompt always produces
          the same plan — every phase, every reasoning edge, every citation is auditable. Ask it to
          solve aging, or anything else.
        </p>
      </header>
      <OracleConsole key={consoleKey} />
    </main>
  );
}
