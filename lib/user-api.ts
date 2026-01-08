import { parseCard, type ParsedCard } from "./card";

export interface UserCard {
  path: string;
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
      parsedCards.push({
        path: card.path,
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
