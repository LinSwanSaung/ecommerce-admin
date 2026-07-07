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

// manual mode: the server does the real sorting/filtering/paging, this
// instance only holds view state and mirrors ?sort=&order= from the URL
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
