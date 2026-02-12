"use client";

import { useState } from "react";
import type { BrokenCard } from "@/lib/user-api";

export function BrokenCardsIndicator({
  brokenCards,
}: {
  brokenCards: BrokenCard[];
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (brokenCards.length === 0) return null;

  const displayCards = brokenCards.slice(0, 3);
  const remaining = brokenCards.length - displayCards.length;

  return (
    <div className="fixed bottom-6 right-6 z-30">
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute bottom-full right-0 mb-2 w-72 bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700 rounded-lg shadow-lg z-20 p-3">
            <p className="text-sm font-semibold text-orange-600 dark:text-orange-400 mb-2">
              Broken cards
            </p>
            <ul className="space-y-1">
              {displayCards.map((card) => (
                <li key={`${card.owner}/${card.repo}/${card.file}`}>
                  <a
                    href={card.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-orange-600 dark:text-orange-400 hover:underline block truncate"
                  >
                    {card.owner}/{card.repo}{" "}
                    <span className="text-orange-500 dark:text-orange-500">
                      .ishipped/{card.file}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            {remaining > 0 && (
              <p className="text-xs text-orange-500 dark:text-orange-500 mt-2">
                and {remaining} more...
              </p>
            )}
          </div>
        </>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`${brokenCards.length} broken card${brokenCards.length !== 1 ? "s" : ""}`}
        className="relative w-12 h-12 bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700 rounded-full flex items-center justify-center shadow-lg hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
      >
        <svg
          className="w-6 h-6 text-orange-600 dark:text-orange-400"
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
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
          {brokenCards.length}
        </span>
      </button>
    </div>
  );
}
