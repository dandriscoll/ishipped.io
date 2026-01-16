import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CardRenderer } from "@/components/CardRenderer";
import type { ParsedCard } from "@/lib/card";
import type { RepoMetadata } from "@/lib/github";

const defaultMetadata: RepoMetadata = {
  stars: 100,
  license: "MIT",
  description: "A test repo",
};

function createCard(overrides: Partial<ParsedCard["frontmatter"]> = {}): ParsedCard {
  return {
    frontmatter: {
      title: "Test Project",
      ...overrides,
    },
    body: "Test body content",
  };
}

describe("CardRenderer", () => {
  describe("icon overlap prevention", () => {
    it("adds right padding to header when icon is present", () => {
      const card = createCard({
        title: "A Very Long Project Title That Could Overlap With Icon",
        icon: "https://raw.githubusercontent.com/owner/repo/main/icon.png",
      });

      const { container } = render(
        <CardRenderer
          card={card}
          bodyHtml="<p>Test body</p>"
          owner="owner"
          repo="repo"
          ref="main"
          metadata={defaultMetadata}
        />
      );

      const header = container.querySelector("header");
      expect(header).toBeTruthy();
      // Header should have padding-right class when icon is present
      expect(header?.className).toMatch(/pr-16|pr-20|pr-\[/);
    });

    it("does not add extra right padding when no icon is present", () => {
      const card = createCard({
        title: "Test Project",
        // No icon
      });

      const { container } = render(
        <CardRenderer
          card={card}
          bodyHtml="<p>Test body</p>"
          owner="owner"
          repo="repo"
          ref="main"
          metadata={defaultMetadata}
        />
      );

      const header = container.querySelector("header");
      expect(header).toBeTruthy();
      // Header should NOT have the icon-specific padding class
      expect(header?.className).not.toMatch(/pr-16|pr-20|pr-\[/);
    });

    it("renders icon in top-right corner with proper positioning", () => {
      const card = createCard({
        title: "Test Project",
        icon: "https://raw.githubusercontent.com/owner/repo/main/icon.png",
      });

      const { container } = render(
        <CardRenderer
          card={card}
          bodyHtml="<p>Test body</p>"
          owner="owner"
          repo="repo"
          ref="main"
          metadata={defaultMetadata}
        />
      );

      const iconContainer = container.querySelector(".\\!absolute");
      expect(iconContainer).toBeTruthy();
      expect(iconContainer?.className).toContain("top-4");
      expect(iconContainer?.className).toContain("right-4");
    });

    it("header text does not extend into icon area", () => {
      const card = createCard({
        title: "This Is A Very Long Title That Would Normally Extend Into The Icon Area",
        summary: "This is also a potentially long summary that should not overlap with the icon in the corner",
        icon: "https://raw.githubusercontent.com/owner/repo/main/icon.png",
      });

      const { container } = render(
        <CardRenderer
          card={card}
          bodyHtml="<p>Test body</p>"
          owner="owner"
          repo="repo"
          ref="main"
          metadata={defaultMetadata}
        />
      );

      // Both title and summary should be rendered
      expect(screen.getByText(/This Is A Very Long Title/)).toBeInTheDocument();
      expect(screen.getByText(/This is also a potentially long summary/)).toBeInTheDocument();

      // Header should have padding to prevent overlap
      const header = container.querySelector("header");
      expect(header?.className).toMatch(/pr-/);
    });
  });

  describe("basic rendering", () => {
    it("renders card title", () => {
      const card = createCard({ title: "My Project" });

      render(
        <CardRenderer
          card={card}
          bodyHtml=""
          owner="owner"
          repo="repo"
          ref="main"
          metadata={defaultMetadata}
        />
      );

      expect(screen.getByText("My Project")).toBeInTheDocument();
    });

    it("renders card summary", () => {
      const card = createCard({
        title: "Test",
        summary: "A project summary",
      });

      render(
        <CardRenderer
          card={card}
          bodyHtml=""
          owner="owner"
          repo="repo"
          ref="main"
          metadata={defaultMetadata}
        />
      );

      expect(screen.getByText("A project summary")).toBeInTheDocument();
    });

    it("renders version badge", () => {
      const card = createCard({
        title: "Test",
        version: "2.0.0",
      });

      render(
        <CardRenderer
          card={card}
          bodyHtml=""
          owner="owner"
          repo="repo"
          ref="main"
          metadata={defaultMetadata}
        />
      );

      expect(screen.getByText("2.0.0")).toBeInTheDocument();
    });
  });
});
