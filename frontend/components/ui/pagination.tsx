import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Pagination({
  currentPage,
  totalItems,
  itemsPerPage = 10,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 25, 50],
  className,
  page,
  totalPages,
}: {
  currentPage?: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  itemsPerPageOptions?: number[];
  className?: string;
  page?: number;
  totalPages?: number;
}) {
  const activePage = currentPage ?? page ?? 1;
  const pages = totalPages ?? Math.max(1, Math.ceil((totalItems ?? 0) / itemsPerPage));
  const hasItems = totalItems === undefined || totalItems > 0;
  const firstItem = totalItems ? (activePage - 1) * itemsPerPage + 1 : 0;
  const lastItem = totalItems ? Math.min(activePage * itemsPerPage, totalItems) : 0;
  const pageNumbers = Array.from({ length: pages }, (_, index) => index + 1)
    .filter((nextPage) => (
      nextPage === 1 ||
      nextPage === pages ||
      Math.abs(nextPage - activePage) <= 1
    ));

  if (!hasItems || (pages <= 1 && !onItemsPerPageChange)) {
    return null;
  }

  return (
    <div className={cn("mt-4 flex flex-col gap-3 border-t border-slate-200 pt-4 md:flex-row md:items-center md:justify-between", className)}>
      <p className="text-sm text-slate-500">
        {totalItems === undefined
          ? `Halaman ${activePage} dari ${pages}`
          : `Menampilkan ${firstItem}-${lastItem} dari ${totalItems} data`}
      </p>
      <div className="flex flex-wrap items-center justify-end gap-2">
        {onItemsPerPageChange ? (
          <div className="w-auto shrink-0">
            <select
              value={itemsPerPage}
              onChange={(event) => onItemsPerPageChange(Number(event.target.value))}
              className="h-9 w-[72px] min-w-[72px] max-w-[72px] rounded-xl border border-slate-200 bg-white px-2 text-sm font-medium text-slate-800 shadow-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              aria-label="Data per halaman"
            >
              {itemsPerPageOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        ) : null}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="h-10 w-10 p-0"
          onClick={() => onPageChange(activePage - 1)}
          disabled={activePage <= 1}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Sebelumnya</span>
        </Button>
        {pageNumbers.map((nextPage, index) => {
          const previousPage = pageNumbers[index - 1];
          const needsEllipsis = previousPage && nextPage - previousPage > 1;

          return (
            <span key={nextPage} className="flex items-center gap-2">
              {needsEllipsis ? <span className="text-sm text-slate-400">...</span> : null}
              <Button
                type="button"
                variant={nextPage === activePage ? "primary" : "secondary"}
                size="sm"
                onClick={() => onPageChange(nextPage)}
                className="h-10 min-w-10 px-3"
              >
                {nextPage}
              </Button>
            </span>
          );
        })}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="h-10 w-10 p-0"
          onClick={() => onPageChange(activePage + 1)}
          disabled={activePage >= pages}
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Berikutnya</span>
        </Button>
      </div>
    </div>
  );
}
