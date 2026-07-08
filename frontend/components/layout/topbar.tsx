"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, ChevronDown, LogOut, Search } from "lucide-react";

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
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const displayName = user?.name ?? name;
  const displayRole = user?.role === "owner" ? "Owner" : role;
  const displayEmail = user?.email ?? "Email belum tersedia";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!profileRef.current?.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  async function handleLogout() {
    setIsProfileOpen(false);
    await logout();
    router.replace("/login");
  }

  return (
    <header className="no-print sticky top-0 z-20 border-b border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur lg:px-8">
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
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10"
            aria-label="Notifikasi"
            title="Notifikasi"
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
          </button>
          <div ref={profileRef} className="relative">
            <button
              type="button"
              onClick={() => setIsProfileOpen((current) => !current)}
              className="flex h-11 items-center gap-1 rounded-xl border border-slate-200 bg-white px-1.5 text-left shadow-[3px_3px_8px_rgba(15,23,42,0.05)] transition hover:bg-slate-50"
              aria-expanded={isProfileOpen}
              aria-haspopup="menu"
              aria-label="Buka menu profil"
              title="Profil"
            >
              <div className="neo-button neo-button-primary flex h-9 w-9 items-center justify-center text-sm font-bold">
                {initials}
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            </button>

            {isProfileOpen ? (
              <div
                role="menu"
                className="neo-card absolute right-0 top-full z-50 mt-2 w-72 p-3 text-slate-900"
              >
                <div className="px-2 py-2">
                  <p className="text-sm font-semibold text-slate-950">{displayName}</p>
                  <p className="mt-1 truncate text-xs text-slate-500">{displayEmail}</p>
                  <div className="mt-3">
                    <Badge tone={displayRole === "Owner" ? "blue" : "orange"}>{displayRole}</Badge>
                  </div>
                </div>
                <div className="my-2 h-px bg-slate-200" />
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  role="menuitem"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Keluar
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
