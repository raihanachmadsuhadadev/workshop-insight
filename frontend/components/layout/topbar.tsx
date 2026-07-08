"use client";

import { useRouter } from "next/navigation";
import { Bell, LogOut, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";

export function Topbar({
  role,
  name,
}: {
  role: "Admin" | "Owner";
  name: string;
}) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const displayName = user?.name ?? name;
  const displayRole = user?.role === "owner" ? "Owner" : role;
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50/90 px-4 py-3 backdrop-blur lg:px-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <Input placeholder="Cari transaksi, stok, atau laporan..." className="pl-9" />
        </div>
        <div className="flex items-center justify-between gap-3 md:justify-end">
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
            aria-label="Notifikasi"
            title="Notifikasi"
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-orange-300">
              {initials}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-950">{displayName}</p>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={displayRole === "Owner" ? "blue" : "orange"}>{displayRole}</Badge>
                {user?.email ? <span className="text-xs text-slate-500">{user.email}</span> : null}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-red-50 hover:text-red-600"
            aria-label="Logout"
            title="Logout"
          >
            <LogOut className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}
