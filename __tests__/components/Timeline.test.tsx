import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Timeline } from "@/components/Timeline";
import type { ParsedUserCard } from "@/lib/user-api";

describe("Timeline", () => {
  const mockCards: ParsedUserCard[] = [
    {
      path: "octocat/hello-world",
      owner: "octocat",
      repo: "hello-world",
      card: {
        frontmatter: {
          title: "Hello World",
          summary: "My first project",
          shipped: "2024-01-15",
          icon: "https://example.com/icon.png",
        },
        body: "",
      },
    },
    {
      path: "octocat/awesome-app",
      owner: "octocat",
      repo: "awesome-app",
      card: {
        frontmatter: {
          title: "Awesome App",
          summary: "Another great project",
          shipped: "2024-06-01",
          hero: "https://example.com/hero.png",
        },
        body: "",
      },
    },
    {
      path: "octocat/old-project",
      owner: "octocat",
      repo: "old-project",
      card: {
        frontmatter: {
          title: "Old Project",
          summary: "An older project",
          shipped: "2023-03-10",
        },
        body: "",
      },
    },
  ];

  describe("rendering", () => {
    it("renders all card titles", () => {
      render(<Timeline cards={mockCards} />);

      // Each title appears twice (desktop + mobile layouts)
      expect(screen.getAllByText("Hello World")).toHaveLength(2);
      expect(screen.getAllByText("Awesome App")).toHaveLength(2);
      expect(screen.getAllByText("Old Project")).toHaveLength(2);
    });

    it("renders card summaries", () => {
      render(<Timeline cards={mockCards} />);

      // Each summary appears twice (desktop + mobile layouts)
      expect(screen.getAllByText("My first project")).toHaveLength(2);
      expect(screen.getAllByText("Another great project")).toHaveLength(2);
      expect(screen.getAllByText("An older project")).toHaveLength(2);
    });

    it("renders shipped dates", () => {
      render(<Timeline cards={mockCards} />);

      // Check for formatted dates
      expect(screen.getAllByText(/January 15, 2024/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/June 1, 2024/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/March 10, 2023/).length).toBeGreaterThan(0);
    });

    it("renders links to card pages", () => {
      render(<Timeline cards={mockCards} />);

      const links = screen.getAllByRole("link");
      const cardLinks = links.map((link) => link.getAttribute("href"));

      expect(cardLinks).toContain("/card/octocat/hello-world");
      expect(cardLinks).toContain("/card/octocat/awesome-app");
      expect(cardLinks).toContain("/card/octocat/old-project");
    });
  });

  describe("sorting", () => {
    it("sorts cards by shipped date (newest first)", () => {
      render(<Timeline cards={mockCards} />);

      const links = screen.getAllByRole("link");
      const cardUrls = links.map((link) => link.getAttribute("href"));

      // Awesome App (June 2024) should be first
      // Hello World (January 2024) should be second
      // Old Project (March 2023) should be last
      const awesomeIndex = cardUrls.indexOf("/card/octocat/awesome-app");
      const helloIndex = cardUrls.indexOf("/card/octocat/hello-world");
      const oldIndex = cardUrls.indexOf("/card/octocat/old-project");

      expect(awesomeIndex).toBeLessThan(helloIndex);
      expect(helloIndex).toBeLessThan(oldIndex);
    });

    it("handles cards without shipped dates", () => {
      const cardsWithoutDates: ParsedUserCard[] = [
        {
          path: "user/no-date",
          owner: "user",
          repo: "no-date",
          card: {
            frontmatter: {
              title: "No Date Project",
            },
            body: "",
          },
        },
        ...mockCards,
      ];

      render(<Timeline cards={cardsWithoutDates} />);

      // Should render without errors (appears twice for desktop/mobile)
      expect(screen.getAllByText("No Date Project")).toHaveLength(2);
    });
  });

  describe("images", () => {
    it("prefers icon over hero image", () => {
      const cardWithBoth: ParsedUserCard[] = [
        {
          path: "user/both-images",
          owner: "user",
          repo: "both-images",
          card: {
            frontmatter: {
              title: "Both Images",
              icon: "https://example.com/icon.png",
              hero: "https://example.com/hero.png",
            },
            body: "",
          },
        },
      ];

      const { container } = render(<Timeline cards={cardWithBoth} />);

      const images = container.querySelectorAll("img");
      // Should use icon URL, not hero (appears multiple times for desktop/mobile)
      const iconImages = Array.from(images).filter((img) => img.getAttribute("src") === "https://example.com/icon.png");
      const heroImages = Array.from(images).filter((img) => img.getAttribute("src") === "https://example.com/hero.png");
      expect(iconImages.length).toBeGreaterThan(0);
      expect(heroImages.length).toBe(0);
    });

    it("falls back to hero when no icon", () => {
      const cardWithHeroOnly: ParsedUserCard[] = [
        {
          path: "user/hero-only",
          owner: "user",
          repo: "hero-only",
          card: {
            frontmatter: {
              title: "Hero Only",
              hero: "https://example.com/hero.png",
            },
            body: "",
          },
        },
      ];

      const { container } = render(<Timeline cards={cardWithHeroOnly} />);

      const images = container.querySelectorAll("img");
      const heroImages = Array.from(images).filter((img) => img.getAttribute("src") === "https://example.com/hero.png");
      expect(heroImages.length).toBeGreaterThan(0);
    });

    it("renders without image when neither icon nor hero provided", () => {
      const cardWithoutImages: ParsedUserCard[] = [
        {
          path: "user/no-images",
          owner: "user",
          repo: "no-images",
          card: {
            frontmatter: {
              title: "No Images Project",
              summary: "A project without images",
            },
            body: "",
          },
        },
      ];

      const { container } = render(<Timeline cards={cardWithoutImages} />);

      // Should render title without errors (appears twice for desktop/mobile)
      expect(screen.getAllByText("No Images Project")).toHaveLength(2);
      // Should not have any images
      expect(container.querySelectorAll("img")).toHaveLength(0);
    });
  });

  describe("empty state", () => {
    it("renders empty container when no cards", () => {
      const { container } = render(<Timeline cards={[]} />);

      // Should render the container but no timeline items
      expect(container.querySelector(".space-y-8")).toBeInTheDocument();
      expect(screen.queryAllByRole("link")).toHaveLength(0);
    });
  });

  describe("responsive layout", () => {
    it("renders desktop layout with hidden class on mobile", () => {
      render(<Timeline cards={mockCards} />);

      // Desktop layout elements should have 'hidden md:flex' pattern
      const desktopElements = document.querySelectorAll(".hidden.md\\:flex");
      expect(desktopElements.length).toBeGreaterThan(0);
    });

    it("renders mobile layout with md:hidden class", () => {
      render(<Timeline cards={mockCards} />);

      // Mobile layout elements should have 'flex md:hidden' pattern
      const mobileElements = document.querySelectorAll(".flex.md\\:hidden");
      expect(mobileElements.length).toBeGreaterThan(0);
    });
  });
});
