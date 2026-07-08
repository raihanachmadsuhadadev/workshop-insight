"use client";

import { useEffect, useMemo, useState } from "react";
import { Boxes, TrendingDown, TrendingUp } from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/loading-state";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import { StatCard } from "@/components/ui/stat-card";
import { Toast, type ToastState } from "@/components/ui/toast";
import { formatDateTime } from "@/lib/format";
import { listMasterData, type MasterRecord } from "@/lib/services/master-data";
import { getStockMovements, type StockMovement } from "@/lib/services/transactions";

type SparePart = MasterRecord & {
  current_stock: number;
  minimum_stock: number;
  item_category?: { name?: string };
};

function stockBadge(current: number, minimum: number) {
  return current <= minimum ? <Badge tone="red">Stok Kritis</Badge> : <Badge tone="green">Stok Aman</Badge>;
}

function movementBadge(type: StockMovement["movement_type"]) {
  const labels = {
    in: "Masuk",
    out: "Keluar",
    adjustment: "Penyesuaian",
    reversal: "Reversal",
  };

  return <Badge tone={type === "out" ? "red" : type === "reversal" ? "blue" : "green"}>{labels[type]}</Badge>;
}

export default function AdminStocksPage() {
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [search, setSearch] = useState("");
  const [movementType, setMovementType] = useState("");
  const [stockPage, setStockPage] = useState(1);
  const [stockItemsPerPage, setStockItemsPerPage] = useState(10);
  const [movementPage, setMovementPage] = useState(1);
  const [movementItemsPerPage, setMovementItemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    async function loadStocks() {
      setIsLoading(true);
      try {
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (movementType) params.movement_type = movementType;
        const [sparePartData, movementData] = await Promise.all([
          listMasterData<SparePart>("spare-parts"),
          getStockMovements(params),
        ]);
        setSpareParts(sparePartData);
        setMovements(movementData);
        setStockPage(1);
        setMovementPage(1);
      } catch {
        setToast({ type: "error", message: "Gagal memuat data stok." });
      } finally {
        setIsLoading(false);
      }
    }

    const timeout = window.setTimeout(loadStocks, 250);
    return () => window.clearTimeout(timeout);
  }, [movementType, search]);

  const total = spareParts.length;
  const critical = spareParts.filter((item) => Number(item.current_stock) <= Number(item.minimum_stock)).length;
  const safe = Math.max(0, total - critical);

  const stockTotalPages = Math.max(1, Math.ceil(spareParts.length / stockItemsPerPage));
  const movementTotalPages = Math.max(1, Math.ceil(movements.length / movementItemsPerPage));
  const activeStockPage = Math.min(stockPage, stockTotalPages);
  const activeMovementPage = Math.min(movementPage, movementTotalPages);
  const paginatedSpareParts = useMemo(
    () => spareParts.slice((activeStockPage - 1) * stockItemsPerPage, activeStockPage * stockItemsPerPage),
    [activeStockPage, spareParts, stockItemsPerPage],
  );
  const paginatedMovements = useMemo(
    () => movements.slice((activeMovementPage - 1) * movementItemsPerPage, activeMovementPage * movementItemsPerPage),
    [activeMovementPage, movementItemsPerPage, movements],
  );

  const stockRows = paginatedSpareParts.map((item) => [
    <span key="code" className="font-semibold">{item.code}</span>,
    item.name,
    item.item_category?.name ?? "-",
    item.current_stock,
    item.minimum_stock,
    stockBadge(Number(item.current_stock), Number(item.minimum_stock)),
  ]);

  const movementRows = useMemo(
    () => paginatedMovements.map((movement) => [
      formatDateTime(movement.created_at),
      movement.spare_part?.name ?? "-",
      movementBadge(movement.movement_type),
      movement.quantity,
      movement.stock_before,
      movement.stock_after,
      movement.reference_code ?? "-",
      movement.created_by?.name ?? "-",
    ]),
    [paginatedMovements],
  );

  return (
    <DashboardLayout
      title="Stok"
      description="Pantau stok suku cadang dan riwayat mutasi dari transaksi bengkel."
      role="Admin"
      userName="Admin Kasir"
      eyebrow="Stok"
    >
      <Toast toast={toast} />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Suku Cadang" value={String(total)} trend="Master stok" icon={Boxes} />
        <StatCard title="Stok Aman" value={String(safe)} trend="Di atas minimum" icon={TrendingUp} tone="green" />
        <StatCard title="Stok Kritis" value={String(critical)} trend="Perlu restock" icon={TrendingDown} tone="red" />
      </div>

      <Card className="mt-6">
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <label>
            <span className="mb-2 block text-sm font-semibold text-slate-700">Cari Mutasi</span>
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari suku cadang atau kode transaksi..." />
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold text-slate-700">Tipe Mutasi</span>
            <Select value={movementType} onChange={(event) => setMovementType(event.target.value)}>
              <option value="">Semua</option>
              <option value="out">Keluar</option>
              <option value="reversal">Reversal</option>
              <option value="in">Masuk</option>
              <option value="adjustment">Penyesuaian</option>
            </Select>
          </label>
        </div>
      </Card>

      <div className="mt-6 space-y-6">
        {isLoading ? (
          <LoadingState />
        ) : (
          <>
            <Card>
              <CardTitle title="Tabel Stok Suku Cadang" description={`${spareParts.length} item suku cadang.`} />
              {spareParts.length === 0 ? (
                <EmptyState title="Belum ada stok" description="Data stok berasal dari master suku cadang." icon={Boxes} />
              ) : (
                <DataTable columns={["Kode", "Nama", "Kategori", "Stok Saat Ini", "Stok Minimum", "Status"]} rows={stockRows} />
              )}
              <Pagination
                currentPage={activeStockPage}
                totalItems={spareParts.length}
                itemsPerPage={stockItemsPerPage}
                onPageChange={setStockPage}
                onItemsPerPageChange={(nextItemsPerPage) => {
                  setStockItemsPerPage(nextItemsPerPage);
                  setStockPage(1);
                }}
              />
            </Card>

            <Card>
              <CardTitle title="Riwayat Mutasi Stok" description={`${movements.length} mutasi ditemukan.`} />
              {movements.length === 0 ? (
                <EmptyState title="Belum ada mutasi stok" description="Mutasi stok akan muncul setelah transaksi dibuat atau dibatalkan." icon={Boxes} />
              ) : (
                <DataTable columns={["Tanggal", "Suku Cadang", "Tipe", "Qty", "Sebelum", "Sesudah", "Referensi", "Dibuat Oleh"]} rows={movementRows} />
              )}
              <Pagination
                currentPage={activeMovementPage}
                totalItems={movements.length}
                itemsPerPage={movementItemsPerPage}
                onPageChange={setMovementPage}
                onItemsPerPageChange={(nextItemsPerPage) => {
                  setMovementItemsPerPage(nextItemsPerPage);
                  setMovementPage(1);
                }}
              />
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
