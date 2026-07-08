"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/loading-state";
import { Select } from "@/components/ui/select";
import { Toast, type ToastState } from "@/components/ui/toast";
import { formatRupiah, toDateTimeLocalValue } from "@/lib/format";
import { listMasterData, type MasterRecord } from "@/lib/services/master-data";
import { createTransaction } from "@/lib/services/transactions";

type SparePart = MasterRecord & {
  selling_price: string;
  current_stock: number;
  minimum_stock: number;
};

type ServiceItem = MasterRecord & {
  service_price: string;
};

type CartItem = {
  key: string;
  item_type: "spare_part" | "service";
  item_id: number;
  item_code: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  stock?: number;
};

export default function CreateTransactionPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<MasterRecord[]>([]);
  const [mechanics, setMechanics] = useState<MasterRecord[]>([]);
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [itemType, setItemType] = useState<"spare_part" | "service">("spare_part");
  const [selectedItemId, setSelectedItemId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [form, setForm] = useState({
    transaction_date: toDateTimeLocalValue(),
    customer_id: "",
    mechanic_id: "",
    vehicle_plate_number: "",
    vehicle_description: "",
    payment_method: "cash",
    payment_status: "paid",
    discount_amount: "0",
    notes: "",
  });

  useEffect(() => {
    async function loadMaster() {
      try {
        const [customerData, mechanicData, sparePartData, serviceData] = await Promise.all([
          listMasterData("customers", { is_active: "1" }),
          listMasterData("mechanics", { is_active: "1" }),
          listMasterData<SparePart>("spare-parts", { is_active: "1" }),
          listMasterData<ServiceItem>("services", { is_active: "1" }),
        ]);
        setCustomers(customerData);
        setMechanics(mechanicData);
        setSpareParts(sparePartData);
        setServices(serviceData);
      } catch {
        setToast({ type: "error", message: "Gagal memuat master data transaksi." });
      } finally {
        setIsLoading(false);
      }
    }

    loadMaster();
  }, []);

  const selectedItems = itemType === "spare_part" ? spareParts : services;
  const selectedItem = selectedItems.find((item) => item.id === Number(selectedItemId));
  const selectedSparePart = itemType === "spare_part" ? (selectedItem as SparePart | undefined) : undefined;
  const quantityNumber = Math.max(1, Number(quantity || 1));
  const stockWarning = selectedSparePart && quantityNumber > selectedSparePart.current_stock;

  const subtotalSpareParts = cart
    .filter((item) => item.item_type === "spare_part")
    .reduce((total, item) => total + item.unit_price * item.quantity, 0);
  const subtotalServices = cart
    .filter((item) => item.item_type === "service")
    .reduce((total, item) => total + item.unit_price * item.quantity, 0);
  const discount = Number(form.discount_amount || 0);
  const total = Math.max(0, subtotalSpareParts + subtotalServices - discount);
  const hasInvalidStock = cart.some((item) => item.item_type === "spare_part" && item.stock !== undefined && item.quantity > item.stock);

  const rows = cart.map((item) => [
    item.item_type === "spare_part" ? <Badge key="type" tone="orange">Suku Cadang</Badge> : <Badge key="type" tone="blue">Servis</Badge>,
    `${item.item_code} - ${item.item_name}`,
    item.quantity,
    formatRupiah(item.unit_price),
    formatRupiah(item.unit_price * item.quantity),
    <Button key="remove" type="button" size="sm" className="bg-red-600 hover:bg-red-700" onClick={() => setCart((current) => current.filter((row) => row.key !== item.key))}>
      <Trash2 className="h-4 w-4" aria-hidden="true" />
    </Button>,
  ]);

  function addItem() {
    if (!selectedItem) {
      setToast({ type: "error", message: "Pilih item terlebih dahulu." });
      return;
    }

    if (stockWarning) {
      setToast({ type: "error", message: "Quantity melebihi stok tersedia." });
      return;
    }

    const unitPrice = itemType === "spare_part"
      ? Number((selectedItem as SparePart).selling_price)
      : Number((selectedItem as ServiceItem).service_price);

    setCart((current) => [
      ...current,
      {
        key: `${itemType}-${selectedItem.id}-${Date.now()}`,
        item_type: itemType,
        item_id: selectedItem.id,
        item_code: selectedItem.code,
        item_name: selectedItem.name,
        quantity: quantityNumber,
        unit_price: unitPrice,
        stock: selectedSparePart?.current_stock,
      },
    ]);
    setSelectedItemId("");
    setQuantity("1");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (cart.length === 0) {
      setToast({ type: "error", message: "Tambahkan minimal satu item transaksi." });
      return;
    }

    if (hasInvalidStock) {
      setToast({ type: "error", message: "Ada item yang quantity-nya melebihi stok." });
      return;
    }

    setIsSubmitting(true);
    try {
      const transaction = await createTransaction({
        transaction_date: form.transaction_date.replace("T", " "),
        customer_id: form.customer_id ? Number(form.customer_id) : null,
        mechanic_id: form.mechanic_id ? Number(form.mechanic_id) : null,
        vehicle_plate_number: form.vehicle_plate_number || null,
        vehicle_description: form.vehicle_description || null,
        payment_method: form.payment_method,
        payment_status: form.payment_status,
        discount_amount: discount,
        notes: form.notes || null,
        items: cart.map((item) => ({
          item_type: item.item_type,
          item_id: item.item_id,
          quantity: item.quantity,
        })),
      });
      setToast({ type: "success", message: "Transaksi berhasil dibuat." });
      router.replace(`/admin/transactions/${transaction.id}`);
    } catch {
      setToast({ type: "error", message: "Gagal membuat transaksi. Periksa stok dan data input." });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout title="Input Transaksi" description="Memuat master data transaksi." role="Admin" userName="Admin Kasir">
        <LoadingState />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Input Transaksi" description="Catat transaksi suku cadang dan layanan servis." role="Admin" userName="Admin Kasir">
      <Toast toast={toast} />
      <div className="mb-4">
        <Link href="/admin/transactions" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Kembali ke Transaksi
        </Link>
      </div>
      <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Card>
            <CardTitle title="Informasi Transaksi" />
            <div className="grid gap-4 md:grid-cols-2">
              <label><span className="mb-2 block text-sm font-semibold text-slate-700">Tanggal</span><Input type="datetime-local" value={form.transaction_date} onChange={(event) => setForm({ ...form, transaction_date: event.target.value })} /></label>
              <label><span className="mb-2 block text-sm font-semibold text-slate-700">Pelanggan</span><Select value={form.customer_id} onChange={(event) => setForm({ ...form, customer_id: event.target.value })}><option value="">Pilih pelanggan</option>{customers.map((item) => <option key={item.id} value={item.id}>{item.code} - {item.name}</option>)}</Select></label>
              <label><span className="mb-2 block text-sm font-semibold text-slate-700">Mekanik</span><Select value={form.mechanic_id} onChange={(event) => setForm({ ...form, mechanic_id: event.target.value })}><option value="">Pilih mekanik</option>{mechanics.map((item) => <option key={item.id} value={item.id}>{item.code} - {item.name}</option>)}</Select></label>
              <label><span className="mb-2 block text-sm font-semibold text-slate-700">Plat Nomor</span><Input value={form.vehicle_plate_number} onChange={(event) => setForm({ ...form, vehicle_plate_number: event.target.value })} /></label>
              <label><span className="mb-2 block text-sm font-semibold text-slate-700">Deskripsi Kendaraan</span><Input value={form.vehicle_description} onChange={(event) => setForm({ ...form, vehicle_description: event.target.value })} placeholder="Honda Beat" /></label>
              <label><span className="mb-2 block text-sm font-semibold text-slate-700">Metode Bayar</span><Select value={form.payment_method} onChange={(event) => setForm({ ...form, payment_method: event.target.value })}><option value="cash">Cash</option><option value="transfer">Transfer</option><option value="qris">QRIS</option><option value="other">Lainnya</option></Select></label>
              <label><span className="mb-2 block text-sm font-semibold text-slate-700">Status Bayar</span><Select value={form.payment_status} onChange={(event) => setForm({ ...form, payment_status: event.target.value })}><option value="paid">Lunas</option><option value="unpaid">Belum Lunas</option></Select></label>
              <label><span className="mb-2 block text-sm font-semibold text-slate-700">Diskon</span><Input type="number" min="0" value={form.discount_amount} onChange={(event) => setForm({ ...form, discount_amount: event.target.value })} /></label>
              <label className="md:col-span-2"><span className="mb-2 block text-sm font-semibold text-slate-700">Catatan</span><textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100" /></label>
            </div>
          </Card>

          <Card>
            <CardTitle title="Item Transaksi" description="Tambahkan suku cadang dan layanan servis." />
            <div className="grid gap-3 md:grid-cols-[160px_1fr_120px_auto] md:items-end">
              <label><span className="mb-2 block text-sm font-semibold text-slate-700">Tipe</span><Select value={itemType} onChange={(event) => { setItemType(event.target.value as "spare_part" | "service"); setSelectedItemId(""); }}><option value="spare_part">Suku Cadang</option><option value="service">Layanan Servis</option></Select></label>
              <label><span className="mb-2 block text-sm font-semibold text-slate-700">Item</span><Select value={selectedItemId} onChange={(event) => setSelectedItemId(event.target.value)}><option value="">Pilih item</option>{selectedItems.map((item) => <option key={item.id} value={item.id}>{item.code} - {item.name}{itemType === "spare_part" ? ` (stok ${(item as SparePart).current_stock})` : ""}</option>)}</Select></label>
              <label><span className="mb-2 block text-sm font-semibold text-slate-700">Qty</span><Input type="number" min="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} /></label>
              <Button type="button" onClick={addItem}><Plus className="h-4 w-4" aria-hidden="true" />Tambah</Button>
            </div>
            {stockWarning ? <p className="mt-3 text-sm font-semibold text-red-600">Quantity melebihi stok tersedia ({selectedSparePart.current_stock}).</p> : null}
            <div className="mt-5">
              <DataTable columns={["Tipe", "Item", "Qty", "Harga", "Subtotal", "Aksi"]} rows={rows} />
            </div>
          </Card>
        </div>

        <Card className="h-fit">
          <CardTitle title="Ringkasan" />
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span>Subtotal Suku Cadang</span><strong>{formatRupiah(subtotalSpareParts)}</strong></div>
            <div className="flex justify-between"><span>Subtotal Layanan</span><strong>{formatRupiah(subtotalServices)}</strong></div>
            <div className="flex justify-between"><span>Diskon</span><strong>{formatRupiah(discount)}</strong></div>
            <div className="border-t border-slate-200 pt-3 text-lg">
              <div className="flex justify-between"><span>Total</span><strong>{formatRupiah(total)}</strong></div>
            </div>
          </div>
          <Button type="submit" className="mt-6 w-full" disabled={isSubmitting || cart.length === 0 || hasInvalidStock}>
            {isSubmitting ? "Menyimpan..." : "Simpan Transaksi"}
          </Button>
        </Card>
      </form>
    </DashboardLayout>
  );
}
