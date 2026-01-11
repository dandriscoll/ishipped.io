"use client";

import { useState, type KeyboardEvent } from "react";

interface CollaboratorsEditorProps {
  collaborators: string[];
  onChange: (collaborators: string[]) => void;
  error?: string;
}

export function CollaboratorsEditor({
  collaborators,
  onChange,
  error,
}: CollaboratorsEditorProps) {
  const [input, setInput] = useState("");

  const addCollaborator = () => {
    const trimmed = input.trim().replace(/^@/, ""); // Remove @ prefix if present
    if (trimmed && !collaborators.includes(trimmed) && collaborators.length < 20) {
      onChange([...collaborators, trimmed]);
      setInput("");
    }
  };

  const removeCollaborator = (index: number) => {
    onChange(collaborators.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCollaborator();
    } else if (e.key === "Backspace" && !input && collaborators.length > 0) {
      removeCollaborator(collaborators.length - 1);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Collaborators
      </label>
      <div className="flex flex-wrap gap-2 p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 min-h-[42px]">
        {collaborators.map((collab, index) => (
          <span
            key={`${collab}-${index}`}
            className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-md"
          >
            @{collab}
            <button
              type="button"
              onClick={() => removeCollaborator(index)}
              className="hover:text-purple-600 dark:hover:text-purple-300"
              aria-label={`Remove collaborator ${collab}`}
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addCollaborator}
          placeholder={
            collaborators.length === 0 ? "GitHub username, press Enter..." : ""
          }
          disabled={collaborators.length >= 20}
          className="flex-1 min-w-[150px] px-1 py-1 bg-transparent text-gray-900 dark:text-gray-100 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 disabled:opacity-50"
        />
      </div>
      <div className="flex justify-between mt-1">
        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Add GitHub usernames of people who contributed to this project
          </p>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {collaborators.length}/20
        </p>
      </div>
    </div>
  );
}
