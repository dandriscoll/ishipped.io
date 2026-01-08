"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RateLimitPage() {
  const [countdown, setCountdown] = useState(60);
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-orange-600 dark:text-orange-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">Slow down!</h1>
        <p className="text-muted dark:text-muted-dark mb-6">
          We&apos;ve hit GitHub&apos;s rate limit. Please try again in a few
          minutes.
        </p>
        <button
          onClick={() => router.back()}
          disabled={countdown > 0}
          className={`px-4 py-2 rounded-md transition-colors ${
            countdown > 0
              ? "bg-gray-200 dark:bg-gray-700 text-muted dark:text-muted-dark cursor-not-allowed"
              : "bg-accent hover:bg-accent-hover text-white"
          }`}
        >
          {countdown > 0 ? `Retry in ${countdown}s` : "Retry"}
        </button>
      </div>
    </div>
  );
}
