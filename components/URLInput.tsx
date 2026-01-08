"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function URLInput() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = url.trim();
    if (!trimmed) {
      setError("Please enter a GitHub URL");
      return;
    }

    // Basic validation
    if (!trimmed.startsWith("https://github.com/")) {
      setError("URL must start with https://github.com/");
      return;
    }

    router.push(`/card?url=${encodeURIComponent(trimmed)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError(null);
          }}
          placeholder="https://github.com/owner/repo"
          className="flex-1 px-4 py-3 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-surface-dark focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent placeholder:text-muted dark:placeholder:text-muted-dark"
          aria-label="GitHub repository URL"
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
