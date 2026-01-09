"use client";

import { useState, type FormEvent } from "react";

interface RepoInputProps {
  onLoad: (owner: string, repo: string) => void;
  loading: boolean;
  error: string | null;
}

export function RepoInput({ onLoad, loading, error }: RepoInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    // Try to parse as GitHub URL
    try {
      const url = new URL(trimmed);
      if (url.hostname === "github.com") {
        const segments = url.pathname.split("/").filter(Boolean);
        if (segments.length >= 2) {
          onLoad(segments[0], segments[1].replace(/\.git$/, ""));
          return;
        }
      }
    } catch {
      // Not a URL, try as owner/repo
    }

    // Try to parse as owner/repo
    const match = trimmed.match(/^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/);
    if (match) {
      onLoad(match[1], match[2]);
      return;
    }

    // Invalid format - the parent component will handle this
    onLoad(trimmed, "");
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 max-w-xl">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="owner/repo or GitHub URL"
            disabled={loading}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent placeholder:text-gray-400 dark:placeholder:text-gray-500 disabled:opacity-50"
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg
                className="animate-spin h-5 w-5 text-accent"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Load
        </button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        Enter a GitHub repo to load an existing card or pre-fill with repo details
      </p>
    </form>
  );
}
