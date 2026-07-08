import { api, type ApiResponse } from "@/lib/api";
import type { AprioriRun, AprioriRule, Recommendation } from "@/lib/services/apriori";
import type { Transaction } from "@/lib/services/transactions";

export type TopItem = {
  item_code: string;
  item_name: string;
  total_quantity: string | number;
  total_amount: string | number;
};

export type LowStockItem = {
  id: number;
  code: string;
  name: string;
  current_stock: number;
  minimum_stock: number;
  item_category?: { name?: string };
};

export type AdminDashboardData = {
  summary: {
    total_transactions_today: number;
    revenue_today: number;
    total_customers: number;
    total_spare_parts: number;
    low_stock_count: number;
    total_services: number;
  };
  recent_transactions: Transaction[];
  low_stock_items: LowStockItem[];
  top_spare_parts: TopItem[];
  top_services: TopItem[];
};

export type OwnerDashboardData = {
  summary: {
    total_transactions: number;
    total_revenue: number;
    total_customers: number;
    total_spare_parts: number;
    total_services: number;
    total_apriori_runs: number;
    low_stock_count: number;
  };
  latest_apriori_run: AprioriRun | null;
  latest_rules: AprioriRule[];
  latest_recommendations: Recommendation[];
  top_spare_parts: TopItem[];
  top_services: TopItem[];
};

export async function getAdminDashboard() {
  const response = await api.get<ApiResponse<AdminDashboardData>>("/admin/dashboard");
  return response.data.data;
}

export async function getOwnerDashboard() {
  const response = await api.get<ApiResponse<OwnerDashboardData>>("/owner/dashboard");
  return response.data.data;
}
