import type { CardLink } from "@/lib/card";

interface LinkButtonsProps {
  links: CardLink[];
}

export function LinkButtons({ links }: LinkButtonsProps) {
  if (links.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3">
      {links.map((link, i) => (
        <a
          key={i}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center px-4 py-2 rounded-md font-medium transition-colors ${
            link.primary
              ? "bg-accent hover:bg-accent-hover text-white border border-transparent"
              : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700"
          }`}
        >
          {link.label}
          <svg
            className="ml-1.5 w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      ))}
    </div>
  );
}
