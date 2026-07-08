"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CircleDollarSign, FileBarChart, Plus, ReceiptText, UsersRound } from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { LoadingState } from "@/components/ui/loading-state";
import { StatCard } from "@/components/ui/stat-card";
import { Toast, type ToastState } from "@/components/ui/toast";
import { formatDateTime, formatRupiah } from "@/lib/format";
import { getAdminDashboard, type AdminDashboardData } from "@/lib/services/dashboard";

function statusBadge(status: string) {
  return status === "completed" ? <Badge tone="green">Selesai</Badge> : <Badge tone="red">Dibatalkan</Badge>;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setData(await getAdminDashboard());
      } catch {
        setToast({ type: "error", message: "Gagal memuat dashboard admin." });
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, []);

  return (
    <DashboardLayout title="Ringkasan Operasional Bengkel" description="Pantau transaksi, pendapatan, pelanggan, dan stok kritis dalam satu layar." role="Admin" userName="Admin Kasir">
      <Toast toast={toast} />
      {isLoading || !data ? (
        <LoadingState />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Transaksi Hari Ini" value={String(data.summary.total_transactions_today)} trend="Data hari ini" icon={ReceiptText} />
            <StatCard title="Pendapatan Hari Ini" value={formatRupiah(data.summary.revenue_today)} trend="Completed only" icon={CircleDollarSign} tone="green" />
            <StatCard title="Total Pelanggan" value={String(data.summary.total_customers)} trend={`${data.summary.total_spare_parts} suku cadang`} icon={UsersRound} tone="blue" />
            <StatCard title="Stok Kritis" value={`${data.summary.low_stock_count} item`} trend="Perlu restock" icon={AlertTriangle} tone="red" />
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <Card>
              <CardTitle title="Transaksi Terbaru" description="Transaksi terbaru dari database." />
              <DataTable
                columns={["Kode", "Tanggal", "Pelanggan", "Total", "Status"]}
                rows={data.recent_transactions.map((transaction) => [
                  transaction.code,
                  formatDateTime(transaction.transaction_date),
                  transaction.customer?.name ?? "-",
                  formatRupiah(transaction.total_amount),
                  statusBadge(transaction.status),
                ])}
              />
            </Card>

            <Card>
              <CardTitle title="Quick Action" description="Aksi cepat untuk operasional kasir." />
              <div className="grid gap-3">
                <ButtonLink href="/admin/transactions/create" className="w-full justify-start whitespace-nowrap">
                  <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>Input Transaksi</span>
                </ButtonLink>
                <ButtonLink
                  href="/admin/spare-parts"
                  variant="secondary"
                  className="w-full justify-start whitespace-nowrap"
                >
                  <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>Kelola Suku Cadang</span>
                </ButtonLink>
                <ButtonLink href="/admin/reports" variant="secondary" className="w-full justify-start whitespace-nowrap">
                  <FileBarChart className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>Lihat Laporan</span>
                </ButtonLink>
              </div>
            </Card>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <Card>
              <CardTitle title="Top Suku Cadang" />
              <div className="space-y-3">
                {data.top_spare_parts.map((item) => (
                  <div key={item.item_code} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                    <span className="font-semibold text-slate-800">{item.item_name}</span>
                    <Badge tone="orange">{item.total_quantity}x</Badge>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <CardTitle title="Top Layanan" />
              <div className="space-y-3">
                {data.top_services.map((item) => (
                  <div key={item.item_code} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                    <span className="font-semibold text-slate-800">{item.item_name}</span>
                    <Badge tone="blue">{item.total_quantity}x</Badge>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <CardTitle title="Stok Rendah" />
              <div className="space-y-3">
                {data.low_stock_items.length === 0 ? <p className="text-sm text-slate-500">Tidak ada stok kritis.</p> : data.low_stock_items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-xl bg-red-50 p-3">
                    <span className="font-semibold text-slate-800">{item.name}</span>
                    <Badge tone="red">{item.current_stock}/{item.minimum_stock}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
