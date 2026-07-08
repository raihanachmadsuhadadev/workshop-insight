"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowLeft, Boxes, BrainCircuit, FileText, Printer } from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { Pagination } from "@/components/ui/pagination";
import { StatCard } from "@/components/ui/stat-card";
import { Toast, type ToastState } from "@/components/ui/toast";
import { formatDateTime } from "@/lib/format";
import { getAprioriRun, type AprioriRun } from "@/lib/services/apriori";

function joinItems(items: string[] | undefined) {
  return items?.join(", ") || "-";
}

function pct(value: string | number | null | undefined) {
  return `${Number(value ?? 0).toFixed(2)}%`;
}

export default function AprioriResultDetailPage() {
  const params = useParams<{ id: string }>();
  const [run, setRun] = useState<AprioriRun | null>(null);
  const [itemsetPage, setItemsetPage] = useState(1);
  const [itemsetItemsPerPage, setItemsetItemsPerPage] = useState(10);
  const [rulePage, setRulePage] = useState(1);
  const [ruleItemsPerPage, setRuleItemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    let isActive = true;
    async function loadRun() {
      setIsLoading(true);
      try {
        const data = await getAprioriRun(params.id);
        if (isActive) setRun(data);
      } catch {
        if (isActive) setToast({ type: "error", message: "Gagal memuat detail hasil analisis." });
      } finally {
        if (isActive) setIsLoading(false);
      }
    }
    loadRun();
    return () => {
      isActive = false;
    };
  }, [params.id]);

  if (isLoading || !run) {
    return (
      <DashboardLayout title="Detail Hasil Analisis" description="Memuat hasil Apriori." role="Owner" userName="Owner Bengkel" eyebrow="Hasil Analisis">
        <Toast toast={toast} />
        <LoadingState />
      </DashboardLayout>
    );
  }

  const itemsets = run.frequent_itemsets ?? [];
  const rules = run.rules ?? [];
  const itemsetTotalPages = Math.max(1, Math.ceil(itemsets.length / itemsetItemsPerPage));
  const ruleTotalPages = Math.max(1, Math.ceil(rules.length / ruleItemsPerPage));
  const activeItemsetPage = Math.min(itemsetPage, itemsetTotalPages);
  const activeRulePage = Math.min(rulePage, ruleTotalPages);
  const paginatedItemsets = itemsets.slice((activeItemsetPage - 1) * itemsetItemsPerPage, activeItemsetPage * itemsetItemsPerPage);
  const paginatedRules = rules.slice((activeRulePage - 1) * ruleItemsPerPage, activeRulePage * ruleItemsPerPage);

  const itemsetRows = paginatedItemsets.map((itemset, index) => [
    (activeItemsetPage - 1) * itemsetItemsPerPage + index + 1,
    joinItems(itemset.items),
    itemset.item_count,
    Number(itemset.support).toFixed(4),
    pct(itemset.support_percentage),
  ]);

  const ruleRows = paginatedRules.map((rule, index) => [
    (activeRulePage - 1) * ruleItemsPerPage + index + 1,
    joinItems(rule.antecedents),
    joinItems(rule.consequents),
    pct(rule.support_percentage),
    pct(rule.confidence_percentage),
    Number(rule.lift).toFixed(4),
    rule.interpretation ?? "-",
  ]);

  const recommendationRules = rules.slice(0, 10);

  return (
    <DashboardLayout title="Detail Hasil Analisis" description={run.code} role="Owner" userName="Owner Bengkel" eyebrow="Hasil Analisis">
      <Toast toast={toast} />
      <div className="no-print mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/owner/apriori-results" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Kembali
        </Link>
        <Button type="button" variant="secondary" onClick={() => window.print()}>
          <Printer className="h-4 w-4" aria-hidden="true" />
          Print Hasil
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Total Transaksi" value={String(run.total_transactions)} icon={FileText} />
        <StatCard title="Unique Items" value={String(run.total_unique_items)} icon={Boxes} tone="blue" />
        <StatCard title="Frequent Itemsets" value={String(run.total_frequent_itemsets)} icon={BrainCircuit} tone="green" />
        <StatCard title="Association Rules" value={String(run.total_rules)} icon={BrainCircuit} tone="orange" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <CardTitle title="Parameter Analisis" />
          <div className="grid gap-3 text-sm md:grid-cols-2">
            <Info label="Nama" value={run.name ?? "-"} />
            <Info label="Status" value={run.status === "completed" ? <Badge tone="green">Completed</Badge> : <Badge tone="red">Failed</Badge>} />
            <Info label="Minimum Support" value={`${Number(run.minimum_support) * 100}%`} />
            <Info label="Minimum Confidence" value={`${Number(run.minimum_confidence) * 100}%`} />
            <Info label="Periode" value={run.start_date || run.end_date ? `${run.start_date ?? "..."} - ${run.end_date ?? "..."}` : "Semua periode"} />
            <Info label="Scope" value={run.item_scope} />
            <Info label="Dijalankan Oleh" value={run.run_by?.name ?? "-"} />
            <Info label="Tanggal Analisis" value={formatDateTime(run.ran_at)} />
          </div>
        </Card>

        <Card>
          <CardTitle title="Rekomendasi Paket" />
          {recommendationRules.length === 0 ? (
            <EmptyState title="Belum ada rekomendasi" description="Belum ada aturan asosiasi yang memenuhi parameter." icon={BrainCircuit} />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {recommendationRules.map((rule) => (
                <div key={rule.id} className="rounded-xl border border-slate-200 p-4">
                  <h3 className="font-semibold text-slate-950">{rule.recommendation_title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{rule.recommendation_description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[...(rule.antecedents ?? []), ...(rule.consequents ?? [])].map((item) => (
                      <Badge key={item} tone="orange">{item}</Badge>
                    ))}
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    Confidence {pct(rule.confidence_percentage)} · Support {pct(rule.support_percentage)}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">{rule.suggestion}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="mt-6 space-y-6">
        <Card>
          <CardTitle title="Frequent Itemsets" />
          {itemsets.length === 0 ? (
            <EmptyState title="Belum ada frequent itemset" description="Coba turunkan minimum support." icon={Boxes} />
          ) : (
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
          <CardTitle title="Association Rules" />
          {rules.length === 0 ? (
            <EmptyState title="Belum ada aturan asosiasi" description="Coba turunkan minimum support atau minimum confidence." icon={BrainCircuit} />
          ) : (
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
      </div>
    </DashboardLayout>
  );
}

function Info({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <div className="mt-1 font-semibold text-slate-900">{value}</div>
    </div>
  );
}
