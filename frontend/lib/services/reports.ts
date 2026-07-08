import { api, type ApiResponse } from "@/lib/api";
import type { AprioriFrequentItemset, AprioriRule, AprioriRun, Recommendation } from "@/lib/services/apriori";
import type { Transaction } from "@/lib/services/transactions";

export type TransactionReport = {
  summary: {
    total_transactions: number;
    completed_transactions: number;
    cancelled_transactions: number;
    total_revenue: number;
    total_discount: number;
    average_transaction: number;
  };
  data: Transaction[];
  filters_applied: Record<string, string>;
};

export type StockReportItem = {
  id: number;
  code: string;
  name: string;
  category: string | null;
  brand: string | null;
  current_stock: number;
  minimum_stock: number;
  purchase_price: number;
  selling_price: number;
  stock_status: "safe" | "low";
  stock_value: number;
  is_active: boolean;
};

export type StockReport = {
  summary: {
    total_spare_parts: number;
    safe_stock: number;
    low_stock: number;
    total_stock_value: number;
  };
  data: StockReportItem[];
  filters_applied: Record<string, string>;
};

export type AprioriReport = {
  selected_run: AprioriRun | null;
  summary: {
    total_runs: number;
    total_transactions_analyzed: number;
    total_frequent_itemsets: number;
    total_rules: number;
    average_confidence: number;
    highest_lift: number;
  };
  frequent_itemsets: AprioriFrequentItemset[];
  association_rules: AprioriRule[];
  recommendations: Recommendation[];
  filters_applied: Record<string, string>;
};

export async function getAdminTransactionReport(params?: Record<string, string>) {
  const response = await api.get<ApiResponse<TransactionReport>>("/admin/reports/transactions", { params });
  return response.data.data;
}

export async function getAdminStockReport(params?: Record<string, string>) {
  const response = await api.get<ApiResponse<StockReport>>("/admin/reports/stocks", { params });
  return response.data.data;
}

export async function getOwnerTransactionReport(params?: Record<string, string>) {
  const response = await api.get<ApiResponse<TransactionReport>>("/owner/reports/transactions", { params });
  return response.data.data;
}

export async function getOwnerAprioriReport(params?: Record<string, string>) {
  const response = await api.get<ApiResponse<AprioriReport>>("/owner/reports/apriori", { params });
  return response.data.data;
}
