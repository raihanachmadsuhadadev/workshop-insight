import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ConfirmDialog({
  title,
  description,
  isLoading,
  onCancel,
  onConfirm,
}: {
  title: string;
  description: string;
  isLoading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm">
      <div className="neo-card w-full max-w-md p-6">
        <div className="flex gap-3">
          <div className="neo-card-soft flex h-11 w-11 shrink-0 items-center justify-center text-red-600">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
            Batal
          </Button>
          <Button type="button" className="bg-red-600 hover:bg-red-700" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Menghapus..." : "Hapus"}
          </Button>
        </div>
      </div>
    </div>
  );
}
