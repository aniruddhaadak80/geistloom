export interface RouteInfo {
  readonly href: string;
  readonly label: string;
  readonly blurb: string;
}

/**
 * The 12 routes of the world-frame. Single source of truth for the
 * nav bar, the mobile menu, and the command palette.
 */
export const ROUTES: readonly RouteInfo[] = [
  {
    href: "/oracle",
    label: "The Oracle",
    blurb:
      "A deterministic superintelligence. Ask anything — receive an auditable research program.",
  },
  {
    href: "/century",
    label: "Century Engine",
    blurb: "Two hundred years of civilization as a function of biotechnology.",
  },
  {
    href: "/hallmarks",
    label: "Hallmarks",
    blurb: "The twelve mechanisms of aging — the problem, precisely stated.",
  },
  {
    href: "/interventions",
    label: "Interventions",
    blurb: "Every real and near-real longevity therapy, graded by evidence.",
  },
  {
    href: "/clocks",
    label: "Clocks",
    blurb: "Epigenetic clocks — the instruments that make aging measurable.",
  },
  {
    href: "/gene-drive",
    label: "Gene Drives",
    blurb: "Population-scale genetics, simulated generation by generation.",
  },
  {
    href: "/timeline",
    label: "Timeline",
    blurb: "The road from here to the bio-dividend, milestone by milestone.",
  },
  {
    href: "/scenarios",
    label: "Scenarios",
    blurb: "Six futures, each with its own priors. Fork the world.",
  },
  {
    href: "/worldboard",
    label: "Worldboard",
    blurb: "Every simulated state, every year — a coordinate system for the future.",
  },
  {
    href: "/ethics",
    label: "Ethics",
    blurb: "Who gets the therapies? The hardest question in the bio-dividend.",
  },
  {
    href: "/archive",
    label: "Archive",
    blurb: "Every plan, every simulation, every trace — kept forever.",
  },
  {
    href: "/lab",
    label: "Lab",
    blurb: "Experimental apparatus: playgrounds for the deterministic engines.",
  },
];
