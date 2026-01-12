import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthorBlock } from "@/components/AuthorBlock";
import type { CardAuthor } from "@/lib/card";

describe("AuthorBlock", () => {
  const basicAuthor: CardAuthor = {
    name: "Test Author",
    github: "testauthor",
  };

  describe("basic rendering", () => {
    it("renders author name", () => {
      render(<AuthorBlock author={basicAuthor} />);

      expect(screen.getByText("Test Author")).toBeInTheDocument();
    });

    it("renders GitHub username link", () => {
      render(<AuthorBlock author={basicAuthor} />);

      const link = screen.getByRole("link", { name: "@testauthor" });
      expect(link).toHaveAttribute("href", "https://github.com/testauthor");
    });

    it("renders avatar from GitHub", () => {
      render(<AuthorBlock author={basicAuthor} />);

      const avatar = screen.getByRole("img", { name: "Test Author" });
      expect(avatar).toHaveAttribute(
        "src",
        expect.stringContaining("github.com/testauthor.png")
      );
    });

    it("renders custom avatar when provided", () => {
      const authorWithAvatar: CardAuthor = {
        ...basicAuthor,
        avatar: "https://example.com/custom-avatar.png",
      };

      render(<AuthorBlock author={authorWithAvatar} />);

      const avatar = screen.getByRole("img", { name: "Test Author" });
      expect(avatar).toHaveAttribute(
        "src",
        expect.stringContaining("example.com/custom-avatar.png")
      );
    });

    it("renders personal website link when provided", () => {
      const authorWithUrl: CardAuthor = {
        ...basicAuthor,
        url: "https://example.com",
      };

      render(<AuthorBlock author={authorWithUrl} />);

      const websiteLink = screen.getByRole("link", { name: "example.com" });
      expect(websiteLink).toHaveAttribute("href", "https://example.com");
    });

    it("renders separator between GitHub and website links", () => {
      const authorWithUrl: CardAuthor = {
        ...basicAuthor,
        url: "https://example.com",
      };

      render(<AuthorBlock author={authorWithUrl} />);

      expect(screen.getByText("·")).toBeInTheDocument();
    });
  });

  describe("other cards expand icon", () => {
    it("does not show expand icon when otherCardsCount is 0", () => {
      render(
        <AuthorBlock
          author={basicAuthor}
          otherCardsCount={0}
          authorUsername="testauthor"
        />
      );

      expect(screen.queryByText(/more/)).not.toBeInTheDocument();
    });

    it("does not show expand icon when otherCardsCount is undefined", () => {
      render(<AuthorBlock author={basicAuthor} />);

      expect(screen.queryByText(/more/)).not.toBeInTheDocument();
    });

    it("shows expand icon when otherCardsCount > 0", () => {
      render(
        <AuthorBlock
          author={basicAuthor}
          otherCardsCount={3}
          authorUsername="testauthor"
        />
      );

      expect(screen.getByText("+3 more")).toBeInTheDocument();
    });

    it("links to user page when expand icon clicked", () => {
      render(
        <AuthorBlock
          author={basicAuthor}
          otherCardsCount={5}
          authorUsername="testauthor"
        />
      );

      const expandLink = screen.getByRole("link", { name: /\+5 more/ });
      expect(expandLink).toHaveAttribute("href", "/u/testauthor");
    });

    it("uses authorUsername prop for link", () => {
      render(
        <AuthorBlock
          author={basicAuthor}
          otherCardsCount={2}
          authorUsername="differentuser"
        />
      );

      const expandLink = screen.getByRole("link", { name: /\+2 more/ });
      expect(expandLink).toHaveAttribute("href", "/u/differentuser");
    });

    it("falls back to author.github when authorUsername not provided", () => {
      render(
        <AuthorBlock
          author={basicAuthor}
          otherCardsCount={4}
        />
      );

      const expandLink = screen.getByRole("link", { name: /\+4 more/ });
      expect(expandLink).toHaveAttribute("href", "/u/testauthor");
    });

    it("has correct title attribute for accessibility", () => {
      render(
        <AuthorBlock
          author={basicAuthor}
          otherCardsCount={3}
          authorUsername="testauthor"
        />
      );

      const expandLink = screen.getByRole("link", { name: /\+3 more/ });
      expect(expandLink).toHaveAttribute("title", "View all cards by @testauthor");
    });

    it("does not show expand icon when username is missing", () => {
      const authorWithoutGithub: CardAuthor = {
        name: "No GitHub",
      };

      render(
        <AuthorBlock
          author={authorWithoutGithub}
          otherCardsCount={3}
        />
      );

      // Should not show expand link since no username available
      expect(screen.queryByText(/more/)).not.toBeInTheDocument();
    });
  });

  describe("edge cases", () => {
    it("renders without GitHub username", () => {
      const authorWithoutGithub: CardAuthor = {
        name: "Anonymous Author",
      };

      render(<AuthorBlock author={authorWithoutGithub} />);

      expect(screen.getByText("Anonymous Author")).toBeInTheDocument();
      expect(screen.queryByText(/@/)).not.toBeInTheDocument();
    });

    it("renders with only URL (no GitHub)", () => {
      const authorWithUrlOnly: CardAuthor = {
        name: "Web Author",
        url: "https://webauthor.com",
      };

      render(<AuthorBlock author={authorWithUrlOnly} />);

      expect(screen.getByText("Web Author")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "webauthor.com" })).toBeInTheDocument();
    });
  });
});
