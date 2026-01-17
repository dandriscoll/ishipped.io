"use client";

import { useState } from "react";

const AGENT_INSTRUCTIONS = `Create an iShipped.io card for this project at /.ishipped/card.md

Follow this format (only include fields that apply):
---
title: "Project Name"
summary: "One punchy line. What does it do?"
shipped: YYYY-MM-DD
tags: [relevant, tags, only]
links:
  - label: "Try It"
    url: "https://..."
    primary: true
# Include hero/icon only if the project has images:
# hero: "./hero.png"
# icon: "./icon.png"
# Include images only if you have screenshots:
# images:
#   - url: "./screenshot.png"
#     alt: "Description"
---

## What is it?
2-3 sentences. No jargon. What problem does it solve?

## Key Features
- **Bold feature** — Brief explanation
- Keep it to 3-5 features
- Lead with the most impressive one

---
[View on ishipped.io](https://ishipped.io/card/OWNER/REPO)

IMPORTANT: Always end the card with the viewAt section above (replace OWNER/REPO with actual values). This creates a clickable link when viewing the file on GitHub.

Writing style:
- Be direct. Cut filler words.
- Use active voice ("Syncs files" not "Files are synced")
- Show, don't tell ("Deploys in 30 seconds" beats "Fast deployment")
- If you can delete a word without losing meaning, delete it
- Only include fields that add value. Skip hero/icon/images if none exist.

Spec: https://github.com/dandriscoll/ishipped.io/blob/main/SPEC.md
Example: https://github.com/dandriscoll/ishipped.io/blob/main/.ishipped/card.md`;

export function AgentInstructions() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(AGENT_INSTRUCTIONS);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = AGENT_INSTRUCTIONS;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section className="py-16 px-4 bg-gray-50 dark:bg-surface-dark">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-center">Using a Coding Agent?</h2>
        <p className="text-center text-muted dark:text-muted-dark mb-6">
          Give your agent these instructions to create a card for your project:
        </p>
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-border dark:border-border-dark">
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 px-3 py-1.5 text-sm font-medium rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors flex items-center gap-1.5"
          >
            {copied ? (
              <>
                <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </>
            )}
          </button>
          <pre className="whitespace-pre-wrap text-sm font-mono text-gray-800 dark:text-gray-200 leading-relaxed p-6 pt-12 overflow-x-auto">
            {AGENT_INSTRUCTIONS}
          </pre>
        </div>
      </div>
    </section>
  );
}
