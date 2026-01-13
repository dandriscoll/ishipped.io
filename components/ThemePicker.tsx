"use client";

import { useState } from "react";

const THEMES = [
  { id: "default", name: "Default", color: "#0969da" },
  { id: "ocean", name: "Ocean", color: "#0891b2" },
  { id: "forest", name: "Forest", color: "#16a34a" },
  { id: "sunset", name: "Sunset", color: "#ea580c" },
  { id: "lavender", name: "Lavender", color: "#9333ea" },
  { id: "midnight", name: "Midnight", color: "#6366f1" },
  { id: "ruby", name: "Ruby", color: "#dc2626" },
] as const;

export type CardTheme = (typeof THEMES)[number]["id"];

interface ThemePickerProps {
  value?: CardTheme;
  onThemeChange?: (theme: CardTheme) => void;
  dropUp?: boolean;
}

export function ThemePicker({ value = "default", onThemeChange, dropUp = false }: ThemePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Use the controlled value from parent
  const selectedTheme = value;

  const handleThemeSelect = (themeId: CardTheme) => {
    localStorage.setItem("card-theme", themeId);
    onThemeChange?.(themeId);
    setIsOpen(false);
  };

  const currentTheme = THEMES.find((t) => t.id === selectedTheme)!;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        aria-label="Select card theme"
      >
        <span
          className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600"
          style={{ backgroundColor: currentTheme.color }}
        />
        <span className="text-gray-700 dark:text-gray-300">{currentTheme.name}</span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen !== dropUp ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className={`absolute right-0 w-48 bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-lg shadow-lg z-20 py-1 ${dropUp ? "bottom-full mb-2" : "mt-2"}`}>
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleThemeSelect(theme.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                  selectedTheme === theme.id ? "bg-gray-50 dark:bg-gray-800" : ""
                }`}
              >
                <span
                  className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: theme.color }}
                />
                <span className="text-gray-700 dark:text-gray-300">{theme.name}</span>
                {selectedTheme === theme.id && (
                  <svg className="w-4 h-4 ml-auto text-accent" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export { THEMES };
