import { api, type ApiResponse } from "@/lib/api";

export type MasterResource =
  | "item-categories"
  | "spare-parts"
  | "services"
  | "customers"
  | "mechanics";

export type MasterRecord = Record<string, unknown> & {
  id: number;
  code: string;
  name: string;
  is_active: boolean;
};

export async function listMasterData<T extends MasterRecord>(
  resource: MasterResource,
  params?: Record<string, string>,
) {
  const response = await api.get<ApiResponse<T[]>>(`/admin/${resource}`, { params });

  return response.data.data;
}

export async function createMasterData<T extends MasterRecord>(
  resource: MasterResource,
  payload: Record<string, unknown>,
) {
  const response = await api.post<ApiResponse<T>>(`/admin/${resource}`, payload);

  return response.data;
}

export async function updateMasterData<T extends MasterRecord>(
  resource: MasterResource,
  id: number,
  payload: Record<string, unknown>,
) {
  const response = await api.put<ApiResponse<T>>(`/admin/${resource}/${id}`, payload);

  return response.data;
}

export async function deleteMasterData(resource: MasterResource, id: number) {
  const response = await api.delete<ApiResponse<null>>(`/admin/${resource}/${id}`);

  return response.data;
}
