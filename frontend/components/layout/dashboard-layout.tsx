import type { ReactNode } from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export function DashboardLayout({
  children,
  title,
  description,
  role,
  userName,
}: {
  children: ReactNode;
  title: string;
  description: string;
  role: "Admin" | "Owner";
  userName: string;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar role={role} />
      <div className="lg:pl-72">
        <Topbar role={role} name={userName} />
        <main className="px-4 py-6 lg:px-8">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
              Dashboard {role}
            </p>
            <h1 className="mt-2 text-2xl font-bold text-slate-950 md:text-3xl">{title}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{description}</p>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
