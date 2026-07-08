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
    <div className="neo-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
        </div>
        <div className="neo-icon-accent flex h-12 w-12 items-center justify-center rounded-xl">
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
