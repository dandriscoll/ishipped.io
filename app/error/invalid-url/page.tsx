import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Invalid URL - iShipped.io",
};

export default function InvalidURLPage() {
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
        <h1 className="text-2xl font-bold mb-2">Invalid GitHub URL</h1>
        <p className="text-muted dark:text-muted-dark mb-6">
          Please enter a valid GitHub repository or file URL.
        </p>
        <div className="bg-gray-50 dark:bg-surface-dark rounded-lg p-4 mb-6 text-left">
          <p className="text-sm font-medium mb-2">Accepted formats:</p>
          <ul className="text-sm text-muted dark:text-muted-dark space-y-1">
            <li>
              <code className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                https://github.com/owner/repo
              </code>
            </li>
            <li>
              <code className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                https://github.com/owner/repo/blob/main/path/to/file.md
              </code>
            </li>
          </ul>
        </div>
        <Link
          href="/"
          className="inline-block px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-md transition-colors"
        >
          Try again
        </Link>
      </div>
    </div>
  );
}
