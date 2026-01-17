# iShipped.io — v1 Specification

## Decisions

**Core Concept:** iShipped.io is a read-only service that renders "project cards" from public GitHub repositories. No accounts, no database, no write operations.

**v1 Constraints:**
- Single card per repo at `/.ishipped/card.md`
- Card format: Markdown with YAML frontmatter
- Input: Full `github.com` URLs only (repo URL or direct file URL ending in `.md`)
- Output: Rendered card page with links back to repo, author, and declared resources
- Security: Fetch only from GitHub domains, sanitize all rendered content

---

## Card Spec (v1)

### 1. YAML Frontmatter Schema

#### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Project name (1-100 chars) |

#### Optional Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `summary` | string | `null` | One-line description (max 280 chars) |
| `hero` | URL or path | `null` | Hero image URL (HTTPS) or relative path (e.g., `hero.png`) |
| `icon` | URL or path | `null` | Icon image displayed in top-right corner (HTTPS URL or relative path) |
| `shipped` | ISO 8601 date | `null` | Ship date (e.g., `2024-03-15`) |
| `tags` | string[] | `[]` | Categorical tags (max 10, each max 30 chars) |
| `author` | Author object or string | repo owner | Project author (see below) |
| `links` | Link[] | `[]` | Primary project links (max 10) |
| `version` | string | `null` | Version identifier (semver preferred) |
| `repo` | Repo object | hosting repo | Source repository override (see below) |
| `collaborators` | string[] | `[]` | GitHub usernames of contributors (max 20) |
| `images` | Image[] | `[]` | Screenshot gallery (max 10, see below) |

#### Author Object

When `author` is an object:

```yaml
author:
  name: "Jane Doe"           # Required if object form used
  github: "janedoe"          # Optional: GitHub username
  url: "https://jane.dev"    # Optional: Personal URL
  avatar: "https://..."      # Optional: Avatar URL (HTTPS only)
```

When `author` is a string, it's treated as the display name, and GitHub profile defaults to repo owner.

#### Link Object

```yaml
links:
  - label: "Live Demo"       # Required: Display text (max 50 chars)
    url: "https://..."       # Required: Target URL (HTTPS only)
    primary: true            # Optional: Highlight as primary CTA (max 1)
```

#### Repo Object

Use `repo` to specify a different source repository than where the card is hosted. This is useful when you want to host a card in one repo (e.g., a portfolio site) but link to the actual project's repository.

```yaml
repo:
  owner: "facebook"          # Required: GitHub username or organization
  name: "react"              # Required: Repository name
```

When `repo` is specified, the card footer will link to the specified repository instead of the hosting repository. If omitted, the repository containing the card is used.

#### Collaborators Array

List GitHub usernames of people who contributed to the project. Each collaborator is displayed with their GitHub avatar and a link to their profile.

```yaml
collaborators:
  - "octocat"                # GitHub username (without @)
  - "defunkt"
  - "mojombo"
```

**Constraints:**
- Maximum 20 collaborators
- Each username must be a valid GitHub username (alphanumeric, hyphens, max 39 chars)
- The `@` prefix is optional and will be stripped if present

#### Images Array

Display screenshots or other images in a gallery format. Images can be clicked to view full-size in a lightbox.

```yaml
images:
  - url: "./screenshot1.png"       # Required: relative path or HTTPS URL
    alt: "Dashboard view"          # Optional: accessibility text
    caption: "The main dashboard"  # Optional: displayed below image
  - url: "./screenshot2.png"
    alt: "Settings panel"
  - url: "https://i.imgur.com/example.png"
```

**Display behavior:**
- Single image: displayed larger (max-width: 100%, max-height: 400px)
- Multiple images: displayed in a horizontal row (thumbnails ~200px wide)
- Click any image to open full-size in a lightbox with navigation

**Constraints:**
- Maximum 10 images
- Each URL must be a relative path or HTTPS URL from allowed hosts
- Relative paths resolved from card directory (same as hero/icon)
- Alt text recommended for accessibility

#### Validation Rules

1. **Strings:** Trimmed, reject if only whitespace
2. **URLs:** Must be valid HTTPS URLs; `http://` rejected except localhost for dev
3. **Dates:** ISO 8601 format (`YYYY-MM-DD` or full datetime)
4. **Arrays:** Empty arrays allowed; items validated individually
5. **Unknown fields:** Silently ignored (forward compatibility)
6. **Missing optional fields:** Use defaults, never error

#### Schema Version

The spec version is implicit in v1. Future versions may add:
```yaml
spec: "1"  # Reserved for future use
```

---

### 2. Rendering Rules

#### Frontmatter → UI Mapping

| Frontmatter | UI Element | Fallback |
|-------------|------------|----------|
| `title` | Page title, H1 heading | *Required—no fallback* |
| `summary` | Subtitle below title | Hidden if missing |
| `icon` | Icon in top-right corner (64x64px, rounded) | Hidden if missing |
| `hero` | Hero image below body content (max-width: 100%, aspect-ratio preserved) | Hidden if missing |
| `shipped` | "Shipped on [date]" badge | Hidden if missing |
| `tags` | Horizontal tag pills | Hidden if empty |
| `author.name` | Author block with name | Repo owner username |
| `author.github` | Link to GitHub profile | Repo owner |
| `author.avatar` | Author avatar (48x48) | GitHub avatar via `github.com/<username>.png` |
| `links` | Button list; `primary: true` gets accent style | Hidden if empty |
| `version` | Version badge next to title | Hidden if missing |
| `repo` | Repository link in footer | Hosting repository |
| `collaborators` | Avatar list with GitHub links | Hidden if empty |
| `images` | Screenshot gallery with lightbox | Hidden if empty |

#### Markdown Body Rendering

The content after frontmatter is rendered as Markdown with these rules:

**Allowed Elements:**
- Headings (H2-H6; H1 reserved for title)
- Paragraphs, bold, italic, strikethrough
- Ordered and unordered lists
- Code blocks (with syntax highlighting)
- Inline code
- Blockquotes
- Horizontal rules
- Links (open in new tab, `rel="noopener noreferrer"`)
- Images (HTTPS only, lazy-loaded)
- Tables (GFM style)

**Disallowed / Stripped:**
- Raw HTML tags (stripped entirely)
- `<script>`, `<iframe>`, `<object>`, `<embed>`
- `javascript:` URLs
- Data URLs (except small images under 10KB for inline diagrams)
- Event handlers (`onclick`, etc.)

**Code Block Handling:**
- Language hint respected for syntax highlighting
- Max height with scroll for blocks > 30 lines
- Copy button on hover

#### viewAt Section

The `viewAt` section is a special markdown section that provides a clickable link to view the card on ishipped.io. This link is visible when viewing the raw markdown file (e.g., on GitHub or in an editor) but is automatically stripped when rendering the card in the viewer.

**Format:**
```markdown
---
[View on ishipped.io](https://ishipped.io/card/owner/repo)
```

**Placement:** Always at the very end of the card file, after all other content.

**Purpose:**
- Allows users browsing GitHub to quickly jump to the rendered card
- Provides a permanent link to the card viewer
- Does not clutter the rendered card display

**Example:**
```markdown
---
title: "My Project"
---

## About
My project description...

---
[View on ishipped.io](https://ishipped.io/card/acme/myproject)
```

**Rules:**
- Must be preceded by a horizontal rule (`---`, `***`, or `___`)
- Must contain a markdown link to `https://ishipped.io/card/...`
- Automatically stripped from rendered output
- Optional but recommended for discoverability

#### Graceful Degradation

| Missing Data | Behavior |
|--------------|----------|
| No frontmatter | Error: "Invalid card format" |
| No `title` | Error: "Card must have a title" |
| Invalid `hero` URL | Hide hero, no error |
| Invalid `icon` URL | Hide icon, no error |
| Invalid `author.github` | Fall back to repo owner |
| Malformed `links` entry | Skip that entry |
| Malformed `images` entry | Skip that entry |
| Empty body | Render card with frontmatter only |

---

### 3. Examples

#### Minimal Card

```markdown
---
title: "MyProject"
---

A simple project that does something useful.
```

Renders as:
- H1: "MyProject"
- Author block showing repo owner
- Body text
- Link to repo

#### Fully Loaded Card

```markdown
---
title: "CloudSync Pro"
summary: "Real-time file synchronization across all your devices"
hero: "https://raw.githubusercontent.com/acme/cloudsync/main/.ishipped/hero.png"
icon: "./icon.png"
shipped: 2024-03-15
version: "2.1.0"
tags:
  - sync
  - cloud
  - productivity
  - cross-platform
author:
  name: "Sarah Chen"
  github: "sarahchen"
  url: "https://sarahchen.dev"
links:
  - label: "Try It Free"
    url: "https://cloudsync.pro/signup"
    primary: true
  - label: "Documentation"
    url: "https://docs.cloudsync.pro"
  - label: "Discord Community"
    url: "https://discord.gg/cloudsync"
repo:
  owner: "acme"
  name: "cloudsync"
collaborators:
  - "mikejohnson"
  - "emilywang"
  - "alexkim"
images:
  - url: "./dashboard.png"
    alt: "CloudSync dashboard"
    caption: "Main dashboard view"
  - url: "./sync-settings.png"
    alt: "Sync settings panel"
  - url: "./mobile-app.png"
    alt: "Mobile app screenshot"
---

## What is CloudSync Pro?

CloudSync Pro keeps your files synchronized across Windows, macOS, Linux, iOS, and Android in real-time.

### Key Features

- **Instant Sync** — Changes propagate in under 2 seconds
- **End-to-End Encryption** — Your files, your keys
- **Selective Sync** — Choose exactly what syncs where
- **Version History** — 30-day file versioning included

### Quick Start

```bash
npm install -g cloudsync-cli
cloudsync login
cloudsync init ~/Documents
```

### Screenshots

![Dashboard](https://raw.githubusercontent.com/acme/cloudsync/main/.ishipped/dashboard.png)

---

Built with love by the CloudSync team.
```

---

### 4. Security Rules

#### Fetch Allowlist

Only fetch content from:
- `github.com` (for URL parsing/validation)
- `raw.githubusercontent.com` (for file content)
- `api.github.com` (for metadata: default branch, etc.)

Reject any attempt to fetch from other domains during card resolution.

#### HTML Sanitization

Use a strict sanitizer (e.g., DOMPurify with restricted config):

```javascript
const ALLOWED_TAGS = [
  'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'hr',
  'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
  'a', 'strong', 'em', 'del', 'img', 'table',
  'thead', 'tbody', 'tr', 'th', 'td'
];

const ALLOWED_ATTR = {
  'a': ['href', 'title'],
  'img': ['src', 'alt', 'title', 'loading'],
  'code': ['class'],  // for language-* classes
  '*': []
};
```

#### Image Handling

**Allowed image sources:**
- `raw.githubusercontent.com`
- `user-images.githubusercontent.com`
- `githubusercontent.com` subdomains
- `i.imgur.com` (common for READMEs)
- `github.com/*.png` (avatars)
- Relative paths (resolved relative to the card's directory)

**Relative path examples:**

For a card at `.ishipped/card.md`:
```yaml
hero: "hero.png"              # Resolves to .ishipped/hero.png
hero: "./hero.png"            # Resolves to .ishipped/hero.png
hero: "assets/banner.jpg"     # Resolves to .ishipped/assets/banner.jpg
icon: "icon.png"              # Resolves to .ishipped/icon.png
icon: "./icon.png"            # Resolves to .ishipped/icon.png
```

For a card at `docs/showcase.md`:
```yaml
hero: "images/hero.png"       # Resolves to docs/images/hero.png
icon: "images/icon.png"       # Resolves to docs/images/icon.png
```

**Blocked:**
- Data URLs over 10KB
- `http://` URLs
- Any domain not in allowlist
- Parent directory traversal (`..`)

**Recommendation:** Proxy images through a sanitizing CDN (e.g., Cloudflare Images, imgix) to:
- Prevent IP leakage to image hosts
- Resize/optimize images
- Cache aggressively

#### Rate Limiting

**GitHub API limits:**
- Unauthenticated: 60 requests/hour
- Authenticated: 5,000 requests/hour

**Mitigation strategy:**
1. Cache resolved cards aggressively (5-minute minimum TTL)
2. Use conditional requests (`If-None-Match` with ETag)
3. For popular cards, extend cache to 1 hour
4. Implement request coalescing for concurrent identical requests
5. Consider GitHub App token for higher limits

**Client-side limits:**
- Max 30 card renders per IP per minute
- Reject requests with malformed URLs immediately (no API call)

---

## Website Design (v1)

### 1. URL Patterns

| Route | Purpose |
|-------|---------|
| `/` | Landing page |
| `/card` | Card renderer (accepts `url` query param) |
| `/card?url=https://github.com/...` | Render specific card |
| `/error/not-found` | Card not found |
| `/error/invalid-url` | Malformed GitHub URL |
| `/error/private` | Private repo (or 404 from GitHub) |
| `/error/rate-limit` | GitHub rate limit exceeded |

**Accepted URL Formats (query param):**

```
# Repo URLs - fetches /.ishipped/card.md
https://github.com/acme/project
https://github.com/acme/project/
https://github.com/acme/project/tree/main
https://github.com/acme/project/tree/feature-branch

# File URLs - fetches the specified .md file
https://github.com/acme/project/blob/main/.ishipped/card.md
https://github.com/acme/project/blob/main/docs/showcase.md
https://github.com/acme/project/blob/v2.0.0/README.md
```

**Rejected:**
- Non-github.com URLs
- Shorthand forms like `acme/project`
- URLs without `https://` scheme

### 2. Page Layouts

#### Landing Page (`/`)

```
┌─────────────────────────────────────────────────────────┐
│  [Logo] iShipped.io                              [GitHub]│
├─────────────────────────────────────────────────────────┤
│                                                         │
│              Ship it. Show it. Share it.                │
│                                                         │
│   Project cards for GitHub repos. Add a card.md to      │
│   your repo and get a beautiful shareable page.         │
│                                                         │
│   ┌───────────────────────────────────────────────┐     │
│   │ https://github.com/...                        │     │
│   └───────────────────────────────────────────────┘     │
│                        [View Card]                       │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   HOW IT WORKS                                          │
│                                                         │
│   1. Add /.ishipped/card.md to your repo                │
│   2. Write your card with YAML frontmatter              │
│   3. Share your iShipped.io link                        │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   EXAMPLE CARD                 [View on iShipped.io →]  │
│   ┌─────────────────────────────────────────────────┐   │
│   │  (Embedded preview of a sample card)            │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   CARD FORMAT                                           │
│   ```yaml                                               │
│   ---                                                   │
│   title: "My Project"                                   │
│   summary: "A short description"                        │
│   ...                                                   │
│   ```                                                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### Card Page (`/card?url=...`)

```
┌─────────────────────────────────────────────────────────┐
│  [Logo] iShipped.io                    [View on GitHub] │
├─────────────────────────────────────────────────────────┤
│                                                  [ICON] │
│   CloudSync Pro                              v2.1.0     │
│   Real-time file synchronization across all devices     │
│                                                         │
│   [sync] [cloud] [productivity] [cross-platform]        │
│                                                         │
│   [█ Try It Free]  [Documentation]  [Discord]           │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   ## What is CloudSync Pro?                             │
│                                                         │
│   CloudSync Pro keeps your files synchronized...        │
│                                                         │
│   ### Key Features                                      │
│   - **Instant Sync** — Changes propagate...             │
│   ...                                                   │
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │                                                 │   │
│   │              [HERO IMAGE]                       │   │
│   │                                                 │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   ┌────────────────┐                                    │
│   │ [Avatar]       │  Sarah Chen                        │
│   │                │  @sarahchen · sarahchen.dev        │
│   └────────────────┘                                    │
│                                                         │
│   Shipped on March 15, 2024                             │
│                                                         │
├─────────────────────────────────────────────────────────┤
│   acme/cloudsync · ★ 1.2k · MIT License                 │
│   [View Repository →]                                   │
└─────────────────────────────────────────────────────────┘
```

#### Error Pages

**Not Found:**
```
Card not found

We couldn't find /.ishipped/card.md in this repository.

[Create a Card →] links to spec/docs
[Try Another URL]
```

**Invalid URL:**
```
Invalid GitHub URL

Please enter a valid GitHub repository or file URL.

Accepted formats:
• https://github.com/owner/repo
• https://github.com/owner/repo/blob/main/path/to/file.md

[Try Again]
```

**Private Repo:**
```
Repository not accessible

This repository is private or doesn't exist.
iShipped.io only works with public repositories.

[Try Another URL]
```

**Rate Limited:**
```
Slow down!

We've hit GitHub's rate limit. Please try again in a few minutes.

[Retry in X seconds]
```

#### Responsive Behavior

**Desktop (>768px):**
- Max content width: 720px, centered
- Hero image: full width of content area
- Links: horizontal button row
- Author block: inline with avatar

**Mobile (<768px):**
- Full-width with 16px padding
- Hero image: full width, max-height 300px
- Links: stacked vertically
- Tags: wrap to multiple lines
- Author block: stacked layout

**Dark Mode:**
- Respect `prefers-color-scheme: dark`
- Toggle in header (persisted to localStorage)
- Colors: Dark gray background (#0d1117), light text (#c9d1d9)

---

### 3. Visual Style

**Typography:**
- Font stack: `system-ui, -apple-system, sans-serif`
- Monospace: `ui-monospace, 'SF Mono', monospace`
- Title: 32px, font-weight 700
- Summary: 18px, font-weight 400, muted color
- Body: 16px, line-height 1.6
- Code: 14px

**Colors (Light Mode):**
- Background: `#ffffff`
- Text: `#1f2328`
- Muted text: `#656d76`
- Border: `#d0d7de`
- Accent: `#0969da`
- Tag background: `#ddf4ff`
- Tag text: `#0969da`
- Code background: `#f6f8fa`

**Spacing:**
- Section padding: 32px
- Element gap: 16px
- Card border-radius: 8px
- Button border-radius: 6px

**Effects:**
- Subtle box-shadow on cards: `0 1px 3px rgba(0,0,0,0.1)`
- Hover states: darken buttons 10%, underline links
- Focus rings: 2px solid accent with 2px offset

---

### 4. Content Resolution Algorithm

#### Step 1: Validate Input URL

```
Input: user-provided string (from query param)

MUST match one of these patterns:
1. https://github.com/<owner>/<repo>
2. https://github.com/<owner>/<repo>/
3. https://github.com/<owner>/<repo>/tree/<ref>
4. https://github.com/<owner>/<repo>/tree/<ref>/<path>
5. https://github.com/<owner>/<repo>/blob/<ref>/<path>
6. https://github.com/<owner>/<repo>/blob/<ref>/<path>.md

REJECT if:
- URL does not start with https://github.com/
- URL is malformed
- Missing owner or repo segments
```

#### Step 2: Parse URL Components

```javascript
function parseGitHubURL(input) {
  // Validate scheme and host
  let url;
  try {
    url = new URL(input.trim());
  } catch {
    throw new Error('INVALID_URL');
  }

  if (url.protocol !== 'https:' || url.hostname !== 'github.com') {
    throw new Error('INVALID_URL');
  }

  const segments = url.pathname.split('/').filter(Boolean);
  // segments[0] = owner
  // segments[1] = repo
  // segments[2] = 'blob' | 'tree' | undefined
  // segments[3] = ref (if blob/tree)
  // segments[4+] = path (if blob)

  const owner = segments[0];
  const repo = segments[1]?.replace(/\.git$/, '');

  if (!owner || !repo) {
    throw new Error('INVALID_URL');
  }

  let ref = null;
  let path = null;
  let isFilePath = false;

  if (segments[2] === 'blob' || segments[2] === 'tree') {
    ref = segments[3] || null;
    if (segments[2] === 'blob' && segments.length > 4) {
      path = segments.slice(4).join('/');
      isFilePath = path.endsWith('.md');
    }
  }

  // If URL points to a file that doesn't end in .md, reject it
  if (segments[2] === 'blob' && path && !isFilePath) {
    throw new Error('INVALID_URL'); // Only .md files allowed
  }

  return { owner, repo, ref, path, isFilePath };
}
```

#### Step 3: Resolve Default Branch (if needed)

If `ref` is null, fetch the default branch:

```
GET https://api.github.com/repos/<owner>/<repo>
Response: { "default_branch": "main", ... }

Use response.default_branch as ref.
```

**Caching:** Cache owner/repo → default_branch for 1 hour.

#### Step 4: Construct Fetch URL

```javascript
function constructFetchURL({ owner, repo, ref, path, isFilePath }) {
  const branch = ref || 'HEAD'; // HEAD works for raw.githubusercontent.com

  if (isFilePath && path) {
    // User provided a direct .md file URL
    return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
  } else {
    // Fetch default card location
    return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/.ishipped/card.md`;
  }
}
```

#### Step 5: Fetch and Parse

```javascript
async function fetchCard(url) {
  const response = await fetch(url, {
    headers: {
      'Accept': 'text/plain',
      'If-None-Match': cachedETag || undefined
    }
  });

  if (response.status === 404) {
    throw new Error('CARD_NOT_FOUND');
  }
  if (response.status === 403) {
    // Check if rate limited
    if (response.headers.get('X-RateLimit-Remaining') === '0') {
      throw new Error('RATE_LIMITED');
    }
    throw new Error('PRIVATE_REPO');
  }
  if (response.status === 304) {
    return { cached: true };
  }
  if (!response.ok) {
    throw new Error('FETCH_FAILED');
  }

  const content = await response.text();
  const etag = response.headers.get('ETag');

  return { content, etag };
}
```

#### Step 6: Parse Card Content

```javascript
function parseCard(content) {
  // Extract frontmatter between --- delimiters
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);

  if (!match) {
    throw new Error('INVALID_FORMAT');
  }

  const frontmatter = yaml.parse(match[1]);
  const body = match[2];

  if (!frontmatter.title) {
    throw new Error('MISSING_TITLE');
  }

  return {
    frontmatter: validateFrontmatter(frontmatter),
    body: body.trim()
  };
}
```

#### Complete Resolution Flow

```
User Input (query param: url)
    │
    ▼
┌─────────────────┐
│  Validate URL   │ → Not github.com? → /error/invalid-url
│  (https://      │ → Malformed? → /error/invalid-url
│   github.com/)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Parse URL      │ → Missing owner/repo? → /error/invalid-url
│  Components     │ → Non-.md file path? → /error/invalid-url
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Check Cache    │ → Cache hit + fresh? → Return cached
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Resolve Branch  │ → API error? → Handle (rate limit/private)
│ (if ref null)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Fetch Card     │ → 404? → /error/not-found
│  from raw.git   │ → 403? → /error/private or /error/rate-limit
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Parse YAML +   │ → No frontmatter? → /error/invalid-format
│  Markdown       │ → No title? → /error/invalid-format
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Render Card    │
│  Page           │
└─────────────────┘
```

#### Caching Strategy

| Resource | TTL | Strategy |
|----------|-----|----------|
| Default branch | 1 hour | In-memory + Redis |
| Card content | 5 minutes | ETag-based revalidation |
| Rendered HTML | 5 minutes | CDN edge cache |
| GitHub avatars | 1 day | Proxy + CDN |
| Hero images | 1 hour | Proxy + CDN |

**Cache Keys:**
- Branch: `branch:${owner}/${repo}`
- Card: `card:${owner}/${repo}/${ref}/${path}`

**Stale-While-Revalidate:**
- Serve stale content while fetching fresh in background
- Max stale age: 1 hour

---

### 5. Implementation Approach

#### Recommended Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Framework | Next.js 14+ (App Router) | Edge-ready, great DX, ISR support |
| Hosting | Vercel | Native Next.js support, edge network |
| Styling | Tailwind CSS | Utility-first, small bundle |
| Markdown | `unified` + `remark` + `rehype` | Modular, secure, extensible |
| YAML | `yaml` (npm package) | Spec-compliant, safe |
| Sanitization | `rehype-sanitize` | Integrates with unified pipeline |
| Syntax highlighting | `shiki` | VSCode-quality, SSR-compatible |
| Cache | Vercel KV (Redis) | Low-latency, serverless |

#### Rendering Strategy

**Server-side rendering (SSR) with caching:**

```
Request → Edge middleware
              │
              ▼
         Check CDN cache
              │
         ┌────┴────┐
      Hit│         │Miss
         ▼         ▼
    Return     Fetch card
    cached     from GitHub
              │
              ▼
         Render React
         to HTML
              │
              ▼
         Cache at edge
         (5 min TTL)
              │
              ▼
         Return response
```

**Why SSR over SSG:**
- Cards update frequently
- Can't pre-generate all possible repos
- SSR + edge caching = fast + fresh

#### Markdown Pipeline

```javascript
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeShiki from '@shikijs/rehype';
import rehypeStringify from 'rehype-stringify';

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeSanitize, {
    ...defaultSchema,
    tagNames: [...defaultSchema.tagNames, 'img'],
    attributes: {
      ...defaultSchema.attributes,
      img: ['src', 'alt', 'title', 'loading']
    }
  })
  .use(rehypeShiki, { theme: 'github-light' })
  .use(rehypeStringify);

const html = await processor.process(markdownBody);
```

#### Directory Structure

```
/
├── app/
│   ├── layout.tsx           # Root layout with header
│   ├── page.tsx             # Landing page
│   ├── card/
│   │   └── page.tsx         # Card renderer (?url=)
│   └── error/
│       ├── not-found/
│       │   └── page.tsx
│       ├── invalid-url/
│       │   └── page.tsx
│       ├── private/
│       │   └── page.tsx
│       └── rate-limit/
│           └── page.tsx
├── lib/
│   ├── github.ts            # URL parsing, fetching
│   ├── card.ts              # Card parsing, validation
│   ├── markdown.ts          # Markdown processing
│   └── cache.ts             # Caching utilities
├── components/
│   ├── CardRenderer.tsx     # Main card display
│   ├── AuthorBlock.tsx
│   ├── TagList.tsx
│   ├── LinkButtons.tsx
│   └── URLInput.tsx
└── public/
    └── og-default.png       # Default OG image
```

#### Minimal Dependencies

Production dependencies (target < 15):
- `next`
- `react`, `react-dom`
- `unified`, `remark-parse`, `remark-gfm`, `remark-rehype`
- `rehype-sanitize`, `rehype-stringify`
- `shiki`
- `yaml`
- `@vercel/kv` (optional, for caching)

Avoid:
- Heavy UI libraries (no MUI, Chakra)
- State management libraries (not needed)
- Form libraries (single input doesn't need it)

---

## Open Questions (Later)

**v1.1 Candidates:**
- Multiple cards per repo (manifest file listing cards?)
- Card preview/embed widget for READMEs
- OpenGraph image generation from card content
- GitHub Action to validate card format
- Badge for READMEs: `[![iShipped](https://ishipped.io/badge/owner/repo)](https://ishipped.io/card?url=https://github.com/owner/repo)`

**v2 Possibilities:**
- Custom domains pointing to cards
- Card collections/galleries
- Organization pages (all cards from an org)
- Webhook-triggered cache invalidation
- Analytics (view counts, referrers)
- Card templates/themes

**Deferred Decisions:**
- Support for GitLab/Bitbucket (v1 is GitHub-only)
- Support for private repos with token auth
- Card versioning/history
- Comments/reactions on cards
- i18n for card content

**Technical Debt to Avoid:**
- Don't over-engineer caching (start simple, scale later)
- Don't add auth until there's a clear need
- Don't build a card editor (GitHub is the editor)
- Don't store any user data (stay stateless)

---

## Appendix: Quick Reference

### Minimum Viable Card

```markdown
---
title: "Project Name"
---

Description goes here.
```

### Recommended Card

```markdown
---
title: "Project Name"
summary: "One-line description of what it does"
hero: "./hero.png"
icon: "./icon.png"
shipped: 2024-01-15
tags: [tag1, tag2]
links:
  - label: "Live Site"
    url: "https://example.com"
    primary: true
collaborators:
  - "teammate1"
  - "teammate2"
images:
  - url: "./screenshot.png"
    alt: "App screenshot"
---

## About

Longer description...

## Features

- Feature 1
- Feature 2

---
[View on ishipped.io](https://ishipped.io/card/owner/repo)
```

### URL Quick Reference

| Input URL | Fetches |
|-----------|---------|
| `https://github.com/acme/foo` | `acme/foo/.ishipped/card.md` @ default branch |
| `https://github.com/acme/foo/tree/dev` | `acme/foo/.ishipped/card.md` @ `dev` |
| `https://github.com/acme/foo/blob/main/docs/card.md` | `acme/foo/docs/card.md` @ `main` |
| `https://github.com/acme/foo/blob/v1.0.0/.ishipped/card.md` | `acme/foo/.ishipped/card.md` @ `v1.0.0` |
