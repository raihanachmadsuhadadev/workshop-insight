import { ClipboardList } from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { EmptyState } from "@/components/ui/empty-state";

export function PlaceholderPage({
  role,
  title,
  description,
}: {
  role: "Admin" | "Owner";
  title: string;
  description: string;
}) {
  return (
    <DashboardLayout
      title={title}
      description={description}
      role={role}
      userName={role === "Admin" ? "Admin Kasir" : "Owner Bengkel"}
    >
      <EmptyState title={title} description={description} icon={ClipboardList} />
    </DashboardLayout>
  );
}
