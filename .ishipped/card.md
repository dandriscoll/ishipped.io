---
title: "iShipped.io"
summary: "Ship it. Show it. Share it. Project cards for GitHub repos."
shipped: 2026-01-07
version: "1.0.0"
tags:
  - nextjs
  - github
  - developer-tools
  - open-source
author:
  name: "Dan Driscoll"
  github: "dandriscoll"
links:
  - label: "Try It Now"
    url: "https://ishipped.io"
    primary: true
  - label: "View Spec"
    url: "https://github.com/dandriscoll/ishipped.io/blob/main/SPEC.md"
---

## What is iShipped.io?

iShipped.io is a simple service that renders beautiful project cards from GitHub repositories. Add a `card.md` file to your repo and get a shareable page for your project.

## Features

- **No Account Required** - Just add a markdown file to your repo
- **YAML Frontmatter** - Define metadata like title, links, and tags
- **Markdown Body** - Write rich content with full GFM support
- **Dark Mode** - Automatic theme detection with manual toggle
- **Mobile Friendly** - Responsive design that works everywhere

## Quick Start

1. Create `/.ishipped/card.md` in your repository
2. Add YAML frontmatter with at least a `title`
3. Visit `ishipped.io/card/you/repo`

## Example Card

```yaml
---
title: "My Project"
summary: "A brief description"
links:
  - label: "Live Demo"
    url: "https://example.com"
    primary: true
---

Your markdown content here.
```

---

Built with Next.js.
