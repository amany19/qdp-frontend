export type UserRole = "admin" | "user" | "resident";

export interface AuthUser {
  id: string;
  role: UserRole;
}