import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@geistloom/ui";
import { Eye, Globe2, type LucideIcon, Scale, ShieldCheck, Undo2 } from "lucide-react";

/**
 * The frame's five governance principles.
 * Server component — static doctrine, lucide icons.
 */

const PRINCIPLES: readonly {
  readonly icon: LucideIcon;
  readonly title: string;
  readonly body: string;
}[] = [
  {
    icon: Scale,
    title: "Determinism & auditability",
    body: "Every simulation is a pure function of its seed. Replay any century, audit any decision line by line — there is no hidden stochasticity to appeal to, and no result that cannot be reproduced exactly.",
  },
  {
    icon: Eye,
    title: "No hidden optimizers",
    body: "The Oracle's objective is printed on the page. No reward function evolves in the dark, no emergent goal escapes the frame, and every trade-off the engine makes is legible to the person who owns it.",
  },
  {
    icon: Undo2,
    title: "Reversibility first",
    body: "Interventions are ranked by reversibility before efficacy. A therapy that cannot be withdrawn is a commitment the future did not consent to — so every design ships with an undo path.",
  },
  {
    icon: Globe2,
    title: "Access before approval",
    body: "A cure only the wealthy reach is a divergence engine. Access planning, manufacturing distribution, and pricing models ship with the science — not as an afterthought, but as a design requirement.",
  },
  {
    icon: ShieldCheck,
    title: "Containment by design",
    body: "Gene drives and automated labs carry reversal strategies before any field release. Containment is part of the design review, not the postmortem — if a system can't be recalled, it doesn't ship.",
  },
];

export function EthicsPrinciples() {
  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h2 className="font-display text-xl font-semibold text-star-white">The five principles</h2>
        <p className="max-w-2xl text-sm leading-relaxed text-mist">
          Non-negotiable doctrine. Every route in this frame — the Oracle, the Century Engine, the
          gene-drive console, the lab — operates under these five constraints.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {PRINCIPLES.map((p) => {
          const Icon = p.icon;
          return (
            <Card key={p.title}>
              <CardHeader>
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-bio-teal/30 bg-bio-teal/10">
                    <Icon className="h-4 w-4 text-bio-teal" aria-hidden />
                  </span>
                  <CardTitle className="text-base">{p.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">{p.body}</CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
