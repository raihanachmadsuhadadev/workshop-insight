"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wrench } from "lucide-react";

import { adminNavigation, ownerNavigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function Sidebar({
  role,
}: {
  role: "Admin" | "Owner";
}) {
  const pathname = usePathname();
  const items = role === "Admin" ? adminNavigation : ownerNavigation;

  return (
    <aside className="w-full shrink-0 border-b border-slate-800 bg-slate-950 text-white lg:fixed lg:inset-y-0 lg:left-0 lg:w-72 lg:border-b-0 lg:border-r">
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500 text-white">
            <Wrench className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-300">
              Star Motor
            </p>
            <h1 className="text-lg font-bold">Insight</h1>
          </div>
        </div>

        <nav className="flex gap-2 overflow-x-auto px-4 pb-4 lg:flex-col lg:overflow-visible lg:pb-0">
          {items.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-w-max items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white lg:min-w-0",
                  isActive && "bg-orange-500 text-white shadow-sm shadow-orange-950/30",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto hidden p-5 lg:block">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-semibold">Mode {role}</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              UI foundation siap untuk tahap integrasi auth dan API berikutnya.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
