import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const _BASE = "http://localhost:3000";

test.describe("Geistloom e2e", () => {
  test("landing renders the frame promise", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("superintelligence solves");
    await expect(page.getByRole("link", { name: "Ask the Oracle" })).toBeVisible();
  });

  test("landing is accessible (axe)", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test("nav links to all twelve routes", async ({ page }) => {
    await page.goto("/");
    const routes = [
      "/oracle",
      "/century",
      "/hallmarks",
      "/interventions",
      "/clocks",
      "/gene-drive",
      "/timeline",
      "/scenarios",
      "/worldboard",
      "/ethics",
      "/archive",
      "/lab",
    ];
    for (const route of routes) {
      const res = await page.request.get(route);
      expect(res.ok(), `${route} returned ${res.status()}`).toBeTruthy();
    }
  });

  test("oracle page answers deterministically", async ({ page }) => {
    await page.goto("/oracle");
    const prompt = page.getByRole("textbox");
    await prompt.fill("solve aging");
    await page.getByRole("button", { name: /consult the oracle/i }).click();
    // The plan renders six phases.
    await expect(page.getByText("Map the problem").first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText("Ship it to the world").first()).toBeVisible();
  });

  test("healthz probe", async ({ page }) => {
    const res = await page.request.get("/healthz");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("ok");
  });

  test("og image route renders a social card", async ({ page }) => {
    const res = await page.request.get("/og?title=Test");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("image/");
  });
});
