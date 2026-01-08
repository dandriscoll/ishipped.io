import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import type { Options as SanitizeOptions } from "rehype-sanitize";

// Strict sanitization schema
const sanitizeSchema: SanitizeOptions = {
  ...defaultSchema,
  tagNames: [
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "p",
    "br",
    "hr",
    "ul",
    "ol",
    "li",
    "blockquote",
    "pre",
    "code",
    "a",
    "strong",
    "em",
    "del",
    "img",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    "span",
  ],
  attributes: {
    ...defaultSchema.attributes,
    a: ["href", "title"],
    img: ["src", "alt", "title", "loading"],
    code: ["className"],
    span: ["className"],
    pre: ["className"],
    "*": [],
  },
  protocols: {
    href: ["https"],
    src: ["https"],
  },
};

// Allowed image hosts for markdown images
const ALLOWED_IMAGE_HOSTS = [
  "raw.githubusercontent.com",
  "user-images.githubusercontent.com",
  "avatars.githubusercontent.com",
  "i.imgur.com",
];

function isAllowedImageUrl(src: string): boolean {
  try {
    const url = new URL(src);
    return ALLOWED_IMAGE_HOSTS.some(
      (h) => url.hostname === h || url.hostname.endsWith(`.${h}`)
    );
  } catch {
    return false;
  }
}

export async function renderMarkdown(markdown: string): Promise<string> {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeSanitize, sanitizeSchema)
    .use(rehypeStringify);

  const result = await processor.process(markdown);
  let html = String(result);

  // Post-process to add target="_blank" to links and filter images
  html = html.replace(
    /<a\s+href="([^"]+)"([^>]*)>/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer"$2>'
  );

  // Filter out images from non-allowed hosts
  html = html.replace(/<img\s+([^>]*)src="([^"]+)"([^>]*)>/g, (match, before, src, after) => {
    if (isAllowedImageUrl(src)) {
      return `<img ${before}src="${src}"${after} loading="lazy">`;
    }
    return ""; // Remove image from non-allowed hosts
  });

  return html;
}
