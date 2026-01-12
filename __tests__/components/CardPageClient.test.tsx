import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { CardPageClient } from "@/components/CardPageClient";

// Mock the github module
vi.mock("@/lib/github", () => ({
  getDefaultBranch: vi.fn(),
  fetchCardContent: vi.fn(),
  getRepoMetadata: vi.fn(),
  GitHubURLError: class extends Error {
    constructor(public code: string) {
      super(code);
    }
  },
}));

// Mock the markdown module
vi.mock("@/lib/markdown", () => ({
  renderMarkdown: vi.fn(),
}));

// Mock the user-api module
vi.mock("@/lib/user-api", () => ({
  fetchUserCards: vi.fn(),
}));

import * as github from "@/lib/github";
import * as markdown from "@/lib/markdown";
import * as userApi from "@/lib/user-api";

describe("CardPageClient", () => {
  const validCardContent = `---
title: Test Project
summary: A test project summary
version: "1.0.0"
shipped: "2024-01-15"
tags:
  - typescript
  - react
links:
  - label: Website
    url: https://example.com
    primary: true
author:
  name: Test Author
  github: testauthor
---

This is the body content.`;

  beforeEach(() => {
    vi.resetAllMocks();

    // Default mocks
    vi.mocked(github.getDefaultBranch).mockResolvedValue("main");
    vi.mocked(github.fetchCardContent).mockResolvedValue(validCardContent);
    vi.mocked(github.getRepoMetadata).mockResolvedValue({
      stars: 100,
      license: "MIT",
      description: "A test repo",
    });
    vi.mocked(markdown.renderMarkdown).mockResolvedValue(
      "<p>This is the body content.</p>"
    );

    // Default: author has no other cards
    vi.mocked(userApi.fetchUserCards).mockResolvedValue([]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("path parsing", () => {
    it("parses /card/owner/repo path", async () => {
      Object.defineProperty(window, "location", {
        value: { pathname: "/card/octocat/hello-world" },
        writable: true,
      });

      render(<CardPageClient />);

      await waitFor(() => {
        expect(github.getDefaultBranch).toHaveBeenCalledWith(
          "octocat",
          "hello-world"
        );
      });
    });

    it("parses /card/owner/repo/path/to/file.md path", async () => {
      Object.defineProperty(window, "location", {
        value: { pathname: "/card/octocat/repo/docs/card.md" },
        writable: true,
      });

      render(<CardPageClient />);

      await waitFor(() => {
        expect(github.fetchCardContent).toHaveBeenCalledWith(
          expect.stringContaining("docs/card.md")
        );
      });
    });

    it("shows error for invalid path format", async () => {
      Object.defineProperty(window, "location", {
        value: { pathname: "/card/onlyowner" },
        writable: true,
      });

      render(<CardPageClient />);

      await waitFor(() => {
        expect(screen.getByText("Invalid Path")).toBeInTheDocument();
      });
    });

    it("shows error for non-.md file path", async () => {
      Object.defineProperty(window, "location", {
        value: { pathname: "/card/owner/repo/file.txt" },
        writable: true,
      });

      render(<CardPageClient />);

      await waitFor(() => {
        expect(screen.getByText("Invalid Path")).toBeInTheDocument();
      });
    });

    it("shows error for path without /card/ prefix", async () => {
      Object.defineProperty(window, "location", {
        value: { pathname: "/other/path" },
        writable: true,
      });

      render(<CardPageClient />);

      await waitFor(() => {
        expect(screen.getByText("Invalid Path")).toBeInTheDocument();
      });
    });
  });

  describe("loading state", () => {
    it("shows loading skeleton initially", () => {
      Object.defineProperty(window, "location", {
        value: { pathname: "/card/owner/repo" },
        writable: true,
      });

      // Make the fetch hang
      vi.mocked(github.getDefaultBranch).mockImplementation(
        () => new Promise(() => {})
      );

      render(<CardPageClient />);

      // Loading skeleton has animate-pulse class
      expect(document.querySelector(".animate-pulse")).toBeTruthy();
    });
  });

  describe("successful card rendering", () => {
    beforeEach(() => {
      Object.defineProperty(window, "location", {
        value: { pathname: "/card/octocat/hello-world" },
        writable: true,
      });
    });

    it("renders card title", async () => {
      render(<CardPageClient />);

      await waitFor(() => {
        expect(screen.getByText("Test Project")).toBeInTheDocument();
      });
    });

    it("renders card summary", async () => {
      render(<CardPageClient />);

      await waitFor(() => {
        expect(screen.getByText("A test project summary")).toBeInTheDocument();
      });
    });

    it("renders version badge", async () => {
      render(<CardPageClient />);

      await waitFor(() => {
        expect(screen.getByText("1.0.0")).toBeInTheDocument();
      });
    });

    it("renders tags", async () => {
      render(<CardPageClient />);

      await waitFor(() => {
        expect(screen.getByText("typescript")).toBeInTheDocument();
        expect(screen.getByText("react")).toBeInTheDocument();
      });
    });

    it("renders link buttons", async () => {
      render(<CardPageClient />);

      await waitFor(() => {
        expect(screen.getByRole("link", { name: /Website/i })).toBeInTheDocument();
      });
    });

    it("renders author name", async () => {
      render(<CardPageClient />);

      await waitFor(() => {
        expect(screen.getByText("Test Author")).toBeInTheDocument();
      });
    });

    it("renders shipped date", async () => {
      render(<CardPageClient />);

      await waitFor(() => {
        // Check for date components (timezone-agnostic)
        expect(screen.getByText(/2024/)).toBeInTheDocument();
        expect(screen.getByText(/January/)).toBeInTheDocument();
      });
    });

    it("renders repository link", async () => {
      render(<CardPageClient />);

      await waitFor(() => {
        expect(screen.getByText("octocat/hello-world")).toBeInTheDocument();
      });
    });

    it("renders star count", async () => {
      render(<CardPageClient />);

      await waitFor(() => {
        expect(screen.getByText("100")).toBeInTheDocument();
      });
    });

    it("renders license", async () => {
      render(<CardPageClient />);

      await waitFor(() => {
        expect(screen.getByText("MIT")).toBeInTheDocument();
      });
    });

    it("updates document title", async () => {
      render(<CardPageClient />);

      await waitFor(() => {
        expect(document.title).toBe("Test Project - iShipped.io");
      });
    });
  });

  describe("error states", () => {
    beforeEach(() => {
      Object.defineProperty(window, "location", {
        value: { pathname: "/card/owner/repo" },
        writable: true,
      });
    });

    it("shows error for CARD_NOT_FOUND", async () => {
      vi.mocked(github.fetchCardContent).mockRejectedValue(
        new github.GitHubURLError("CARD_NOT_FOUND")
      );

      render(<CardPageClient />);

      await waitFor(() => {
        expect(screen.getByText("Card not found")).toBeInTheDocument();
        expect(
          screen.getByText(/couldn't find \/\.ishipped\/card\.md/)
        ).toBeInTheDocument();
      });
    });

    it("shows error for PRIVATE_REPO", async () => {
      vi.mocked(github.getDefaultBranch).mockRejectedValue(
        new github.GitHubURLError("PRIVATE_REPO")
      );

      render(<CardPageClient />);

      await waitFor(() => {
        expect(screen.getByText("Repository not accessible")).toBeInTheDocument();
      });
    });

    it("shows error for RATE_LIMITED", async () => {
      vi.mocked(github.getDefaultBranch).mockRejectedValue(
        new github.GitHubURLError("RATE_LIMITED")
      );

      render(<CardPageClient />);

      await waitFor(() => {
        expect(screen.getByText("Rate limited")).toBeInTheDocument();
      });
    });

    it("shows error for FETCH_FAILED", async () => {
      vi.mocked(github.fetchCardContent).mockRejectedValue(
        new github.GitHubURLError("FETCH_FAILED")
      );

      render(<CardPageClient />);

      await waitFor(() => {
        expect(screen.getByText("Fetch failed")).toBeInTheDocument();
      });
    });

    it("shows error for INVALID_FORMAT (card parse error)", async () => {
      vi.mocked(github.fetchCardContent).mockResolvedValue("no frontmatter");

      render(<CardPageClient />);

      await waitFor(() => {
        expect(screen.getByText("Invalid card format")).toBeInTheDocument();
      });
    });

    it("shows error for MISSING_TITLE", async () => {
      vi.mocked(github.fetchCardContent).mockResolvedValue(`---
summary: No title
---
Body`);

      render(<CardPageClient />);

      await waitFor(() => {
        expect(screen.getByText("Missing title")).toBeInTheDocument();
      });
    });

    it("shows generic error for unknown errors", async () => {
      vi.mocked(github.getDefaultBranch).mockRejectedValue(
        new Error("Unknown error")
      );

      render(<CardPageClient />);

      await waitFor(() => {
        expect(screen.getByText("Fetch failed")).toBeInTheDocument();
      });
    });

    it("shows 'Try Another URL' button on error", async () => {
      vi.mocked(github.fetchCardContent).mockRejectedValue(
        new github.GitHubURLError("CARD_NOT_FOUND")
      );

      render(<CardPageClient />);

      await waitFor(() => {
        expect(
          screen.getByRole("link", { name: "Try Another URL" })
        ).toBeInTheDocument();
        expect(
          screen.getByRole("link", { name: "Try Another URL" })
        ).toHaveAttribute("href", "/");
      });
    });
  });

  describe("API calls", () => {
    beforeEach(() => {
      Object.defineProperty(window, "location", {
        value: { pathname: "/card/owner/repo" },
        writable: true,
      });
    });

    it("calls getDefaultBranch with owner and repo", async () => {
      render(<CardPageClient />);

      await waitFor(() => {
        expect(github.getDefaultBranch).toHaveBeenCalledWith("owner", "repo");
      });
    });

    it("constructs correct fetch URL for default card path", async () => {
      render(<CardPageClient />);

      await waitFor(() => {
        expect(github.fetchCardContent).toHaveBeenCalledWith(
          "https://raw.githubusercontent.com/owner/repo/main/.ishipped/card.md"
        );
      });
    });

    it("calls getRepoMetadata after successful fetch", async () => {
      render(<CardPageClient />);

      await waitFor(() => {
        expect(github.getRepoMetadata).toHaveBeenCalledWith("owner", "repo");
      });
    });

    it("calls renderMarkdown with card body", async () => {
      render(<CardPageClient />);

      await waitFor(() => {
        expect(markdown.renderMarkdown).toHaveBeenCalledWith(
          "This is the body content."
        );
      });
    });
  });

  describe("author's other cards", () => {
    beforeEach(() => {
      Object.defineProperty(window, "location", {
        value: { pathname: "/card/owner/repo" },
        writable: true,
      });
    });

    it("fetches author's other cards after card loads", async () => {
      render(<CardPageClient />);

      await waitFor(() => {
        expect(userApi.fetchUserCards).toHaveBeenCalledWith("testauthor");
      });
    });

    it("uses owner as author when no author.github specified", async () => {
      const cardWithoutAuthorGithub = `---
title: Test Project
---
Body`;

      vi.mocked(github.fetchCardContent).mockResolvedValue(cardWithoutAuthorGithub);

      render(<CardPageClient />);

      await waitFor(() => {
        expect(userApi.fetchUserCards).toHaveBeenCalledWith("owner");
      });
    });

    it("shows expand icon when author has other cards", async () => {
      const otherCards = [
        {
          path: "testauthor/other-repo",
          owner: "testauthor",
          repo: "other-repo",
          card: {
            frontmatter: { title: "Other Project" },
            body: "",
          },
        },
        {
          path: "testauthor/another-repo",
          owner: "testauthor",
          repo: "another-repo",
          card: {
            frontmatter: { title: "Another Project" },
            body: "",
          },
        },
      ];

      vi.mocked(userApi.fetchUserCards).mockResolvedValue(otherCards);

      render(<CardPageClient />);

      await waitFor(() => {
        expect(screen.getByText("+2 more")).toBeInTheDocument();
      });
    });

    it("excludes current card from other cards count", async () => {
      const allCards = [
        {
          path: "owner/repo", // Current card - should be excluded
          owner: "owner",
          repo: "repo",
          card: {
            frontmatter: { title: "Current Project" },
            body: "",
          },
        },
        {
          path: "owner/other-repo",
          owner: "owner",
          repo: "other-repo",
          card: {
            frontmatter: { title: "Other Project" },
            body: "",
          },
        },
      ];

      // Card author defaults to owner when not specified
      const cardWithOwnerAsAuthor = `---
title: Test Project
---
Body`;

      vi.mocked(github.fetchCardContent).mockResolvedValue(cardWithOwnerAsAuthor);
      vi.mocked(userApi.fetchUserCards).mockResolvedValue(allCards);

      render(<CardPageClient />);

      await waitFor(() => {
        // Should show +1 more (excluding current card)
        expect(screen.getByText("+1 more")).toBeInTheDocument();
      });
    });

    it("does not show expand icon when author has no other cards", async () => {
      vi.mocked(userApi.fetchUserCards).mockResolvedValue([]);

      render(<CardPageClient />);

      await waitFor(() => {
        expect(screen.getByText("Test Author")).toBeInTheDocument();
      });

      expect(screen.queryByText(/more/)).not.toBeInTheDocument();
    });

    it("silently handles API errors for other cards", async () => {
      vi.mocked(userApi.fetchUserCards).mockRejectedValue(
        new Error("API error")
      );

      render(<CardPageClient />);

      // Card should still render successfully
      await waitFor(() => {
        expect(screen.getByText("Test Project")).toBeInTheDocument();
      });

      // No error should be shown
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });
  });
});
