import type { ReactNode } from "react";
import { X } from "lucide-react";

export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm">
      <div className="neo-card max-h-[90vh] w-full max-w-3xl overflow-y-auto">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200/70 bg-slate-50/95 px-5 py-4 backdrop-blur">
          <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="neo-button neo-button-ghost flex h-9 w-9 items-center justify-center text-slate-500"
            aria-label="Tutup"
            title="Tutup"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
