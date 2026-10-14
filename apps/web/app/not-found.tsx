import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Not Found",
  description: "This coordinate does not exist in the world-frame.",
};

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <p className="font-mono text-sm uppercase tracking-[0.3em] text-bio-teal">
        404 · coordinate not found
      </p>
      <h1 className="max-w-2xl font-display text-5xl font-bold tracking-tight">
        This timeline branch doesn&apos;t exist.
      </h1>
      <p className="max-w-md text-mist">
        The world-frame is deterministic, but this URL was never simulated. Return to the root
        timeline.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-bio-teal px-6 py-3 font-display font-semibold text-abyss transition hover:bg-bio-teal-dim"
      >
        Return to origin
      </Link>
    </main>
  );
}
