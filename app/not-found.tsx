"use client";

import { useEffect, useState } from "react";
import { CardPageClient } from "@/components/CardPageClient";

export default function NotFound() {
  const [isCardPath, setIsCardPath] = useState<boolean | null>(null);

  useEffect(() => {
    const pathname = window.location.pathname;
    setIsCardPath(pathname.startsWith("/card/"));
  }, []);

  // Show nothing while determining path
  if (isCardPath === null) {
    return null;
  }

  // If it's a /card/* path, render the card page
  if (isCardPath) {
    return <CardPageClient />;
  }

  // Otherwise show the default 404
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">404</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">Page not found</h1>
        <p className="text-muted dark:text-muted-dark mb-6">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <a
          href="/"
          className="inline-block px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-md transition-colors"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
