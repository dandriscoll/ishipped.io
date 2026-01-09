"use client";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Body (Markdown)
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write your card content here using Markdown...

## Features
- Feature one
- Feature two

## Getting Started
..."
        rows={12}
        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent font-mono text-sm resize-y placeholder:text-gray-400 dark:placeholder:text-gray-500"
      />
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        Supports GitHub Flavored Markdown (headings, lists, code blocks, tables, etc.)
      </p>
    </div>
  );
}
