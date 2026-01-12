# iShipped.io

Project cards for GitHub repositories.

## Development

```bash
# Install dependencies
npm install

# Start development server (port 3000)
npm run dev

# Build for production
npm run build

# Run unit tests
npm test
```

## Accessibility Testing

This project includes automated accessibility scanning using [Playwright](https://playwright.dev/) and [axe-core](https://github.com/dequelabs/axe-core).

### Running the Accessibility Scan

1. **Start the app** (in a separate terminal):
   ```bash
   npm run dev
   ```

2. **Run the scan**:
   ```bash
   npm run a11y
   ```

3. **For CI environments**:
   ```bash
   npm run a11y:ci
   ```

### Custom Target URL

Override the default URL (`http://localhost:3000`) with the `TARGET_URL` environment variable:

```bash
TARGET_URL=http://localhost:4000 npm run a11y
```

### Report Location

Results are saved to `test-results/a11y/axe-results.json` after each run.

### Understanding the Report

The JSON report contains:
- **violations**: Array of accessibility issues found (what you need to fix)
- **passes**: Rules that passed
- **incomplete**: Rules that need manual review
- **inapplicable**: Rules not applicable to this page

Each violation includes:
- **id**: Rule identifier (e.g., `color-contrast`, `image-alt`)
- **impact**: Severity level (`minor`, `moderate`, `serious`, `critical`)
- **description**: What the rule checks
- **helpUrl**: Link to detailed documentation
- **nodes**: Specific DOM elements that failed the rule

### Exit Codes

- `0`: No violations found
- Non-zero: Violations detected (test fails)

### How It Works

1. The app sets `data-app-ready="true"` on `<body>` once hydrated (see `components/ThemeProvider.tsx`)
2. The test waits for this marker before scanning (no arbitrary timeouts)
3. axe-core scans for WCAG 2.0/2.1 Level A and AA violations
4. Results are written to `test-results/a11y/axe-results.json`

### First-Time Setup

After cloning, install Playwright browsers:

```bash
npx playwright install chromium
```
