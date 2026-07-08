import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export function StatCard({
  title,
  value,
  trend,
  icon: Icon,
  tone = "orange",
}: {
  title: string;
  value: string;
  trend?: string;
  icon: LucideIcon;
  tone?: "orange" | "green" | "red" | "blue" | "slate";
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
        </div>
        <div className="rounded-xl bg-slate-950 p-3 text-orange-400">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
      {trend ? (
        <div className="mt-4">
          <Badge tone={tone}>{trend}</Badge>
        </div>
      ) : null}
    </div>
  );
}
