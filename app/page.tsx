import { URLInput } from "@/components/URLInput";

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
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
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Card Format</h2>
          <div className="bg-gray-50 dark:bg-surface-dark rounded-lg p-6 overflow-x-auto">
            <pre className="text-sm font-mono">
              <code>{`---
title: "My Awesome Project"
summary: "A brief description of what it does"
shipped: 2024-03-15
tags:
  - typescript
  - nextjs
  - open-source
author:
  name: "Your Name"
  github: "yourusername"
links:
  - label: "Live Demo"
    url: "https://example.com"
    primary: true
  - label: "Documentation"
    url: "https://docs.example.com"
---

## About

Describe your project in detail using Markdown.

## Features

- Feature one
- Feature two
- Feature three`}</code>
            </pre>
          </div>
          <div className="mt-6 text-center">
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
