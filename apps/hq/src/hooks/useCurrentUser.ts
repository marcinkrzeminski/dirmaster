"use client";

import { db } from "@/lib/db";

export function useCurrentUser() {
  const { user, isLoading } = db.useAuth();
  return { user, isLoading, isAuthenticated: !!user };
}
