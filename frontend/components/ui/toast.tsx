import { CheckCircle2, XCircle } from "lucide-react";

export type ToastState = {
  type: "success" | "error";
  message: string;
} | null;

export function Toast({ toast }: { toast: ToastState }) {
  if (!toast) {
    return null;
  }

  const isSuccess = toast.type === "success";
  const Icon = isSuccess ? CheckCircle2 : XCircle;

  return (
    <div className="neo-card fixed right-4 top-4 z-50 max-w-sm p-4">
      <div className="flex gap-3">
        <Icon
          className={isSuccess ? "h-5 w-5 text-green-600" : "h-5 w-5 text-red-600"}
          aria-hidden="true"
        />
        <p className="text-sm font-semibold text-slate-800">{toast.message}</p>
      </div>
    </div>
  );
}
