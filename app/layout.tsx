import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "iShipped.io - Project Cards for GitHub Repos",
  description:
    "Ship it. Show it. Share it. Beautiful project cards for your GitHub repositories.",
  openGraph: {
    title: "iShipped.io",
    description: "Project cards for GitHub repos",
    type: "website",
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
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
