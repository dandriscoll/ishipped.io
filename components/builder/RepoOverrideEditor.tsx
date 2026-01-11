"use client";

import { getFieldError, type ValidationError } from "@/lib/builderValidation";

interface RepoOverride {
  owner: string;
  name: string;
}

interface RepoOverrideEditorProps {
  repo: RepoOverride;
  onChange: (field: keyof RepoOverride, value: string) => void;
  errors: ValidationError[];
}

export function RepoOverrideEditor({
  repo,
  onChange,
  errors,
}: RepoOverrideEditorProps) {
  const ownerError = getFieldError(errors, "repo.owner");
  const nameError = getFieldError(errors, "repo.name");

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Source Repository Override
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <input
            type="text"
            value={repo.owner}
            onChange={(e) => onChange("owner", e.target.value)}
            placeholder="Owner (e.g., facebook)"
            className={`w-full px-3 py-2 text-sm rounded-lg border ${
              ownerError
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600"
            } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent`}
          />
          {ownerError && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {ownerError}
            </p>
          )}
        </div>
        <div>
          <input
            type="text"
            value={repo.name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="Repository (e.g., react)"
            className={`w-full px-3 py-2 text-sm rounded-lg border ${
              nameError
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600"
            } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent`}
          />
          {nameError && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {nameError}
            </p>
          )}
        </div>
      </div>
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Use this to link to a different repository than where the card is hosted
      </p>
    </div>
  );
}
