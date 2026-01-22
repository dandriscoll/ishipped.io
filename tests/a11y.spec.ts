import { test, expect, Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import * as fs from "fs";
import * as path from "path";

const TARGET_URL = process.env.TARGET_URL || "http://localhost:3000";
const RESULTS_DIR = path.join(process.cwd(), "test-results", "a11y");

// All available card themes
const CARD_THEMES = [
  "default",
  "ocean",
  "forest",
  "sunset",
  "lavender",
  "midnight",
  "ruby",
] as const;

// Markdown content that exercises all supported markdown elements
const ALL_MARKDOWN_ELEMENTS = `## Heading Level 2

This is a paragraph with **bold text**, *italic text*, and ~~strikethrough~~.

### Heading Level 3

> This is a blockquote that tests contrast ratios.
> It can span multiple lines to ensure proper styling.

#### Heading Level 4

Here's an unordered list:
- First item
- Second item with \`inline code\`
- Third item

And an ordered list:
1. First numbered item
2. Second numbered item
3. Third numbered item

##### Heading Level 5

Here's a code block:

\`\`\`javascript
function hello() {
  console.log("Hello, world!");
}
\`\`\`

###### Heading Level 6

| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |

---

A [link to example](https://example.com) for testing link contrast.
`;

interface AllResults {
  timestamp: string;
  summary: {
    total: number;
    passed: number;
    failed: number;
  };
  tests: TestResult[];
}

interface TestResult {
  page: string;
  theme: string;
  colorMode: string;
  violations: ViolationSummary[];
  passed: boolean;
}

interface ViolationSummary {
  id: string;
  impact: string;
  description: string;
  nodes: number;
  helpUrl: string;
}

async function waitForAppReady(page: Page) {
  await page.waitForSelector("body[data-app-ready='true']", {
    timeout: 30000,
  });
}

async function runAccessibilityScan(page: Page) {
  return new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
}

function logViolations(violations: ViolationSummary[], context: string) {
  if (violations.length > 0) {
    console.log(`\n=== ACCESSIBILITY VIOLATIONS: ${context} ===\n`);
    violations.forEach((violation, index) => {
      console.log(`${index + 1}. [${violation.impact}] ${violation.id}`);
      console.log(`   ${violation.description}`);
      console.log(`   Affected elements: ${violation.nodes}`);
      console.log(`   Help: ${violation.helpUrl}`);
      console.log("");
    });
  }
}

test.describe("Accessibility", () => {
  test("homepage should have no accessibility violations", async ({ page }) => {
    await page.goto(TARGET_URL, { waitUntil: "networkidle" });
    await waitForAppReady(page);

    const results = await runAccessibilityScan(page);

    if (!fs.existsSync(RESULTS_DIR)) {
      fs.mkdirSync(RESULTS_DIR, { recursive: true });
    }

    fs.writeFileSync(
      path.join(RESULTS_DIR, "homepage-results.json"),
      JSON.stringify(results, null, 2)
    );

    const { violations } = results;
    if (violations.length > 0) {
      logViolations(
        violations.map((v) => ({
          id: v.id,
          impact: v.impact || "unknown",
          description: v.description,
          nodes: v.nodes.length,
          helpUrl: v.helpUrl,
        })),
        "Homepage"
      );
    }

    expect(
      violations,
      `Found ${violations.length} accessibility violation(s) on homepage.`
    ).toHaveLength(0);
  });

  test.describe("Card view with all markdown elements", () => {
    const allResults: AllResults = {
      timestamp: new Date().toISOString(),
      summary: { total: 0, passed: 0, failed: 0 },
      tests: [],
    };

    for (const theme of CARD_THEMES) {
      for (const colorMode of ["light", "dark"] as const) {
        test(`${theme} theme in ${colorMode} mode`, async ({ page }) => {
          // Navigate to builder
          await page.goto(`${TARGET_URL}/builder`, { waitUntil: "networkidle" });
          await waitForAppReady(page);

          // Set color mode
          if (colorMode === "dark") {
            await page.evaluate(() => {
              document.documentElement.classList.add("dark");
              document.documentElement.classList.remove("light");
            });
          } else {
            await page.evaluate(() => {
              document.documentElement.classList.add("light");
              document.documentElement.classList.remove("dark");
            });
          }

          // Enter a title (required for card to render)
          const titleInput = page.locator('input[placeholder*="title"], input[name="title"]').first();
          if (await titleInput.isVisible()) {
            await titleInput.fill("Test Card for Accessibility");
          } else {
            // Try finding by label
            await page.fill('input:near(:text("Title"))', "Test Card for Accessibility");
          }

          // Enter markdown body content with all elements
          const bodyTextarea = page.locator('textarea').first();
          if (await bodyTextarea.isVisible()) {
            await bodyTextarea.fill(ALL_MARKDOWN_ELEMENTS);
          }

          // Wait for markdown to render
          await page.waitForTimeout(500);

          // Select theme using the theme picker
          if (theme !== "default") {
            const themePicker = page.locator('button[aria-label="Select card theme"]');
            if (await themePicker.isVisible()) {
              await themePicker.click();
              await page.waitForTimeout(100);

              // Click on the theme option
              const themeOption = page.locator(`button:has-text("${theme.charAt(0).toUpperCase() + theme.slice(1)}")`);
              if (await themeOption.isVisible()) {
                await themeOption.click();
              }
            }
          }

          // Wait for theme to apply
          await page.waitForTimeout(300);

          // Run accessibility scan on the preview area
          const results = await runAccessibilityScan(page);

          const testResult: TestResult = {
            page: "builder-preview",
            theme,
            colorMode,
            violations: results.violations.map((v) => ({
              id: v.id,
              impact: v.impact || "unknown",
              description: v.description,
              nodes: v.nodes.length,
              helpUrl: v.helpUrl,
            })),
            passed: results.violations.length === 0,
          };

          allResults.tests.push(testResult);
          allResults.summary.total++;
          if (testResult.passed) {
            allResults.summary.passed++;
          } else {
            allResults.summary.failed++;
          }

          // Save individual test result
          if (!fs.existsSync(RESULTS_DIR)) {
            fs.mkdirSync(RESULTS_DIR, { recursive: true });
          }

          fs.writeFileSync(
            path.join(RESULTS_DIR, `card-${theme}-${colorMode}-results.json`),
            JSON.stringify(results, null, 2)
          );

          if (results.violations.length > 0) {
            logViolations(testResult.violations, `Card - ${theme} theme (${colorMode} mode)`);
          }

          expect(
            results.violations,
            `Found ${results.violations.length} accessibility violation(s) in ${theme} theme (${colorMode} mode).`
          ).toHaveLength(0);
        });
      }
    }

    test.afterAll(async () => {
      // Save combined results
      if (!fs.existsSync(RESULTS_DIR)) {
        fs.mkdirSync(RESULTS_DIR, { recursive: true });
      }

      fs.writeFileSync(
        path.join(RESULTS_DIR, "all-card-theme-results.json"),
        JSON.stringify(allResults, null, 2)
      );

      console.log("\n=== CARD THEME ACCESSIBILITY SUMMARY ===");
      console.log(`Total tests: ${allResults.summary.total}`);
      console.log(`Passed: ${allResults.summary.passed}`);
      console.log(`Failed: ${allResults.summary.failed}`);
      console.log(`Results saved to: ${RESULTS_DIR}/all-card-theme-results.json\n`);
    });
  });
});
