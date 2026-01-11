"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getDefaultBranch,
  fetchCardContent,
  getRepoMetadata,
  GitHubURLError,
  type RepoMetadata,
} from "@/lib/github";
import { parseCard, CardParseError, type ParsedCard } from "@/lib/card";
import { renderMarkdown } from "@/lib/markdown";
import { CardRenderer } from "@/components/CardRenderer";
import { ThemePicker, type CardTheme } from "@/components/ThemePicker";

type CardState =
  | { status: "loading" }
  | { status: "error"; code: string }
  | {
      status: "success";
      card: ParsedCard;
      bodyHtml: string;
      owner: string;
      repo: string;
      ref: string;
      cardPath: string;
      metadata: RepoMetadata;
    };

function LoadingCard() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-8" />
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4" />
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-full mb-8" />
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
      </div>
    </div>
  );
}

function ErrorDisplay({ code }: { code: string }) {
  const errors: Record<string, { title: string; message: string }> = {
    INVALID_PATH: {
      title: "Invalid Path",
      message: "Please use the format /card/owner/repo or /card/owner/repo/path/to/file.md",
    },
    CARD_NOT_FOUND: {
      title: "Card not found",
      message: "We couldn't find /.ishipped/card.md in this repository.",
    },
    PRIVATE_REPO: {
      title: "Repository not accessible",
      message:
        "This repository is private or doesn't exist. iShipped.io only works with public repositories.",
    },
    RATE_LIMITED: {
      title: "Rate limited",
      message: "GitHub's rate limit exceeded. Please try again in a few minutes.",
    },
    FETCH_FAILED: {
      title: "Fetch failed",
      message: "Failed to fetch the card. Please try again.",
    },
    INVALID_FORMAT: {
      title: "Invalid card format",
      message: "The card file is missing required YAML frontmatter.",
    },
    MISSING_TITLE: {
      title: "Missing title",
      message: "The card must have a title field in its frontmatter.",
    },
  };

  const error = errors[code] || {
    title: "Something went wrong",
    message: "An unexpected error occurred.",
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-red-600 dark:text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">{error.title}</h1>
        <p className="text-muted dark:text-muted-dark mb-6">{error.message}</p>
        <a
          href="/"
          className="inline-block px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-md transition-colors"
        >
          Try Another URL
        </a>
      </div>
    </div>
  );
}

export function CardPageClient() {
  const [state, setState] = useState<CardState>({ status: "loading" });
  const [theme, setTheme] = useState<CardTheme>("default");

  const handleThemeChange = useCallback((newTheme: CardTheme) => {
    setTheme(newTheme);
  }, []);

  useEffect(() => {
    // Parse path from window.location (e.g., /card/owner/repo or /card/owner/repo/path/to/file.md)
    const pathname = window.location.pathname;
    const match = pathname.match(/^\/card\/(.+)$/);

    if (!match) {
      setState({ status: "error", code: "INVALID_PATH" });
      return;
    }

    const pathSegments = match[1].split("/").filter(Boolean);

    if (pathSegments.length < 2) {
      setState({ status: "error", code: "INVALID_PATH" });
      return;
    }

    const owner = pathSegments[0];
    const repo = pathSegments[1];
    const filePath = pathSegments.length > 2 ? pathSegments.slice(2).join("/") : null;

    // Validate file path if provided (must be .md)
    if (filePath && !filePath.endsWith(".md")) {
      setState({ status: "error", code: "INVALID_PATH" });
      return;
    }

    async function loadCard() {
      setState({ status: "loading" });

      try {
        // Get the default branch
        const ref = await getDefaultBranch(owner, repo);

        // Construct fetch URL
        const fetchUrl = filePath
          ? `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${filePath}`
          : `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/.ishipped/card.md`;

        const content = await fetchCardContent(fetchUrl);

        // Parse the card
        const card = parseCard(content, owner);

        // Render markdown body
        const bodyHtml = card.body ? await renderMarkdown(card.body) : "";

        // Get repo metadata - use override repo if specified, otherwise hosting repo
        const metadataOwner = card.frontmatter.repo?.owner || owner;
        const metadataRepo = card.frontmatter.repo?.name || repo;
        const metadata = await getRepoMetadata(metadataOwner, metadataRepo);

        // Card path for resolving relative URLs
        const cardPath = filePath || ".ishipped/card.md";

        setState({
          status: "success",
          card,
          bodyHtml,
          owner,
          repo,
          ref,
          cardPath,
          metadata,
        });

        // Update document title
        document.title = `${card.frontmatter.title} - iShipped.io`;
      } catch (error) {
        if (error instanceof GitHubURLError) {
          setState({ status: "error", code: error.code });
        } else if (error instanceof CardParseError) {
          setState({ status: "error", code: error.code });
        } else {
          console.error("Card fetch error:", error);
          setState({ status: "error", code: "FETCH_FAILED" });
        }
      }
    }

    loadCard();
  }, []);

  if (state.status === "loading") {
    return <LoadingCard />;
  }

  if (state.status === "error") {
    return <ErrorDisplay code={state.code} />;
  }

  return (
    <div className="relative">
      {/* Theme Picker - fixed position */}
      <div className="fixed bottom-4 right-4 z-50">
        <ThemePicker onThemeChange={handleThemeChange} dropUp />
      </div>

      <CardRenderer
        card={state.card}
        bodyHtml={state.bodyHtml}
        owner={state.owner}
        repo={state.repo}
        ref={state.ref}
        cardPath={state.cardPath}
        metadata={state.metadata}
        theme={theme}
      />
    </div>
  );
}
