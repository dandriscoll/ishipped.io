import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { UserPageClient } from "@/components/UserPageClient";

// Mock the user-api module
vi.mock("@/lib/user-api", () => ({
  fetchUserCards: vi.fn(),
  isValidUsername: vi.fn(),
  UserApiError: class extends Error {
    constructor(public code: string) {
      super(code);
    }
  },
}));

import * as userApi from "@/lib/user-api";

describe("UserPageClient", () => {
  const mockCards = [
    {
      path: "octocat/hello-world",
      owner: "octocat",
      repo: "hello-world",
      card: {
        frontmatter: {
          title: "Hello World",
          summary: "My first project",
          version: "1.0.0",
          shipped: "2024-01-15",
          tags: ["javascript", "node"],
        },
        body: "Body content",
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
          tags: ["typescript", "react"],
        },
        body: "",
      },
    },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(userApi.isValidUsername).mockReturnValue(true);
    vi.mocked(userApi.fetchUserCards).mockResolvedValue(mockCards);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("path parsing", () => {
    it("parses /u/username path", async () => {
      Object.defineProperty(window, "location", {
        value: { pathname: "/u/octocat" },
        writable: true,
      });

      render(<UserPageClient />);

      await waitFor(() => {
        expect(userApi.fetchUserCards).toHaveBeenCalledWith("octocat");
      });
    });

    it("parses /u/username/ path with trailing slash", async () => {
      Object.defineProperty(window, "location", {
        value: { pathname: "/u/octocat/" },
        writable: true,
      });

      render(<UserPageClient />);

      await waitFor(() => {
        expect(userApi.fetchUserCards).toHaveBeenCalledWith("octocat");
      });
    });

    it("shows error for invalid path format", async () => {
      Object.defineProperty(window, "location", {
        value: { pathname: "/u/" },
        writable: true,
      });

      render(<UserPageClient />);

      await waitFor(() => {
        expect(screen.getByText("Invalid Path")).toBeInTheDocument();
      });
    });

    it("shows error for path with extra segments", async () => {
      Object.defineProperty(window, "location", {
        value: { pathname: "/u/user/extra/path" },
        writable: true,
      });

      render(<UserPageClient />);

      await waitFor(() => {
        expect(screen.getByText("Invalid Path")).toBeInTheDocument();
      });
    });

    it("shows error for invalid username format", async () => {
      Object.defineProperty(window, "location", {
        value: { pathname: "/u/-invalid" },
        writable: true,
      });

      vi.mocked(userApi.isValidUsername).mockReturnValue(false);

      render(<UserPageClient />);

      await waitFor(() => {
        expect(screen.getByText("Invalid username")).toBeInTheDocument();
      });
    });
  });

  describe("loading state", () => {
    it("shows loading skeleton initially", () => {
      Object.defineProperty(window, "location", {
        value: { pathname: "/u/octocat" },
        writable: true,
      });

      // Make the fetch hang
      vi.mocked(userApi.fetchUserCards).mockImplementation(
        () => new Promise(() => {})
      );

      render(<UserPageClient />);

      expect(document.querySelector(".animate-pulse")).toBeTruthy();
    });
  });

  describe("successful rendering", () => {
    beforeEach(() => {
      Object.defineProperty(window, "location", {
        value: { pathname: "/u/octocat" },
        writable: true,
      });
    });

    it("renders user avatar", async () => {
      render(<UserPageClient />);

      await waitFor(() => {
        const avatar = screen.getByRole("img", { name: "octocat" });
        expect(avatar).toBeInTheDocument();
        expect(avatar).toHaveAttribute(
          "src",
          "https://github.com/octocat.png"
        );
      });
    });

    it("renders username", async () => {
      render(<UserPageClient />);

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "octocat" })).toBeInTheDocument();
      });
    });

    it("renders card count", async () => {
      render(<UserPageClient />);

      await waitFor(() => {
        expect(screen.getByText("2 shipped projects")).toBeInTheDocument();
      });
    });

    it("renders singular for 1 project", async () => {
      vi.mocked(userApi.fetchUserCards).mockResolvedValue([mockCards[0]]);

      render(<UserPageClient />);

      await waitFor(() => {
        expect(screen.getByText("1 shipped project")).toBeInTheDocument();
      });
    });

    it("renders card titles", async () => {
      render(<UserPageClient />);

      await waitFor(() => {
        // Timeline renders each card twice (desktop + mobile layouts)
        expect(screen.getAllByText("Hello World")).toHaveLength(2);
        expect(screen.getAllByText("Awesome App")).toHaveLength(2);
      });
    });

    it("renders card summaries", async () => {
      render(<UserPageClient />);

      await waitFor(() => {
        // Timeline renders each card twice (desktop + mobile layouts)
        expect(screen.getAllByText("My first project")).toHaveLength(2);
        expect(screen.getAllByText("Another great project")).toHaveLength(2);
      });
    });

    it("renders card links to full card pages", async () => {
      render(<UserPageClient />);

      await waitFor(() => {
        const links = screen.getAllByRole("link");
        const cardLinks = links.filter(
          (link) =>
            link.getAttribute("href")?.startsWith("/card/") ?? false
        );
        expect(cardLinks).toHaveLength(2);
        expect(cardLinks[0]).toHaveAttribute("href", "/card/octocat/hello-world");
        expect(cardLinks[1]).toHaveAttribute("href", "/card/octocat/awesome-app");
      });
    });

    it("renders GitHub profile link", async () => {
      render(<UserPageClient />);

      await waitFor(() => {
        const githubLink = screen.getByRole("link", { name: "" });
        expect(githubLink).toHaveAttribute(
          "href",
          "https://github.com/octocat"
        );
      });
    });

    it("updates document title", async () => {
      render(<UserPageClient />);

      await waitFor(() => {
        expect(document.title).toBe("octocat's Ships - iShipped.io");
      });
    });
  });

  describe("empty state", () => {
    beforeEach(() => {
      Object.defineProperty(window, "location", {
        value: { pathname: "/u/emptyuser" },
        writable: true,
      });
      vi.mocked(userApi.fetchUserCards).mockResolvedValue([]);
    });

    it("shows empty state message", async () => {
      render(<UserPageClient />);

      await waitFor(() => {
        expect(screen.getByText("No shipped projects yet")).toBeInTheDocument();
      });
    });

    it("shows helpful message about card files", async () => {
      render(<UserPageClient />);

      await waitFor(() => {
        expect(
          screen.getByText(/hasn't added any \.ishipped\/card\.md files/)
        ).toBeInTheDocument();
      });
    });

    it("shows link to learn more", async () => {
      render(<UserPageClient />);

      await waitFor(() => {
        expect(
          screen.getByRole("link", { name: "Learn how to create a card" })
        ).toHaveAttribute("href", "/");
      });
    });

    it("shows 0 shipped projects in header", async () => {
      render(<UserPageClient />);

      await waitFor(() => {
        expect(screen.getByText("0 shipped projects")).toBeInTheDocument();
      });
    });
  });

  describe("error states", () => {
    beforeEach(() => {
      Object.defineProperty(window, "location", {
        value: { pathname: "/u/testuser" },
        writable: true,
      });
    });

    it("shows error for USER_NOT_FOUND", async () => {
      vi.mocked(userApi.fetchUserCards).mockRejectedValue(
        new userApi.UserApiError("USER_NOT_FOUND")
      );

      render(<UserPageClient />);

      await waitFor(() => {
        expect(screen.getByText("User not found")).toBeInTheDocument();
        expect(
          screen.getByText(/doesn't exist or has no public repositories/)
        ).toBeInTheDocument();
      });
    });

    it("shows error for RATE_LIMITED", async () => {
      vi.mocked(userApi.fetchUserCards).mockRejectedValue(
        new userApi.UserApiError("RATE_LIMITED")
      );

      render(<UserPageClient />);

      await waitFor(() => {
        expect(screen.getByText("Rate limited")).toBeInTheDocument();
      });
    });

    it("shows error for FETCH_FAILED", async () => {
      vi.mocked(userApi.fetchUserCards).mockRejectedValue(
        new userApi.UserApiError("FETCH_FAILED")
      );

      render(<UserPageClient />);

      await waitFor(() => {
        expect(screen.getByText("Fetch failed")).toBeInTheDocument();
      });
    });

    it("shows error for INVALID_USERNAME from API", async () => {
      vi.mocked(userApi.fetchUserCards).mockRejectedValue(
        new userApi.UserApiError("INVALID_USERNAME")
      );

      render(<UserPageClient />);

      await waitFor(() => {
        expect(screen.getByText("Invalid username")).toBeInTheDocument();
      });
    });

    it("shows generic error for unknown errors", async () => {
      vi.mocked(userApi.fetchUserCards).mockRejectedValue(
        new Error("Unknown error")
      );

      render(<UserPageClient />);

      await waitFor(() => {
        expect(screen.getByText("Fetch failed")).toBeInTheDocument();
      });
    });

    it("shows 'Go Home' button on error", async () => {
      vi.mocked(userApi.fetchUserCards).mockRejectedValue(
        new userApi.UserApiError("USER_NOT_FOUND")
      );

      render(<UserPageClient />);

      await waitFor(() => {
        expect(screen.getByRole("link", { name: "Go Home" })).toHaveAttribute(
          "href",
          "/"
        );
      });
    });
  });
});
