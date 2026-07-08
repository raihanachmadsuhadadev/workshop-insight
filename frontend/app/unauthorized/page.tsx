"use client";

import { ShieldAlert } from "lucide-react";

import { getDashboardForRole } from "@/components/auth/role-guard";
import { ButtonLink } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";

export default function UnauthorizedPage() {
  const { user, isAuthenticated } = useAuth();
  const href = isAuthenticated ? getDashboardForRole(user?.role) : "/login";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <section className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-red-100 text-red-600">
          <ShieldAlert className="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-slate-950">Akses Ditolak</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Anda tidak memiliki akses ke halaman ini.
        </p>
        <ButtonLink href={href} className="mt-6">
          Kembali ke Dashboard
        </ButtonLink>
      </section>
    </main>
  );
}
