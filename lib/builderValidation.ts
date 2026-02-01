export interface ValidationError {
  field: string;
  message: string;
  severity: "error" | "warning";
}

function isValidHttpsUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

function isRelativePath(path: string): boolean {
  return !path.startsWith("http://") && !path.startsWith("https://") && !path.startsWith("data:");
}

function isValidImageUrl(url: string): boolean {
  // Allow relative paths
  if (isRelativePath(url)) {
    // Basic validation for relative paths
    if (url.includes("..")) return false; // No parent directory traversal
    return true;
  }

  // For absolute URLs, require HTTPS and allowed hosts
  if (!isValidHttpsUrl(url)) return false;
  try {
    const parsedUrl = new URL(url);
    const allowedHosts = [
      "raw.githubusercontent.com",
      "user-images.githubusercontent.com",
      "avatars.githubusercontent.com",
      "i.imgur.com",
    ];
    return allowedHosts.some(
      (h) => parsedUrl.hostname === h || parsedUrl.hostname.endsWith(`.${h}`)
    );
  } catch {
    return false;
  }
}

function isValidShippedDate(shipped: string): boolean {
  const isoDateRegex =
    /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})?)?$/;
  if (!isoDateRegex.test(shipped)) return false;
  const date = new Date(shipped);
  return !isNaN(date.getTime());
}

export interface BuilderState {
  title: string;
  summary: string;
  hero: string;
  icon: string;
  shipped: string;
  version: string;
  tags: string[];
  author: {
    name: string;
    github: string;
    url: string;
    avatar: string;
  };
  links: Array<{
    id: string;
    label: string;
    url: string;
    primary: boolean;
  }>;
  repo: {
    owner: string;
    name: string;
  };
  collaborators: string[];
  images: Array<{
    id: string;
    url: string;
    alt: string;
    caption: string;
  }>;
  theme: string;
  body: string;
  repoOwner: string;
  repoName: string;
  loadingState: "idle" | "loading" | "loaded" | "error";
  loadError: string | null;
}

export function validateBuilderState(state: BuilderState): ValidationError[] {
  const errors: ValidationError[] = [];

  // Title validation (required, max 100 chars)
  if (!state.title.trim()) {
    errors.push({
      field: "title",
      message: "Title is required",
      severity: "error",
    });
  } else if (state.title.length > 100) {
    errors.push({
      field: "title",
      message: "Title must be 100 characters or less",
      severity: "error",
    });
  }

  // Summary validation (max 280 chars)
  if (state.summary.length > 280) {
    errors.push({
      field: "summary",
      message: "Summary must be 280 characters or less",
      severity: "error",
    });
  }

  // Hero URL validation (relative path or HTTPS from allowed domains)
  if (state.hero.trim() && !isValidImageUrl(state.hero)) {
    errors.push({
      field: "hero",
      message:
        "Hero must be a relative path or HTTPS URL from allowed domains (raw.githubusercontent.com, i.imgur.com, etc.)",
      severity: "error",
    });
  }

  // Icon URL validation (relative path or HTTPS from allowed domains)
  if (state.icon.trim() && !isValidImageUrl(state.icon)) {
    errors.push({
      field: "icon",
      message:
        "Icon must be a relative path or HTTPS URL from allowed domains (raw.githubusercontent.com, i.imgur.com, etc.)",
      severity: "error",
    });
  }

  // Shipped date validation (ISO 8601)
  if (state.shipped.trim() && !isValidShippedDate(state.shipped)) {
    errors.push({
      field: "shipped",
      message: "Shipped must be a valid date (YYYY-MM-DD)",
      severity: "error",
    });
  }

  // Version validation (max 20 chars)
  if (state.version.length > 20) {
    errors.push({
      field: "version",
      message: "Version must be 20 characters or less",
      severity: "error",
    });
  }

  // Tags validation (max 10, each max 30 chars)
  const nonEmptyTags = state.tags.filter((t) => t.trim());
  if (nonEmptyTags.length > 10) {
    errors.push({
      field: "tags",
      message: "Maximum 10 tags allowed",
      severity: "error",
    });
  }
  state.tags.forEach((tag, i) => {
    if (tag.trim() && tag.length > 30) {
      errors.push({
        field: `tags[${i}]`,
        message: `Tag "${tag.slice(0, 20)}..." exceeds 30 characters`,
        severity: "error",
      });
    }
  });

  // Links validation (max 10, each needs label/url, HTTPS)
  const nonEmptyLinks = state.links.filter((l) => l.label.trim() || l.url.trim());
  if (nonEmptyLinks.length > 10) {
    errors.push({
      field: "links",
      message: "Maximum 10 links allowed",
      severity: "error",
    });
  }
  state.links.forEach((link, i) => {
    if (!link.label.trim() && link.url.trim()) {
      errors.push({
        field: `links[${i}].label`,
        message: "Link label is required",
        severity: "error",
      });
    }
    if (link.label.trim() && !link.url.trim()) {
      errors.push({
        field: `links[${i}].url`,
        message: "Link URL is required",
        severity: "error",
      });
    }
    if (link.url.trim() && !isValidHttpsUrl(link.url)) {
      errors.push({
        field: `links[${i}].url`,
        message: "Link URL must be HTTPS",
        severity: "error",
      });
    }
    if (link.label && link.label.length > 50) {
      errors.push({
        field: `links[${i}].label`,
        message: "Link label must be 50 characters or less",
        severity: "error",
      });
    }
  });

  // Author URL validation
  if (state.author.url.trim() && !isValidHttpsUrl(state.author.url)) {
    errors.push({
      field: "author.url",
      message: "Author URL must be HTTPS",
      severity: "error",
    });
  }
  if (state.author.avatar.trim() && !isValidHttpsUrl(state.author.avatar)) {
    errors.push({
      field: "author.avatar",
      message: "Author avatar must be HTTPS URL",
      severity: "error",
    });
  }

  // Repo override validation (if either is provided, both must be)
  const validGitHubPattern = /^[a-zA-Z0-9_-]+$/;
  const hasRepoOwner = state.repo.owner.trim();
  const hasRepoName = state.repo.name.trim();
  if (hasRepoOwner && !hasRepoName) {
    errors.push({
      field: "repo.name",
      message: "Repository name is required when owner is specified",
      severity: "error",
    });
  }
  if (hasRepoName && !hasRepoOwner) {
    errors.push({
      field: "repo.owner",
      message: "Repository owner is required when name is specified",
      severity: "error",
    });
  }
  if (hasRepoOwner && !validGitHubPattern.test(state.repo.owner)) {
    errors.push({
      field: "repo.owner",
      message: "Invalid GitHub username format",
      severity: "error",
    });
  }
  if (hasRepoName && !validGitHubPattern.test(state.repo.name)) {
    errors.push({
      field: "repo.name",
      message: "Invalid repository name format",
      severity: "error",
    });
  }

  // Collaborators validation (max 20, valid GitHub usernames)
  const nonEmptyCollaborators = state.collaborators.filter((c) => c.trim());
  if (nonEmptyCollaborators.length > 20) {
    errors.push({
      field: "collaborators",
      message: "Maximum 20 collaborators allowed",
      severity: "error",
    });
  }
  state.collaborators.forEach((collab, i) => {
    if (collab.trim() && !validGitHubPattern.test(collab)) {
      errors.push({
        field: `collaborators[${i}]`,
        message: `"${collab.slice(0, 20)}..." is not a valid GitHub username`,
        severity: "error",
      });
    }
    if (collab.trim() && collab.length > 39) {
      errors.push({
        field: `collaborators[${i}]`,
        message: `GitHub username too long (max 39 characters)`,
        severity: "error",
      });
    }
  });

  // Images validation (max 10, valid URLs)
  const nonEmptyImages = state.images.filter((img) => img.url.trim());
  if (nonEmptyImages.length > 10) {
    errors.push({
      field: "images",
      message: "Maximum 10 images allowed",
      severity: "error",
    });
  }
  state.images.forEach((image, i) => {
    if (image.url.trim() && !isValidImageUrl(image.url)) {
      errors.push({
        field: `images[${i}].url`,
        message:
          "Image URL must be a relative path or HTTPS URL from allowed domains",
        severity: "error",
      });
    }
  });

  return errors;
}

export function getFieldError(
  errors: ValidationError[],
  field: string
): string | undefined {
  const error = errors.find((e) => e.field === field && e.severity === "error");
  return error?.message;
}

export function hasErrors(errors: ValidationError[]): boolean {
  return errors.some((e) => e.severity === "error");
}
