"use client";

import { useEffect, useState } from "react";
import { BarChart3, CircleDollarSign, ClipboardList, Sparkles, UsersRound } from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { LoadingState } from "@/components/ui/loading-state";
import { StatCard } from "@/components/ui/stat-card";
import { Toast, type ToastState } from "@/components/ui/toast";
import { formatDateTime, formatRupiah } from "@/lib/format";
import { getOwnerDashboard, type OwnerDashboardData } from "@/lib/services/dashboard";

function join(items?: string[]) {
  return items?.join(", ") || "-";
}

export default function OwnerDashboardPage() {
  const [data, setData] = useState<OwnerDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setData(await getOwnerDashboard());
      } catch {
        setToast({ type: "error", message: "Gagal memuat dashboard owner." });
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, []);

  return (
    <DashboardLayout title="Insight Owner Bengkel" description="Lihat performa transaksi, hasil association rule, dan rekomendasi paket servis." role="Owner" userName="Owner Bengkel">
      <Toast toast={toast} />
      {isLoading || !data ? (
        <LoadingState />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Total Transaksi" value={String(data.summary.total_transactions)} trend="Semua status" icon={ClipboardList} />
            <StatCard title="Total Pendapatan" value={formatRupiah(data.summary.total_revenue)} trend="Completed only" icon={CircleDollarSign} tone="green" />
            <StatCard title="Total Pelanggan" value={String(data.summary.total_customers)} trend={`${data.summary.total_spare_parts} suku cadang`} icon={UsersRound} tone="blue" />
            <StatCard title="Analisis Pola" value={String(data.summary.total_apriori_runs)} trend={`${data.summary.low_stock_count} stok kritis`} icon={BarChart3} />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <Card>
              <CardTitle title="Analisis Pola Terbaru" description="Hasil analisis terbaru yang sudah selesai." />
              {data.latest_apriori_run ? (
                <div className="grid gap-3 text-sm md:grid-cols-2">
                  <Info label="Kode" value={data.latest_apriori_run.code} />
                  <Info label="Tanggal" value={formatDateTime(data.latest_apriori_run.ran_at)} />
                  <Info label="Min Support" value={`${Number(data.latest_apriori_run.minimum_support) * 100}%`} />
                  <Info label="Min Confidence" value={`${Number(data.latest_apriori_run.minimum_confidence) * 100}%`} />
                  <Info label="Total Rules" value={String(data.latest_apriori_run.total_rules)} />
                  <Info label="Periode" value={data.latest_apriori_run.start_date || data.latest_apriori_run.end_date ? `${data.latest_apriori_run.start_date ?? "..."} - ${data.latest_apriori_run.end_date ?? "..."}` : "Semua periode"} />
                </div>
              ) : <p className="text-sm text-slate-500">Belum ada analisis pola.</p>}
            </Card>

            <Card>
              <CardTitle title="Rekomendasi Terbaru" />
              <div className="space-y-3">
                {data.latest_recommendations.length === 0 ? <p className="text-sm text-slate-500">Belum ada rekomendasi.</p> : data.latest_recommendations.map((item, index) => (
                  <div key={`${item.title}-${index}`} className="rounded-xl bg-orange-50 p-4">
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-5 w-5 text-orange-600" aria-hidden="true" />
                      <span className="font-semibold text-slate-800">{item.title}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">{item.suggestion}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <Card>
              <CardTitle title="Latest Association Rules" />
              <DataTable
                columns={["Antecedents", "Consequents", "Support %", "Confidence %", "Lift"]}
                rows={data.latest_rules.map((rule) => [
                  join(rule.antecedents),
                  join(rule.consequents),
                  `${rule.support_percentage}%`,
                  `${rule.confidence_percentage}%`,
                  rule.lift,
                ])}
              />
            </Card>
            <Card>
              <CardTitle title="Top Item" description="Suku cadang dan layanan teratas." />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <Badge tone="orange">Suku Cadang</Badge>
                  {data.top_spare_parts.map((item) => <p key={item.item_code} className="text-sm font-semibold text-slate-700">{item.item_name} · {item.total_quantity}x</p>)}
                </div>
                <div className="space-y-3">
                  <Badge tone="blue">Layanan</Badge>
                  {data.top_services.map((item) => <p key={item.item_code} className="text-sm font-semibold text-slate-700">{item.item_name} · {item.total_quantity}x</p>)}
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-900">{value}</p>
    </div>
  );
}
