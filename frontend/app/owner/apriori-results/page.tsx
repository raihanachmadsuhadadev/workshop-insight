"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, Trash2 } from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/loading-state";
import { Pagination } from "@/components/ui/pagination";
import { Toast, type ToastState } from "@/components/ui/toast";
import { formatDateTime } from "@/lib/format";
import { deleteAprioriRun, getAprioriRuns, type AprioriRun } from "@/lib/services/apriori";

const defaultItemsPerPage = 10;

function scopeLabel(scope: AprioriRun["item_scope"]) {
  return scope === "spare_part" ? "Suku Cadang" : scope === "service" ? "Layanan" : "Semua";
}

export default function AprioriResultsPage() {
  const [runs, setRuns] = useState<AprioriRun[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingRun, setDeletingRun] = useState<AprioriRun | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const loadRuns = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      setRuns(await getAprioriRuns(params));
      setPage(1);
    } catch {
      setToast({ type: "error", message: "Gagal memuat hasil analisis." });
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timeout = window.setTimeout(loadRuns, 250);
    return () => window.clearTimeout(timeout);
  }, [loadRuns]);

  async function handleDelete() {
    if (!deletingRun) return;
    try {
      await deleteAprioriRun(deletingRun.id);
      setToast({ type: "success", message: "Hasil analisis berhasil dihapus." });
      setDeletingRun(null);
      await loadRuns();
    } catch {
      setToast({ type: "error", message: "Gagal menghapus hasil analisis." });
    }
  }

  const totalPages = Math.max(1, Math.ceil(runs.length / itemsPerPage));
  const activePage = Math.min(page, totalPages);
  const paginated = useMemo(() => runs.slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage), [activePage, itemsPerPage, runs]);
  const rows = paginated.map((run) => [
    <span key="code" className="font-semibold">{run.code}</span>,
    run.name ?? "-",
    run.start_date || run.end_date ? `${run.start_date ?? "..."} - ${run.end_date ?? "..."}` : "Semua periode",
    scopeLabel(run.item_scope),
    `${Number(run.minimum_support) * 100}%`,
    `${Number(run.minimum_confidence) * 100}%`,
    run.total_transactions,
    run.total_rules,
    run.status === "completed" ? <Badge key="status" tone="green">Completed</Badge> : <Badge key="status" tone="red">Failed</Badge>,
    formatDateTime(run.ran_at),
    <div key="actions" className="flex gap-2">
      <Link href={`/owner/apriori-results/${run.id}`} className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold hover:bg-slate-50">
        <Eye className="h-4 w-4" aria-hidden="true" />
      </Link>
      <Button type="button" size="sm" className="bg-red-600 hover:bg-red-700" onClick={() => setDeletingRun(run)}>
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>,
  ]);

  return (
    <DashboardLayout title="Hasil Analisis Apriori" description="Daftar histori analisis Apriori yang pernah dijalankan." role="Owner" userName="Owner Bengkel" eyebrow="Hasil Analisis">
      <Toast toast={toast} />
      <Card>
        <label>
          <span className="mb-2 block text-sm font-semibold text-slate-700">Cari</span>
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari kode atau nama analisis..." />
        </label>
      </Card>
      <div className="mt-6">
        {isLoading ? (
          <LoadingState />
        ) : runs.length === 0 ? (
          <EmptyState title="Belum ada hasil analisis" description="Jalankan analisis Apriori untuk melihat hasil di sini." icon={Eye} />
        ) : (
          <Card>
            <CardTitle title="Daftar Hasil Analisis" description={`${runs.length} run ditemukan.`} />
            <DataTable columns={["Kode", "Nama", "Periode", "Scope", "Min Support", "Min Confidence", "Transaksi", "Rules", "Status", "Tanggal", "Aksi"]} rows={rows} />
            <Pagination
              currentPage={activePage}
              totalItems={runs.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setPage}
              onItemsPerPageChange={(nextItemsPerPage) => {
                setItemsPerPage(nextItemsPerPage);
                setPage(1);
              }}
            />
          </Card>
        )}
      </div>
      {deletingRun ? (
        <ConfirmDialog
          title={`Hapus ${deletingRun.code}?`}
          description="Run analisis akan disembunyikan dari daftar hasil."
          onCancel={() => setDeletingRun(null)}
          onConfirm={handleDelete}
        />
      ) : null}
    </DashboardLayout>
  );
}
