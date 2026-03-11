import { useAuthStore } from "@/store/authStore";

export type RoleType = "admin" | "user" | "resident" | "public" | "guest";

export function useRole(): RoleType {
  const { user } = useAuthStore();

  if (!user) return "guest";

  return user.userType as RoleType;
}