"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

interface Props {
  allowedRoles: ("admin" | "user" | "resident" | "guest")[];
  loginPath?: string;
  children: React.ReactNode;
}

export default function RoleGuard({
  allowedRoles,
  loginPath = "/auth/login",
  children,
}: Props) {
  const router = useRouter();

  const { user, token, hasHydrated } = useAuthStore();

  const isGuestAllowed = allowedRoles.includes("guest");
  const isAuthenticated = !!token && !!user;

  useEffect(() => {
    if (!hasHydrated) return; // wait for persist

    // Guest mode: allow unauthenticated users when "guest" is in allowedRoles
    if (!isAuthenticated) {
      if (isGuestAllowed) return; // show content for guests
      router.replace(loginPath);
      return;
    }

    if (!allowedRoles.includes(user!.userType)) {
      router.replace("/unauthorized");
      return;
    }
  }, [hasHydrated, token, user, isGuestAllowed, isAuthenticated]);

  if (!hasHydrated) return null;

  if (!isAuthenticated) {
    if (isGuestAllowed) return <>{children}</>;
    return null;
  }

  if (!allowedRoles.includes(user!.userType)) return null;

  return <>{children}</>;
}