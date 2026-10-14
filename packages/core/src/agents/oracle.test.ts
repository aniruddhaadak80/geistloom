import { describe, expect, it } from "vitest";
import { askOracle, askOracleAllScenarios, ORACLE_MODEL } from "./oracle";

describe("the Oracle", () => {
  it("answers a prompt deterministically", () => {
    const a = askOracle({ prompt: "solve aging" });
    const b = askOracle({ prompt: "solve aging" });
    expect(a).toEqual(b);
  });

  it("different prompts produce different plans", () => {
    const a = askOracle({ prompt: "solve aging" });
    const b = askOracle({ prompt: "cure malaria with gene drives" });
    expect(a.id).not.toBe(b.id);
  });

  it("classifies the domain correctly", () => {
    const plan = askOracle({ prompt: "how do we solve aging and extend human lifespan?" });
    expect(plan.domain).toBe("longevity & aging");
  });

  it("produces a 6-phase research program", () => {
    const plan = askOracle({ prompt: "solve aging" });
    expect(plan.phases).toHaveLength(6);
    const totalYears = plan.phases.reduce((acc, p) => acc + p.years, 0);
    expect(totalYears).toBeGreaterThanOrEqual(14);
    expect(totalYears).toBeLessThanOrEqual(45);
  });

  it("confidence decays across phases", () => {
    const plan = askOracle({ prompt: "solve aging" });
    for (let i = 1; i < plan.phases.length; i++) {
      expect(plan.phases[i]?.confidence).toBeLessThanOrEqual(
        (plan.phases[i - 1]?.confidence ?? 1) + 0.001,
      );
    }
  });

  it("builds a connected reasoning DAG", () => {
    const plan = askOracle({ prompt: "solve aging with partial reprogramming" });
    const { nodes, edges } = plan.reasoningDag;
    expect(nodes.length).toBeGreaterThan(3);
    expect(edges.length).toBeGreaterThan(2);
    const nodeIds = new Set(nodes.map((n) => n.id));
    for (const e of edges) {
      expect(nodeIds.has(e.from)).toBe(true);
      expect(nodeIds.has(e.to)).toBe(true);
    }
  });

  it("anchors key numbers with units", () => {
    const plan = askOracle({ prompt: "solve aging" });
    expect(plan.keyNumbers.length).toBeGreaterThanOrEqual(4);
    for (const kn of plan.keyNumbers) {
      expect(kn.label.length).toBeGreaterThan(2);
      expect(kn.unit.length).toBeGreaterThan(0);
    }
  });

  it("cites the real literature", () => {
    const plan = askOracle({ prompt: "senolytics for aging" });
    expect(plan.citations.length).toBeGreaterThan(2);
    const joined = plan.citations.join(" ");
    expect(joined).toContain("Hallmarks of aging");
  });

  it("names its model as a deterministic local simulation", () => {
    const plan = askOracle({ prompt: "solve aging" });
    expect(plan.model).toBe(ORACLE_MODEL);
    expect(plan.model).not.toContain("gpt");
    expect(plan.model).not.toContain("claude");
  });

  it("throws on an empty prompt", () => {
    expect(() => askOracle({ prompt: "   " })).toThrow();
  });

  it("batch mode runs the prompt under every scenario prior", () => {
    const plans = askOracleAllScenarios("solve aging");
    expect(plans).toHaveLength(6);
  });

  it("a gene-drive prompt lands in infectious disease or genetic engineering", () => {
    const plan = askOracle({ prompt: "engineer a CRISPR gene drive to eliminate malaria" });
    expect(["infectious disease", "genetic engineering"]).toContain(plan.domain);
  });
});
