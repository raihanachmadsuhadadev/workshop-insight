"use client";

import { MasterDataPage, activeBadge, type MasterDataConfig } from "@/components/master-data/master-data-page";

const config: MasterDataConfig = {
  resource: "mechanics",
  title: "Mekanik",
  description: "Kelola data mekanik dan spesialisasi layanan bengkel.",
  createLabel: "Tambah Mekanik",
  emptyTitle: "Belum ada mekanik",
  emptyDescription: "Tambahkan mekanik servis umum, kelistrikan, CVT, atau spesialisasi lain.",
  initialValues: {
    code: "",
    name: "",
    phone: "",
    specialization: "",
    is_active: true,
  },
  fields: [
    { name: "code", label: "Kode", type: "text", required: true, placeholder: "MCH-0001" },
    { name: "name", label: "Nama", type: "text", required: true, placeholder: "Nama mekanik" },
    { name: "phone", label: "No HP", type: "text", placeholder: "081300000001" },
    { name: "specialization", label: "Spesialisasi", type: "text", placeholder: "Servis umum" },
    { name: "is_active", label: "Aktif", type: "boolean" },
  ],
  columns: [
    { header: "Kode", render: (record) => <span className="font-semibold">{record.code}</span> },
    { header: "Nama", render: (record) => String(record.name) },
    { header: "No HP", render: (record) => String(record.phone ?? "-") },
    { header: "Spesialisasi", render: (record) => String(record.specialization ?? "-") },
    { header: "Status", render: (record) => activeBadge(record.is_active) },
  ],
};

export default function AdminMechanicsPage() {
  return <MasterDataPage config={config} />;
}
