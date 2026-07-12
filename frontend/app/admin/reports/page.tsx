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
import { getAdminStockReport, getAdminTransactionReport, type StockReport, type TransactionReport } from "@/lib/services/reports";

function statusBadge(status: string) {
  return status === "completed" ? <Badge tone="green">Selesai</Badge> : <Badge tone="red">Dibatalkan</Badge>;
}

export default function AdminReportsPage() {
  const [tab, setTab] = useState<"transactions" | "stocks">("transactions");
  const [transactionReport, setTransactionReport] = useState<TransactionReport | null>(null);
  const [stockReport, setStockReport] = useState<StockReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<ToastState>(null);
  const [transactionFilter, setTransactionFilter] = useState({ search: "", start_date: "", end_date: "", status: "", payment_status: "" });
  const [stockFilter, setStockFilter] = useState({ search: "", stock_status: "all" });
  const [transactionPage, setTransactionPage] = useState(1);
  const [transactionItemsPerPage, setTransactionItemsPerPage] = useState(10);
  const [stockPage, setStockPage] = useState(1);
  const [stockItemsPerPage, setStockItemsPerPage] = useState(10);

  useEffect(() => {
    async function loadReports() {
      setIsLoading(true);
      try {
        if (tab === "transactions") {
          const params = Object.fromEntries(Object.entries(transactionFilter).filter(([, value]) => value));
          setTransactionReport(await getAdminTransactionReport(params));
          setTransactionPage(1);
        } else {
          const params = Object.fromEntries(Object.entries(stockFilter).filter(([, value]) => value && value !== "all"));
          setStockReport(await getAdminStockReport(params));
          setStockPage(1);
        }
      } catch {
        setToast({ type: "error", message: "Gagal memuat laporan." });
      } finally {
        setIsLoading(false);
      }
    }
    const timeout = window.setTimeout(loadReports, 250);
    return () => window.clearTimeout(timeout);
  }, [stockFilter, tab, transactionFilter]);

  const transactionData = useMemo(() => transactionReport?.data ?? [], [transactionReport]);
  const stockData = useMemo(() => stockReport?.data ?? [], [stockReport]);
  const transactionTotalPages = Math.max(1, Math.ceil(transactionData.length / transactionItemsPerPage));
  const stockTotalPages = Math.max(1, Math.ceil(stockData.length / stockItemsPerPage));
  const activeTransactionPage = Math.min(transactionPage, transactionTotalPages);
  const activeStockPage = Math.min(stockPage, stockTotalPages);
  const paginatedTransactions = useMemo(
    () => transactionData.slice((activeTransactionPage - 1) * transactionItemsPerPage, activeTransactionPage * transactionItemsPerPage),
    [activeTransactionPage, transactionData, transactionItemsPerPage],
  );
  const paginatedStock = useMemo(
    () => stockData.slice((activeStockPage - 1) * stockItemsPerPage, activeStockPage * stockItemsPerPage),
    [activeStockPage, stockData, stockItemsPerPage],
  );

  const transactionRows = useMemo(() => paginatedTransactions.map((transaction) => [
    transaction.code,
    formatDateTime(transaction.transaction_date),
    transaction.customer?.name ?? "-",
    transaction.mechanic?.name ?? "-",
    transaction.vehicle_plate_number ?? "-",
    formatRupiah(transaction.subtotal_spare_parts),
    formatRupiah(transaction.subtotal_services),
    formatRupiah(transaction.discount_amount),
    formatRupiah(transaction.total_amount),
    transaction.payment_status === "paid" ? <Badge key="payment" tone="green">Lunas</Badge> : <Badge key="payment" tone="orange">Belum Lunas</Badge>,
    statusBadge(transaction.status),
  ]), [paginatedTransactions]);

  const stockRows = useMemo(() => paginatedStock.map((item) => [
    item.code,
    item.name,
    item.category ?? "-",
    item.brand ?? "-",
    item.current_stock,
    item.minimum_stock,
    formatRupiah(item.purchase_price),
    formatRupiah(item.selling_price),
    item.stock_status === "low" ? <Badge key="stock" tone="red">Kritis</Badge> : <Badge key="stock" tone="green">Aman</Badge>,
    formatRupiah(item.stock_value),
  ]), [paginatedStock]);

  return (
    <DashboardLayout title="Laporan Bengkel" description="Laporan transaksi dan stok suku cadang siap cetak." role="Admin" userName="Admin Kasir" eyebrow="Laporan">
      <Toast toast={toast} />
      <div className="no-print mb-6 flex flex-wrap gap-2">
        <Button type="button" variant={tab === "transactions" ? "primary" : "secondary"} onClick={() => setTab("transactions")}>Laporan Transaksi</Button>
        <Button type="button" variant={tab === "stocks" ? "primary" : "secondary"} onClick={() => setTab("stocks")}>Laporan Stok</Button>
        <Button type="button" variant="secondary" onClick={() => window.print()}><Printer className="h-4 w-4" aria-hidden="true" />Print</Button>
      </div>

      {tab === "transactions" ? (
        <section className="print-area">
          <PrintHeader title="Laporan Transaksi Bengkel" />
          <Card className="no-print mb-6">
            <div className="grid gap-3 md:grid-cols-5">
              <Input placeholder="Cari transaksi..." value={transactionFilter.search} onChange={(e) => setTransactionFilter({ ...transactionFilter, search: e.target.value })} />
              <Input type="date" value={transactionFilter.start_date} onChange={(e) => setTransactionFilter({ ...transactionFilter, start_date: e.target.value })} />
              <Input type="date" value={transactionFilter.end_date} onChange={(e) => setTransactionFilter({ ...transactionFilter, end_date: e.target.value })} />
              <Select value={transactionFilter.status} onChange={(e) => setTransactionFilter({ ...transactionFilter, status: e.target.value })}><option value="">Semua Status</option><option value="completed">Selesai</option><option value="cancelled">Dibatalkan</option></Select>
              <Select value={transactionFilter.payment_status} onChange={(e) => setTransactionFilter({ ...transactionFilter, payment_status: e.target.value })}><option value="">Semua Pembayaran</option><option value="paid">Lunas</option><option value="unpaid">Belum Lunas</option></Select>
            </div>
          </Card>
          {isLoading || !transactionReport ? <LoadingState /> : (
            <>
              <div className="mb-6 grid gap-4 md:grid-cols-4">
                <StatCard title="Total Transaksi" value={String(transactionReport.summary.total_transactions)} icon={FileBarChart} />
                <StatCard title="Selesai" value={String(transactionReport.summary.completed_transactions)} icon={FileBarChart} tone="green" />
                <StatCard title="Dibatalkan" value={String(transactionReport.summary.cancelled_transactions)} icon={FileBarChart} tone="red" />
                <StatCard title="Pendapatan" value={formatRupiah(transactionReport.summary.total_revenue)} icon={FileBarChart} tone="blue" />
              </div>
              <Card>
                <CardTitle title="Data Transaksi" description={`Dicetak: ${formatDateTime(new Date().toISOString())}`} />
                {transactionData.length === 0 ? <EmptyState title="Tidak ada transaksi" description="Tidak ada data sesuai filter." icon={FileBarChart} /> : (
                  <>
                    <DataTable columns={["Kode", "Tanggal", "Pelanggan", "Mekanik", "Plat", "Spare Part", "Servis", "Diskon", "Total", "Bayar", "Status"]} rows={transactionRows} />
                    <Pagination
                      currentPage={activeTransactionPage}
                      totalItems={transactionData.length}
                      itemsPerPage={transactionItemsPerPage}
                      onPageChange={setTransactionPage}
                      onItemsPerPageChange={(nextItemsPerPage) => {
                        setTransactionItemsPerPage(nextItemsPerPage);
                        setTransactionPage(1);
                      }}
                    />
                  </>
                )}
              </Card>
            </>
          )}
        </section>
      ) : (
        <section className="print-area">
          <PrintHeader title="Laporan Stok Suku Cadang" />
          <Card className="no-print mb-6">
            <div className="grid gap-3 md:grid-cols-2">
              <Input placeholder="Cari suku cadang..." value={stockFilter.search} onChange={(e) => setStockFilter({ ...stockFilter, search: e.target.value })} />
              <Select value={stockFilter.stock_status} onChange={(e) => setStockFilter({ ...stockFilter, stock_status: e.target.value })}><option value="all">Semua Stok</option><option value="safe">Aman</option><option value="low">Kritis</option></Select>
            </div>
          </Card>
          {isLoading || !stockReport ? <LoadingState /> : (
            <>
              <div className="mb-6 grid gap-4 md:grid-cols-4">
                <StatCard title="Total Spare Part" value={String(stockReport.summary.total_spare_parts)} icon={FileBarChart} />
                <StatCard title="Stok Aman" value={String(stockReport.summary.safe_stock)} icon={FileBarChart} tone="green" />
                <StatCard title="Stok Kritis" value={String(stockReport.summary.low_stock)} icon={FileBarChart} tone="red" />
                <StatCard title="Nilai Stok" value={formatRupiah(stockReport.summary.total_stock_value)} icon={FileBarChart} tone="blue" />
              </div>
              <Card>
                <CardTitle title="Data Stok" description={`Dicetak: ${formatDateTime(new Date().toISOString())}`} />
                {stockData.length === 0 ? <EmptyState title="Tidak ada stok" description="Tidak ada data sesuai filter." icon={FileBarChart} /> : (
                  <>
                    <DataTable columns={["Kode", "Nama", "Kategori", "Brand", "Stok", "Minimum", "Harga Beli", "Harga Jual", "Status", "Nilai Stok"]} rows={stockRows} />
                    <Pagination
                      currentPage={activeStockPage}
                      totalItems={stockData.length}
                      itemsPerPage={stockItemsPerPage}
                      onPageChange={setStockPage}
                      onItemsPerPageChange={(nextItemsPerPage) => {
                        setStockItemsPerPage(nextItemsPerPage);
                        setStockPage(1);
                      }}
                    />
                  </>
                )}
              </Card>
            </>
          )}
        </section>
      )}
    </DashboardLayout>
  );
}

function PrintHeader({ title }: { title: string }) {
  return (
    <div className="print-only mb-4">
      <h1 className="text-xl font-bold">Workshop Insight</h1>
      <p className="font-semibold">{title}</p>
      <p className="text-sm">Tanggal cetak: {formatDateTime(new Date().toISOString())}</p>
    </div>
  );
}
