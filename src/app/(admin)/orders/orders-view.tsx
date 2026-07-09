"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/tables/data-table";
import { SearchInput } from "@/components/tables/search-input";
import { FilterSelect } from "@/components/tables/filter-select";
import { ColumnToggle } from "@/components/tables/column-toggle";
import { TablePagination } from "@/components/tables/table-pagination";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { DetailModal, DetailRow } from "@/components/detail-modal";
import { useDataTable } from "@/hooks/use-data-table";
import { useQueryParams } from "@/hooks/use-query-params";
import { formatCurrency, formatDate } from "@/lib/format";
import { ORDER_STATUSES } from "@/lib/constants";
import type { ListResult, Order } from "@/types";

export function OrdersView({ data }: { data: ListResult<Order> }) {
  const { isPending } = useQueryParams();
  const [detail, setDetail] = useState<Order | null>(null);

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "id",
      header: "Order",
      cell: ({ row }) => <span className="font-medium">{row.original.id}</span>,
    },
    { accessorKey: "customerName", header: "Customer", enableSorting: false },
    {
      accessorKey: "date",
      header: "Date",
      meta: { className: "hidden md:table-cell" },
      cell: ({ row }) => formatDate(row.original.date),
    },
    {
      accessorKey: "total",
      header: "Total",
      meta: { className: "text-right" },
      cell: ({ row }) => formatCurrency(row.original.total),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      enableHiding: false,
      meta: { className: "w-10 text-right" },
      // row click opens the detail too, this button is the keyboard path
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="View details"
          onClick={() => setDetail(row.original)}
        >
          <Eye />
        </Button>
      ),
    },
  ];

  const table = useDataTable({
    columns,
    rows: data.rows,
    getRowId: (order) => order.id,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchInput placeholder="Search order ID or customer" />
        <FilterSelect paramKey="status" label="Statuses" options={ORDER_STATUSES} />
        <div className="sm:ml-auto">
          <ColumnToggle table={table} />
        </div>
      </div>

      <DataTable
        table={table}
        isLoading={isPending}
        onRowClick={setDetail}
        empty={
          <EmptyState
            icon={SearchX}
            title="No orders found"
            description="Try adjusting your search or filters."
          />
        }
      />

      <TablePagination
        page={data.page}
        totalPages={data.totalPages}
        total={data.total}
        isLoading={isPending}
      />

      <DetailModal
        open={Boolean(detail)}
        onOpenChange={(open) => !open && setDetail(null)}
        title={detail?.id ?? ""}
        description={detail ? formatDate(detail.date) : undefined}
      >
        {detail ? (
          <div className="space-y-5">
            <dl>
              <DetailRow label="Customer">{detail.customerName}</DetailRow>
              <DetailRow label="Email">{detail.customerEmail}</DetailRow>
              <DetailRow label="Status">
                <StatusBadge status={detail.status} />
              </DetailRow>
              <DetailRow label="Total">{formatCurrency(detail.total)}</DetailRow>
            </dl>

            <div className="space-y-2">
              <p className="text-sm font-medium">Items</p>
              <ul className="divide-y rounded-lg border">
                {detail.items.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between gap-4 px-3 py-2 text-sm"
                  >
                    <span>
                      {item.name}
                      <span className="text-muted-foreground"> × {item.quantity}</span>
                    </span>
                    <span className="font-medium">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </DetailModal>
    </div>
  );
}
