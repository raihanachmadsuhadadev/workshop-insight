import { api, type ApiResponse } from "@/lib/api";
import type { MasterRecord } from "@/lib/services/master-data";

export type Relation = {
  id: number;
  code?: string;
  name: string;
  email?: string;
};

export type TransactionItem = {
  id: number;
  item_type: "spare_part" | "service";
  item_id: number;
  item_code: string;
  item_name: string;
  quantity: number;
  unit_price: string;
  subtotal: string;
};

export type StockMovement = {
  id: number;
  movement_type: "in" | "out" | "adjustment" | "reversal";
  quantity: number;
  stock_before: number;
  stock_after: number;
  reference_code: string | null;
  description: string | null;
  created_at: string;
  spare_part?: MasterRecord & { item_category?: Relation };
  transaction?: Transaction;
  created_by?: Relation;
};

export type Transaction = {
  id: number;
  transaction_date: string;
  code: string;
  customer_id: number | null;
  mechanic_id: number | null;
  cashier_id: number | null;
  vehicle_plate_number: string | null;
  vehicle_description: string | null;
  subtotal_spare_parts: string;
  subtotal_services: string;
  discount_amount: string;
  total_amount: string;
  payment_method: "cash" | "transfer" | "qris" | "other" | null;
  payment_status: "paid" | "unpaid";
  status: "completed" | "cancelled";
  notes: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  customer?: Relation;
  mechanic?: Relation;
  cashier?: Relation;
  cancelled_by?: Relation;
  items?: TransactionItem[];
  stock_movements?: StockMovement[];
};

export type CreateTransactionPayload = {
  transaction_date?: string;
  customer_id?: number | null;
  mechanic_id?: number | null;
  vehicle_plate_number?: string | null;
  vehicle_description?: string | null;
  payment_method?: string;
  payment_status?: string;
  discount_amount?: number;
  notes?: string | null;
  items: Array<{
    item_type: "spare_part" | "service";
    item_id: number;
    quantity: number;
  }>;
};

export async function getTransactions(params?: Record<string, string>) {
  const response = await api.get<ApiResponse<Transaction[]>>("/admin/transactions", { params });

  return response.data.data;
}

export async function createTransaction(payload: CreateTransactionPayload) {
  const response = await api.post<ApiResponse<Transaction>>("/admin/transactions", payload);

  return response.data.data;
}

export async function getTransaction(id: string | number) {
  const response = await api.get<ApiResponse<Transaction>>(`/admin/transactions/${id}`);

  return response.data.data;
}

export async function cancelTransaction(id: string | number, cancellation_reason: string) {
  const response = await api.post<ApiResponse<Transaction>>(`/admin/transactions/${id}/cancel`, {
    cancellation_reason,
  });

  return response.data.data;
}

export async function getStockMovements(params?: Record<string, string>) {
  const response = await api.get<ApiResponse<StockMovement[]>>("/admin/stock-movements", { params });

  return response.data.data;
}
