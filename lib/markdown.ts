import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import type { Options as SanitizeOptions } from "rehype-sanitize";
import type { Root, Element, ElementContent } from "hast";

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

// Rehype plugin to add target="_blank" and rel="noopener noreferrer" to links
function rehypeExternalLinks() {
  return (tree: Root) => {
    visitNode(tree, (node) => {
      if (node.type === "element" && node.tagName === "a") {
        node.properties = node.properties || {};
        node.properties.target = "_blank";
        node.properties.rel = "noopener noreferrer";
      }
    });
  };
}

// Rehype plugin to filter images from non-allowed hosts and add lazy loading
function rehypeFilterImages() {
  return (tree: Root) => {
    visitNodeWithParent(tree, null, (node, parent, index) => {
      if (node.type === "element" && node.tagName === "img") {
        const src = node.properties?.src;
        if (typeof src === "string" && isAllowedImageUrl(src)) {
          // Add lazy loading to allowed images
          node.properties = node.properties || {};
          node.properties.loading = "lazy";
        } else if (parent && typeof index === "number") {
          // Remove images from non-allowed hosts
          (parent.children as ElementContent[]).splice(index, 1);
          return index; // Return same index to continue from correct position
        }
      }
      return undefined;
    });
  };
}

// Simple tree visitor function
function visitNode(node: Root | Element | ElementContent, callback: (node: Element) => void) {
  if (node.type === "element") {
    callback(node);
  }
  if ("children" in node && Array.isArray(node.children)) {
    for (const child of node.children) {
      visitNode(child as ElementContent, callback);
    }
  }
}

// Tree visitor with parent tracking for node removal
function visitNodeWithParent(
  node: Root | Element | ElementContent,
  parent: (Root | Element) | null,
  callback: (node: Element, parent: (Root | Element) | null, index: number | null) => number | undefined
) {
  if ("children" in node && Array.isArray(node.children)) {
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      if (child.type === "element") {
        const newIndex = callback(child, node as Root | Element, i);
        if (typeof newIndex === "number") {
          i = newIndex - 1; // Adjust for the splice and loop increment
        }
      }
      visitNodeWithParent(child as ElementContent, node as Root | Element, callback);
    }
  }
}

export async function renderMarkdown(markdown: string): Promise<string> {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeSanitize, sanitizeSchema)
    .use(rehypeExternalLinks)
    .use(rehypeFilterImages)
    .use(rehypeStringify);

  const result = await processor.process(markdown);
  return String(result);
}
