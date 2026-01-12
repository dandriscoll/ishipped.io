"use client";

import type { ParsedUserCard } from "@/lib/user-api";
import { formatShippedDate } from "@/lib/card";

interface TimelineProps {
  cards: ParsedUserCard[];
}

function TimelineItem({
  card,
  isLeft,
  isFirst,
  isLast,
}: {
  card: ParsedUserCard;
  isLeft: boolean;
  isFirst: boolean;
  isLast: boolean;
}) {
  const { frontmatter } = card.card;
  const cardUrl = `/card/${card.owner}/${card.repo}`;

  // Prefer icon, fallback to hero
  const imageUrl = frontmatter.icon || frontmatter.hero;

  const cardContent = (
    <div className="w-full md:w-80 p-4 bg-white dark:bg-surface-dark rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-accent/30 transition-all">
      <div className="flex items-start gap-3">
        {imageUrl && (
          <img
            src={imageUrl}
            alt=""
            className="w-12 h-12 rounded-full object-cover shrink-0 bg-gray-100 dark:bg-gray-800"
            onError={(e) => {
              // Hide broken images
              e.currentTarget.style.display = 'none';
            }}
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
  );

  return (
    <a href={cardUrl} className="group block">
      {/* Desktop layout */}
      <div className="hidden md:grid md:grid-cols-[1fr_auto_1fr] md:gap-4 items-center">
        {/* Left side */}
        <div className={`flex ${isLeft ? 'justify-end' : 'justify-end'}`}>
          {isLeft ? cardContent : (
            <span className="text-sm text-muted dark:text-muted-dark pr-4">
              {frontmatter.shipped && formatShippedDate(frontmatter.shipped)}
            </span>
          )}
        </div>

        {/* Center timeline */}
        <div className="flex flex-col items-center">
          {/* Line above */}
          <div className={`w-0.5 h-8 ${isFirst ? 'bg-transparent' : 'bg-gray-300 dark:bg-gray-600'}`} />
          {/* Node */}
          <div className="w-4 h-4 rounded-full bg-accent ring-4 ring-accent/20 shrink-0" />
          {/* Line below */}
          <div className={`w-0.5 h-8 ${isLast ? 'bg-transparent' : 'bg-gray-300 dark:bg-gray-600'}`} />
        </div>

        {/* Right side */}
        <div className={`flex ${isLeft ? 'justify-start' : 'justify-start'}`}>
          {isLeft ? (
            <span className="text-sm text-muted dark:text-muted-dark pl-4">
              {frontmatter.shipped && formatShippedDate(frontmatter.shipped)}
            </span>
          ) : cardContent}
        </div>
      </div>

      {/* Mobile layout */}
      <div className="flex md:hidden gap-4">
        {/* Timeline */}
        <div className="flex flex-col items-center">
          {/* Line above */}
          <div className={`w-0.5 h-4 ${isFirst ? 'bg-transparent' : 'bg-gray-300 dark:bg-gray-600'}`} />
          {/* Node */}
          <div className="w-3 h-3 rounded-full bg-accent ring-4 ring-accent/20 shrink-0" />
          {/* Line below */}
          <div className="w-0.5 flex-1 bg-gray-300 dark:bg-gray-600" />
        </div>

        {/* Content */}
        <div className="flex-1 pb-8">
          {frontmatter.shipped && (
            <span className="text-xs text-muted dark:text-muted-dark mb-2 block">
              {formatShippedDate(frontmatter.shipped)}
            </span>
          )}
          {cardContent}
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
    <div className="py-4">
      {sortedCards.map((card, index) => (
        <TimelineItem
          key={card.path}
          card={card}
          isLeft={index % 2 === 0}
          isFirst={index === 0}
          isLast={index === sortedCards.length - 1}
        />
      ))}
    </div>
  );
}
