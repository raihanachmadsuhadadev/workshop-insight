import {
  AlertTriangle,
  CircleDollarSign,
  Plus,
  ReceiptText,
  TrendingUp,
  UsersRound,
} from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { StatCard } from "@/components/ui/stat-card";

export default function AdminDashboardPage() {
  return (
    <DashboardLayout
      title="Ringkasan Operasional Bengkel"
      description="Pantau transaksi, pendapatan, pelanggan, dan stok kritis dalam satu layar."
      role="Admin"
      userName="Admin Kasir"
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Transaksi Hari Ini" value="42" trend="+12% dari kemarin" icon={ReceiptText} />
        <StatCard
          title="Pendapatan Hari Ini"
          value="Rp 8,4 jt"
          trend="Target 74%"
          icon={CircleDollarSign}
          tone="green"
        />
        <StatCard title="Pelanggan" value="128" trend="18 pelanggan baru" icon={UsersRound} tone="blue" />
        <StatCard title="Stok Kritis" value="7 item" trend="Perlu restock" icon={AlertTriangle} tone="red" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <CardTitle title="Transaksi Terbaru" description="Data dummy transaksi bengkel hari ini." />
          <DataTable
            columns={["Invoice", "Pelanggan", "Item", "Total", "Status"]}
            rows={[
              ["INV-1042", "Rizky", "Oli Mesin, Servis Ringan", "Rp 285.000", <Badge key="paid" tone="green">Lunas</Badge>],
              ["INV-1041", "Dewi", "Busi, Tune Up", "Rp 320.000", <Badge key="paid" tone="green">Lunas</Badge>],
              ["INV-1040", "Ari", "Kampas Rem", "Rp 175.000", <Badge key="process" tone="blue">Proses</Badge>],
            ]}
          />
        </Card>

        <Card>
          <CardTitle title="Quick Action" description="Aksi cepat untuk operasional kasir." />
          <div className="grid gap-3">
            <ButtonLink href="/admin/transactions" className="justify-start">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Input Transaksi
            </ButtonLink>
            <ButtonLink href="/admin/spare-parts" variant="secondary" className="justify-start">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Tambah Suku Cadang
            </ButtonLink>
            <ButtonLink href="/admin/services" variant="secondary" className="justify-start">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Tambah Layanan Servis
            </ButtonLink>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle title="Item Paling Sering Digunakan" />
          <div className="space-y-4">
            {[
              ["Oli Mesin MPX", "84 transaksi"],
              ["Busi NGK", "49 transaksi"],
              ["Kampas Rem", "32 transaksi"],
            ].map(([item, value]) => (
              <div key={item} className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                <span className="font-semibold text-slate-800">{item}</span>
                <Badge tone="orange">{value}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardTitle title="Stok Rendah" />
          <div className="space-y-4">
            {[
              ["Oli Gardan", "4 tersisa"],
              ["V-Belt Beat", "3 tersisa"],
              ["Kampas Rem Belakang", "5 tersisa"],
            ].map(([item, value]) => (
              <div key={item} className="flex items-center justify-between rounded-xl bg-red-50 p-4">
                <span className="font-semibold text-slate-800">{item}</span>
                <Badge tone="red">{value}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <Card className="bg-slate-950 text-white">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Performa bengkel stabil</h2>
              <p className="mt-1 text-sm text-slate-300">
                Pendapatan dan volume transaksi naik dibanding hari sebelumnya.
              </p>
            </div>
            <Badge tone="green" className="w-fit">
              <TrendingUp className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
              Positif
            </Badge>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
