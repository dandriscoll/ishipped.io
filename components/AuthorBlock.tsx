import Image from "next/image";
import Link from "next/link";
import type { CardAuthor } from "@/lib/card";

interface AuthorBlockProps {
  author: CardAuthor;
  otherCardsCount?: number;
  authorUsername?: string;
}

export function AuthorBlock({
  author,
  otherCardsCount = 0,
  authorUsername,
}: AuthorBlockProps) {
  const avatarUrl =
    author.avatar ||
    (author.github
      ? `https://github.com/${author.github}.png?size=96`
      : undefined);

  const username = authorUsername || author.github;

  return (
    <div className="flex items-center gap-3">
      {avatarUrl && (
        <Image
          src={avatarUrl}
          alt={author.name}
          width={48}
          height={48}
          className="rounded-full"
        />
      )}
      <div className="flex flex-col">
        <span className="font-medium">{author.name}</span>
        <div className="flex items-center gap-2 text-sm text-muted dark:text-muted-dark">
          {author.github && (
            <a
              href={`https://github.com/${author.github}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors"
            >
              @{author.github}
            </a>
          )}
          {author.github && author.url && <span>·</span>}
          {author.url && (
            <a
              href={author.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors"
            >
              {new URL(author.url).hostname}
            </a>
          )}
        </div>
      </div>

      {/* Expand icon for other cards */}
      {otherCardsCount > 0 && username && (
        <Link
          href={`/u/${username}/`}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted dark:text-muted-dark hover:text-accent hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          title={`View all cards by @${username}`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <span>+{otherCardsCount} more</span>
        </Link>
      )}
    </div>
  );
}
