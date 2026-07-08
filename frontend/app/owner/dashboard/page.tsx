import { BarChart3, CircleDollarSign, ClipboardList, Database, Sparkles } from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { StatCard } from "@/components/ui/stat-card";

export default function OwnerDashboardPage() {
  return (
    <DashboardLayout
      title="Insight Owner Bengkel"
      description="Lihat performa transaksi, hasil association rule, dan rekomendasi paket servis."
      role="Owner"
      userName="Owner Bengkel"
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Transaksi" value="1.284" trend="+8% bulan ini" icon={ClipboardList} />
        <StatCard
          title="Total Pendapatan"
          value="Rp 246 jt"
          trend="+14% bulan ini"
          icon={CircleDollarSign}
          tone="green"
        />
        <StatCard title="Total Item Dianalisis" value="68 item" trend="Dataset siap" icon={Database} tone="blue" />
        <StatCard
          title="Association Rule Terakhir"
          value="18 rule"
          trend="Confidence min. 70%"
          icon={BarChart3}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardTitle title="Preview Hasil Apriori" description="Rule dummy dari transaksi servis dan suku cadang." />
          <DataTable
            columns={["Rule", "Support", "Confidence", "Lift"]}
            rows={[
              ["Oli Mesin -> Servis Ringan", "32%", "82%", "1.34"],
              ["Tune Up -> Busi", "24%", "76%", "1.21"],
              ["Kampas Rem -> Rem Safety Check", "19%", "73%", "1.18"],
            ]}
          />
        </Card>

        <Card>
          <CardTitle title="Rekomendasi Paket" description="Paket awal berbasis pola pembelian." />
          <div className="space-y-3">
            {[
              "Paket Oli + Servis Ringan",
              "Paket Tune Up + Busi",
              "Paket Rem Safety Check",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-xl bg-orange-50 p-4">
                <Sparkles className="h-5 w-5 text-orange-600" aria-hidden="true" />
                <span className="font-semibold text-slate-800">{item}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {[
          ["Ringkasan Transaksi", "Transaksi servis ringan mendominasi dataset bulan ini.", "blue"],
          ["Kualitas Rule", "Sebagian besar rule memenuhi confidence minimum simulasi.", "green"],
          ["Peluang Paket", "Bundling oli dan servis ringan layak dijadikan promo.", "orange"],
        ].map(([title, description, tone]) => (
          <Card key={title}>
            <Badge tone={tone as "blue" | "green" | "orange"}>{title}</Badge>
            <p className="mt-4 text-sm leading-6 text-slate-600">{description}</p>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
