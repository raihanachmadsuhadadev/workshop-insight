"use client";

import { MasterDataPage, activeBadge, type MasterDataConfig } from "@/components/master-data/master-data-page";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/format";

const config: MasterDataConfig = {
  resource: "spare-parts",
  title: "Suku Cadang",
  description: "Kelola master suku cadang, harga, dan stok manual untuk operasional bengkel.",
  createLabel: "Tambah Suku Cadang",
  emptyTitle: "Belum ada suku cadang",
  emptyDescription: "Tambahkan data seperti oli mesin, busi, kampas rem, filter udara, dan V-Belt.",
  needsCategories: true,
  initialValues: {
    code: "",
    name: "",
    item_category_id: "",
    brand: "",
    unit: "pcs",
    purchase_price: "0",
    selling_price: "0",
    current_stock: "0",
    minimum_stock: "0",
    description: "",
    is_active: true,
  },
  fields: [
    { name: "code", label: "Kode", type: "text", required: true, placeholder: "SP-0001" },
    { name: "name", label: "Nama", type: "text", required: true, placeholder: "Oli Mesin MPX" },
    { name: "item_category_id", label: "Kategori", type: "select", optionSource: "categories" },
    { name: "brand", label: "Brand", type: "text", placeholder: "Honda" },
    { name: "unit", label: "Unit", type: "text", placeholder: "pcs" },
    { name: "purchase_price", label: "Harga Beli", type: "number" },
    { name: "selling_price", label: "Harga Jual", type: "number" },
    { name: "current_stock", label: "Stok", type: "number" },
    { name: "minimum_stock", label: "Stok Minimum", type: "number" },
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
    { header: "Brand", render: (record) => String(record.brand ?? "-") },
    { header: "Harga Jual", render: (record) => formatRupiah(record.selling_price as string | number) },
    { header: "Stok", render: (record) => String(record.current_stock ?? 0) },
    {
      header: "Stok Minimum",
      render: (record) => {
        const current = Number(record.current_stock ?? 0);
        const minimum = Number(record.minimum_stock ?? 0);
        return (
          <div className="flex items-center gap-2">
            <span>{minimum}</span>
            <Badge tone={current <= minimum ? "red" : "green"}>
              {current <= minimum ? "Stok Kritis" : "Stok Aman"}
            </Badge>
          </div>
        );
      },
    },
    { header: "Status", render: (record) => activeBadge(record.is_active) },
  ],
};

export default function AdminSparePartsPage() {
  return <MasterDataPage config={config} />;
}
