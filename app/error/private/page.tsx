import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Repository Not Accessible - iShipped.io",
};

export default function PrivateRepoPage() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-yellow-600 dark:text-yellow-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">Repository not accessible</h1>
        <p className="text-muted dark:text-muted-dark mb-6">
          This repository is private or doesn&apos;t exist. iShipped.io only
          works with public repositories.
        </p>
        <Link
          href="/"
          className="inline-block px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-md transition-colors"
        >
          Try another URL
        </Link>
      </div>
    </div>
  );
}
