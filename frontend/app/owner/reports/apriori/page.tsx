"use client";

import { useEffect, useMemo, useState } from "react";
import { BrainCircuit, Printer } from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/loading-state";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import { StatCard } from "@/components/ui/stat-card";
import { Toast, type ToastState } from "@/components/ui/toast";
import { formatDateTime } from "@/lib/format";
import { getAprioriRuns, type AprioriRun } from "@/lib/services/apriori";
import { getOwnerAprioriReport, type AprioriReport } from "@/lib/services/reports";

function join(items?: string[]) {
  return items?.join(", ") || "-";
}

export default function OwnerAprioriReportPage() {
  const [runs, setRuns] = useState<AprioriRun[]>([]);
  const [report, setReport] = useState<AprioriReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<ToastState>(null);
  const [filter, setFilter] = useState({ apriori_run_id: "", minimum_support: "", minimum_confidence: "", search: "" });
  const [itemsetPage, setItemsetPage] = useState(1);
  const [itemsetItemsPerPage, setItemsetItemsPerPage] = useState(10);
  const [rulePage, setRulePage] = useState(1);
  const [ruleItemsPerPage, setRuleItemsPerPage] = useState(10);
  const [recommendationPage, setRecommendationPage] = useState(1);
  const [recommendationItemsPerPage, setRecommendationItemsPerPage] = useState(10);

  useEffect(() => {
    getAprioriRuns().then(setRuns).catch(() => setToast({ type: "error", message: "Gagal memuat daftar analisis pola." }));
  }, []);

  useEffect(() => {
    async function loadReport() {
      setIsLoading(true);
      try {
        const params = Object.fromEntries(Object.entries(filter).filter(([, value]) => value));
        setReport(await getOwnerAprioriReport(params));
        setItemsetPage(1);
        setRulePage(1);
        setRecommendationPage(1);
      } catch {
        setToast({ type: "error", message: "Gagal memuat laporan analisis pola." });
      } finally {
        setIsLoading(false);
      }
    }
    const timeout = window.setTimeout(loadReport, 250);
    return () => window.clearTimeout(timeout);
  }, [filter]);

  const itemsets = useMemo(() => report?.frequent_itemsets ?? [], [report]);
  const rules = useMemo(() => report?.association_rules ?? [], [report]);
  const recommendations = useMemo(() => report?.recommendations ?? [], [report]);
  const itemsetTotalPages = Math.max(1, Math.ceil(itemsets.length / itemsetItemsPerPage));
  const ruleTotalPages = Math.max(1, Math.ceil(rules.length / ruleItemsPerPage));
  const recommendationTotalPages = Math.max(1, Math.ceil(recommendations.length / recommendationItemsPerPage));
  const activeItemsetPage = Math.min(itemsetPage, itemsetTotalPages);
  const activeRulePage = Math.min(rulePage, ruleTotalPages);
  const activeRecommendationPage = Math.min(recommendationPage, recommendationTotalPages);
  const paginatedItemsets = useMemo(
    () => itemsets.slice((activeItemsetPage - 1) * itemsetItemsPerPage, activeItemsetPage * itemsetItemsPerPage),
    [activeItemsetPage, itemsetItemsPerPage, itemsets],
  );
  const paginatedRules = useMemo(
    () => rules.slice((activeRulePage - 1) * ruleItemsPerPage, activeRulePage * ruleItemsPerPage),
    [activeRulePage, ruleItemsPerPage, rules],
  );
  const paginatedRecommendations = useMemo(
    () => recommendations.slice((activeRecommendationPage - 1) * recommendationItemsPerPage, activeRecommendationPage * recommendationItemsPerPage),
    [activeRecommendationPage, recommendationItemsPerPage, recommendations],
  );

  const itemsetRows = useMemo(() => paginatedItemsets.map((itemset, index) => [(activeItemsetPage - 1) * itemsetItemsPerPage + index + 1, join(itemset.items), itemset.item_count, itemset.support, `${itemset.support_percentage}%`]), [activeItemsetPage, itemsetItemsPerPage, paginatedItemsets]);
  const ruleRows = useMemo(() => paginatedRules.map((rule, index) => [(activeRulePage - 1) * ruleItemsPerPage + index + 1, join(rule.antecedents), join(rule.consequents), `${rule.support_percentage}%`, `${rule.confidence_percentage}%`, rule.lift, rule.interpretation ?? "-"]), [activeRulePage, paginatedRules, ruleItemsPerPage]);

  return (
    <DashboardLayout title="Laporan Analisis Pola" description="Laporan aturan kombinasi dan rekomendasi paket." role="Owner" userName="Owner Bengkel" eyebrow="Laporan">
      <Toast toast={toast} />
      <section className="print-area">
        <div className="no-print mb-6 flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={() => window.print()}><Printer className="h-4 w-4" aria-hidden="true" />Print</Button>
        </div>
        <div className="print-only mb-4">
          <h1 className="text-xl font-bold">Workshop Insight</h1>
          <p className="font-semibold">Laporan Hasil Analisis Pola Transaksi</p>
          <p className="text-sm">Tanggal cetak: {formatDateTime(new Date().toISOString())}</p>
        </div>
        <Card className="no-print mb-6">
          <div className="grid gap-3 md:grid-cols-4">
            <Select value={filter.apriori_run_id} onChange={(e) => setFilter({ ...filter, apriori_run_id: e.target.value })}><option value="">Run terbaru</option>{runs.map((run) => <option key={run.id} value={run.id}>{run.code} - {run.name ?? "Tanpa nama"}</option>)}</Select>
            <Input type="number" step="0.01" placeholder="Min support" value={filter.minimum_support} onChange={(e) => setFilter({ ...filter, minimum_support: e.target.value })} />
            <Input type="number" step="0.01" placeholder="Min confidence" value={filter.minimum_confidence} onChange={(e) => setFilter({ ...filter, minimum_confidence: e.target.value })} />
            <Input placeholder="Cari item..." value={filter.search} onChange={(e) => setFilter({ ...filter, search: e.target.value })} />
          </div>
        </Card>
        {isLoading || !report ? <LoadingState /> : !report.selected_run ? (
          <EmptyState title="Belum ada hasil analisis pola" description="Jalankan analisis terlebih dahulu." icon={BrainCircuit} />
        ) : (
          <>
            <div className="mb-6 grid gap-4 md:grid-cols-4">
              <StatCard title="Transaksi Dianalisis" value={String(report.summary.total_transactions_analyzed)} icon={BrainCircuit} />
              <StatCard title="Kombinasi Item Sering Muncul" value={String(report.summary.total_frequent_itemsets)} icon={BrainCircuit} tone="green" />
              <StatCard title="Aturan Kombinasi" value={String(report.summary.total_rules)} icon={BrainCircuit} tone="blue" />
              <StatCard title="Avg Confidence" value={`${report.summary.average_confidence}%`} icon={BrainCircuit} tone="orange" />
            </div>
            <div className="space-y-6">
              <Card>
                <CardTitle title="Kombinasi Item Sering Muncul" description={report.selected_run.code} />
                {itemsets.length === 0 ? <EmptyState title="Tidak ada kombinasi item" description="Tidak ada data sesuai filter." icon={BrainCircuit} /> : (
                  <>
                    <DataTable columns={["No", "Items", "Item Count", "Support", "Support %"]} rows={itemsetRows} />
                    <Pagination
                      currentPage={activeItemsetPage}
                      totalItems={itemsets.length}
                      itemsPerPage={itemsetItemsPerPage}
                      onPageChange={setItemsetPage}
                      onItemsPerPageChange={(nextItemsPerPage) => {
                        setItemsetItemsPerPage(nextItemsPerPage);
                        setItemsetPage(1);
                      }}
                    />
                  </>
                )}
              </Card>
              <Card>
                <CardTitle title="Aturan Kombinasi" description={`Lift tertinggi: ${report.summary.highest_lift}`} />
                {rules.length === 0 ? <EmptyState title="Tidak ada aturan kombinasi" description="Tidak ada data sesuai filter." icon={BrainCircuit} /> : (
                  <>
                    <DataTable columns={["No", "Antecedents", "Consequents", "Support %", "Confidence %", "Lift", "Interpretation"]} rows={ruleRows} />
                    <Pagination
                      currentPage={activeRulePage}
                      totalItems={rules.length}
                      itemsPerPage={ruleItemsPerPage}
                      onPageChange={setRulePage}
                      onItemsPerPageChange={(nextItemsPerPage) => {
                        setRuleItemsPerPage(nextItemsPerPage);
                        setRulePage(1);
                      }}
                    />
                  </>
                )}
              </Card>
              <Card>
                <CardTitle title="Rekomendasi" />
                {recommendations.length === 0 ? <EmptyState title="Tidak ada rekomendasi" description="Tidak ada rekomendasi sesuai filter." icon={BrainCircuit} /> : (
                  <>
                    <div className="grid gap-3 md:grid-cols-2">
                      {paginatedRecommendations.map((item, index) => (
                        <div key={`${item.title}-${index}`} className="rounded-xl bg-orange-50 p-4">
                          <h3 className="font-semibold text-slate-950">{item.title}</h3>
                          <div className="mt-3 flex flex-wrap gap-2">{item.items.map((value) => <Badge key={value} tone="orange">{value}</Badge>)}</div>
                          <p className="mt-3 text-sm text-slate-600">{item.suggestion}</p>
                        </div>
                      ))}
                    </div>
                    <Pagination
                      currentPage={activeRecommendationPage}
                      totalItems={recommendations.length}
                      itemsPerPage={recommendationItemsPerPage}
                      onPageChange={setRecommendationPage}
                      onItemsPerPageChange={(nextItemsPerPage) => {
                        setRecommendationItemsPerPage(nextItemsPerPage);
                        setRecommendationPage(1);
                      }}
                    />
                  </>
                )}
              </Card>
            </div>
          </>
        )}
      </section>
    </DashboardLayout>
  );
}
