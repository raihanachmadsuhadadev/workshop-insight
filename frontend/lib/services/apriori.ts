import { api, type ApiResponse } from "@/lib/api";

export type AprioriRun = {
  id: number;
  code: string;
  name: string | null;
  start_date: string | null;
  end_date: string | null;
  item_scope: "all" | "spare_part" | "service";
  minimum_support: string;
  minimum_confidence: string;
  total_transactions: number;
  total_unique_items: number;
  total_frequent_itemsets: number;
  total_rules: number;
  status: "completed" | "failed";
  message: string | null;
  ran_at: string | null;
  run_by?: { id: number; name: string; email: string };
  frequent_itemsets?: AprioriFrequentItemset[];
  rules?: AprioriRule[];
};

export type AprioriFrequentItemset = {
  id: number;
  items: string[];
  item_count: number;
  support: string;
  support_percentage: string;
};

export type AprioriRule = {
  id: number;
  antecedents: string[];
  consequents: string[];
  support: string;
  confidence: string;
  lift: string;
  support_percentage: string;
  confidence_percentage: string;
  interpretation: string | null;
  recommendation_title: string | null;
  recommendation_description: string | null;
  suggestion: string | null;
};

export type RunAprioriPayload = {
  name?: string;
  start_date?: string;
  end_date?: string;
  item_scope: "all" | "spare_part" | "service";
  minimum_support: number;
  minimum_confidence: number;
};

export type Recommendation = {
  title: string;
  description: string;
  items: string[];
  confidence_percentage: number;
  support_percentage: number;
  suggestion: string;
  run_id: number;
};

export async function getAprioriRuns(params?: Record<string, string>) {
  const response = await api.get<ApiResponse<AprioriRun[]>>("/owner/apriori-runs", { params });

  return response.data.data;
}

export async function runAprioriAnalysis(payload: RunAprioriPayload) {
  const response = await api.post<ApiResponse<AprioriRun>>("/owner/apriori-runs", payload);

  return response.data.data;
}

export async function getAprioriRun(id: string | number) {
  const response = await api.get<ApiResponse<AprioriRun>>(`/owner/apriori-runs/${id}`);

  return response.data.data;
}

export async function deleteAprioriRun(id: string | number) {
  const response = await api.delete<ApiResponse<null>>(`/owner/apriori-runs/${id}`);

  return response.data;
}

export async function getRecommendations(params?: Record<string, string>) {
  const response = await api.get<ApiResponse<Recommendation[]>>("/owner/recommendations", { params });

  return response.data.data;
}
