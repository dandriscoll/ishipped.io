import { UserPageClient } from "@/components/UserPageClient";

export const dynamicParams = false;

export async function generateStaticParams(): Promise<{ slug?: string[] }[]> {
  // Return empty array - all user routes are handled client-side
  return [{ slug: undefined }];
}

export default function UserPage() {
  return <UserPageClient />;
}
