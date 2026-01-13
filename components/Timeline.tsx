"use client";

import type { ParsedUserCard } from "@/lib/user-api";
import { formatShippedDate } from "@/lib/card";

interface TimelineProps {
  cards: ParsedUserCard[];
}

function TimelineNode({ imageUrl }: { imageUrl?: string }) {
  if (imageUrl) {
    return (
      <div className="w-12 h-12 rounded-full ring-4 ring-accent/20 shrink-0 overflow-hidden bg-gray-100 dark:bg-gray-800">
        <img
          src={imageUrl}
          alt=""
          className="w-full h-full object-cover"
          onError={(e) => {
            // Replace with accent circle on error using safe DOM methods
            const parent = e.currentTarget.parentElement;
            if (parent) {
              // Clear children safely without innerHTML
              while (parent.firstChild) {
                parent.removeChild(parent.firstChild);
              }
              parent.className = "w-12 h-12 rounded-full bg-accent ring-4 ring-accent/20 shrink-0";
            }
          }}
        />
      </div>
    );
  }
  return <div className="w-12 h-12 rounded-full bg-accent ring-4 ring-accent/20 shrink-0" />;
}

function TimelineNodeMobile({ imageUrl }: { imageUrl?: string }) {
  if (imageUrl) {
    return (
      <div className="w-8 h-8 rounded-full ring-4 ring-accent/20 shrink-0 overflow-hidden bg-gray-100 dark:bg-gray-800">
        <img
          src={imageUrl}
          alt=""
          className="w-full h-full object-cover"
          onError={(e) => {
            // Replace with accent circle on error using safe DOM methods
            const parent = e.currentTarget.parentElement;
            if (parent) {
              // Clear children safely without innerHTML
              while (parent.firstChild) {
                parent.removeChild(parent.firstChild);
              }
              parent.className = "w-8 h-8 rounded-full bg-accent ring-4 ring-accent/20 shrink-0";
            }
          }}
        />
      </div>
    );
  }
  return <div className="w-8 h-8 rounded-full bg-accent ring-4 ring-accent/20 shrink-0" />;
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
  const cardUrl = `/card/${card.path}`;

  // Prefer icon, fallback to hero
  const imageUrl = frontmatter.icon || frontmatter.hero;

  const cardContent = (
    <a
      href={cardUrl}
      className="block w-full md:w-80 p-4 bg-white dark:bg-surface-dark rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-accent/30 transition-all group"
    >
      <h3 className="font-semibold text-base truncate group-hover:text-accent transition-colors">
        {frontmatter.title}
      </h3>
      {frontmatter.summary && (
        <p className="text-sm text-muted dark:text-muted-dark line-clamp-2 mt-1">
          {frontmatter.summary}
        </p>
      )}
    </a>
  );

  return (
    <div>
      {/* Desktop layout */}
      <div className="hidden md:grid md:grid-cols-[1fr_auto_1fr] md:gap-4 items-center">
        {/* Left side */}
        <div className="flex justify-end">
          {isLeft ? cardContent : (
            <span className="text-sm text-muted dark:text-muted-dark pr-4">
              {frontmatter.shipped && formatShippedDate(frontmatter.shipped)}
            </span>
          )}
        </div>

        {/* Center timeline */}
        <div className="flex flex-col items-center">
          {/* Line above */}
          <div className={`w-0.5 h-6 ${isFirst ? 'bg-transparent' : 'bg-gray-300 dark:bg-gray-600'}`} />
          {/* Node with image */}
          <TimelineNode imageUrl={imageUrl} />
          {/* Line below */}
          <div className={`w-0.5 h-6 ${isLast ? 'bg-transparent' : 'bg-gray-300 dark:bg-gray-600'}`} />
        </div>

        {/* Right side */}
        <div className="flex justify-start">
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
          <div className={`w-0.5 h-3 ${isFirst ? 'bg-transparent' : 'bg-gray-300 dark:bg-gray-600'}`} />
          {/* Node with image */}
          <TimelineNodeMobile imageUrl={imageUrl} />
          {/* Line below */}
          <div className={`w-0.5 flex-1 ${isLast ? 'bg-transparent' : 'bg-gray-300 dark:bg-gray-600'}`} />
        </div>

        {/* Content */}
        <div className="flex-1 pb-6">
          {frontmatter.shipped && (
            <span className="text-xs text-muted dark:text-muted-dark mb-2 block">
              {formatShippedDate(frontmatter.shipped)}
            </span>
          )}
          {cardContent}
        </div>
      </div>
    </div>
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
