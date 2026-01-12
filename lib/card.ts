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

export interface CardRepo {
  owner: string;
  name: string;
}

export interface CardImage {
  url: string;
  alt?: string;
  caption?: string;
}

export interface CardFrontmatter {
  title: string;
  summary?: string;
  hero?: string;
  icon?: string;
  shipped?: string;
  version?: string;
  tags?: string[];
  author?: CardAuthor | string;
  links?: CardLink[];
  repo?: CardRepo;
  collaborators?: string[];
  images?: CardImage[];
  theme?: "default" | "ocean" | "forest" | "sunset" | "lavender" | "midnight" | "ruby";
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

function isRelativePath(path: string): boolean {
  // Check if it's a relative path (not a full URL)
  return !path.startsWith("http://") && !path.startsWith("https://") && !path.startsWith("data:");
}

function validateHeroUrl(hero: unknown): string | undefined {
  if (typeof hero !== "string") return undefined;

  const trimmed = hero.trim();
  if (!trimmed) return undefined;

  // Allow relative paths (will be resolved later with repo context)
  if (isRelativePath(trimmed)) {
    // Basic validation for relative paths
    if (trimmed.includes("..")) return undefined; // No parent directory traversal
    return trimmed;
  }

  // For absolute URLs, require HTTPS and allowed hosts
  if (!isValidHttpsUrl(trimmed)) return undefined;

  try {
    const url = new URL(trimmed);
    const allowedHosts = [
      "raw.githubusercontent.com",
      "user-images.githubusercontent.com",
      "avatars.githubusercontent.com",
      "i.imgur.com",
    ];
    if (!allowedHosts.some((h) => url.hostname === h || url.hostname.endsWith(`.${h}`))) {
      return undefined;
    }
    return trimmed;
  } catch {
    return undefined;
  }
}

function resolveRelativeImageUrl(
  imagePath: string | undefined,
  owner: string,
  repo: string,
  ref: string,
  cardPath: string = ".ishipped/card.md"
): string | undefined {
  if (!imagePath) return undefined;

  // If it's already an absolute URL, return as-is
  if (!isRelativePath(imagePath)) {
    return imagePath;
  }

  // Get the directory containing the card
  const cardDir = cardPath.includes("/")
    ? cardPath.substring(0, cardPath.lastIndexOf("/"))
    : "";

  // Remove leading ./ if present
  const cleanPath = imagePath.replace(/^\.\//, "");

  // Resolve relative to card directory
  const resolvedPath = cardDir ? `${cardDir}/${cleanPath}` : cleanPath;

  return `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${resolvedPath}`;
}

export function resolveHeroUrl(
  hero: string | undefined,
  owner: string,
  repo: string,
  ref: string,
  cardPath: string = ".ishipped/card.md"
): string | undefined {
  return resolveRelativeImageUrl(hero, owner, repo, ref, cardPath);
}

export function resolveIconUrl(
  icon: string | undefined,
  owner: string,
  repo: string,
  ref: string,
  cardPath: string = ".ishipped/card.md"
): string | undefined {
  return resolveRelativeImageUrl(icon, owner, repo, ref, cardPath);
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

function validateRepo(repo: unknown): CardRepo | undefined {
  if (!repo || typeof repo !== "object") return undefined;

  const obj = repo as Record<string, unknown>;
  const owner = typeof obj.owner === "string" ? obj.owner.trim() : "";
  const name = typeof obj.name === "string" ? obj.name.trim() : "";

  if (!owner || !name) return undefined;

  // Validate GitHub username/repo name format (alphanumeric, hyphens, underscores)
  const validPattern = /^[a-zA-Z0-9_-]+$/;
  if (!validPattern.test(owner) || !validPattern.test(name)) return undefined;

  return { owner, name };
}

function validateCollaborators(collaborators: unknown): string[] {
  if (!Array.isArray(collaborators)) return [];

  // Validate GitHub username format
  const validPattern = /^[a-zA-Z0-9_-]+$/;

  return collaborators
    .filter((c): c is string => typeof c === "string")
    .map((c) => c.trim())
    .filter((c) => c.length > 0 && c.length <= 39 && validPattern.test(c))
    .slice(0, 20); // Max 20 collaborators
}

function validateImages(images: unknown): CardImage[] {
  if (!Array.isArray(images)) return [];

  const validated: CardImage[] = [];

  for (const image of images.slice(0, 10)) {
    if (typeof image !== "object" || image === null) continue;

    const obj = image as Record<string, unknown>;
    const url = typeof obj.url === "string" ? obj.url.trim() : "";

    if (!url) continue;

    // Validate URL using same rules as hero/icon
    const validatedUrl = validateHeroUrl(url);
    if (!validatedUrl) continue;

    const alt = typeof obj.alt === "string" ? obj.alt.trim() : undefined;
    const caption = typeof obj.caption === "string" ? obj.caption.trim() : undefined;

    validated.push({
      url: validatedUrl,
      alt: alt || undefined,
      caption: caption || undefined,
    });
  }

  return validated;
}

function validateTheme(theme: unknown): CardFrontmatter["theme"] {
  if (typeof theme !== "string") return undefined;
  
  const validThemes = ["default", "ocean", "forest", "sunset", "lavender", "midnight", "ruby"];
  const trimmed = theme.trim().toLowerCase();
  
  if (validThemes.includes(trimmed)) {
    return trimmed as CardFrontmatter["theme"];
  }
  
  return undefined;
}

export function resolveImageUrls(
  images: CardImage[] | undefined,
  owner: string,
  repo: string,
  ref: string,
  cardPath: string = ".ishipped/card.md"
): CardImage[] {
  if (!images || images.length === 0) return [];

  return images.map((image) => ({
    ...image,
    url: resolveRelativeImageUrl(image.url, owner, repo, ref, cardPath) || image.url,
  }));
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
    icon: validateHeroUrl(frontmatterRaw.icon),
    shipped: validateShippedDate(frontmatterRaw.shipped),
    version:
      typeof frontmatterRaw.version === "string"
        ? frontmatterRaw.version.trim().slice(0, 20)
        : undefined,
    tags: validateTags(frontmatterRaw.tags),
    author: validateAuthor(frontmatterRaw.author, repoOwner),
    links: validateLinks(frontmatterRaw.links),
    repo: validateRepo(frontmatterRaw.repo),
    collaborators: validateCollaborators(frontmatterRaw.collaborators),
    images: validateImages(frontmatterRaw.images),
    theme: validateTheme(frontmatterRaw.theme),
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
