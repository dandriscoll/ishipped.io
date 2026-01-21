import { parseCard, resolveIconUrl, resolveHeroUrl, type ParsedCard } from "./card";

export interface UserCard {
  path: string;
  file?: string;
  content: string;
}

export interface UserCardsResponse {
  username: string;
  cards: UserCard[];
  cached_at: string;
}

export interface ParsedUserCard {
  path: string;
  owner: string;
  repo: string;
  card: ParsedCard;
}

export type UserApiErrorCode =
  | "INVALID_USERNAME"
  | "USER_NOT_FOUND"
  | "RATE_LIMITED"
  | "FETCH_FAILED";

export class UserApiError extends Error {
  constructor(public code: UserApiErrorCode) {
    super(code);
    this.name = "UserApiError";
  }
}

const USERNAME_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;

export function isValidUsername(username: string): boolean {
  return USERNAME_REGEX.test(username);
}

export async function fetchUserCards(
  username: string
): Promise<ParsedUserCard[]> {
  if (!isValidUsername(username)) {
    throw new UserApiError("INVALID_USERNAME");
  }

  const response = await fetch(`/api/user/${username}`);

  if (response.status === 400) {
    throw new UserApiError("INVALID_USERNAME");
  }

  if (response.status === 404) {
    throw new UserApiError("USER_NOT_FOUND");
  }

  if (response.status === 429) {
    throw new UserApiError("RATE_LIMITED");
  }

  if (!response.ok) {
    throw new UserApiError("FETCH_FAILED");
  }

  const data: UserCardsResponse = await response.json();

  // Parse each card content
  const parsedCards: ParsedUserCard[] = [];

  for (const card of data.cards) {
    const [owner, repo] = card.path.split("/");
    if (!owner || !repo) continue;

    try {
      const parsed = parseCard(card.content, owner);

      // Resolve relative image URLs (default to main branch)
      const ref = "main";
      // Use the actual file path from the API, defaulting to card.md
      const fileName = card.file || "card.md";
      const cardPath = `.ishipped/${fileName}`;

      if (parsed.frontmatter.icon) {
        parsed.frontmatter.icon = resolveIconUrl(
          parsed.frontmatter.icon,
          owner,
          repo,
          ref,
          cardPath
        );
      }
      if (parsed.frontmatter.hero) {
        parsed.frontmatter.hero = resolveHeroUrl(
          parsed.frontmatter.hero,
          owner,
          repo,
          ref,
          cardPath
        );
      }

      // Construct the full path for the card URL
      // If file is not "card.md", include the file path so the URL becomes
      // /card/owner/repo/.ishipped/foo.md instead of /card/owner/repo
      const fullPath = fileName === "card.md"
        ? card.path
        : `${card.path}/${cardPath}`;

      parsedCards.push({
        path: fullPath,
        owner,
        repo,
        card: parsed,
      });
    } catch {
      // Skip cards that fail to parse
      console.warn(`Failed to parse card for ${card.path}`);
    }
  }

  return parsedCards;
}
