"use client";

import { useEffect, useMemo, useState } from "react";
import { FileBarChart, Printer } from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/loading-state";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import { StatCard } from "@/components/ui/stat-card";
import { Toast, type ToastState } from "@/components/ui/toast";
import { formatDateTime, formatRupiah } from "@/lib/format";
import { getOwnerTransactionReport, type TransactionReport } from "@/lib/services/reports";

export default function OwnerReportsPage() {
  const [report, setReport] = useState<TransactionReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<ToastState>(null);
  const [filter, setFilter] = useState({ search: "", start_date: "", end_date: "", status: "" });
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    async function loadReport() {
      setIsLoading(true);
      try {
        const params = Object.fromEntries(Object.entries(filter).filter(([, value]) => value));
        setReport(await getOwnerTransactionReport(params));
        setPage(1);
      } catch {
        setToast({ type: "error", message: "Gagal memuat laporan transaksi owner." });
      } finally {
        setIsLoading(false);
      }
    }
    const timeout = window.setTimeout(loadReport, 250);
    return () => window.clearTimeout(timeout);
  }, [filter]);

  const reportData = useMemo(() => report?.data ?? [], [report]);
  const totalPages = Math.max(1, Math.ceil(reportData.length / itemsPerPage));
  const activePage = Math.min(page, totalPages);
  const paginatedReportData = useMemo(
    () => reportData.slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage),
    [activePage, itemsPerPage, reportData],
  );

  const rows = useMemo(() => paginatedReportData.map((transaction) => [
    transaction.code,
    formatDateTime(transaction.transaction_date),
    transaction.customer?.name ?? "-",
    transaction.mechanic?.name ?? "-",
    transaction.vehicle_plate_number ?? "-",
    formatRupiah(transaction.total_amount),
    transaction.payment_status === "paid" ? <Badge key="payment" tone="green">Lunas</Badge> : <Badge key="payment" tone="orange">Belum Lunas</Badge>,
    transaction.status === "completed" ? <Badge key="status" tone="green">Selesai</Badge> : <Badge key="status" tone="red">Dibatalkan</Badge>,
  ]), [paginatedReportData]);

  return (
    <DashboardLayout title="Laporan Owner" description="Laporan transaksi bengkel untuk owner." role="Owner" userName="Owner Bengkel" eyebrow="Laporan">
      <Toast toast={toast} />
      <section className="print-area">
        <div className="no-print mb-6 flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={() => window.print()}><Printer className="h-4 w-4" aria-hidden="true" />Print</Button>
        </div>
        <div className="print-only mb-4">
          <h1 className="text-xl font-bold">Workshop Insight</h1>
          <p className="font-semibold">Laporan Transaksi Bengkel</p>
          <p className="text-sm">Tanggal cetak: {formatDateTime(new Date().toISOString())}</p>
        </div>
        <Card className="no-print mb-6">
          <div className="grid gap-3 md:grid-cols-4">
            <Input placeholder="Cari transaksi..." value={filter.search} onChange={(e) => setFilter({ ...filter, search: e.target.value })} />
            <Input type="date" value={filter.start_date} onChange={(e) => setFilter({ ...filter, start_date: e.target.value })} />
            <Input type="date" value={filter.end_date} onChange={(e) => setFilter({ ...filter, end_date: e.target.value })} />
            <Select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}><option value="">Semua Status</option><option value="completed">Selesai</option><option value="cancelled">Dibatalkan</option></Select>
          </div>
        </Card>
        {isLoading || !report ? <LoadingState /> : (
          <>
            <div className="mb-6 grid gap-4 md:grid-cols-4">
              <StatCard title="Total Transaksi" value={String(report.summary.total_transactions)} icon={FileBarChart} />
              <StatCard title="Selesai" value={String(report.summary.completed_transactions)} icon={FileBarChart} tone="green" />
              <StatCard title="Dibatalkan" value={String(report.summary.cancelled_transactions)} icon={FileBarChart} tone="red" />
              <StatCard title="Pendapatan" value={formatRupiah(report.summary.total_revenue)} icon={FileBarChart} tone="blue" />
            </div>
            <Card>
              <CardTitle title="Data Transaksi" />
              {reportData.length === 0 ? <EmptyState title="Tidak ada transaksi" description="Tidak ada data sesuai filter." icon={FileBarChart} /> : (
                <>
                  <DataTable columns={["Kode", "Tanggal", "Pelanggan", "Mekanik", "Plat", "Total", "Bayar", "Status"]} rows={rows} />
                  <Pagination
                    currentPage={activePage}
                    totalItems={reportData.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setPage}
                    onItemsPerPageChange={(nextItemsPerPage) => {
                      setItemsPerPage(nextItemsPerPage);
                      setPage(1);
                    }}
                  />
                </>
              )}
            </Card>
          </>
        )}
      </section>
    </DashboardLayout>
  );
}
