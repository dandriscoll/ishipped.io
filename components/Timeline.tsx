"use client";

import type { ParsedUserCard } from "@/lib/user-api";
import { formatShippedDate } from "@/lib/card";

interface TimelineProps {
  cards: ParsedUserCard[];
}

function TimelineItem({
  card,
  position,
}: {
  card: ParsedUserCard;
  position: "left" | "right";
}) {
  const { frontmatter } = card.card;
  const cardUrl = `/card/${card.owner}/${card.repo}`;

  // Prefer icon, fallback to hero
  const imageUrl = frontmatter.icon || frontmatter.hero;

  return (
    <a
      href={cardUrl}
      className="group block"
    >
      {/* Desktop layout */}
      <div className="hidden md:flex items-center gap-6">
        {/* Left side content (for left-positioned cards) */}
        {position === "left" && (
          <div className="flex-1 flex justify-end">
            <div className="max-w-sm p-4 bg-white dark:bg-surface-dark rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 group-hover:shadow-md group-hover:border-accent/30 transition-all">
              <div className="flex items-start gap-4">
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover shrink-0 ring-2 ring-gray-100 dark:ring-gray-700"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-base truncate group-hover:text-accent transition-colors">
                    {frontmatter.title}
                  </h3>
                  {frontmatter.summary && (
                    <p className="text-sm text-muted dark:text-muted-dark line-clamp-2 mt-1">
                      {frontmatter.summary}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Timeline node with date */}
        <div className="flex flex-col items-center shrink-0 w-32">
          <div className="w-4 h-4 rounded-full bg-accent ring-4 ring-accent/20 group-hover:ring-accent/40 transition-all" />
          {frontmatter.shipped && (
            <span className="mt-2 text-xs text-muted dark:text-muted-dark whitespace-nowrap">
              {formatShippedDate(frontmatter.shipped)}
            </span>
          )}
        </div>

        {/* Right side content (for right-positioned cards) */}
        {position === "right" && (
          <div className="flex-1">
            <div className="max-w-sm p-4 bg-white dark:bg-surface-dark rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 group-hover:shadow-md group-hover:border-accent/30 transition-all">
              <div className="flex items-start gap-4">
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover shrink-0 ring-2 ring-gray-100 dark:ring-gray-700"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-base truncate group-hover:text-accent transition-colors">
                    {frontmatter.title}
                  </h3>
                  {frontmatter.summary && (
                    <p className="text-sm text-muted dark:text-muted-dark line-clamp-2 mt-1">
                      {frontmatter.summary}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty spacer for opposite side */}
        {position === "left" && <div className="flex-1" />}
        {position === "right" && <div className="flex-1 hidden" />}
      </div>

      {/* Mobile layout */}
      <div className="flex md:hidden items-start gap-4">
        {/* Timeline line and node */}
        <div className="flex flex-col items-center shrink-0">
          <div className="w-3 h-3 rounded-full bg-accent ring-4 ring-accent/20" />
          <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-700 min-h-[2rem]" />
        </div>

        {/* Card content */}
        <div className="flex-1 pb-6">
          {frontmatter.shipped && (
            <span className="text-xs text-muted dark:text-muted-dark mb-2 block">
              {formatShippedDate(frontmatter.shipped)}
            </span>
          )}
          <div className="p-4 bg-white dark:bg-surface-dark rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 group-hover:shadow-md group-hover:border-accent/30 transition-all">
            <div className="flex items-start gap-3">
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-gray-100 dark:ring-gray-700"
                />
              )}
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-base truncate group-hover:text-accent transition-colors">
                  {frontmatter.title}
                </h3>
                {frontmatter.summary && (
                  <p className="text-sm text-muted dark:text-muted-dark line-clamp-2 mt-1">
                    {frontmatter.summary}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}

export function Timeline({ cards }: TimelineProps) {
  // Sort cards by shipped date (newest first)
  const sortedCards = [...cards].sort((a, b) => {
    const dateA = a.card.frontmatter.shipped || "";
    const dateB = b.card.frontmatter.shipped || "";
    return dateB.localeCompare(dateA);
  });

  return (
    <div className="relative">
      {/* Desktop center line */}
      <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700 -translate-x-1/2" />

      {/* Timeline items */}
      <div className="space-y-8 md:space-y-6">
        {sortedCards.map((card, index) => (
          <TimelineItem
            key={card.path}
            card={card}
            position={index % 2 === 0 ? "left" : "right"}
          />
        ))}
      </div>
    </div>
  );
}
