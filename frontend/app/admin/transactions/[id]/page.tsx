"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { ArrowLeft, Ban, Printer } from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { LoadingState } from "@/components/ui/loading-state";
import { Modal } from "@/components/ui/modal";
import { Toast, type ToastState } from "@/components/ui/toast";
import { formatDateTime, formatRupiah } from "@/lib/format";
import { cancelTransaction, getTransaction, type Transaction } from "@/lib/services/transactions";

function statusBadge(status: Transaction["status"]) {
  return status === "completed" ? <Badge tone="green">Selesai</Badge> : <Badge tone="red">Dibatalkan</Badge>;
}

function paymentBadge(status: Transaction["payment_status"]) {
  return status === "paid" ? <Badge tone="green">Lunas</Badge> : <Badge tone="orange">Belum Lunas</Badge>;
}

export default function TransactionDetailPage() {
  const params = useParams<{ id: string }>();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    let isActive = true;

    async function run() {
      setIsLoading(true);
      try {
        const data = await getTransaction(params.id);
        if (isActive) {
          setTransaction(data);
        }
      } catch {
        if (isActive) {
          setToast({ type: "error", message: "Gagal memuat detail transaksi." });
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    run();

    return () => {
      isActive = false;
    };
  }, [params.id]);

  async function handleCancel() {
    if (!reason.trim() || !transaction) {
      setToast({ type: "error", message: "Alasan pembatalan wajib diisi." });
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await cancelTransaction(transaction.id, reason);
      setTransaction(data);
      setIsCancelOpen(false);
      setReason("");
      setToast({ type: "success", message: "Transaksi berhasil dibatalkan dan stok dikembalikan." });
    } catch {
      setToast({ type: "error", message: "Gagal membatalkan transaksi." });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading || !transaction) {
    return (
      <DashboardLayout title="Detail Transaksi" description="Memuat detail transaksi." role="Admin" userName="Admin Kasir">
        <Toast toast={toast} />
        <LoadingState />
      </DashboardLayout>
    );
  }

  const itemRows = (transaction.items ?? []).map((item) => [
    item.item_type === "spare_part" ? <Badge key="type" tone="orange">Suku Cadang</Badge> : <Badge key="type" tone="blue">Servis</Badge>,
    `${item.item_code} - ${item.item_name}`,
    item.quantity,
    formatRupiah(item.unit_price),
    formatRupiah(item.subtotal),
  ]);

  const movementRows = (transaction.stock_movements ?? []).map((movement) => [
    formatDateTime(movement.created_at),
    movement.spare_part?.name ?? "-",
    movement.movement_type === "out" ? <Badge key="type" tone="red">Keluar</Badge> : <Badge key="type" tone="blue">Reversal</Badge>,
    movement.quantity,
    movement.stock_before,
    movement.stock_after,
    movement.created_by?.name ?? "-",
  ]);

  return (
    <DashboardLayout title="Detail Transaksi" description={transaction.code} role="Admin" userName="Admin Kasir">
      <Toast toast={toast} />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/admin/transactions" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Kembali ke Transaksi
        </Link>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={() => window.print()}>
            <Printer className="h-4 w-4" aria-hidden="true" />
            Print
          </Button>
          {transaction.status === "completed" ? (
            <Button type="button" className="bg-red-600 hover:bg-red-700" onClick={() => setIsCancelOpen(true)}>
              <Ban className="h-4 w-4" aria-hidden="true" />
              Batalkan
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Card>
            <CardTitle title="Informasi Transaksi" />
            <div className="grid gap-4 text-sm md:grid-cols-2">
              <Info label="Kode" value={transaction.code} />
              <Info label="Tanggal" value={formatDateTime(transaction.transaction_date)} />
              <Info label="Status" value={statusBadge(transaction.status)} />
              <Info label="Pembayaran" value={paymentBadge(transaction.payment_status)} />
              <Info label="Pelanggan" value={transaction.customer?.name ?? "-"} />
              <Info label="Mekanik" value={transaction.mechanic?.name ?? "-"} />
              <Info label="Kasir" value={transaction.cashier?.name ?? "-"} />
              <Info label="Plat Nomor" value={transaction.vehicle_plate_number ?? "-"} />
              <Info label="Kendaraan" value={transaction.vehicle_description ?? "-"} />
              <Info label="Catatan" value={transaction.notes ?? "-"} />
            </div>
          </Card>

          <Card>
            <CardTitle title="Item Transaksi" />
            <DataTable columns={["Tipe", "Item", "Qty", "Harga", "Subtotal"]} rows={itemRows} />
          </Card>

          <Card>
            <CardTitle title="Mutasi Stok Terkait" />
            <DataTable columns={["Tanggal", "Suku Cadang", "Tipe", "Qty", "Sebelum", "Sesudah", "Dibuat Oleh"]} rows={movementRows} />
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardTitle title="Ringkasan Pembayaran" />
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span>Subtotal Suku Cadang</span><strong>{formatRupiah(transaction.subtotal_spare_parts)}</strong></div>
              <div className="flex justify-between"><span>Subtotal Layanan</span><strong>{formatRupiah(transaction.subtotal_services)}</strong></div>
              <div className="flex justify-between"><span>Diskon</span><strong>{formatRupiah(transaction.discount_amount)}</strong></div>
              <div className="border-t border-slate-200 pt-3 text-lg">
                <div className="flex justify-between"><span>Total</span><strong>{formatRupiah(transaction.total_amount)}</strong></div>
              </div>
            </div>
          </Card>

          {transaction.status === "cancelled" ? (
            <Card className="border-red-200 bg-red-50">
              <CardTitle title="Informasi Pembatalan" />
              <div className="space-y-2 text-sm text-red-800">
                <p>Dibatalkan pada: {formatDateTime(transaction.cancelled_at)}</p>
                <p>Oleh: {transaction.cancelled_by?.name ?? "-"}</p>
                <p>Alasan: {transaction.cancellation_reason ?? "-"}</p>
              </div>
            </Card>
          ) : null}
        </div>
      </div>

      {isCancelOpen ? (
        <Modal title="Batalkan Transaksi" onClose={() => setIsCancelOpen(false)}>
          <div className="space-y-4">
            <p className="text-sm leading-6 text-slate-500">
              Stok suku cadang pada transaksi ini akan dikembalikan otomatis.
            </p>
            <label>
              <span className="mb-2 block text-sm font-semibold text-slate-700">Alasan Pembatalan</span>
              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                className="min-h-28 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                placeholder="Salah input transaksi"
              />
            </label>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setIsCancelOpen(false)} disabled={isSubmitting}>Batal</Button>
              <Button type="button" className="bg-red-600 hover:bg-red-700" onClick={handleCancel} disabled={isSubmitting}>
                {isSubmitting ? "Membatalkan..." : "Konfirmasi Pembatalan"}
              </Button>
            </div>
          </div>
        </Modal>
      ) : null}
    </DashboardLayout>
  );
}

function Info({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <div className="mt-1 font-semibold text-slate-900">{value}</div>
    </div>
  );
}
