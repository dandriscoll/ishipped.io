import { BuilderPageClient } from "@/components/builder/BuilderPageClient";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return [];
}

export default function BuilderPage() {
  return <BuilderPageClient />;
}
