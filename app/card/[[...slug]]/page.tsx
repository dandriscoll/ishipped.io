import { CardPageClient } from "@/components/CardPageClient";

export const dynamicParams = false;

export async function generateStaticParams(): Promise<{ slug?: string[] }[]> {
  // Return empty array - all card routes are handled client-side
  // The static export generates /card/index.html which handles all /card/* routes
  return [{ slug: undefined }];
}

export default function CardPage() {
  return <CardPageClient />;
}
