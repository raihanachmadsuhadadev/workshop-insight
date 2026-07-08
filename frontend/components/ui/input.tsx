import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "neo-input h-11 w-full px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400",
        className,
      )}
      {...props}
    />
  );
}
