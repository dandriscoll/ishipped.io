"use client";

import type { ValidationError } from "@/lib/builderValidation";

interface ValidationPanelProps {
  errors: ValidationError[];
}

export function ValidationPanel({ errors }: ValidationPanelProps) {
  const errorCount = errors.filter((e) => e.severity === "error").length;
  const warningCount = errors.filter((e) => e.severity === "warning").length;

  if (errors.length === 0) return null;

  return (
    <div className="floating-card p-4">
      <div className="flex items-center gap-4 mb-3">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Validation Issues
        </h3>
        <div className="flex items-center gap-3 text-xs">
          {errorCount > 0 && (
            <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              {errorCount} error{errorCount !== 1 ? "s" : ""}
            </span>
          )}
          {warningCount > 0 && (
            <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {warningCount} warning{warningCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>
      <ul className="space-y-1">
        {errors.map((error, index) => (
          <li
            key={`${error.field}-${index}`}
            className={`text-sm flex items-start gap-2 ${
              error.severity === "error"
                ? "text-red-600 dark:text-red-400"
                : "text-yellow-600 dark:text-yellow-400"
            }`}
          >
            <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">
              {error.field}
            </span>
            <span>{error.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
