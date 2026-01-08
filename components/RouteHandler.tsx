"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CardPageClient } from "@/components/CardPageClient";

export function RouteHandler({ children }: { children: React.ReactNode }) {
  const [routeType, setRouteType] = useState<"loading" | "card" | "other">("loading");
  const pathname = usePathname();

  useEffect(() => {
    // Check if this is a /card/ path with owner/repo
    if (pathname.match(/^\/card\/[^/]+\/[^/]+/)) {
      setRouteType("card");
    } else {
      setRouteType("other");
    }
  }, [pathname]);

  // Show nothing briefly while determining route
  if (routeType === "loading") {
    return null;
  }

  // If it's a /card/owner/repo path, render the card page
  if (routeType === "card") {
    return <CardPageClient />;
  }

  // Otherwise render the normal children
  return <>{children}</>;
}
