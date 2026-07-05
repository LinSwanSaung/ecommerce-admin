"use client";

import { useState } from "react";
import { AlertTriangle, SearchX } from "lucide-react";

import { DataTable, type Column } from "@/components/tables/data-table";
import { SearchInput } from "@/components/tables/search-input";
import { FilterSelect } from "@/components/tables/filter-select";
import { ColumnToggle } from "@/components/tables/column-toggle";
import { TablePagination } from "@/components/tables/table-pagination";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { DetailSheet, DetailRow } from "@/components/detail-sheet";
import { useList } from "@/hooks/use-list";
import { formatCurrency, formatDate } from "@/lib/format";
import { ORDER_STATUSES } from "@/lib/constants";
import type { Order } from "@/types";

const columns: Column<Order>[] = [
  {
    key: "id",
    header: "Order",
    sortable: true,
    cell: (order) => <span className="font-medium">{order.id}</span>,
  },
  { key: "customerName", header: "Customer", cell: (order) => order.customerName },
  {
    key: "date",
    header: "Date",
    sortable: true,
    className: "hidden md:table-cell",
    cell: (order) => formatDate(order.date),
  },
  {
    key: "total",
    header: "Total",
    sortable: true,
    className: "text-right",
    cell: (order) => formatCurrency(order.total),
  },
  {
    key: "status",
    header: "Status",
    sortable: true,
    cell: (order) => <StatusBadge status={order.status} />,
  },
];

export function OrdersView() {
  const { data, isLoading, isError, refetch } = useList<Order>("orders");
  const [detail, setDetail] = useState<Order | null>(null);
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);

  const toggleColumn = (key: string) =>
    setHiddenColumns((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );

  const visibleColumns = columns.filter((col) => !hiddenColumns.includes(col.key));

  const emptyState = isError ? (
    <EmptyState
      icon={AlertTriangle}
      title="Couldn't load orders"
      description="Something went wrong while fetching the list."
      action={{ label: "Try again", onClick: () => refetch() }}
    />
  ) : (
    <EmptyState
      icon={SearchX}
      title="No orders found"
      description="Try adjusting your search or filters."
    />
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchInput placeholder="Search order ID or customer" />
        <FilterSelect paramKey="status" label="Statuses" options={ORDER_STATUSES} />
        <div className="sm:ml-auto">
          <ColumnToggle
            columns={columns}
            hidden={hiddenColumns}
            onToggle={toggleColumn}
          />
        </div>
      </div>

      <DataTable
        columns={visibleColumns}
        rows={data?.rows ?? []}
        getRowId={(order) => order.id}
        isLoading={isLoading}
        onRowClick={setDetail}
        empty={emptyState}
      />

      <TablePagination
        page={data?.page ?? 1}
        totalPages={data?.totalPages ?? 1}
        total={data?.total ?? 0}
        isLoading={isLoading}
      />

      <DetailSheet
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
      </DetailSheet>
    </div>
  );
}
