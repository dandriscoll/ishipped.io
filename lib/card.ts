import { parse as parseYaml } from "yaml";

export interface CardLink {
  label: string;
  url: string;
  primary?: boolean;
}

export interface CardAuthor {
  name: string;
  github?: string;
  url?: string;
  avatar?: string;
}

export interface CardFrontmatter {
  title: string;
  summary?: string;
  hero?: string;
  shipped?: string;
  version?: string;
  tags?: string[];
  author?: CardAuthor | string;
  links?: CardLink[];
}

export interface ParsedCard {
  frontmatter: CardFrontmatter;
  body: string;
}

export class CardParseError extends Error {
  constructor(
    message: string,
    public code: "INVALID_FORMAT" | "MISSING_TITLE"
  ) {
    super(message);
    this.name = "CardParseError";
  }
}

function isValidHttpsUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

function validateAuthor(
  author: unknown,
  repoOwner: string
): CardAuthor | undefined {
  if (!author) {
    return { name: repoOwner, github: repoOwner };
  }

  if (typeof author === "string") {
    return { name: author, github: repoOwner };
  }

  if (typeof author === "object" && author !== null) {
    const obj = author as Record<string, unknown>;
    const name = typeof obj.name === "string" ? obj.name.trim() : repoOwner;
    const github =
      typeof obj.github === "string" ? obj.github.trim() : repoOwner;
    const url =
      typeof obj.url === "string" && isValidHttpsUrl(obj.url)
        ? obj.url
        : undefined;
    const avatar =
      typeof obj.avatar === "string" && isValidHttpsUrl(obj.avatar)
        ? obj.avatar
        : undefined;

    return { name, github, url, avatar };
  }

  return { name: repoOwner, github: repoOwner };
}

function validateLinks(links: unknown): CardLink[] {
  if (!Array.isArray(links)) {
    return [];
  }

  const validated: CardLink[] = [];
  let hasPrimary = false;

  for (const link of links.slice(0, 10)) {
    if (typeof link !== "object" || link === null) continue;

    const obj = link as Record<string, unknown>;
    const label = typeof obj.label === "string" ? obj.label.trim() : "";
    const url = typeof obj.url === "string" ? obj.url.trim() : "";

    if (!label || !url || label.length > 50) continue;
    if (!isValidHttpsUrl(url)) continue;

    const isPrimary = obj.primary === true && !hasPrimary;
    if (isPrimary) hasPrimary = true;

    validated.push({ label, url, primary: isPrimary });
  }

  return validated;
}

function validateTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) {
    return [];
  }

  return tags
    .filter((t): t is string => typeof t === "string")
    .map((t) => t.trim())
    .filter((t) => t.length > 0 && t.length <= 30)
    .slice(0, 10);
}

function validateHeroUrl(hero: unknown): string | undefined {
  if (typeof hero !== "string") return undefined;
  if (!isValidHttpsUrl(hero)) return undefined;

  // Only allow certain domains for hero images
  try {
    const url = new URL(hero);
    const allowedHosts = [
      "raw.githubusercontent.com",
      "user-images.githubusercontent.com",
      "avatars.githubusercontent.com",
      "i.imgur.com",
    ];
    if (!allowedHosts.some((h) => url.hostname === h || url.hostname.endsWith(`.${h}`))) {
      return undefined;
    }
    return hero;
  } catch {
    return undefined;
  }
}

function validateShippedDate(shipped: unknown): string | undefined {
  if (typeof shipped !== "string") return undefined;

  // Accept YYYY-MM-DD or full ISO 8601
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})?)?$/;
  if (!isoDateRegex.test(shipped)) return undefined;

  const date = new Date(shipped);
  if (isNaN(date.getTime())) return undefined;

  return shipped;
}

export function parseCard(content: string, repoOwner: string): ParsedCard {
  // Extract frontmatter between --- delimiters
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);

  if (!match) {
    throw new CardParseError(
      "Card must have YAML frontmatter between --- delimiters",
      "INVALID_FORMAT"
    );
  }

  let frontmatterRaw: Record<string, unknown>;
  try {
    frontmatterRaw = parseYaml(match[1]) || {};
  } catch {
    throw new CardParseError("Invalid YAML in frontmatter", "INVALID_FORMAT");
  }

  if (typeof frontmatterRaw !== "object" || frontmatterRaw === null) {
    throw new CardParseError("Frontmatter must be an object", "INVALID_FORMAT");
  }

  const title =
    typeof frontmatterRaw.title === "string"
      ? frontmatterRaw.title.trim()
      : null;

  if (!title || title.length === 0) {
    throw new CardParseError("Card must have a title", "MISSING_TITLE");
  }

  if (title.length > 100) {
    throw new CardParseError(
      "Title must be 100 characters or less",
      "INVALID_FORMAT"
    );
  }

  const summary =
    typeof frontmatterRaw.summary === "string"
      ? frontmatterRaw.summary.trim().slice(0, 280)
      : undefined;

  const frontmatter: CardFrontmatter = {
    title,
    summary: summary || undefined,
    hero: validateHeroUrl(frontmatterRaw.hero),
    shipped: validateShippedDate(frontmatterRaw.shipped),
    version:
      typeof frontmatterRaw.version === "string"
        ? frontmatterRaw.version.trim().slice(0, 20)
        : undefined,
    tags: validateTags(frontmatterRaw.tags),
    author: validateAuthor(frontmatterRaw.author, repoOwner),
    links: validateLinks(frontmatterRaw.links),
  };

  return {
    frontmatter,
    body: match[2].trim(),
  };
}

export function formatShippedDate(dateStr: string): string {
  // Parse as local date to avoid timezone shift issues
  // "2016-03-01" should display as March 1, not Feb 29 in western timezones
  const [year, month, day] = dateStr.split("T")[0].split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatStars(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
}
