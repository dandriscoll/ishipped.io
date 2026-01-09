"use client";

interface Link {
  id: string;
  label: string;
  url: string;
  primary: boolean;
}

interface LinkEditorProps {
  links: Link[];
  onChange: (links: Link[]) => void;
  errors?: Map<string, string>;
}

export function LinkEditor({ links, onChange, errors }: LinkEditorProps) {
  const addLink = () => {
    if (links.length >= 10) return;
    onChange([
      ...links,
      { id: `link-${Date.now()}`, label: "", url: "", primary: false },
    ]);
  };

  const removeLink = (id: string) => {
    onChange(links.filter((l) => l.id !== id));
  };

  const updateLink = (id: string, field: keyof Link, value: string | boolean) => {
    onChange(
      links.map((l) => {
        if (l.id !== id) {
          // If setting primary to true on another link, reset this one
          if (field === "primary" && value === true) {
            return { ...l, primary: false };
          }
          return l;
        }
        return { ...l, [field]: value };
      })
    );
  };

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Links
        </label>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {links.length}/10 links
        </span>
      </div>

      <div className="space-y-3">
        {links.map((link, index) => {
          const labelError = errors?.get(`links[${index}].label`);
          const urlError = errors?.get(`links[${index}].url`);

          return (
            <div
              key={link.id}
              className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                <div>
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => updateLink(link.id, "label", e.target.value)}
                    placeholder="Label"
                    maxLength={50}
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${
                      labelError
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent`}
                  />
                  {labelError && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {labelError}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => updateLink(link.id, "url", e.target.value)}
                    placeholder="https://..."
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
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <input
                    type="checkbox"
                    checked={link.primary}
                    onChange={(e) => updateLink(link.id, "primary", e.target.checked)}
                    className="rounded border-gray-300 text-accent focus:ring-accent"
                  />
                  Primary link
                </label>
                <button
                  type="button"
                  onClick={() => removeLink(link.id)}
                  className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {links.length < 10 && (
        <button
          type="button"
          onClick={addLink}
          className="mt-3 inline-flex items-center gap-2 px-3 py-2 text-sm text-accent hover:text-accent-hover transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Link
        </button>
      )}
    </div>
  );
}
