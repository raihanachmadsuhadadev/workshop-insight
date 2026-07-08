"use client";

import { FormEvent, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";
import { Edit2, Plus, Trash2 } from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/loading-state";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import { Toast, type ToastState } from "@/components/ui/toast";
import { listMasterData, createMasterData, deleteMasterData, updateMasterData, type MasterRecord, type MasterResource } from "@/lib/services/master-data";

type FieldType = "text" | "number" | "textarea" | "select" | "boolean";

export type FieldConfig = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
  optionSource?: "categories";
  grid?: "full" | "half";
};

export type ColumnConfig = {
  header: string;
  render: (record: MasterRecord) => ReactNode;
};

export type MasterDataConfig = {
  resource: MasterResource;
  title: string;
  description: string;
  createLabel: string;
  emptyTitle: string;
  emptyDescription: string;
  columns: ColumnConfig[];
  fields: FieldConfig[];
  initialValues: Record<string, string | boolean>;
  searchable?: boolean;
  needsCategories?: boolean;
};

type CategoryRecord = MasterRecord & {
  type?: string | null;
};

const defaultItemsPerPage = 10;

function getErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const errors = error.response?.data?.errors;

    if (errors && typeof errors === "object") {
      const firstError = Object.values(errors)[0];

      if (Array.isArray(firstError) && firstError[0]) {
        return String(firstError[0]);
      }
    }

    return error.response?.data?.message ?? "Terjadi kesalahan saat memproses data.";
  }

  return "Terjadi kesalahan saat memproses data.";
}

function normalizePayload(values: Record<string, string | boolean>, fields: FieldConfig[]) {
  return fields.reduce<Record<string, unknown>>((payload, field) => {
    const value = values[field.name];

    if (field.type === "number") {
      payload[field.name] = value === "" ? null : Number(value);
      return payload;
    }

    if (field.type === "boolean") {
      payload[field.name] = Boolean(value);
      return payload;
    }

    if (field.name === "item_category_id") {
      payload[field.name] = value === "" ? null : Number(value);
      return payload;
    }

    payload[field.name] = value === "" ? null : value;

    return payload;
  }, {});
}

export function activeBadge(isActive: unknown) {
  return <Badge tone={isActive ? "green" : "slate"}>{isActive ? "Aktif" : "Nonaktif"}</Badge>;
}

export function MasterDataPage({ config }: { config: MasterDataConfig }) {
  const [records, setRecords] = useState<MasterRecord[]>([]);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [formValues, setFormValues] = useState(config.initialValues);
  const [editingRecord, setEditingRecord] = useState<MasterRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<MasterRecord | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const showToast = useCallback((nextToast: ToastState) => {
    setToast(nextToast);
    window.setTimeout(() => setToast(null), 2800);
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);

    try {
      const params: Record<string, string> = {};

      if (search) {
        params.search = search;
      }

      if (statusFilter) {
        params.is_active = statusFilter;
      }

      const [masterData, categoryData] = await Promise.all([
        listMasterData(config.resource, params),
        config.needsCategories ? listMasterData<CategoryRecord>("item-categories") : Promise.resolve([]),
      ]);

      setRecords(masterData);
      setCategories(categoryData);
      setPage(1);
    } catch (error) {
      showToast({ type: "error", message: getErrorMessage(error) });
    } finally {
      setIsLoading(false);
    }
  }, [config.needsCategories, config.resource, search, showToast, statusFilter]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      loadData();
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [loadData]);

  const totalPages = Math.max(1, Math.ceil(records.length / itemsPerPage));
  const activePage = Math.min(page, totalPages);
  const paginatedRecords = useMemo(
    () => records.slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage),
    [activePage, itemsPerPage, records],
  );

  function openCreateModal() {
    setEditingRecord(null);
    setFormValues(config.initialValues);
    setIsFormOpen(true);
  }

  function openEditModal(record: MasterRecord) {
    setEditingRecord(record);
    setFormValues(
      Object.keys(config.initialValues).reduce<Record<string, string | boolean>>((values, key) => {
        const rawValue = record[key];
        values[key] = typeof config.initialValues[key] === "boolean" ? Boolean(rawValue) : String(rawValue ?? "");
        return values;
      }, {}),
    );
    setIsFormOpen(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = normalizePayload(formValues, config.fields);

      if (editingRecord) {
        await updateMasterData(config.resource, editingRecord.id, payload);
        showToast({ type: "success", message: `${config.title} berhasil diperbarui.` });
      } else {
        await createMasterData(config.resource, payload);
        showToast({ type: "success", message: `${config.title} berhasil ditambahkan.` });
      }

      setIsFormOpen(false);
      await loadData();
    } catch (error) {
      showToast({ type: "error", message: getErrorMessage(error) });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deletingRecord) {
      return;
    }

    setIsSubmitting(true);

    try {
      await deleteMasterData(config.resource, deletingRecord.id);
      showToast({ type: "success", message: `${config.title} berhasil dihapus.` });
      setDeletingRecord(null);
      await loadData();
    } catch (error) {
      showToast({ type: "error", message: getErrorMessage(error) });
    } finally {
      setIsSubmitting(false);
    }
  }

  const columns = [
    ...config.columns.map((column) => column.header),
    "Aksi",
  ];

  const rows = paginatedRecords.map((record) => [
    ...config.columns.map((column) => column.render(record)),
    <div key={`actions-${record.id}`} className="flex gap-2">
      <Button type="button" size="sm" variant="secondary" onClick={() => openEditModal(record)}>
        <Edit2 className="h-4 w-4" aria-hidden="true" />
      </Button>
      <Button
        type="button"
        size="sm"
        className="bg-red-600 hover:bg-red-700"
        onClick={() => setDeletingRecord(record)}
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>,
  ]);

  return (
    <DashboardLayout
      title={config.title}
      description={config.description}
      role="Admin"
      userName="Admin Kasir"
      eyebrow="Master Data"
    >
      <Toast toast={toast} />

      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid flex-1 gap-3 md:grid-cols-[1fr_180px]">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Cari</span>
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari kode, nama, atau detail data..."
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Status</span>
              <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="">Semua</option>
                <option value="1">Aktif</option>
                <option value="0">Nonaktif</option>
              </Select>
            </label>
          </div>
          <Button type="button" onClick={openCreateModal}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            {config.createLabel}
          </Button>
        </div>
      </Card>

      <div className="mt-6">
        {isLoading ? (
          <LoadingState />
        ) : records.length === 0 ? (
          <EmptyState
            title={config.emptyTitle}
            description={config.emptyDescription}
            icon={Plus}
          />
        ) : (
          <Card>
            <CardTitle title={`Daftar ${config.title}`} description={`${records.length} data ditemukan.`} />
            <DataTable columns={columns} rows={rows} />
            <Pagination
              currentPage={activePage}
              totalItems={records.length}
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

      {isFormOpen ? (
        <Modal
          title={editingRecord ? `Edit ${config.title}` : config.createLabel}
          onClose={() => setIsFormOpen(false)}
        >
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            {config.fields.map((field) => {
              const commonLabel = (
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  {field.label}
                </span>
              );
              const className = field.grid === "full" || field.type === "textarea" ? "md:col-span-2" : "";
              const value = formValues[field.name];
              const setValue = (nextValue: string | boolean) => {
                setFormValues((current) => ({ ...current, [field.name]: nextValue }));
              };

              if (field.type === "textarea") {
                return (
                  <label key={field.name} className={className}>
                    {commonLabel}
                    <textarea
                      value={String(value ?? "")}
                      onChange={(event) => setValue(event.target.value)}
                      placeholder={field.placeholder}
                      className="min-h-24 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                    />
                  </label>
                );
              }

              if (field.type === "select") {
                const options = field.optionSource === "categories"
                  ? categories.map((category) => ({ label: `${category.code} - ${category.name}`, value: String(category.id) }))
                  : field.options ?? [];

                return (
                  <label key={field.name} className={className}>
                    {commonLabel}
                    <Select
                      value={String(value ?? "")}
                      onChange={(event) => setValue(event.target.value)}
                      required={field.required}
                    >
                      <option value="">Pilih data</option>
                      {options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </label>
                );
              }

              if (field.type === "boolean") {
                return (
                  <label key={field.name} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                    <input
                      type="checkbox"
                      checked={Boolean(value)}
                      onChange={(event) => setValue(event.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-orange-500"
                    />
                    <span className="text-sm font-semibold text-slate-700">{field.label}</span>
                  </label>
                );
              }

              return (
                <label key={field.name} className={className}>
                  {commonLabel}
                  <Input
                    type={field.type}
                    value={String(value ?? "")}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder={field.placeholder}
                    required={field.required}
                  />
                </label>
              );
            })}

            <div className="flex justify-end gap-3 md:col-span-2">
              <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)} disabled={isSubmitting}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        </Modal>
      ) : null}

      {deletingRecord ? (
        <ConfirmDialog
          title={`Hapus ${deletingRecord.name}?`}
          description="Data akan dihapus dari daftar melalui soft delete. Aksi ini bisa dipulihkan dari database jika diperlukan."
          isLoading={isSubmitting}
          onCancel={() => setDeletingRecord(null)}
          onConfirm={handleDelete}
        />
      ) : null}
    </DashboardLayout>
  );
}
