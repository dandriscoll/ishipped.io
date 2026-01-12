import Image from "next/image";
import type { ParsedCard } from "@/lib/card";
import type { RepoMetadata } from "@/lib/github";
import { formatShippedDate, formatStars, resolveHeroUrl, resolveIconUrl, resolveImageUrls } from "@/lib/card";
import { AuthorBlock } from "./AuthorBlock";
import { TagList } from "./TagList";
import { LinkButtons } from "./LinkButtons";
import { ImageGallery } from "./ImageGallery";
import type { CardTheme } from "./ThemePicker";

interface CardRendererProps {
  card: ParsedCard;
  bodyHtml: string;
  owner: string;
  repo: string;
  ref: string;
  cardPath?: string;
  metadata: RepoMetadata;
  theme?: CardTheme;
}

export function CardRenderer({
  card,
  bodyHtml,
  owner,
  repo,
  ref,
  cardPath = ".ishipped/card.md",
  metadata,
  theme = "default",
}: CardRendererProps) {
  const { frontmatter } = card;
  const author =
    typeof frontmatter.author === "object"
      ? frontmatter.author
      : { name: frontmatter.author || owner, github: owner };

  // Use repo override if provided, otherwise fall back to the hosting repo
  const displayRepoOwner = frontmatter.repo?.owner || owner;
  const displayRepoName = frontmatter.repo?.name || repo;
  const collaborators = frontmatter.collaborators || [];

  // Resolve relative hero/icon URLs to absolute GitHub raw URLs (relative to card location)
  const resolvedHeroUrl = resolveHeroUrl(frontmatter.hero, owner, repo, ref, cardPath);
  const resolvedIconUrl = resolveIconUrl(frontmatter.icon, owner, repo, ref, cardPath);
  const resolvedImages = resolveImageUrls(frontmatter.images, owner, repo, ref, cardPath);

  return (
    <div
      className="min-h-[calc(100vh-3.5rem)] py-8 px-4 md:py-12 md:px-6 themed-page-bg"
      data-card-theme={theme !== "default" ? theme : undefined}
    >
      <article
        className="max-w-3xl mx-auto floating-card themed-card p-6 md:p-8 relative"
        data-card-theme={theme !== "default" ? theme : undefined}
      >
        {/* Theme-specific decorative overlay */}
        {theme !== "default" && <div className="theme-overlay" aria-hidden="true" />}

        {/* Icon in top-right corner */}
        {resolvedIconUrl && (
          <div className="absolute top-4 right-4 md:top-6 md:right-6 z-10">
            <Image
              src={resolvedIconUrl}
              alt=""
              width={64}
              height={64}
              className="w-12 h-12 md:w-16 md:h-16 rounded-lg object-cover shadow-md"
            />
          </div>
        )}

        {/* Hero Image */}
      {resolvedHeroUrl && (
        <div className="mb-8 rounded-lg overflow-hidden">
          <Image
            src={resolvedHeroUrl}
            alt={frontmatter.title}
            width={800}
            height={400}
            className="w-full h-auto object-cover"
            priority
          />
        </div>
      )}

      {/* Image Gallery */}
      {resolvedImages.length > 0 && (
        <ImageGallery images={resolvedImages} />
      )}

      {/* Title and Version */}
      <header className="mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-3xl font-bold">{frontmatter.title}</h1>
          {frontmatter.version && (
            <span className="px-2 py-0.5 text-sm bg-gray-100 dark:bg-gray-800 text-muted dark:text-muted-dark rounded-md font-mono">
              {frontmatter.version}
            </span>
          )}
        </div>
        {frontmatter.summary && (
          <p className="mt-2 text-lg text-muted dark:text-muted-dark">
            {frontmatter.summary}
          </p>
        )}
      </header>

      {/* Tags */}
      {frontmatter.tags && frontmatter.tags.length > 0 && (
        <div className="mb-6">
          <TagList tags={frontmatter.tags} />
        </div>
      )}

      {/* Links */}
      {frontmatter.links && frontmatter.links.length > 0 && (
        <div className="mb-8">
          <LinkButtons links={frontmatter.links} />
        </div>
      )}

      {/* Divider */}
      {bodyHtml && (
        <hr className="my-8 border-gray-200 dark:border-gray-700" />
      )}

      {/* Body Content */}
      {bodyHtml && (
        <div
          className="card-body"
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />
      )}

      {/* Author and Metadata */}
      <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <AuthorBlock author={author} />
          {frontmatter.shipped && (
            <div className="text-sm text-muted dark:text-muted-dark">
              Shipped on {formatShippedDate(frontmatter.shipped)}
            </div>
          )}
        </div>

        {/* Collaborators */}
        {collaborators.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-muted dark:text-muted-dark mb-3">
              Collaborators
            </h3>
            <div className="flex flex-wrap gap-2">
              {collaborators.map((collab) => (
                <a
                  key={collab}
                  href={`https://github.com/${collab}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <img
                    src={`https://github.com/${collab}.png?size=32`}
                    alt={collab}
                    className="w-5 h-5 rounded-full"
                  />
                  <span className="text-sm font-medium">@{collab}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Repo Info */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-surface-dark rounded-lg">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm">
              <a
                href={`https://github.com/${displayRepoOwner}/${displayRepoName}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:text-accent transition-colors"
              >
                {displayRepoOwner}/{displayRepoName}
              </a>
              {metadata.stars > 0 && (
                <>
                  <span className="text-muted dark:text-muted-dark">·</span>
                  <span className="text-muted dark:text-muted-dark flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {formatStars(metadata.stars)}
                  </span>
                </>
              )}
              {metadata.license && (
                <>
                  <span className="text-muted dark:text-muted-dark">·</span>
                  <span className="text-muted dark:text-muted-dark">
                    {metadata.license}
                  </span>
                </>
              )}
            </div>
            <a
              href={`https://github.com/${displayRepoOwner}/${displayRepoName}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-accent hover:underline inline-flex items-center gap-1"
            >
              View Repository
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
      </article>
    </div>
  );
}
