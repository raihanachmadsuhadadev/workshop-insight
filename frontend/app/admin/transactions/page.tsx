"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, Plus, ReceiptText } from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/loading-state";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import { Toast, type ToastState } from "@/components/ui/toast";
import { formatDateTime, formatRupiah } from "@/lib/format";
import { getTransactions, type Transaction } from "@/lib/services/transactions";

const perPage = 8;

function statusBadge(status: Transaction["status"]) {
  return status === "completed" ? <Badge tone="green">Selesai</Badge> : <Badge tone="red">Dibatalkan</Badge>;
}

function paymentBadge(status: Transaction["payment_status"]) {
  return status === "paid" ? <Badge tone="green">Lunas</Badge> : <Badge tone="orange">Belum Lunas</Badge>;
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<ToastState>(null);

  const loadTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (status) params.status = status;
      if (paymentStatus) params.payment_status = paymentStatus;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      const data = await getTransactions(params);
      setTransactions(data);
      setPage(1);
    } catch {
      setToast({ type: "error", message: "Gagal memuat data transaksi." });
    } finally {
      setIsLoading(false);
    }
  }, [endDate, paymentStatus, search, startDate, status]);

  useEffect(() => {
    const timeout = window.setTimeout(loadTransactions, 250);
    return () => window.clearTimeout(timeout);
  }, [loadTransactions]);

  const totalPages = Math.max(1, Math.ceil(transactions.length / perPage));
  const paginated = useMemo(() => transactions.slice((page - 1) * perPage, page * perPage), [page, transactions]);

  const rows = paginated.map((transaction) => [
    <span key="code" className="font-semibold text-slate-950">{transaction.code}</span>,
    formatDateTime(transaction.transaction_date),
    transaction.customer?.name ?? "-",
    transaction.mechanic?.name ?? "-",
    transaction.vehicle_plate_number ?? "-",
    formatRupiah(transaction.total_amount),
    paymentBadge(transaction.payment_status),
    statusBadge(transaction.status),
    <Link
      key="action"
      href={`/admin/transactions/${transaction.id}`}
      className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
    >
      <Eye className="h-4 w-4" aria-hidden="true" />
      Detail
    </Link>,
  ]);

  return (
    <DashboardLayout
      title="Transaksi Bengkel"
      description="Kelola transaksi suku cadang dan layanan servis bengkel."
      role="Admin"
      userName="Admin Kasir"
    >
      <Toast toast={toast} />
      <Card>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
            <label>
              <span className="mb-2 block text-sm font-semibold text-slate-700">Cari</span>
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Kode, pelanggan, plat..." />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-slate-700">Status</span>
              <Select value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="">Semua</option>
                <option value="completed">Selesai</option>
                <option value="cancelled">Dibatalkan</option>
              </Select>
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-slate-700">Pembayaran</span>
              <Select value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value)}>
                <option value="">Semua</option>
                <option value="paid">Lunas</option>
                <option value="unpaid">Belum Lunas</option>
              </Select>
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-slate-700">Dari</span>
              <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-slate-700">Sampai</span>
              <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
            </label>
          </div>
          <ButtonLink href="/admin/transactions/create">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Input Transaksi
          </ButtonLink>
        </div>
      </Card>

      <div className="mt-6">
        {isLoading ? (
          <LoadingState />
        ) : transactions.length === 0 ? (
          <EmptyState title="Belum ada transaksi" description="Buat transaksi bengkel pertama dari tombol Input Transaksi." icon={ReceiptText} />
        ) : (
          <Card>
            <CardTitle title="Daftar Transaksi" description={`${transactions.length} transaksi ditemukan.`} />
            <DataTable
              columns={["Kode", "Tanggal", "Pelanggan", "Mekanik", "Plat Nomor", "Total", "Pembayaran", "Status", "Aksi"]}
              rows={rows}
            />
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
