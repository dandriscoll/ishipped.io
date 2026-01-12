"use client";

import { useReducer, useMemo, useState, useEffect, useCallback } from "react";
import { ThemePicker, type CardTheme } from "@/components/ThemePicker";
import { CardRenderer } from "@/components/CardRenderer";
import { renderMarkdown } from "@/lib/markdown";
import { parseCard, type ParsedCard } from "@/lib/card";
import {
  type BuilderState,
  validateBuilderState,
  hasErrors,
} from "@/lib/builderValidation";
import { generateCardMarkdown } from "@/lib/cardGenerator";
import {
  getDefaultBranch,
  fetchCardContent,
  getRepoMetadata,
  GitHubURLError,
  type RepoMetadata,
} from "@/lib/github";
import { RepoInput } from "./RepoInput";
import { CardEditor } from "./CardEditor";
import { ValidationPanel } from "./ValidationPanel";
import { CopyButton } from "./CopyButton";

function createInitialState(): BuilderState {
  return {
    title: "",
    summary: "",
    hero: "",
    icon: "",
    shipped: "",
    version: "",
    tags: [],
    author: { name: "", github: "", url: "", avatar: "" },
    links: [],
    repo: { owner: "", name: "" },
    collaborators: [],
    body: "",
    repoOwner: "",
    repoName: "",
    loadingState: "idle",
    loadError: null,
  };
}

type BuilderAction =
  | { type: "SET_FIELD"; field: keyof BuilderState; value: string }
  | { type: "SET_TAGS"; tags: string[] }
  | { type: "SET_LINKS"; links: BuilderState["links"] }
  | { type: "SET_AUTHOR_FIELD"; field: keyof BuilderState["author"]; value: string }
  | { type: "SET_REPO_FIELD"; field: keyof BuilderState["repo"]; value: string }
  | { type: "SET_COLLABORATORS"; collaborators: string[] }
  | { type: "LOAD_FROM_CARD"; card: ParsedCard; owner: string; repo: string }
  | { type: "LOAD_FROM_METADATA"; metadata: RepoMetadata; owner: string; repo: string }
  | { type: "SET_LOADING"; state: BuilderState["loadingState"]; error?: string }
  | { type: "RESET" };

function builderReducer(state: BuilderState, action: BuilderAction): BuilderState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };

    case "SET_TAGS":
      return { ...state, tags: action.tags };

    case "SET_LINKS":
      return { ...state, links: action.links };

    case "SET_AUTHOR_FIELD":
      return {
        ...state,
        author: { ...state.author, [action.field]: action.value },
      };

    case "SET_REPO_FIELD":
      return {
        ...state,
        repo: { ...state.repo, [action.field]: action.value },
      };

    case "SET_COLLABORATORS":
      return { ...state, collaborators: action.collaborators };

    case "LOAD_FROM_CARD": {
      const { frontmatter, body } = action.card;
      const author =
        typeof frontmatter.author === "object" && frontmatter.author
          ? frontmatter.author
          : typeof frontmatter.author === "string"
          ? { name: frontmatter.author, github: "", url: "", avatar: "" }
          : { name: "", github: "", url: "", avatar: "" };

      return {
        ...state,
        title: frontmatter.title || "",
        summary: frontmatter.summary || "",
        hero: frontmatter.hero || "",
        icon: frontmatter.icon || "",
        shipped: frontmatter.shipped || "",
        version: frontmatter.version || "",
        tags: frontmatter.tags || [],
        author: {
          name: author.name || "",
          github: author.github || "",
          url: author.url || "",
          avatar: author.avatar || "",
        },
        links: (frontmatter.links || []).map((l, i) => ({
          id: `link-${i}-${Date.now()}`,
          label: l.label,
          url: l.url,
          primary: l.primary || false,
        })),
        repo: {
          owner: frontmatter.repo?.owner || "",
          name: frontmatter.repo?.name || "",
        },
        collaborators: frontmatter.collaborators || [],
        body: body || "",
        repoOwner: action.owner,
        repoName: action.repo,
        loadingState: "loaded",
        loadError: null,
      };
    }

    case "LOAD_FROM_METADATA":
      return {
        ...state,
        title: action.repo,
        summary: action.metadata.description || "",
        repoOwner: action.owner,
        repoName: action.repo,
        loadingState: "loaded",
        loadError: null,
      };

    case "SET_LOADING":
      return {
        ...state,
        loadingState: action.state,
        loadError: action.error || null,
      };

    case "RESET":
      return createInitialState();

    default:
      return state;
  }
}

export function BuilderPageClient() {
  const [state, dispatch] = useReducer(builderReducer, null, createInitialState);
  const [theme, setTheme] = useState<CardTheme>("default");
  const [bodyHtml, setBodyHtml] = useState("");
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  // Validation
  const validationErrors = useMemo(() => validateBuilderState(state), [state]);
  const hasValidationErrors = hasErrors(validationErrors);

  // Generate card.md output
  const cardOutput = useMemo(() => generateCardMarkdown(state), [state]);

  // Debounced markdown rendering
  useEffect(() => {
    if (!state.body.trim()) {
      setBodyHtml("");
      return;
    }

    const timer = setTimeout(async () => {
      const html = await renderMarkdown(state.body);
      setBodyHtml(html);
    }, 300);

    return () => clearTimeout(timer);
  }, [state.body]);

  // Construct ParsedCard for preview
  const previewCard: ParsedCard = useMemo(() => {
    const author = state.author.name || state.author.github
      ? {
          name: state.author.name || state.repoOwner,
          github: state.author.github || state.repoOwner,
          url: state.author.url || undefined,
          avatar: state.author.avatar || undefined,
        }
      : undefined;

    return {
      frontmatter: {
        title: state.title || "Untitled Project",
        summary: state.summary || undefined,
        hero: state.hero || undefined,
        icon: state.icon || undefined,
        shipped: state.shipped || undefined,
        version: state.version || undefined,
        tags: state.tags.filter(Boolean),
        author,
        links: state.links
          .filter((l) => l.label && l.url)
          .map(({ label, url, primary }) => ({ label, url, primary })),
        repo:
          state.repo.owner && state.repo.name
            ? { owner: state.repo.owner, name: state.repo.name }
            : undefined,
        collaborators: state.collaborators.filter(Boolean),
      },
      body: state.body,
    };
  }, [state]);

  const previewMetadata: RepoMetadata = useMemo(
    () => ({ stars: 0, license: null, description: null }),
    []
  );

  // Handle loading repo
  const handleLoadRepo = useCallback(
    async (owner: string, repo: string) => {
      dispatch({ type: "SET_LOADING", state: "loading" });

      try {
        const branch = await getDefaultBranch(owner, repo);
        const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/.ishipped/card.md`;

        try {
          const content = await fetchCardContent(url);
          const card = parseCard(content, owner);
          dispatch({ type: "LOAD_FROM_CARD", card, owner, repo });
        } catch (err) {
          if (err instanceof GitHubURLError && err.code === "CARD_NOT_FOUND") {
            // No card.md found, fetch metadata instead
            const metadata = await getRepoMetadata(owner, repo);
            dispatch({ type: "LOAD_FROM_METADATA", metadata, owner, repo });
          } else {
            throw err;
          }
        }
      } catch (err) {
        let errorMessage = "Failed to load repository";
        if (err instanceof GitHubURLError) {
          switch (err.code) {
            case "PRIVATE_REPO":
              errorMessage = "Repository not found or is private";
              break;
            case "RATE_LIMITED":
              errorMessage = "GitHub API rate limit exceeded. Try again later.";
              break;
            default:
              errorMessage = `GitHub error: ${err.code}`;
          }
        }
        dispatch({ type: "SET_LOADING", state: "error", error: errorMessage });
      }
    },
    []
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-bg-dark">
      {/* Top bar */}
      <div className="sticky top-14 z-40 bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-border-dark">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <RepoInput
              onLoad={handleLoadRepo}
              loading={state.loadingState === "loading"}
              error={state.loadError}
            />
            <div className="flex items-center gap-3">
              <ThemePicker onThemeChange={setTheme} />
              <CopyButton content={cardOutput} disabled={hasValidationErrors} />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor Panel */}
          <div
            className={`floating-card p-6 order-2 lg:order-1 ${
              showMobilePreview ? "hidden lg:block" : ""
            }`}
          >
            <CardEditor
              state={state}
              dispatch={dispatch}
              errors={validationErrors}
            />
          </div>

          {/* Preview Panel */}
          <div
            className={`lg:sticky lg:top-32 lg:self-start order-1 lg:order-2 ${
              !showMobilePreview ? "hidden lg:block" : ""
            }`}
          >
            <div
              className="floating-card overflow-hidden"
              style={{ maxHeight: "calc(100vh - 10rem)" }}
            >
              <div className="overflow-auto" style={{ maxHeight: "calc(100vh - 10rem)" }}>
                <CardRenderer
                  card={previewCard}
                  bodyHtml={bodyHtml}
                  owner={state.repoOwner || "owner"}
                  repo={state.repoName || "repo"}
                  ref="main"
                  metadata={previewMetadata}
                  theme={theme}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Validation Panel */}
        {validationErrors.length > 0 && (
          <div className="mt-6">
            <ValidationPanel errors={validationErrors} />
          </div>
        )}
      </div>

      {/* Mobile bottom bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white dark:bg-surface-dark border-t border-gray-200 dark:border-border-dark p-4 flex justify-between items-center z-50">
        <button
          onClick={() => setShowMobilePreview(!showMobilePreview)}
          className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          {showMobilePreview ? "Edit" : "Preview"}
        </button>
        <CopyButton content={cardOutput} disabled={hasValidationErrors} />
      </div>

      {/* Bottom padding for mobile bar */}
      <div className="h-20 lg:hidden" />
    </div>
  );
}
