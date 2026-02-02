import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeProvider";
import { BUILD_VERSION } from "@/lib/version";
import { RouteHandler } from "@/components/RouteHandler";

export const metadata: Metadata = {
  metadataBase: new URL("https://ishipped.io"),
  title: "iShipped.io - Project Cards for GitHub Repos",
  description:
    "Ship it. Show it. Share it. Beautiful project cards for your GitHub repositories.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "iShipped.io",
    description: "Project cards for GitHub repos",
    type: "website",
    images: [
      {
        url: "/ishipped.io.png",
        width: 1200,
        height: 630,
        alt: "iShipped.io - Project Cards for GitHub Repos",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-white dark:bg-bg-dark text-gray-900 dark:text-text-dark antialiased">
        <ThemeProvider>
          <Header />
          <main>
            <RouteHandler>{children}</RouteHandler>
          </main>
          <footer className="py-4 text-center text-xs text-gray-500 dark:text-gray-400">
            {BUILD_VERSION}
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
