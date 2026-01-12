import Image from "next/image";
import { URLInput } from "@/components/URLInput";
import { FlippingCard } from "@/components/FlippingCard";

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Image
            src="/ishipped.io.png"
            alt="iShipped.io"
            width={128}
            height={128}
            className="mx-auto mb-8 p-4 rounded-2xl shadow-lg"
          />
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Ship it. Show it. Share it.
          </h1>
          <p className="text-lg text-muted dark:text-muted-dark mb-8 max-w-xl mx-auto">
            Project cards for GitHub repos. Add a card.md to your repo and get a
            beautiful shareable page.
          </p>
          <URLInput />
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-surface-dark">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">How It Works</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-accent text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold mb-2">Add a card</h3>
              <p className="text-sm text-muted dark:text-muted-dark">
                Create <code className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm">/.ishipped/card.md</code> in your repo
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-accent text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="font-semibold mb-2">Write your content</h3>
              <p className="text-sm text-muted dark:text-muted-dark">
                Use YAML frontmatter for metadata and Markdown for the body
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-accent text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold mb-2">Share the link</h3>
              <p className="text-sm text-muted dark:text-muted-dark">
                Get a clean, shareable URL for your project
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Card Format */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Card Format</h2>
          <FlippingCard />
          <div className="mt-8 text-center">
            <a
              href="https://github.com/dandriscoll/ishipped.io/blob/main/SPEC.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline inline-flex items-center gap-1"
            >
              View full specification
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Agent Instructions */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-surface-dark">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-center">Using a Coding Agent?</h2>
          <p className="text-center text-muted dark:text-muted-dark mb-6">
            Give your agent these instructions to create a card for your project:
          </p>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-border dark:border-border-dark">
            <pre className="whitespace-pre-wrap text-sm font-mono text-gray-800 dark:text-gray-200 leading-relaxed">{`Create an iShipped.io card for this project at /.ishipped/card.md

Follow this format:
---
title: "Project Name"
summary: "One punchy line. What does it do?"
hero: "./hero.png"
shipped: YYYY-MM-DD
tags: [max, five, tags]
links:
  - label: "Try It"
    url: "https://..."
    primary: true
images:
  - url: "./screenshot.png"
    alt: "Main view"
---

## What is it?
2-3 sentences. No jargon. What problem does it solve?

## Key Features
- **Bold feature** — Brief explanation
- Keep it to 3-5 features
- Lead with the most impressive one

Writing style:
- Be direct. Cut filler words.
- Use active voice ("Syncs files" not "Files are synced")
- Show, don't tell ("Deploys in 30 seconds" beats "Fast deployment")
- If you can delete a word without losing meaning, delete it

Spec: https://github.com/dandriscoll/ishipped.io/blob/main/SPEC.md
Example: https://github.com/dandriscoll/ishipped.io/blob/main/.ishipped/card.md`}</pre>
          </div>
          <p className="text-center text-sm text-muted dark:text-muted-dark mt-4">
            Copy these instructions directly into your agent chat.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border dark:border-border-dark">
        <div className="max-w-3xl mx-auto text-center text-sm text-muted dark:text-muted-dark">
          <p>
            iShipped.io is open source.{" "}
            <a
              href="https://github.com/dandriscoll/ishipped.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              View on GitHub
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
