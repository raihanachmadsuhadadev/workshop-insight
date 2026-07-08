"use client";

import { MasterDataPage, activeBadge, type MasterDataConfig } from "@/components/master-data/master-data-page";
import { Badge } from "@/components/ui/badge";

const config: MasterDataConfig = {
  resource: "item-categories",
  title: "Kategori Item",
  description: "Kelola kategori untuk suku cadang dan layanan servis bengkel.",
  createLabel: "Tambah Kategori",
  emptyTitle: "Belum ada kategori item",
  emptyDescription: "Tambahkan kategori awal seperti oli, rem, mesin, servis, dan ban.",
  initialValues: {
    code: "",
    name: "",
    type: "general",
    description: "",
    is_active: true,
  },
  fields: [
    { name: "code", label: "Kode", type: "text", required: true, placeholder: "OLI" },
    { name: "name", label: "Nama", type: "text", required: true, placeholder: "Oli & Pelumas" },
    {
      name: "type",
      label: "Tipe",
      type: "select",
      options: [
        { label: "Suku Cadang", value: "spare_part" },
        { label: "Layanan Servis", value: "service" },
        { label: "General", value: "general" },
      ],
    },
    { name: "is_active", label: "Aktif", type: "boolean" },
    { name: "description", label: "Deskripsi", type: "textarea", grid: "full" },
  ],
  columns: [
    { header: "Kode", render: (record) => <span className="font-semibold">{record.code}</span> },
    { header: "Nama", render: (record) => String(record.name) },
    {
      header: "Tipe",
      render: (record) => {
        const type = String(record.type ?? "general");
        const label = type === "spare_part" ? "Suku Cadang" : type === "service" ? "Servis" : "General";
        return <Badge tone={type === "service" ? "blue" : "orange"}>{label}</Badge>;
      },
    },
    { header: "Status", render: (record) => activeBadge(record.is_active) },
  ],
};

export default function AdminItemCategoriesPage() {
  return <MasterDataPage config={config} />;
}
