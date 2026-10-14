import { type ArchiveKind, buildArchiveCorpus, KIND_ORDER } from "./archive-corpus";

/**
 * Archive statistics — counts by kind, total word count, and the
 * oldest entry year. Server component, mono font.
 */

const KIND_LABEL: Record<ArchiveKind, string> = {
  milestone: "milestones",
  intervention: "interventions",
  clock: "clocks",
  hallmark: "hallmarks",
  scenario: "scenarios",
};

export function ArchiveStats() {
  const corpus = buildArchiveCorpus();

  const counts = { milestone: 0, intervention: 0, clock: 0, hallmark: 0, scenario: 0 } as Record<
    ArchiveKind,
    number
  >;
  let totalWords = 0;
  let oldest: number | null = null;

  for (const entry of corpus) {
    counts[entry.kind] += 1;
    totalWords += entry.body.split(/\s+/).filter(Boolean).length;
    if (entry.year !== undefined && (oldest === null || entry.year < oldest)) {
      oldest = entry.year;
    }
  }

  const stats: readonly {
    readonly label: string;
    readonly value: string;
  }[] = [
    { label: "total entries", value: String(corpus.length) },
    ...KIND_ORDER.map((k) => ({
      label: KIND_LABEL[k],
      value: String(counts[k]),
    })),
    { label: "total words", value: String(totalWords) },
    { label: "oldest entry", value: oldest === null ? "—" : String(oldest) },
  ];

  return (
    <section
      className="grid grid-cols-2 gap-3 rounded-xl border border-charcoal bg-abyss-2 p-5 font-mono sm:grid-cols-4 lg:grid-cols-8"
      aria-label="Archive statistics"
    >
      {stats.map((s) => (
        <div key={s.label} className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest text-mist">{s.label}</span>
          <span className="text-xl font-semibold text-star-white">{s.value}</span>
        </div>
      ))}
    </section>
  );
}
