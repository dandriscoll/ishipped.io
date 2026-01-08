"use client";

import Image from "next/image";
import type { ParsedUserCard } from "@/lib/user-api";
import { formatShippedDate } from "@/lib/card";
import { TagList } from "./TagList";

interface UserCardGridProps {
  cards: ParsedUserCard[];
}

function CardPreview({ card }: { card: ParsedUserCard }) {
  const { frontmatter } = card.card;
  const cardUrl = `/card/${card.owner}/${card.repo}`;

  return (
    <a
      href={cardUrl}
      className="block bg-white dark:bg-surface-dark rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-200 dark:border-gray-700"
    >
      {/* Hero Image */}
      {frontmatter.hero && (
        <div className="aspect-video relative overflow-hidden bg-gray-100 dark:bg-gray-800">
          <Image
            src={frontmatter.hero}
            alt={frontmatter.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      <div className="p-4">
        {/* Title and Version */}
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-lg truncate">{frontmatter.title}</h3>
          {frontmatter.version && (
            <span className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-muted dark:text-muted-dark rounded font-mono shrink-0">
              {frontmatter.version}
            </span>
          )}
        </div>

        {/* Summary */}
        {frontmatter.summary && (
          <p className="text-sm text-muted dark:text-muted-dark line-clamp-2 mb-3">
            {frontmatter.summary}
          </p>
        )}

        {/* Tags */}
        {frontmatter.tags && frontmatter.tags.length > 0 && (
          <div className="mb-3">
            <TagList tags={frontmatter.tags.slice(0, 3)} />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted dark:text-muted-dark pt-3 border-t border-gray-100 dark:border-gray-700">
          <span className="truncate">
            {card.owner}/{card.repo}
          </span>
          {frontmatter.shipped && (
            <span className="shrink-0 ml-2">
              {formatShippedDate(frontmatter.shipped)}
            </span>
          )}
        </div>
      </div>
    </a>
  );
}

export function UserCardGrid({ cards }: UserCardGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card) => (
        <CardPreview key={card.path} card={card} />
      ))}
    </div>
  );
}
