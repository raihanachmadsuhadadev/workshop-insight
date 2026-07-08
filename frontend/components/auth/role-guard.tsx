"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/context/auth-context";
import type { UserRole } from "@/lib/api";

const roleDashboard: Record<UserRole, string> = {
  admin: "/admin/dashboard",
  owner: "/owner/dashboard",
};

export function RoleGuard({
  allowedRole,
  children,
}: {
  allowedRole: UserRole;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated || !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (user.role !== allowedRole) {
      router.replace("/unauthorized");
    }
  }, [allowedRole, isAuthenticated, isLoading, pathname, router, user]);

  if (isLoading || !isAuthenticated || !user || user.role !== allowedRole) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-orange-500" aria-hidden="true" />
          <span className="text-sm font-semibold">Memeriksa akses...</span>
        </div>
      </div>
    );
  }

  return children;
}

export function getDashboardForRole(role: UserRole | undefined) {
  return role ? roleDashboard[role] : "/login";
}
