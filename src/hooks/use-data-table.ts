"use client";

import { useState } from "react";
import {
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type Updater,
  type VisibilityState,
} from "@tanstack/react-table";

import { useQueryParams } from "./use-query-params";

// Builds a TanStack Table instance wired to our server-side data model:
// - manual* modes: the SERVER does the actual sorting/filtering/pagination
//   (driven by the URL); the table only manages view state.
// - sorting state is derived from ?sort=&order= and written back to the URL,
//   so the server re-queries when a header is clicked.
// - column visibility is client-only view preference.
export function useDataTable<T>({
  columns,
  rows,
  getRowId,
}: {
  columns: ColumnDef<T>[];
  rows: T[];
  getRowId?: (row: T) => string;
}) {
  const { get, setParams } = useQueryParams();
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const sort = get("sort");
  const sorting: SortingState = sort
    ? [{ id: sort, desc: get("order") === "desc" }]
    : [];

  // TanStack hands us the next sorting state; we translate it into URL params.
  const onSortingChange = (updater: Updater<SortingState>) => {
    const next = typeof updater === "function" ? updater(sorting) : updater;
    const first = next[0];
    setParams({
      sort: first?.id ?? null,
      order: first ? (first.desc ? "desc" : "asc") : null,
      page: null, // a new sort resets to page 1
    });
  };

  return useReactTable({
    data: rows,
    columns,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    sortDescFirst: false, // numbers would otherwise start descending
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
    state: { sorting, columnVisibility },
    onSortingChange,
    onColumnVisibilityChange: setColumnVisibility,
  });
}
