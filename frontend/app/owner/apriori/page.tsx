"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { BrainCircuit, Info, Loader2 } from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Toast, type ToastState } from "@/components/ui/toast";
import { runAprioriAnalysis } from "@/lib/services/apriori";

function getErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const errors = error.response?.data?.errors;
    if (errors && typeof errors === "object") {
      const first = Object.values(errors)[0];
      if (Array.isArray(first) && first[0]) return String(first[0]);
    }
    return error.response?.data?.message ?? "Gagal menjalankan analisis Apriori.";
  }
  return "Gagal menjalankan analisis Apriori.";
}

export default function OwnerAprioriPage() {
  const router = useRouter();
  const [toast, setToast] = useState<ToastState>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "Analisis Apriori Star Motor",
    start_date: "",
    end_date: "",
    item_scope: "all",
    minimum_support: "0.2",
    minimum_confidence: "0.5",
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const run = await runAprioriAnalysis({
        name: form.name || undefined,
        start_date: form.start_date || undefined,
        end_date: form.end_date || undefined,
        item_scope: form.item_scope as "all" | "spare_part" | "service",
        minimum_support: Number(form.minimum_support),
        minimum_confidence: Number(form.minimum_confidence),
      });
      setToast({ type: "success", message: "Analisis Apriori berhasil dijalankan." });
      router.replace(`/owner/apriori-results/${run.id}`);
    } catch (error) {
      setToast({ type: "error", message: getErrorMessage(error) });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <DashboardLayout
      title="Analisis Apriori"
      description="Jalankan association rule mining dari transaksi bengkel yang sudah selesai."
      role="Owner"
      userName="Owner Bengkel"
      eyebrow="Apriori"
    >
      <Toast toast={toast} />
      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <Card>
          <CardTitle title="Parameter Analisis" description="Atur periode, scope item, dan minimum metric." />
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <label className="md:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Nama Analisis</span>
              <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-slate-700">Tanggal Mulai</span>
              <Input type="date" value={form.start_date} onChange={(event) => setForm({ ...form, start_date: event.target.value })} />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-slate-700">Tanggal Akhir</span>
              <Input type="date" value={form.end_date} onChange={(event) => setForm({ ...form, end_date: event.target.value })} />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-slate-700">Scope Item</span>
              <Select value={form.item_scope} onChange={(event) => setForm({ ...form, item_scope: event.target.value })}>
                <option value="all">Semua Item</option>
                <option value="spare_part">Suku Cadang</option>
                <option value="service">Layanan Servis</option>
              </Select>
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-slate-700">Minimum Support</span>
              <Input type="number" min="0.01" max="1" step="0.01" value={form.minimum_support} onChange={(event) => setForm({ ...form, minimum_support: event.target.value })} required />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-slate-700">Minimum Confidence</span>
              <Input type="number" min="0.01" max="1" step="0.01" value={form.minimum_confidence} onChange={(event) => setForm({ ...form, minimum_confidence: event.target.value })} required />
            </label>
            <div className="md:col-span-2">
              <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <BrainCircuit className="h-4 w-4" aria-hidden="true" />}
                {isSubmitting ? "Menganalisis..." : "Jalankan Analisis"}
              </Button>
            </div>
          </form>
        </Card>

        <Card className="h-fit bg-slate-950 text-white">
          <div className="flex gap-3">
            <Info className="mt-1 h-5 w-5 shrink-0 text-orange-300" aria-hidden="true" />
            <div>
              <h2 className="font-semibold">Panduan Metric</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Support 0.2 berarti itemset muncul minimal 20% dari total transaksi. Confidence
                0.5 berarti aturan punya keyakinan minimal 50%. Jika rule kosong, coba turunkan
                minimum support atau confidence.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
