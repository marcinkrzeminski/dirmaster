"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  // AUTH DISABLED
  return <>{children}</>;
}
