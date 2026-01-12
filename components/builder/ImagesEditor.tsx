"use client";

interface ImageItem {
  id: string;
  url: string;
  alt: string;
  caption: string;
}

interface ImagesEditorProps {
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
  errors?: Map<string, string>;
}

export function ImagesEditor({ images, onChange, errors }: ImagesEditorProps) {
  const addImage = () => {
    if (images.length >= 10) return;
    onChange([
      ...images,
      { id: `image-${Date.now()}`, url: "", alt: "", caption: "" },
    ]);
  };

  const removeImage = (id: string) => {
    onChange(images.filter((img) => img.id !== id));
  };

  const updateImage = (id: string, field: keyof ImageItem, value: string) => {
    onChange(
      images.map((img) => {
        if (img.id !== id) return img;
        return { ...img, [field]: value };
      })
    );
  };

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Screenshots
        </label>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {images.length}/10 images
        </span>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        Add screenshots to showcase your project. Use relative paths (e.g., ./screenshot.png) or HTTPS URLs.
      </p>

      <div className="space-y-3">
        {images.map((image, index) => {
          const urlError = errors?.get(`images[${index}].url`);

          return (
            <div
              key={image.id}
              className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
            >
              <div className="space-y-2">
                <div>
                  <input
                    type="text"
                    value={image.url}
                    onChange={(e) => updateImage(image.id, "url", e.target.value)}
                    placeholder="./screenshot.png or https://..."
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={image.alt}
                    onChange={(e) => updateImage(image.id, "alt", e.target.value)}
                    placeholder="Alt text (accessibility)"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <input
                    type="text"
                    value={image.caption}
                    onChange={(e) => updateImage(image.id, "caption", e.target.value)}
                    placeholder="Caption (optional)"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end mt-2">
                <button
                  type="button"
                  onClick={() => removeImage(image.id)}
                  className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {images.length < 10 && (
        <button
          type="button"
          onClick={addImage}
          className="mt-3 inline-flex items-center gap-2 px-3 py-2 text-sm text-accent hover:text-accent-hover transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Screenshot
        </button>
      )}
    </div>
  );
}
