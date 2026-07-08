import {
  ArrowRight,
  BarChart3,
  Boxes,
  CheckCircle2,
  FileBarChart,
  PackageCheck,
  ReceiptText,
  Sparkles,
  Wrench,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";

export default function Home() {
  const features = [
    { title: "Manajemen transaksi bengkel", icon: ReceiptText },
    { title: "Kelola stok suku cadang", icon: Boxes },
    { title: "Analisis pola pembelian Apriori", icon: BarChart3 },
    { title: "Rekomendasi paket servis", icon: Sparkles },
    { title: "Laporan transaksi dan hasil analisis", icon: FileBarChart },
  ];

  const flow = [
    "Admin input transaksi",
    "Stok suku cadang diperbarui",
    "Owner menjalankan analisis Apriori",
    "Sistem menghasilkan association rule",
    "Owner melihat rekomendasi paket dan laporan",
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/95 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
          <a href="#" className="flex items-center gap-3 text-white">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500">
              <Wrench className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-lg font-bold">Star Motor Insight</span>
          </a>
          <div className="hidden items-center gap-6 text-sm font-medium text-slate-300 md:flex">
            <a href="#beranda" className="hover:text-white">
              Beranda
            </a>
            <a href="#fitur" className="hover:text-white">
              Fitur
            </a>
            <a href="#alur" className="hover:text-white">
              Alur
            </a>
            <a href="/login" className="hover:text-white">
              Login
            </a>
          </div>
        </nav>
      </header>

      <main>
        <section id="beranda" className="bg-slate-950 text-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
            <div className="flex flex-col justify-center">
              <Badge tone="orange" className="w-fit">
                Modern workshop dashboard
              </Badge>
              <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
                Star Motor Insight
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
                Sistem Transaksi Bengkel dan Analisis Pola Pembelian Suku Cadang & Layanan
                Servis
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/login" size="lg">
                  Masuk Dashboard <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </ButtonLink>
                <ButtonLink href="#fitur" variant="secondary" size="lg">
                  Lihat Fitur
                </ButtonLink>
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white p-4 text-slate-900 shadow-2xl shadow-slate-950/40">
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">Preview Dashboard</p>
                    <h2 className="text-xl font-bold text-slate-950">Operasional Hari Ini</h2>
                  </div>
                  <Badge tone="green">Aktif</Badge>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    ["Transaksi", "42"],
                    ["Pendapatan", "Rp 8,4 jt"],
                    ["Stok Kritis", "7"],
                    ["Rule Apriori", "18"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-slate-200 bg-white p-4">
                      <p className="text-sm text-slate-500">{label}</p>
                      <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-3">
                    <PackageCheck className="h-5 w-5 text-orange-500" aria-hidden="true" />
                    <div>
                      <p className="font-semibold">Oli Mesin -&gt; Servis Ringan</p>
                      <p className="text-sm text-slate-500">Confidence 82% · Lift 1.34</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="fitur" className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
              Fitur Utama
            </p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950">
              Fondasi operasional dan analisis untuk bengkel motor.
            </h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title}>
                  <Icon className="h-6 w-6 text-orange-500" aria-hidden="true" />
                  <h3 className="mt-4 font-semibold text-slate-950">{feature.title}</h3>
                </Card>
              );
            })}
          </div>
        </section>

        <section id="alur" className="bg-white">
          <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
            <CardTitle
              title="Alur Sistem"
              description="Dari transaksi kasir sampai rekomendasi paket servis untuk owner."
            />
            <div className="grid gap-4 md:grid-cols-5">
              {flow.map((item, index) => (
                <div key={item} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-orange-300">
                    {index + 1}
                  </span>
                  <p className="mt-4 text-sm font-semibold leading-6 text-slate-800">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
          <Card>
            <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <CardTitle
                  title="Preview Dashboard"
                  description="Kartu ringkasan, tabel modern, dan insight Apriori siap dikembangkan."
                />
                <div className="space-y-3 text-sm text-slate-600">
                  {["Stat operasional", "Transaksi terbaru", "Paket rekomendasi"].map((item) => (
                    <p key={item} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" aria-hidden="true" />
                      {item}
                    </p>
                  ))}
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {["Admin", "Owner", "Apriori"].map((item) => (
                  <div key={item} className="rounded-xl bg-slate-950 p-4 text-white">
                    <p className="text-sm text-slate-300">{item}</p>
                    <p className="mt-3 text-2xl font-bold text-orange-300">Ready</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">
        © 2026 Star Motor Insight. Sistem transaksi dan analisis bengkel.
      </footer>
    </div>
  );
}
