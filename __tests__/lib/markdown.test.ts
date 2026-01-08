import { describe, it, expect } from "vitest";
import { renderMarkdown } from "@/lib/markdown";

describe("lib/markdown", () => {
  describe("renderMarkdown", () => {
    describe("basic markdown rendering", () => {
      it("renders headings", async () => {
        const md = "## Heading 2\n### Heading 3";
        const html = await renderMarkdown(md);

        expect(html).toContain("<h2>Heading 2</h2>");
        expect(html).toContain("<h3>Heading 3</h3>");
      });

      it("renders paragraphs", async () => {
        const md = "This is a paragraph.";
        const html = await renderMarkdown(md);

        expect(html).toContain("<p>This is a paragraph.</p>");
      });

      it("renders bold and italic text", async () => {
        const md = "**bold** and *italic*";
        const html = await renderMarkdown(md);

        expect(html).toContain("<strong>bold</strong>");
        expect(html).toContain("<em>italic</em>");
      });

      it("renders unordered lists", async () => {
        const md = "- Item 1\n- Item 2";
        const html = await renderMarkdown(md);

        expect(html).toContain("<ul>");
        expect(html).toContain("<li>Item 1</li>");
        expect(html).toContain("<li>Item 2</li>");
      });

      it("renders ordered lists", async () => {
        const md = "1. First\n2. Second";
        const html = await renderMarkdown(md);

        expect(html).toContain("<ol>");
        expect(html).toContain("<li>First</li>");
        expect(html).toContain("<li>Second</li>");
      });

      it("renders code blocks", async () => {
        const md = "```\ncode here\n```";
        const html = await renderMarkdown(md);

        expect(html).toContain("<pre>");
        expect(html).toContain("<code>");
        expect(html).toContain("code here");
      });

      it("renders inline code", async () => {
        const md = "Use `npm install`";
        const html = await renderMarkdown(md);

        expect(html).toContain("<code>npm install</code>");
      });

      it("renders blockquotes", async () => {
        const md = "> This is a quote";
        const html = await renderMarkdown(md);

        expect(html).toContain("<blockquote>");
        expect(html).toContain("This is a quote");
      });

      it("renders horizontal rules", async () => {
        const md = "Above\n\n---\n\nBelow";
        const html = await renderMarkdown(md);

        expect(html).toContain("<hr>");
      });

      it("renders tables (GFM)", async () => {
        const md = `| Col 1 | Col 2 |
| --- | --- |
| A | B |`;
        const html = await renderMarkdown(md);

        expect(html).toContain("<table>");
        expect(html).toContain("<thead>");
        expect(html).toContain("<tbody>");
        expect(html).toContain("<th>Col 1</th>");
        expect(html).toContain("<td>A</td>");
      });

      it("renders strikethrough (GFM)", async () => {
        const md = "~~deleted~~";
        const html = await renderMarkdown(md);

        expect(html).toContain("<del>deleted</del>");
      });
    });

    describe("link handling", () => {
      it("renders links with target=_blank", async () => {
        const md = "[Click here](https://example.com)";
        const html = await renderMarkdown(md);

        expect(html).toContain('target="_blank"');
        expect(html).toContain('rel="noopener noreferrer"');
        expect(html).toContain('href="https://example.com"');
      });

      it("strips non-HTTPS links", async () => {
        const md = "[Bad link](http://example.com)";
        const html = await renderMarkdown(md);

        // The link text remains but href should be removed
        expect(html).not.toContain('href="http://');
      });

      it("strips javascript: URLs", async () => {
        const md = '[XSS](javascript:alert("xss"))';
        const html = await renderMarkdown(md);

        expect(html).not.toContain("javascript:");
      });
    });

    describe("image handling", () => {
      it("allows images from raw.githubusercontent.com", async () => {
        const md = "![Alt](https://raw.githubusercontent.com/user/repo/main/img.png)";
        const html = await renderMarkdown(md);

        expect(html).toContain("<img");
        expect(html).toContain("raw.githubusercontent.com");
      });

      it("allows images from i.imgur.com", async () => {
        const md = "![Alt](https://i.imgur.com/abc123.png)";
        const html = await renderMarkdown(md);

        expect(html).toContain("<img");
        expect(html).toContain("i.imgur.com");
      });

      it("allows images from user-images.githubusercontent.com", async () => {
        const md = "![Alt](https://user-images.githubusercontent.com/123/456.png)";
        const html = await renderMarkdown(md);

        expect(html).toContain("<img");
      });

      it("allows images from avatars.githubusercontent.com", async () => {
        const md = "![Alt](https://avatars.githubusercontent.com/u/123)";
        const html = await renderMarkdown(md);

        expect(html).toContain("<img");
      });

      it("removes images from non-allowed hosts", async () => {
        const md = "![Alt](https://evil.com/malware.png)";
        const html = await renderMarkdown(md);

        expect(html).not.toContain("<img");
        expect(html).not.toContain("evil.com");
      });

      it("removes images with HTTP URLs", async () => {
        const md = "![Alt](http://raw.githubusercontent.com/user/repo/img.png)";
        const html = await renderMarkdown(md);

        // HTTP URLs should be stripped by sanitizer
        expect(html).not.toContain('src="http://');
      });

      it("adds loading=lazy to allowed images", async () => {
        const md = "![Alt](https://i.imgur.com/test.png)";
        const html = await renderMarkdown(md);

        expect(html).toContain('loading="lazy"');
      });
    });

    describe("XSS prevention", () => {
      it("strips script tags", async () => {
        const md = "<script>alert('xss')</script>";
        const html = await renderMarkdown(md);

        expect(html).not.toContain("<script>");
        expect(html).not.toContain("alert");
      });

      it("strips onclick attributes", async () => {
        const md = '<div onclick="alert(\'xss\')">Click me</div>';
        const html = await renderMarkdown(md);

        expect(html).not.toContain("onclick");
      });

      it("strips onerror attributes on images", async () => {
        const md = '<img src="x" onerror="alert(\'xss\')">';
        const html = await renderMarkdown(md);

        expect(html).not.toContain("onerror");
      });

      it("strips style tags", async () => {
        const md = "<style>body { display: none; }</style>";
        const html = await renderMarkdown(md);

        expect(html).not.toContain("<style>");
      });

      it("strips iframe tags", async () => {
        const md = '<iframe src="https://evil.com"></iframe>';
        const html = await renderMarkdown(md);

        expect(html).not.toContain("<iframe>");
      });

      it("strips form tags", async () => {
        const md = '<form action="https://evil.com"><input></form>';
        const html = await renderMarkdown(md);

        expect(html).not.toContain("<form>");
        expect(html).not.toContain("<input>");
      });

      it("strips data: URLs in images", async () => {
        const md = '<img src="data:image/svg+xml,<svg onload=alert(1)>">';
        const html = await renderMarkdown(md);

        expect(html).not.toContain("data:");
      });

      it("handles nested XSS attempts", async () => {
        const md = "<<script>script>alert('xss')<</script>/script>";
        const html = await renderMarkdown(md);

        expect(html).not.toContain("<script>");
      });
    });

    describe("disallowed tags", () => {
      it("strips h1 tags (only h2-h6 allowed)", async () => {
        const md = "# Heading 1";
        const html = await renderMarkdown(md);

        // h1 is converted but should be stripped
        expect(html).not.toContain("<h1>");
      });

      it("strips div tags", async () => {
        const md = "<div>Content</div>";
        const html = await renderMarkdown(md);

        expect(html).not.toContain("<div>");
      });

      it("strips button tags", async () => {
        const md = "<button>Click</button>";
        const html = await renderMarkdown(md);

        expect(html).not.toContain("<button>");
      });
    });

    describe("edge cases", () => {
      it("handles empty string", async () => {
        const html = await renderMarkdown("");
        expect(html).toBe("");
      });

      it("handles whitespace only", async () => {
        const html = await renderMarkdown("   \n\n   ");
        expect(html.trim()).toBe("");
      });

      it("handles very long content", async () => {
        const longContent = "word ".repeat(10000);
        const html = await renderMarkdown(longContent);

        expect(html).toContain("word");
      });
    });
  });
});
