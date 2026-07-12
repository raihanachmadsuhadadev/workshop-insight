"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import { Toast, type ToastState } from "@/components/ui/toast";
import { getAprioriRuns, getRecommendations, type AprioriRun, type Recommendation } from "@/lib/services/apriori";

export default function OwnerRecommendationsPage() {
  const [runs, setRuns] = useState<AprioriRun[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [runId, setRunId] = useState("");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    async function loadRuns() {
      try {
        setRuns(await getAprioriRuns());
      } catch {
        setToast({ type: "error", message: "Gagal memuat daftar analisis." });
      }
    }
    loadRuns();
  }, []);

  useEffect(() => {
    async function loadRecommendations() {
      setIsLoading(true);
      try {
        const params: Record<string, string> = { limit: "10" };
        if (runId) params.run_id = runId;
        setRecommendations(await getRecommendations(params));
        setPage(1);
      } catch {
        setToast({ type: "error", message: "Gagal memuat rekomendasi paket." });
      } finally {
        setIsLoading(false);
      }
    }
    loadRecommendations();
  }, [runId]);

  const totalPages = Math.max(1, Math.ceil(recommendations.length / itemsPerPage));
  const activePage = Math.min(page, totalPages);
  const paginatedRecommendations = recommendations.slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage);

  return (
    <DashboardLayout
      title="Rekomendasi Paket"
      description="Rekomendasi paket servis berdasarkan pola kombinasi transaksi."
      role="Owner"
      userName="Owner Bengkel"
      eyebrow="Rekomendasi"
    >
      <Toast toast={toast} />
      <Card>
        <label className="block max-w-md">
          <span className="mb-2 block text-sm font-semibold text-slate-700">Filter Hasil Analisis</span>
          <Select value={runId} onChange={(event) => setRunId(event.target.value)}>
            <option value="">Run terbaru</option>
            {runs.map((run) => (
              <option key={run.id} value={run.id}>{run.code} - {run.name ?? "Tanpa nama"}</option>
            ))}
          </Select>
        </label>
      </Card>

      <div className="mt-6">
        {isLoading ? (
          <LoadingState />
        ) : recommendations.length === 0 ? (
          <EmptyState title="Belum ada rekomendasi" description="Jalankan analisis pola atau turunkan parameter minimum support/confidence." icon={Sparkles} />
        ) : (
          <Card>
            <CardTitle title="Daftar Rekomendasi Paket" description={`${recommendations.length} rekomendasi ditemukan.`} />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {paginatedRecommendations.map((recommendation, index) => (
                <div key={`${recommendation.run_id}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                    <Sparkles className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h2 className="mt-4 font-semibold text-slate-950">{recommendation.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{recommendation.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {recommendation.items.map((item) => (
                      <Badge key={item} tone="orange">{item}</Badge>
                    ))}
                  </div>
                  <p className="mt-4 text-sm font-semibold text-slate-700">
                    Confidence {recommendation.confidence_percentage}% · Support {recommendation.support_percentage}%
                  </p>
                  <p className="mt-2 text-sm text-slate-500">{recommendation.suggestion}</p>
                </div>
              ))}
            </div>
            <Pagination
              currentPage={activePage}
              totalItems={recommendations.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setPage}
              onItemsPerPageChange={(nextItemsPerPage) => {
                setItemsPerPage(nextItemsPerPage);
                setPage(1);
              }}
            />
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
