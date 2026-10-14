"use client";

import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@geistloom/ui";

/**
 * The construct library.
 *
 * A curated catalogue of construct architectures that have shaped
 * real biology — the reference points any new design is compared
 * against. Every field is static data: the library is the same on
 * every machine, forever.
 */

interface LibraryEntry {
  readonly id: string;
  readonly name: string;
  readonly promoter: string;
  readonly payload: string;
  readonly backbone: string;
  readonly selection: string;
  readonly bsl: "BSL-1" | "BSL-2" | "BSL-2+";
  readonly milestone: string;
  readonly note: string;
}

const LIBRARY: readonly LibraryEntry[] = [
  {
    id: "pCMV-GFP",
    name: "pCMV-GFP",
    promoter: "CMV (constitutive)",
    payload: "eGFP reporter",
    backbone: "pUC ori · AmpR",
    selection: "Ampicillin",
    bsl: "BSL-1",
    milestone: "1994 · the picture of a cell",
    note: "The reporter that made expression visible. Always the first build: if you cannot see it, do not interpret it.",
  },
  {
    id: "pTet-On-OSK",
    name: "pTet-On OSK",
    promoter: "Tet-On (inducible)",
    payload: "OSK reprogramming factors",
    backbone: "piggyBac · PuroR",
    selection: "Puromycin",
    bsl: "BSL-2",
    milestone: "2016 · partial reprogramming",
    note: "Doxycycline-gated Yamanaka factors. The dose is the expression level — which is why the designer above matters.",
  },
  {
    id: "pALB-AAV9",
    name: "pALB-AAV9",
    promoter: "Albumin (liver-specific)",
    payload: "FIX transgene",
    backbone: "AAV9 ITR · ~4.7 kb",
    selection: "None (integration-free)",
    bsl: "BSL-2",
    milestone: "2012 · first AAV gene therapy approval path",
    note: "Tissue-locked delivery: quiet everywhere except hepatocytes. The template for modern in-vivo therapy.",
  },
  {
    id: "pCas12a-multiplex",
    name: "pCas12a-multiplex",
    promoter: "EF1α (constitutive)",
    payload: "Cas12a + crRNA array",
    backbone: "pSFFV · BlastR",
    selection: "Blasticidin",
    bsl: "BSL-2+",
    milestone: "2017 · programmable multiplex editing",
    note: "One effector, many guides, one pot. Multiplexing is where off-target analysis becomes the whole job.",
  },
  {
    id: "pU6-gRNA-ABL",
    name: "pU6-gRNA ABL",
    promoter: "U6 (Pol III)",
    payload: "spCas9 + BCR::ABL1 gRNA",
    backbone: "pLenti · PuroR",
    selection: "Puromycin",
    bsl: "BSL-2",
    milestone: "2015 → 2023 · Casgevy",
    note: "Ex-vivo edited hematopoietic stem cells: the first approved CRISPR therapy. Edit outside the body, infuse inside.",
  },
  {
    id: "pEF1a-DIRECT",
    name: "pEF1α-CAR19",
    promoter: "EF1α (constitutive)",
    payload: "Anti-CD19 CAR",
    backbone: "pSFFV · pUC ori",
    selection: "None (primary cells)",
    bsl: "BSL-2",
    milestone: "2017 · first approved CAR-T",
    note: "Gene-plus-cell: a receptor built in vitro, then a living drug infused. The construct is half the therapy.",
  },
  {
    id: "pGAP-Telomerase",
    name: "pGAP-TERT",
    promoter: "GAPDH (constitutive)",
    payload: "hTERT (telomerase)",
    backbone: "AAV2 ITR",
    selection: "None",
    bsl: "BSL-2",
    milestone: "2012 · hyper-long telomere mice",
    note: "Telomerase therapy extended mouse healthspan — and is exactly why containment rules exist: immortal cells are a hazard, not a feature.",
  },
  {
    id: "pCAG-DunetPACE",
    name: "pCAG-DunetPACE reporter",
    promoter: "CAG (constitutive)",
    payload: "Aging-clock reporter cassette",
    backbone: "piggyBac · NeoR",
    selection: "G418",
    bsl: "BSL-1",
    milestone: "2020s · measurable biological age",
    note: "Instruments, not interventions: a construct whose job is to measure the pace of aging so the interventions above can be scored.",
  },
];

const BSL_TONE: Record<LibraryEntry["bsl"], "teal" | "amber" | "violet"> = {
  "BSL-1": "teal",
  "BSL-2": "amber",
  "BSL-2+": "violet",
};

export function ConstructLibrary() {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-2xl font-bold tracking-tight">The reference library</h2>
        <p className="text-sm text-mist">
          Eight architectures that defined the field. Every new design in Geistloom is compared
          against these — same fields, same units, same containment language.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {LIBRARY.map((entry) => (
          <Card key={entry.id} variant="outline">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="font-mono text-sm text-bio-teal">{entry.name}</CardTitle>
                <Badge tone={BSL_TONE[entry.bsl]}>{entry.bsl}</Badge>
              </div>
              <CardDescription className="font-mono text-[10px] uppercase tracking-widest">
                {entry.milestone}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <dl className="grid grid-cols-[7rem_1fr] gap-x-3 gap-y-1 font-mono text-[11px]">
                <dt className="text-mist">promoter</dt>
                <dd className="text-star-white">{entry.promoter}</dd>
                <dt className="text-mist">payload</dt>
                <dd className="text-star-white">{entry.payload}</dd>
                <dt className="text-mist">backbone</dt>
                <dd className="text-star-white">{entry.backbone}</dd>
                <dt className="text-mist">selection</dt>
                <dd className="text-star-white">{entry.selection}</dd>
              </dl>
              <p className="text-xs leading-relaxed text-mist">{entry.note}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
