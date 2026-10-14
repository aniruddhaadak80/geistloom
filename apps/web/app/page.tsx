import Link from "next/link";

const FEATURED = [
  {
    href: "/oracle",
    title: "The Oracle",
    body: "A deterministic superintelligence simulator. Ask it to solve aging and watch a phased research plan unfold — reasoning traces included, zero API keys.",
  },
  {
    href: "/century",
    title: "The Century Engine",
    body: "Two hundred years of civilization as a function of biotechnology. Apply interventions, watch life expectancy, population, and biosphere health cascade.",
  },
  {
    href: "/hallmarks",
    title: "The Twelve Hallmarks",
    body: "The 2023 taxonomy of aging — genomic instability to dysbiosis — mapped to every intervention that targets it.",
  },
];

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-16">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-block h-8 w-8 rounded-lg bg-bio-teal" aria-hidden />
          <span className="font-display text-xl font-semibold tracking-tight">geistloom</span>
        </div>
        <nav className="flex gap-6 text-sm text-mist">
          <Link href="/oracle" className="hover:text-bio-teal">
            Oracle
          </Link>
          <Link href="/century" className="hover:text-bio-teal">
            Century Engine
          </Link>
          <Link href="/timeline" className="hover:text-bio-teal">
            Timeline
          </Link>
          <Link href="/worldboard" className="hover:text-bio-teal">
            Worldboard
          </Link>
        </nav>
      </header>

      <section className="mt-24 flex flex-col items-start gap-8">
        <p className="font-mono text-sm uppercase tracking-[0.3em] text-bio-teal">
          world-frame observatory · seed 4093
        </p>
        <h1 className="max-w-4xl font-display text-6xl font-bold leading-[1.02] tracking-tight">
          The frame where superintelligence solves <span className="text-bio-teal">aging</span> —
          and everything else.
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-mist">
          Geistloom is an open-source simulation of the biotech century. A deterministic Oracle
          plans the research. A century engine propagates every intervention through two hundred
          years of demography, biology, and ethics. Every state is a coordinate you can return to.
        </p>
        <div className="flex gap-4">
          <Link
            href="/oracle"
            className="rounded-lg bg-bio-teal px-6 py-3 font-display font-semibold text-abyss transition hover:bg-bio-teal-dim"
          >
            Ask the Oracle
          </Link>
          <Link
            href="/century"
            className="rounded-lg border border-genome-violet px-6 py-3 font-display font-semibold text-genome-violet transition hover:bg-genome-violet hover:text-abyss"
          >
            Run the Century Engine
          </Link>
        </div>
      </section>

      <section className="mt-24 grid gap-6 md:grid-cols-3">
        {FEATURED.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className="group flex flex-col gap-3 rounded-xl border border-charcoal bg-abyss-2 p-6 transition hover:border-bio-teal"
          >
            <h2 className="font-display text-xl font-semibold group-hover:text-bio-teal">
              {f.title}
            </h2>
            <p className="text-sm leading-relaxed text-mist">{f.body}</p>
          </Link>
        ))}
      </section>

      <footer className="mt-32 border-t border-charcoal pt-8 text-sm text-mist">
        <p>
          Geistloom runs entirely on-device. Every &quot;AI&quot; behavior is a deterministic local
          simulation — no API keys, no network, no surveillance.
        </p>
      </footer>
    </main>
  );
}
