import { stringify } from "yaml";
import type { BuilderState } from "./builderValidation";

export function generateCardMarkdown(state: BuilderState): string {
  // Build frontmatter object, only including non-empty fields
  const frontmatter: Record<string, unknown> = {};

  // Required field
  frontmatter.title = state.title.trim() || "Untitled";

  // Optional string fields
  if (state.summary?.trim()) {
    frontmatter.summary = state.summary.trim();
  }
  if (state.hero?.trim()) {
    frontmatter.hero = state.hero.trim();
  }
  if (state.icon?.trim()) {
    frontmatter.icon = state.icon.trim();
  }
  if (state.shipped?.trim()) {
    frontmatter.shipped = state.shipped.trim();
  }
  if (state.version?.trim()) {
    frontmatter.version = state.version.trim();
  }

  // Tags (only non-empty)
  const validTags = state.tags.filter((t) => t.trim()).map((t) => t.trim());
  if (validTags.length > 0) {
    frontmatter.tags = validTags;
  }

  // Author (only if has meaningful content)
  const hasAuthor =
    state.author.name.trim() ||
    state.author.github.trim() ||
    state.author.url.trim() ||
    state.author.avatar.trim();
  if (hasAuthor) {
    const author: Record<string, string> = {};
    if (state.author.name?.trim()) author.name = state.author.name.trim();
    if (state.author.github?.trim()) author.github = state.author.github.trim();
    if (state.author.url?.trim()) author.url = state.author.url.trim();
    if (state.author.avatar?.trim()) author.avatar = state.author.avatar.trim();
    frontmatter.author = author;
  }

  // Links (only complete ones)
  const validLinks = state.links
    .filter((l) => l.label?.trim() && l.url?.trim())
    .map((l) => {
      const link: Record<string, unknown> = {
        label: l.label.trim(),
        url: l.url.trim(),
      };
      if (l.primary) {
        link.primary = true;
      }
      return link;
    });
  if (validLinks.length > 0) {
    frontmatter.links = validLinks;
  }

  // Repo override (only if both owner and name are provided)
  if (state.repo?.owner?.trim() && state.repo?.name?.trim()) {
    frontmatter.repo = {
      owner: state.repo.owner.trim(),
      name: state.repo.name.trim(),
    };
  }

  // Collaborators (only non-empty)
  const validCollaborators = state.collaborators
    .filter((c) => c.trim())
    .map((c) => c.trim());
  if (validCollaborators.length > 0) {
    frontmatter.collaborators = validCollaborators;
  }

  // Generate YAML with specific options for readability
  const yamlStr = stringify(frontmatter, {
    indent: 2,
    lineWidth: 0, // Don't wrap long lines
  });

  // Combine frontmatter and body
  const parts = ["---", yamlStr.trim(), "---"];
  if (state.body?.trim()) {
    parts.push("", state.body.trim());
  }

  return parts.join("\n");
}
