/**
 * Build version loader.
 *
 * The version string is injected at build time via the NEXT_PUBLIC_BUILD_VERSION
 * environment variable. Falls back to "development" for local dev.
 */
export const BUILD_VERSION: string =
  process.env.NEXT_PUBLIC_BUILD_VERSION || "development";
