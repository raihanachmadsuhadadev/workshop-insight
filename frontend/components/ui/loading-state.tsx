import { Loader2 } from "lucide-react";

export function LoadingState({ label = "Memuat data..." }: { label?: string }) {
  return (
    <div className="flex min-h-56 items-center justify-center rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
        <Loader2 className="h-5 w-5 animate-spin text-orange-500" aria-hidden="true" />
        {label}
      </div>
    </div>
  );
}
