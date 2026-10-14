import { Card, CardContent, CardHeader, CardTitle } from "@geistloom/ui";

/**
 * The three-allele model, explained.
 * Server component — the recursion rendered as styled mono text, plus the
 * real-world context (Esvelt, malaria, the 2015 first synthetic drives).
 */

const FORMULA = `homing (per generation, in drive/wild heterozygotes 2wd):
  conversions  = e · 2wd
  w′ = w − conversions
  d′ = d + conversions · (1 − r)
  r′ = r + conversions · r

selection (drive homozygotes pay fitness cost c):
  W̄  = w′² + 2w′d′ + 2w′r′ + 2d′r′ + r′² + d′²(1 − c)
  w″ = w′ / W̄
  d″ = d′(1 − c·d′) / W̄
  r″ = r′ / W̄`;

const CONTEXT: readonly {
  readonly title: string;
  readonly body: string;
}[] = [
  {
    title: "Esvelt, 2014: the proposal",
    body: "Kevin Esvelt and George Church proposed CRISPR-based homing drives: an edit that copies itself onto the wild-type chromosome at the target locus, bypassing Mendelian 50% inheritance and spreading through a population at super-Mendelian rates — with a built-in 'reversal drive' as the undo button.",
  },
  {
    title: "2015: the first synthetic drives",
    body: "CRISPR homing drives were demonstrated in yeast, Drosophila, and Anopheles mosquitoes — the moment population-scale genetic engineering moved from theory to bench, and the global governance debate began in earnest.",
  },
  {
    title: "Malaria: the canonical use case",
    body: "Target Malaria's drives suppress Anopheles gambiae populations by spreading female-sterility alleles; caged trials collapsed populations entirely. The model here is the same three-allele math those trials are judged by — wild, drive, resistant.",
  },
  {
    title: "Why resistance is the whole game",
    body: "Every cleavage is a chance to mutate the target site into a resistant allele the drive cannot cut. The resistance rate r is therefore the most important number in the model: below ~1%, drives fix; above ~10%, they burn out. That is why every field-trial design ships a reversal strategy before release.",
  },
];

export function GeneDriveExplainer() {
  return (
    <section className="grid items-start gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base">The three-allele recursion</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm leading-relaxed text-mist">
            Each generation, drive/wild heterozygotes (frequency 2wd) convert wild-type alleles into
            drive copies at efficiency e; a fraction r of those cleavages instead yield resistant
            alleles. Drive homozygotes then pay fitness cost c. Three alleles, one recursion —
            everything the console shows falls out of it.
          </p>
          <pre className="overflow-x-auto rounded-lg border border-charcoal bg-abyss p-4 font-mono text-xs leading-relaxed text-bio-teal">
            {FORMULA}
          </pre>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        {CONTEXT.map((c) => (
          <Card key={c.title}>
            <CardHeader>
              <CardTitle className="font-display text-base">{c.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-mist">{c.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
