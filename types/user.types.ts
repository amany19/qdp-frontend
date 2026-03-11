export type UserRole = "admin" | "user" | "resident";

export interface StoredUser {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  userType: UserRole;
}