import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import * as fs from "fs";
import * as path from "path";

const TARGET_URL = process.env.TARGET_URL || "http://localhost:3000";
const RESULTS_DIR = path.join(process.cwd(), "test-results", "a11y");
const RESULTS_FILE = path.join(RESULTS_DIR, "axe-results.json");

test.describe("Accessibility", () => {
  test("should have no accessibility violations", async ({ page }) => {
    // Navigate to the app and wait for network to settle
    await page.goto(TARGET_URL, { waitUntil: "networkidle" });

    // Wait for the app-ready marker (set by ThemeProvider after hydration)
    // This ensures the SPA has fully rendered before scanning
    await page.waitForSelector("body[data-app-ready='true']", {
      timeout: 30000,
    });

    // Run axe accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    // Ensure output directory exists
    if (!fs.existsSync(RESULTS_DIR)) {
      fs.mkdirSync(RESULTS_DIR, { recursive: true });
    }

    // Write results to JSON file
    fs.writeFileSync(
      RESULTS_FILE,
      JSON.stringify(accessibilityScanResults, null, 2)
    );

    // Log summary to stdout
    const { violations } = accessibilityScanResults;
    if (violations.length > 0) {
      console.log("\n=== ACCESSIBILITY VIOLATIONS FOUND ===\n");
      violations.forEach((violation, index) => {
        console.log(`${index + 1}. [${violation.impact}] ${violation.id}`);
        console.log(`   ${violation.description}`);
        console.log(`   Help: ${violation.helpUrl}`);
        console.log(`   Affected elements: ${violation.nodes.length}`);
        violation.nodes.slice(0, 3).forEach((node) => {
          console.log(`     - ${node.target.join(" > ")}`);
        });
        if (violation.nodes.length > 3) {
          console.log(`     ... and ${violation.nodes.length - 3} more`);
        }
        console.log("");
      });
      console.log(`Total violations: ${violations.length}`);
      console.log(`Results saved to: ${RESULTS_FILE}\n`);
    } else {
      console.log("\n=== NO ACCESSIBILITY VIOLATIONS ===");
      console.log(`Results saved to: ${RESULTS_FILE}\n`);
    }

    // Fail the test if there are violations
    expect(
      violations,
      `Found ${violations.length} accessibility violation(s). See ${RESULTS_FILE} for details.`
    ).toHaveLength(0);
  });
});
