"use client";

import { MasterDataPage, activeBadge, type MasterDataConfig } from "@/components/master-data/master-data-page";

const config: MasterDataConfig = {
  resource: "customers",
  title: "Pelanggan",
  description: "Kelola data pelanggan dan kendaraan untuk kebutuhan transaksi bengkel.",
  createLabel: "Tambah Pelanggan",
  emptyTitle: "Belum ada pelanggan",
  emptyDescription: "Tambahkan pelanggan beserta nomor kendaraan untuk mempercepat transaksi.",
  initialValues: {
    code: "",
    name: "",
    phone: "",
    address: "",
    vehicle_brand: "",
    vehicle_type: "",
    vehicle_plate_number: "",
    notes: "",
    is_active: true,
  },
  fields: [
    { name: "code", label: "Kode", type: "text", required: true, placeholder: "CUS-0001" },
    { name: "name", label: "Nama", type: "text", required: true, placeholder: "Nama pelanggan" },
    { name: "phone", label: "No HP", type: "text", placeholder: "08123456789" },
    { name: "vehicle_plate_number", label: "Plat Nomor", type: "text", placeholder: "B 1234 ABC" },
    { name: "vehicle_brand", label: "Merek Kendaraan", type: "text", placeholder: "Honda" },
    { name: "vehicle_type", label: "Tipe Kendaraan", type: "text", placeholder: "Beat" },
    { name: "is_active", label: "Aktif", type: "boolean" },
    { name: "address", label: "Alamat", type: "textarea", grid: "full" },
    { name: "notes", label: "Catatan", type: "textarea", grid: "full" },
  ],
  columns: [
    { header: "Kode", render: (record) => <span className="font-semibold">{record.code}</span> },
    { header: "Nama", render: (record) => String(record.name) },
    { header: "No HP", render: (record) => String(record.phone ?? "-") },
    {
      header: "Kendaraan",
      render: (record) => `${record.vehicle_brand ?? "-"} ${record.vehicle_type ?? ""}`.trim(),
    },
    { header: "Plat Nomor", render: (record) => String(record.vehicle_plate_number ?? "-") },
    { header: "Status", render: (record) => activeBadge(record.is_active) },
  ],
};

export default function AdminCustomersPage() {
  return <MasterDataPage config={config} />;
}
