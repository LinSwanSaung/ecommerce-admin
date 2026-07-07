"use client";

import { flexRender, type Column, type Table as TableInstance } from "@tanstack/react-table";
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

// lets a column def set width/alignment classes via meta
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    className?: string;
  }
}

export function DataTable<T>({
  table,
  isLoading,
  onRowClick,
  empty,
  skeletonRows = 8,
}: {
  table: TableInstance<T>;
  isLoading?: boolean;
  onRowClick?: (row: T) => void;
  empty?: React.ReactNode;
  skeletonRows?: number;
}) {
  const columnCount = table.getVisibleFlatColumns().length;
  const rows = table.getRowModel().rows;

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader className="bg-muted/50">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={header.column.columnDef.meta?.className}
                  aria-sort={ariaSort(header.column)}
                >
                  {header.isPlaceholder ? null : header.column.getCanSort() ? (
                    <SortButton column={header.column}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </SortButton>
                  ) : (
                    flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: skeletonRows }).map((_, rowIndex) => (
              <TableRow key={rowIndex} className="hover:bg-transparent">
                {Array.from({ length: columnCount }).map((_, cellIndex) => (
                  <TableCell key={cellIndex}>
                    <Skeleton className="h-4 w-full max-w-35" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : rows.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columnCount} className="p-0">
                {empty}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow
                key={row.id}
                onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                className={cn(onRowClick && "cursor-pointer")}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cell.column.columnDef.meta?.className}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
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

function ariaSort<T>(column: Column<T>) {
  if (!column.getCanSort()) return undefined;
  const sorted = column.getIsSorted();
  return sorted === "asc"
    ? "ascending"
    : sorted === "desc"
      ? "descending"
      : "none";
}

// clicking cycles asc -> desc -> none, useDataTable writes it to the URL
function SortButton<T>({
  column,
  children,
}: {
  column: Column<T>;
  children: React.ReactNode;
}) {
  const sorted = column.getIsSorted(); // false | "asc" | "desc"
  const Icon = sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ChevronsUpDown;

  return (
    <button
      type="button"
      onClick={column.getToggleSortingHandler()}
      className="-ml-1 inline-flex items-center gap-1 rounded px-1 py-0.5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      {children}
      <Icon
        className={cn(
          "h-3.5 w-3.5",
          sorted ? "text-foreground" : "text-muted-foreground",
        )}
      />
    </button>
  );
}
