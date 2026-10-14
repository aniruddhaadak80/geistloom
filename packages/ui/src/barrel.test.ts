import { describe, expect, it } from "vitest";
import * as generated from "./generated/index";
import * as barrel from "./index";

/**
 * The UI package ships hand-written primitives plus 29 generated
 * components. These are smoke tests over the barrels — they assert
 * the public surface exists and is the documented type, without
 * dragging a DOM into the test run.
 */
describe("@geistloom/ui barrel", () => {
  it("exports the hand-written primitives", () => {
    expect(typeof barrel.cn).toBe("function");
    expect(typeof barrel.Button).toBe("function");
    expect(typeof barrel.Card).toBe("function");
    expect(typeof barrel.Badge).toBe("function");
    expect(typeof barrel.LineChart).toBe("function");
  });

  it("re-exports the generated chart and display primitives", () => {
    for (const name of [
      "Sparkline",
      "AreaChart",
      "BarChart",
      "DonutChart",
      "TimelineItem",
      "EvidenceBadge",
      "ConfidenceGauge",
      "MetricCard",
      "StatBlock",
      "PhaseRibbon",
      "AdoptionCurve",
      "CitationEntry",
      "MonoTable",
      "EmptyState",
    ]) {
      expect(typeof (generated as Record<string, unknown>)[name]).toBe("function");
    }
  });

  it("re-exports one card per hallmark", () => {
    const cards = Object.keys(generated).filter(
      (k) => k.startsWith("Hallmark") && k.endsWith("Card"),
    );
    expect(cards).toHaveLength(12);
  });
});
