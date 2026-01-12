"use client";

import { useEffect, useState } from "react";
import {
  fetchUserCards,
  isValidUsername,
  UserApiError,
  type ParsedUserCard,
} from "@/lib/user-api";
import { Timeline } from "@/components/Timeline";

type UserState =
  | { status: "loading" }
  | { status: "error"; code: string }
  | { status: "success"; username: string; cards: ParsedUserCard[] };

function LoadingState() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gray-100 dark:bg-bg-dark py-12 px-4">
      <div className="max-w-6xl mx-auto animate-pulse">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ErrorDisplay({ code }: { code: string }) {
  const errors: Record<string, { title: string; message: string }> = {
    INVALID_USERNAME: {
      title: "Invalid username",
      message: "The username format is invalid.",
    },
    INVALID_PATH: {
      title: "Invalid Path",
      message: "Please use the format /u/username",
    },
    USER_NOT_FOUND: {
      title: "User not found",
      message: "This GitHub user doesn't exist or has no public repositories.",
    },
    RATE_LIMITED: {
      title: "Rate limited",
      message: "API rate limit exceeded. Please try again in a few minutes.",
    },
    FETCH_FAILED: {
      title: "Fetch failed",
      message: "Failed to fetch user data. Please try again.",
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
          Go Home
        </a>
      </div>
    </div>
  );
}

function EmptyState({ username }: { username: string }) {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gray-100 dark:bg-bg-dark py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <UserHeader username={username} cardCount={0} />
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-muted dark:text-muted-dark"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">No shipped projects yet</h2>
          <p className="text-muted dark:text-muted-dark mb-6">
            This user hasn&apos;t added any .ishipped/card.md files to their
            repositories.
          </p>
          <a
            href="/"
            className="text-accent hover:underline"
          >
            Learn how to create a card
          </a>
        </div>
      </div>
    </div>
  );
}

function UserHeader({
  username,
  cardCount,
}: {
  username: string;
  cardCount: number;
}) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <img
        src={`https://github.com/${username}.png`}
        alt={username}
        className="w-16 h-16 rounded-full"
      />
      <div>
        <h1 className="text-2xl font-bold">{username}</h1>
        <p className="text-muted dark:text-muted-dark">
          {cardCount} shipped project{cardCount !== 1 ? "s" : ""}
        </p>
      </div>
      <a
        href={`https://github.com/${username}`}
        target="_blank"
        rel="noopener noreferrer"
        className="ml-auto text-muted dark:text-muted-dark hover:text-accent transition-colors"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path
            fillRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            clipRule="evenodd"
          />
        </svg>
      </a>
    </div>
  );
}

export function UserPageClient() {
  const [state, setState] = useState<UserState>({ status: "loading" });

  useEffect(() => {
    const pathname = window.location.pathname;
    const match = pathname.match(/^\/u\/([^/]+)\/?$/);

    if (!match) {
      setState({ status: "error", code: "INVALID_PATH" });
      return;
    }

    const username = match[1];

    if (!isValidUsername(username)) {
      setState({ status: "error", code: "INVALID_USERNAME" });
      return;
    }

    async function loadUserCards() {
      setState({ status: "loading" });

      try {
        const cards = await fetchUserCards(username);

        setState({
          status: "success",
          username,
          cards,
        });

        document.title = `${username}'s Ships - iShipped.io`;
      } catch (error) {
        if (error instanceof UserApiError) {
          setState({ status: "error", code: error.code });
        } else {
          console.error("User fetch error:", error);
          setState({ status: "error", code: "FETCH_FAILED" });
        }
      }
    }

    loadUserCards();
  }, []);

  if (state.status === "loading") {
    return <LoadingState />;
  }

  if (state.status === "error") {
    return <ErrorDisplay code={state.code} />;
  }

  if (state.cards.length === 0) {
    return <EmptyState username={state.username} />;
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gray-100 dark:bg-bg-dark py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <UserHeader username={state.username} cardCount={state.cards.length} />
        <Timeline cards={state.cards} />
      </div>
    </div>
  );
}
