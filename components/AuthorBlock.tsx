import Image from "next/image";
import type { CardAuthor } from "@/lib/card";

interface AuthorBlockProps {
  author: CardAuthor;
}

export function AuthorBlock({ author }: AuthorBlockProps) {
  const avatarUrl =
    author.avatar ||
    (author.github
      ? `https://github.com/${author.github}.png?size=96`
      : undefined);

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
    </div>
  );
}
