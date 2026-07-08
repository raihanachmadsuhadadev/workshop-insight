import { RoleGuard } from "@/components/auth/role-guard";

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRole="owner">{children}</RoleGuard>;
}
