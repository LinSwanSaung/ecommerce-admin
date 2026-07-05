"use client";

import { Button } from "@/components/ui/button";
import { useQueryParams } from "@/hooks/use-query-params";

// Reads page/totalPages from the data and writes ?page= back to the URL.
export function TablePagination({
  page,
  totalPages,
  total,
  isLoading,
}: {
  page: number;
  totalPages: number;
  total: number;
  isLoading?: boolean;
}) {
  const { setParams } = useQueryParams();

  return (
    <div className="flex items-center justify-between gap-4 px-1 text-sm">
      <p className="text-muted-foreground">
        {isLoading ? "Loading…" : `${total} result${total === 1 ? "" : "s"}`}
      </p>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => setParams({ page: page - 1 === 1 ? null : page - 1 })}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => setParams({ page: page + 1 })}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
