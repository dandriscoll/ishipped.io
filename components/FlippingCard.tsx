"use client";

import { useState } from "react";

const EXAMPLE_MARKDOWN = `---
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
- Feature three`;

export function FlippingCard() {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="space-y-4">
      <div
        className="flip-card mx-auto"
        style={{ height: "480px", maxWidth: "100%" }}
      >
        <div className={`flip-card-inner ${isFlipped ? "" : ""}`} style={{ transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}>
          {/* Front - Source Code */}
          <div className="flip-card-front">
            <div className="floating-card h-full p-6 overflow-hidden">
              <div className="text-xs uppercase tracking-wider text-muted dark:text-muted-dark mb-3 font-semibold">
                /.ishipped/card.md
              </div>
              <pre className="text-sm font-mono overflow-auto h-[calc(100%-2rem)] text-left">
                <code className="text-gray-700 dark:text-gray-300">{EXAMPLE_MARKDOWN}</code>
              </pre>
            </div>
          </div>

          {/* Back - Rendered Card */}
          <div className="flip-card-back">
            <div className="floating-card h-full p-6 overflow-hidden">
              <div className="text-xs uppercase tracking-wider text-muted dark:text-muted-dark mb-3 font-semibold">
                Rendered Card
              </div>
              <div className="text-left h-[calc(100%-2rem)] overflow-auto">
                {/* Simulated rendered card preview */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold">My Awesome Project</h3>
                    <p className="text-muted dark:text-muted-dark text-sm mt-1">
                      A brief description of what it does
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                      typescript
                    </span>
                    <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                      nextjs
                    </span>
                    <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                      open-source
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <span className="px-4 py-2 bg-accent text-white text-sm rounded-lg">
                      Live Demo
                    </span>
                    <span className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm rounded-lg">
                      Documentation
                    </span>
                  </div>

                  <hr className="border-gray-200 dark:border-gray-700" />

                  <div>
                    <h4 className="font-semibold mb-2">About</h4>
                    <p className="text-sm text-muted dark:text-muted-dark">
                      Describe your project in detail using Markdown.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Features</h4>
                    <ul className="text-sm text-muted dark:text-muted-dark list-disc list-inside space-y-1">
                      <li>Feature one</li>
                      <li>Feature two</li>
                      <li>Feature three</li>
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                    <div>
                      <div className="text-sm font-medium">Your Name</div>
                      <div className="text-xs text-muted dark:text-muted-dark">Shipped on Mar 15, 2024</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Flip Buttons */}
      <div className="flex justify-center gap-3">
        <button
          onClick={() => setIsFlipped(false)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            !isFlipped
              ? "bg-accent text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          Show Source
        </button>
        <button
          onClick={() => setIsFlipped(true)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            isFlipped
              ? "bg-accent text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          Show Card
        </button>
      </div>
    </div>
  );
}
