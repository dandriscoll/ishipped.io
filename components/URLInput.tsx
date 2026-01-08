"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function URLInput() {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = input.trim().replace(/^\//, ""); // Remove leading slash if present
    if (!trimmed) {
      setError("Please enter a repository path");
      return;
    }

    // Parse owner/repo format
    const segments = trimmed.split("/").filter(Boolean);
    if (segments.length < 2) {
      setError("Please use the format: owner/repo");
      return;
    }

    // Validate owner and repo names (basic GitHub naming rules)
    const owner = segments[0];
    const repo = segments[1];
    if (!/^[a-zA-Z0-9_.-]+$/.test(owner) || !/^[a-zA-Z0-9_.-]+$/.test(repo)) {
      setError("Invalid owner or repository name");
      return;
    }

    router.push(`/card/${trimmed}`);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError(null);
          }}
          placeholder="owner/repo"
          className="flex-1 px-4 py-3 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-surface-dark focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent placeholder:text-muted dark:placeholder:text-muted-dark"
          aria-label="GitHub repository path"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 dark:focus:ring-offset-bg-dark"
        >
          View Card
        </button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </form>
  );
}
