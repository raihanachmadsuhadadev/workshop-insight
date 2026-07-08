import { ClipboardList } from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { EmptyState } from "@/components/ui/empty-state";

export function PlaceholderPage({
  role,
  title,
  description,
  eyebrow,
}: {
  role: "Admin" | "Owner";
  title: string;
  description: string;
  eyebrow?: string;
}) {
  return (
    <DashboardLayout
      title={title}
      description={description}
      role={role}
      userName={role === "Admin" ? "Admin Kasir" : "Owner Bengkel"}
      eyebrow={eyebrow}
    >
      <EmptyState title={title} description={description} icon={ClipboardList} />
    </DashboardLayout>
  );
}
