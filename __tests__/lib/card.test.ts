import { describe, it, expect } from "vitest";
import {
  parseCard,
  CardParseError,
  formatShippedDate,
  formatStars,
} from "@/lib/card";

describe("lib/card", () => {
  describe("parseCard", () => {
    const validCard = `---
title: Test Project
summary: A test project
---

This is the body.`;

    it("parses valid card with frontmatter and body", () => {
      const result = parseCard(validCard, "testowner");

      expect(result.frontmatter.title).toBe("Test Project");
      expect(result.frontmatter.summary).toBe("A test project");
      expect(result.body).toBe("This is the body.");
    });

    it("throws INVALID_FORMAT when frontmatter delimiters are missing", () => {
      const noFrontmatter = "Just some text without frontmatter";

      try {
        parseCard(noFrontmatter, "owner");
        expect.fail("Should have thrown");
      } catch (e) {
        expect(e).toBeInstanceOf(CardParseError);
        expect((e as CardParseError).code).toBe("INVALID_FORMAT");
      }
    });

    it("throws INVALID_FORMAT for invalid YAML", () => {
      const invalidYaml = `---
title: [unclosed bracket
---
Body`;

      expect(() => parseCard(invalidYaml, "owner")).toThrow(CardParseError);
    });

    it("throws MISSING_TITLE when title is absent", () => {
      const noTitle = `---
summary: No title here
---
Body`;

      try {
        parseCard(noTitle, "owner");
        expect.fail("Should have thrown");
      } catch (e) {
        expect(e).toBeInstanceOf(CardParseError);
        expect((e as CardParseError).code).toBe("MISSING_TITLE");
      }
    });

    it("throws MISSING_TITLE when title is empty string", () => {
      const emptyTitle = `---
title: ""
---
Body`;

      try {
        parseCard(emptyTitle, "owner");
        expect.fail("Should have thrown");
      } catch (e) {
        expect(e).toBeInstanceOf(CardParseError);
        expect((e as CardParseError).code).toBe("MISSING_TITLE");
      }
    });

    it("throws INVALID_FORMAT when title exceeds 100 characters", () => {
      const longTitle = `---
title: ${"a".repeat(101)}
---
Body`;

      try {
        parseCard(longTitle, "owner");
        expect.fail("Should have thrown");
      } catch (e) {
        expect(e).toBeInstanceOf(CardParseError);
        expect((e as CardParseError).code).toBe("INVALID_FORMAT");
      }
    });

    it("truncates summary at 280 characters", () => {
      const longSummary = `---
title: Test
summary: ${"a".repeat(300)}
---
Body`;

      const result = parseCard(longSummary, "owner");
      expect(result.frontmatter.summary?.length).toBe(280);
    });

    it("validates hero URL - accepts allowed hosts", () => {
      const validHero = `---
title: Test
hero: https://raw.githubusercontent.com/user/repo/main/image.png
---
Body`;

      const result = parseCard(validHero, "owner");
      expect(result.frontmatter.hero).toBe(
        "https://raw.githubusercontent.com/user/repo/main/image.png"
      );
    });

    it("validates hero URL - rejects non-HTTPS", () => {
      const httpHero = `---
title: Test
hero: http://example.com/image.png
---
Body`;

      const result = parseCard(httpHero, "owner");
      expect(result.frontmatter.hero).toBeUndefined();
    });

    it("validates hero URL - rejects non-allowed hosts", () => {
      const badHost = `---
title: Test
hero: https://evil.com/image.png
---
Body`;

      const result = parseCard(badHost, "owner");
      expect(result.frontmatter.hero).toBeUndefined();
    });

    it("validates shipped date - accepts YYYY-MM-DD", () => {
      const validDate = `---
title: Test
shipped: "2024-03-15"
---
Body`;

      const result = parseCard(validDate, "owner");
      expect(result.frontmatter.shipped).toBe("2024-03-15");
    });

    it("validates shipped date - rejects invalid format", () => {
      const invalidDate = `---
title: Test
shipped: "March 15, 2024"
---
Body`;

      const result = parseCard(invalidDate, "owner");
      expect(result.frontmatter.shipped).toBeUndefined();
    });

    it("validates tags - limits to 10 tags", () => {
      const manyTags = `---
title: Test
tags: [a, b, c, d, e, f, g, h, i, j, k, l]
---
Body`;

      const result = parseCard(manyTags, "owner");
      expect(result.frontmatter.tags?.length).toBe(10);
    });

    it("validates tags - filters tags over 30 chars", () => {
      const longTag = `---
title: Test
tags:
  - short
  - ${"x".repeat(31)}
---
Body`;

      const result = parseCard(longTag, "owner");
      expect(result.frontmatter.tags).toEqual(["short"]);
    });

    it("validates links - limits to 10 links", () => {
      const links = Array(12)
        .fill(null)
        .map((_, i) => `  - label: Link ${i}\n    url: https://example.com/${i}`)
        .join("\n");

      const manyLinks = `---
title: Test
links:
${links}
---
Body`;

      const result = parseCard(manyLinks, "owner");
      expect(result.frontmatter.links?.length).toBe(10);
    });

    it("validates links - only one primary allowed", () => {
      const twoPrimary = `---
title: Test
links:
  - label: First
    url: https://example.com/1
    primary: true
  - label: Second
    url: https://example.com/2
    primary: true
---
Body`;

      const result = parseCard(twoPrimary, "owner");
      const primaryLinks = result.frontmatter.links?.filter((l) => l.primary);
      expect(primaryLinks?.length).toBe(1);
    });

    it("validates links - rejects non-HTTPS URLs", () => {
      const httpLink = `---
title: Test
links:
  - label: Bad Link
    url: http://example.com
---
Body`;

      const result = parseCard(httpLink, "owner");
      expect(result.frontmatter.links?.length).toBe(0);
    });

    it("validates links - rejects labels over 50 chars", () => {
      const longLabel = `---
title: Test
links:
  - label: ${"x".repeat(51)}
    url: https://example.com
---
Body`;

      const result = parseCard(longLabel, "owner");
      expect(result.frontmatter.links?.length).toBe(0);
    });

    it("defaults author to repo owner when not provided", () => {
      const noAuthor = `---
title: Test
---
Body`;

      const result = parseCard(noAuthor, "myowner");
      expect(result.frontmatter.author).toEqual({
        name: "myowner",
        github: "myowner",
      });
    });

    it("handles author as string", () => {
      const stringAuthor = `---
title: Test
author: John Doe
---
Body`;

      const result = parseCard(stringAuthor, "owner");
      expect(result.frontmatter.author).toEqual({
        name: "John Doe",
        github: "owner",
      });
    });

    it("handles author as object", () => {
      const objectAuthor = `---
title: Test
author:
  name: Jane Doe
  github: janedoe
  url: https://jane.dev
---
Body`;

      const result = parseCard(objectAuthor, "owner");
      expect(result.frontmatter.author).toEqual({
        name: "Jane Doe",
        github: "janedoe",
        url: "https://jane.dev",
        avatar: undefined,
      });
    });

    it("trims version to 20 characters", () => {
      // Quote the version to ensure YAML parses it as string
      const longVersion = `---
title: Test
version: "v${"1".repeat(24)}"
---
Body`;

      const result = parseCard(longVersion, "owner");
      expect(result.frontmatter.version?.length).toBe(20);
    });

    it("handles empty body", () => {
      const emptyBody = `---
title: Test
---
`;

      const result = parseCard(emptyBody, "owner");
      expect(result.body).toBe("");
    });
  });

  describe("formatShippedDate", () => {
    it("formats date string to readable format", () => {
      // Use a date with explicit timezone to avoid timezone issues
      const result = formatShippedDate("2024-03-15T12:00:00Z");
      // Check that it contains the expected parts (timezone-agnostic)
      expect(result).toContain("2024");
      expect(result).toContain("March");
    });

    it("formats ISO 8601 timestamp with time", () => {
      const result = formatShippedDate("2024-06-15T15:30:00Z");
      expect(result).toContain("2024");
      expect(result).toContain("June");
    });

    it("handles different months", () => {
      const result = formatShippedDate("2024-12-25T12:00:00Z");
      expect(result).toContain("December");
      expect(result).toContain("2024");
    });
  });

  describe("formatStars", () => {
    it("returns number as string for values under 1000", () => {
      expect(formatStars(0)).toBe("0");
      expect(formatStars(999)).toBe("999");
    });

    it("formats thousands with k suffix", () => {
      expect(formatStars(1000)).toBe("1.0k");
      expect(formatStars(1500)).toBe("1.5k");
      expect(formatStars(15000)).toBe("15.0k");
    });
  });
});
