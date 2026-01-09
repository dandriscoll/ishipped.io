"use client";

import { getFieldError, type ValidationError } from "@/lib/builderValidation";

interface Author {
  name: string;
  github: string;
  url: string;
  avatar: string;
}

interface AuthorEditorProps {
  author: Author;
  onChange: (field: keyof Author, value: string) => void;
  errors: ValidationError[];
}

export function AuthorEditor({ author, onChange, errors }: AuthorEditorProps) {
  const urlError = getFieldError(errors, "author.url");
  const avatarError = getFieldError(errors, "author.avatar");

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Author
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <input
            type="text"
            value={author.name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="Name"
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div>
          <input
            type="text"
            value={author.github}
            onChange={(e) => onChange("github", e.target.value)}
            placeholder="GitHub username"
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div>
          <input
            type="url"
            value={author.url}
            onChange={(e) => onChange("url", e.target.value)}
            placeholder="Website URL (https://...)"
            className={`w-full px-3 py-2 text-sm rounded-lg border ${
              urlError
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600"
            } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent`}
          />
          {urlError && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {urlError}
            </p>
          )}
        </div>
        <div>
          <input
            type="url"
            value={author.avatar}
            onChange={(e) => onChange("avatar", e.target.value)}
            placeholder="Avatar URL (https://...)"
            className={`w-full px-3 py-2 text-sm rounded-lg border ${
              avatarError
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600"
            } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent`}
          />
          {avatarError && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {avatarError}
            </p>
          )}
        </div>
      </div>
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Leave empty to use GitHub profile info
      </p>
    </div>
  );
}
