export interface ParsedGitHubURL {
  owner: string;
  repo: string;
  ref: string | null;
  path: string | null;
  isFilePath: boolean;
}

export type GitHubError =
  | "INVALID_URL"
  | "CARD_NOT_FOUND"
  | "PRIVATE_REPO"
  | "RATE_LIMITED"
  | "FETCH_FAILED";

export class GitHubURLError extends Error {
  constructor(public code: GitHubError) {
    super(code);
    this.name = "GitHubURLError";
  }
}

export function parseGitHubURL(input: string): ParsedGitHubURL {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    throw new GitHubURLError("INVALID_URL");
  }

  if (url.protocol !== "https:" || url.hostname !== "github.com") {
    throw new GitHubURLError("INVALID_URL");
  }

  const segments = url.pathname.split("/").filter(Boolean);
  const owner = segments[0];
  const repo = segments[1]?.replace(/\.git$/, "");

  if (!owner || !repo) {
    throw new GitHubURLError("INVALID_URL");
  }

  let ref: string | null = null;
  let path: string | null = null;
  let isFilePath = false;

  if (segments[2] === "blob" || segments[2] === "tree") {
    ref = segments[3] || null;
    if (segments[2] === "blob" && segments.length > 4) {
      path = segments.slice(4).join("/");
      isFilePath = path.endsWith(".md");

      // Only .md files are allowed for file paths
      if (!isFilePath) {
        throw new GitHubURLError("INVALID_URL");
      }
    }
  }

  return { owner, repo, ref, path, isFilePath };
}

// Simple in-memory cache for default branches
const branchCache = new Map<string, { branch: string; expires: number }>();
const BRANCH_CACHE_TTL = 60 * 60 * 1000; // 1 hour

export async function getDefaultBranch(
  owner: string,
  repo: string
): Promise<string> {
  const cacheKey = `${owner}/${repo}`;
  const cached = branchCache.get(cacheKey);

  if (cached && cached.expires > Date.now()) {
    return cached.branch;
  }

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}`,
    {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "iShipped.io",
      },
      next: { revalidate: 3600 },
    }
  );

  if (response.status === 404) {
    throw new GitHubURLError("PRIVATE_REPO");
  }

  if (response.status === 403) {
    const remaining = response.headers.get("X-RateLimit-Remaining");
    if (remaining === "0") {
      throw new GitHubURLError("RATE_LIMITED");
    }
    throw new GitHubURLError("PRIVATE_REPO");
  }

  if (!response.ok) {
    throw new GitHubURLError("FETCH_FAILED");
  }

  const data = await response.json();
  const branch = data.default_branch || "main";

  branchCache.set(cacheKey, {
    branch,
    expires: Date.now() + BRANCH_CACHE_TTL,
  });

  return branch;
}

export function constructFetchURL(parsed: ParsedGitHubURL, ref: string): string {
  if (parsed.isFilePath && parsed.path) {
    return `https://raw.githubusercontent.com/${parsed.owner}/${parsed.repo}/${ref}/${parsed.path}`;
  }
  return `https://raw.githubusercontent.com/${parsed.owner}/${parsed.repo}/${ref}/.ishipped/card.md`;
}

export async function fetchCardContent(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      Accept: "text/plain",
      "User-Agent": "iShipped.io",
    },
    next: { revalidate: 300 }, // 5 minutes
  });

  if (response.status === 404) {
    throw new GitHubURLError("CARD_NOT_FOUND");
  }

  if (response.status === 403) {
    const remaining = response.headers.get("X-RateLimit-Remaining");
    if (remaining === "0") {
      throw new GitHubURLError("RATE_LIMITED");
    }
    throw new GitHubURLError("PRIVATE_REPO");
  }

  if (!response.ok) {
    throw new GitHubURLError("FETCH_FAILED");
  }

  return response.text();
}

export interface RepoMetadata {
  stars: number;
  license: string | null;
  description: string | null;
}

export async function getRepoMetadata(
  owner: string,
  repo: string
): Promise<RepoMetadata> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "iShipped.io",
        },
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      return { stars: 0, license: null, description: null };
    }

    const data = await response.json();
    return {
      stars: data.stargazers_count || 0,
      license: data.license?.spdx_id || null,
      description: data.description || null,
    };
  } catch {
    return { stars: 0, license: null, description: null };
  }
}
