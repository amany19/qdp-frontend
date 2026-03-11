import { ReactNode } from "react";
import { useRole } from "@/hooks/useRole";

interface RoleProps {
  roles: ("admin" | "user" | "resident" | "public" | "guest")[];
  children: ReactNode;
}

export default function Role({ roles, children }: RoleProps) {
  const roleType = useRole();
  const canRender = roles.includes(roleType);
  if (!canRender) return null;

  return <>{children}</>;
}