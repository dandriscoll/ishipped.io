"use client";

import { useState } from "react";
import Image from "next/image";
import { Lightbox } from "./Lightbox";

interface ImageGalleryProps {
  images: Array<{
    url: string;
    alt?: string;
    caption?: string;
  }>;
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (images.length === 0) return null;

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const isSingle = images.length === 1;

  return (
    <>
      <div className="mb-8">
        {isSingle ? (
          // Single image: larger display
          <button
            onClick={() => openLightbox(0)}
            className="w-full cursor-zoom-in group"
          >
            <div className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
              <Image
                src={images[0].url}
                alt={images[0].alt || "Screenshot"}
                width={800}
                height={400}
                className="w-full h-auto max-h-[400px] object-contain group-hover:opacity-95 transition-opacity"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
                <span className="bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  Click to enlarge
                </span>
              </div>
            </div>
            {images[0].caption && (
              <p className="mt-2 text-sm text-muted dark:text-muted-dark text-center">
                {images[0].caption}
              </p>
            )}
          </button>
        ) : (
          // Multiple images: horizontal scrollable row
          <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex gap-3 min-w-max">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => openLightbox(index)}
                  className="flex-shrink-0 cursor-zoom-in group"
                >
                  <div className="relative w-48 h-32 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <Image
                      src={image.url}
                      alt={image.alt || `Screenshot ${index + 1}`}
                      fill
                      className="object-cover group-hover:opacity-95 transition-opacity"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                      <svg
                        className="w-8 h-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                        />
                      </svg>
                    </div>
                  </div>
                  {image.caption && (
                    <p className="mt-1 text-xs text-muted dark:text-muted-dark text-center truncate max-w-48">
                      {image.caption}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {lightboxOpen && (
        <Lightbox
          images={images}
          currentIndex={currentIndex}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setCurrentIndex}
        />
      )}
    </>
  );
}
