import { redirect } from "next/navigation";
import { Suspense } from "react";
import {
  parseGitHubURL,
  getDefaultBranch,
  constructFetchURL,
  fetchCardContent,
  getRepoMetadata,
  GitHubURLError,
} from "@/lib/github";
import { parseCard, CardParseError } from "@/lib/card";
import { renderMarkdown } from "@/lib/markdown";
import { CardRenderer } from "@/components/CardRenderer";

interface PageProps {
  searchParams: Promise<{ url?: string }>;
}

function LoadingCard() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-8" />
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4" />
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-full mb-8" />
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
      </div>
    </div>
  );
}

async function CardContent({ url }: { url: string }) {
  try {
    // Parse the GitHub URL
    const parsed = parseGitHubURL(url);

    // Get the ref (branch/tag) if not specified
    const ref = parsed.ref || (await getDefaultBranch(parsed.owner, parsed.repo));

    // Construct and fetch the card content
    const fetchUrl = constructFetchURL(parsed, ref);
    const content = await fetchCardContent(fetchUrl);

    // Parse the card
    const card = parseCard(content, parsed.owner);

    // Render markdown body
    const bodyHtml = card.body ? await renderMarkdown(card.body) : "";

    // Get repo metadata
    const metadata = await getRepoMetadata(parsed.owner, parsed.repo);

    return (
      <CardRenderer
        card={card}
        bodyHtml={bodyHtml}
        owner={parsed.owner}
        repo={parsed.repo}
        metadata={metadata}
      />
    );
  } catch (error) {
    if (error instanceof GitHubURLError) {
      switch (error.code) {
        case "INVALID_URL":
          redirect("/error/invalid-url");
        case "CARD_NOT_FOUND":
          redirect("/error/not-found");
        case "PRIVATE_REPO":
          redirect("/error/private");
        case "RATE_LIMITED":
          redirect("/error/rate-limit");
        default:
          redirect("/error/not-found");
      }
    }

    if (error instanceof CardParseError) {
      redirect("/error/invalid-url");
    }

    // Unknown error
    console.error("Card fetch error:", error);
    redirect("/error/not-found");
  }
}

export default async function CardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const url = params.url;

  if (!url) {
    redirect("/error/invalid-url");
  }

  return (
    <Suspense fallback={<LoadingCard />}>
      <CardContent url={url} />
    </Suspense>
  );
}

export async function generateMetadata({ searchParams }: PageProps) {
  const params = await searchParams;
  const url = params.url;

  if (!url) {
    return { title: "Card Not Found - iShipped.io" };
  }

  try {
    const parsed = parseGitHubURL(url);
    const ref = parsed.ref || (await getDefaultBranch(parsed.owner, parsed.repo));
    const fetchUrl = constructFetchURL(parsed, ref);
    const content = await fetchCardContent(fetchUrl);
    const card = parseCard(content, parsed.owner);

    return {
      title: `${card.frontmatter.title} - iShipped.io`,
      description: card.frontmatter.summary || `Project card for ${parsed.owner}/${parsed.repo}`,
      openGraph: {
        title: card.frontmatter.title,
        description: card.frontmatter.summary,
        images: card.frontmatter.hero ? [card.frontmatter.hero] : [],
      },
    };
  } catch {
    return { title: "Card - iShipped.io" };
  }
}
