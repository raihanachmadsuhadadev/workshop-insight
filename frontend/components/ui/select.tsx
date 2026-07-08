import type { SelectHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "neo-select h-11 w-full px-3 text-sm text-slate-900 outline-none transition",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
