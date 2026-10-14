/**
 * The twelve hallmarks of aging.
 *
 * Source taxonomy: López-Otín et al., "Hallmarks of aging: An expanding
 * universe", Cell (2023). Each hallmark carries its mechanism sketch, the
 * molecular layer it lives on, and the class of intervention that targets it —
 * this is the backbone of the Hallmarks route and the intervention graph.
 */

export type HallmarkCategory = "primary" | "antagonistic" | "integrative";

export type MolecularLayer =
  | "nuclear"
  | "epigenomic"
  | "proteomic"
  | "organellar"
  | "cellular"
  | "intercellular"
  | "systemic";

export interface Hallmark {
  readonly id: string;
  readonly name: string;
  readonly category: HallmarkCategory;
  readonly layer: MolecularLayer;
  readonly summary: string;
  readonly mechanism: string;
  readonly measuredBy: string;
  readonly interventionIds: readonly string[];
}

export const HALLMARKS: readonly Hallmark[] = [
  {
    id: "genomic-instability",
    name: "Genomic instability",
    category: "primary",
    layer: "nuclear",
    summary: "Accumulated DNA damage from exogenous and endogenous sources.",
    mechanism:
      "Replication errors, oxidative damage, and transposon activity accumulate faster than repair pathways (NER, BER, HR, NHEJ) can clear them, producing mutations, translocations, and aneuploidy.",
    measuredBy: "Whole-genome sequencing mutational burden; γH2AX foci count.",
    interventionIds: ["base-editing", "dna-repair-boosters", "sirt6-activation"],
  },
  {
    id: "telomere-attrition",
    name: "Telomere attrition",
    category: "primary",
    layer: "nuclear",
    summary: "Progressive shortening of chromosome caps with each division.",
    mechanism:
      "The end-replication problem shortens telomeres until cells hit Hayflick limit and senesce; telomerase (TERT) restoration or gene therapy extends replicative lifespan in mice without raising cancer incidence (Blasco lab).",
    measuredBy: "qPCR telomere length ratio; Flow-FISH.",
    interventionIds: ["telomerase-therapy", "telomere-gene-therapy"],
  },
  {
    id: "epigenetic-alterations",
    name: "Epigenetic alterations",
    category: "primary",
    layer: "epigenomic",
    summary: "Drift in DNA methylation, histone marks, and chromatin state.",
    mechanism:
      "Methylation entropy rises with age; clocks (Horvath, GrimAge, DunedinPACE) quantify the drift. Partial reprogramming (OSK/Oct4-Sox2-Klf4) resets the methylome in vivo without erasing cell identity.",
    measuredBy: "Illumina EPIC arrays; DunedinPACE pace score.",
    interventionIds: ["partial-reprogramming", "epigenetic-editing", "alpha-ketoglutarate"],
  },
  {
    id: "loss-of-proteostasis",
    name: "Loss of proteostasis",
    category: "primary",
    layer: "proteomic",
    summary: "Proteome collapse: misfolded proteins outrun chaperones.",
    mechanism:
      "Chaperone capacity and the unfolded-protein response decline; aggregates (amyloid, tau) accumulate. HSP70/90 inducers and autophagy enhancers restore clearance.",
    measuredBy: "Proteasome activity assays; aggregate proteomics.",
    interventionIds: ["chaperone-inducers", "autophagy-enhancers"],
  },
  {
    id: "disabled-macroautophagy",
    name: "Disabled macroautophagy",
    category: "primary",
    layer: "organellar",
    summary: "The cell's recycling system slows with age.",
    mechanism:
      "Autophagosome formation and lysosomal acidification decline, so damaged mitochondria and aggregates persist. Spermidine and rapamycin analogs reactivate the pathway in model organisms.",
    measuredBy: "LC3-II/LC3-I ratio; p62 turnover assay.",
    interventionIds: ["autophagy-enhancers", "spermidine", "rapalogs"],
  },
  {
    id: "deregulated-nutrient-sensing",
    name: "Deregulated nutrient sensing",
    category: "primary",
    layer: "systemic",
    summary: "IGF-1, mTOR, AMPK, and sirtuin signaling drift.",
    mechanism:
      "Chronic nutrient excess keeps mTORC1 high and AMPK/SIRT low. Rapamycin (mTOR inhibition) extends mouse lifespan ~10–25%; metformin and NAD+ precursors modulate the same axes.",
    measuredBy: "p-S6K1 levels; NAD+/NADH ratio; circulating IGF-1.",
    interventionIds: ["rapalogs", "metformin", "nad-precursors", "igf1-modulators"],
  },
  {
    id: "mitochondrial-dysfunction",
    name: "Mitochondrial dysfunction",
    category: "primary",
    layer: "organellar",
    summary: "Energy conversion degrades; ROS signaling distorts.",
    mechanism:
      "mtDNA mutations accumulate, electron transport chain efficiency drops, and mitophagy fails. Mitochondria-targeted antioxidants (SS-31) and NAD+ precursors partially restore function in aged mice.",
    measuredBy: "Oxygen consumption rate; mtDNA copy number; cardiolipin profiles.",
    interventionIds: ["mito-targeted-antioxidants", "nad-precursors", "mitophagy-boosters"],
  },
  {
    id: "cellular-senescence",
    name: "Cellular senescence",
    category: "antagonistic",
    layer: "cellular",
    summary: "Senescent cells secrete inflammatory SASP factors.",
    mechanism:
      "Cells arrested by damage secrete IL-6, IL-8 and MMPs. Dasatinib+quercetin cleared senescent cells in old mice, extending remaining lifespan ~36% (Xu et al., Nat Med 2018); fisetin is in human trials.",
    measuredBy: "p16INK4a expression; SA-β-gal staining; SASP panel.",
    interventionIds: ["senolytics-dq", "fisetin", "senomorphics"],
  },
  {
    id: "stem-cell-exhaustion",
    name: "Stem cell exhaustion",
    category: "antagonistic",
    layer: "cellular",
    summary: "Regenerative pools dwindle and skew.",
    mechanism:
      "HSC myeloid skewing, muscle satellite-cell loss, and niche deterioration reduce repair capacity. Heterochronic parabiosis and GDF11 modulation rejuvenate niches in mice.",
    measuredBy: "Colony-forming unit assays; niche single-cell atlases.",
    interventionIds: ["stem-cell-therapies", "niche-rejuvenation", "gdf11-modulators"],
  },
  {
    id: "altered-intercellular-communication",
    name: "Altered intercellular communication",
    category: "integrative",
    layer: "intercellular",
    summary: "Endocrine, neuroendocrine, and immune signaling drift.",
    mechanism:
      "Inflammaging, NF-κB activation, and senescent-cell SASP corrupt signaling between tissues. Plasma dilution (TPE) and young-plasma factors show early signals in preclinical models.",
    measuredBy: "Cytokine panels; inflammaging scores (IL-6, TNF-α, CRP).",
    interventionIds: ["plasma-exchange", "anti-inflammatories", "sasp-blockers"],
  },
  {
    id: "chronic-inflammation",
    name: "Chronic inflammation",
    category: "integrative",
    layer: "systemic",
    summary: "Low-grade, sterile, age-related inflammation (inflammaging).",
    mechanism:
      "NF-κB tone rises with age, driven by SASP, gut-barrier leak, and immunosenescence. It predicts multimorbidity better than many single biomarkers; JAK inhibitors and senolytics reduce it in trials.",
    measuredBy: "IL-6, CRP, TNF-α; inflammaging clocks.",
    interventionIds: ["anti-inflammatories", "jak-inhibitors", "senolytics-dq"],
  },
  {
    id: "dysbiosis",
    name: "Dysbiosis",
    category: "integrative",
    layer: "systemic",
    summary: "Microbiome diversity and metabolite output decline.",
    mechanism:
      "Bifidobacterium and butyrate-producers fade while pathobionts rise; gut-barrier permeability fuels systemic inflammation. FMT from young donors extends healthspan in killifish and mice.",
    measuredBy: "16S/shotgun metagenomics; SCFA levels; calprotectin.",
    interventionIds: ["fmt", "prebiotics-postbiotics", "phage-therapy"],
  },
] as const;

export function getHallmark(id: string): Hallmark | undefined {
  return HALLMARKS.find((h) => h.id === id);
}

export function hallmarksByCategory(category: HallmarkCategory): Hallmark[] {
  return HALLMARKS.filter((h) => h.category === category);
}

export function hallmarksTargetedBy(interventionId: string): Hallmark[] {
  return HALLMARKS.filter((h) => h.interventionIds.includes(interventionId));
}
