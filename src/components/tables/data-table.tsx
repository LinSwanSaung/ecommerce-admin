"use client";

import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useQueryParams } from "@/hooks/use-query-params";

// A column definition. `cell` renders the value; `key` doubles as the sort key.
export type Column<T> = {
  key: string;
  header: string;
  sortable?: boolean;
  className?: string; // alignment etc., applied to both header and cell
  cell: (row: T) => React.ReactNode;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  isLoading?: boolean;
  onRowClick?: (row: T) => void;
  empty?: React.ReactNode; // shown when there are no rows (or on error)
  skeletonRows?: number;
};

// The shared table: presentation only (sortable headers, skeletons, empty slot);
// pages pass in already-fetched rows.
export function DataTable<T>({
  columns,
  rows,
  getRowId,
  isLoading,
  onRowClick,
  empty,
  skeletonRows = 8,
}: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent">
            {columns.map((col) => (
              <TableHead key={col.key} className={col.className}>
                {col.sortable ? (
                  <SortButton sortKey={col.key}>{col.header}</SortButton>
                ) : (
                  col.header
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: skeletonRows }).map((_, rowIndex) => (
              <TableRow key={rowIndex} className="hover:bg-transparent">
                {columns.map((col) => (
                  <TableCell key={col.key} className={col.className}>
                    <Skeleton className="h-4 w-full max-w-35" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : rows.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columns.length} className="p-0">
                {empty}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow
                key={getRowId(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(onRowClick && "cursor-pointer")}
              >
                {columns.map((col) => (
                  <TableCell key={col.key} className={col.className}>
                    {col.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// A clickable header that toggles sort direction through the URL (?sort=&order=).
function SortButton({
  sortKey,
  children,
}: {
  sortKey: string;
  children: React.ReactNode;
}) {
  const { get, setParams } = useQueryParams();
  const active = get("sort") === sortKey;
  const order = get("order", "asc");
  const Icon = !active ? ChevronsUpDown : order === "asc" ? ArrowUp : ArrowDown;

  return (
    <button
      type="button"
      onClick={() =>
        setParams({
          sort: sortKey,
          order: active && order === "asc" ? "desc" : "asc",
          page: null, // a new sort resets to page 1
        })
      }
      className="-ml-1 inline-flex items-center gap-1 rounded px-1 py-0.5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      {children}
      <Icon
        className={cn(
          "h-3.5 w-3.5",
          active ? "text-foreground" : "text-muted-foreground",
        )}
      />
    </button>
  );
}
