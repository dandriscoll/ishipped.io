import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Card Not Found - iShipped.io",
};

export default function NotFoundPage() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
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
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">Card not found</h1>
        <p className="text-muted dark:text-muted-dark mb-6">
          We couldn&apos;t find <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm">/.ishipped/card.md</code> in this repository.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="https://github.com/dandriscoll/ishipped.io/blob/main/SPEC.md"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-md transition-colors"
          >
            Learn how to create a card
          </a>
          <Link
            href="/"
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            Try another URL
          </Link>
        </div>
      </div>
    </div>
  );
}
