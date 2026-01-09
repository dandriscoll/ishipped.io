"use client";

interface FieldEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  type?: "text" | "url" | "date";
  maxLength?: number;
  multiline?: boolean;
  rows?: number;
  hint?: string;
}

export function FieldEditor({
  label,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
  maxLength,
  multiline = false,
  rows = 3,
  hint,
}: FieldEditorProps) {
  const inputClasses = `w-full px-3 py-2 rounded-lg border ${
    error
      ? "border-red-500 focus:ring-red-500"
      : "border-gray-300 dark:border-gray-600 focus:ring-accent"
  } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 placeholder:text-gray-400 dark:placeholder:text-gray-500`;

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={rows}
          className={`${inputClasses} resize-y`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className={inputClasses}
        />
      )}
      <div className="flex justify-between mt-1">
        <div>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          {hint && !error && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{hint}</p>
          )}
        </div>
        {maxLength && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {value.length}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
}
