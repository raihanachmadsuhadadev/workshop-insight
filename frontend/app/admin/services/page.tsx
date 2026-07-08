"use client";

import { MasterDataPage, activeBadge, type MasterDataConfig } from "@/components/master-data/master-data-page";
import { formatRupiah } from "@/lib/format";

const config: MasterDataConfig = {
  resource: "services",
  title: "Layanan Servis",
  description: "Kelola layanan servis, harga jasa, dan estimasi durasi pengerjaan.",
  createLabel: "Tambah Layanan",
  emptyTitle: "Belum ada layanan servis",
  emptyDescription: "Tambahkan layanan seperti servis ringan, tune up, servis rem, dan ganti oli.",
  needsCategories: true,
  initialValues: {
    code: "",
    name: "",
    item_category_id: "",
    service_price: "0",
    estimated_duration: "",
    description: "",
    is_active: true,
  },
  fields: [
    { name: "code", label: "Kode", type: "text", required: true, placeholder: "SRV-0001" },
    { name: "name", label: "Nama", type: "text", required: true, placeholder: "Servis Ringan" },
    { name: "item_category_id", label: "Kategori", type: "select", optionSource: "categories" },
    { name: "service_price", label: "Harga", type: "number" },
    { name: "estimated_duration", label: "Estimasi Durasi (menit)", type: "number" },
    { name: "is_active", label: "Aktif", type: "boolean" },
    { name: "description", label: "Deskripsi", type: "textarea", grid: "full" },
  ],
  columns: [
    { header: "Kode", render: (record) => <span className="font-semibold">{record.code}</span> },
    { header: "Nama", render: (record) => String(record.name) },
    {
      header: "Kategori",
      render: (record) => String((record.item_category as { name?: string } | undefined)?.name ?? "-"),
    },
    { header: "Harga", render: (record) => formatRupiah(record.service_price as string | number) },
    {
      header: "Estimasi Durasi",
      render: (record) => (record.estimated_duration ? `${record.estimated_duration} menit` : "-"),
    },
    { header: "Status", render: (record) => activeBadge(record.is_active) },
  ],
};

export default function AdminServicesPage() {
  return <MasterDataPage config={config} />;
}
