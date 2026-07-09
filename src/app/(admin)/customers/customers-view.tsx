"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, UserSearch } from "lucide-react";

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
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { CUSTOMER_STATUSES } from "@/lib/constants";
import type { Customer, ListResult } from "@/types";

export function CustomersView({ data }: { data: ListResult<Customer> }) {
  const { isPending } = useQueryParams();
  const [detail, setDetail] = useState<Customer | null>(null);

  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: "email",
      header: "Email",
      enableSorting: false,
      meta: { className: "text-muted-foreground" },
    },
    {
      accessorKey: "totalOrders",
      header: "Orders",
      meta: { className: "text-right" },
      cell: ({ row }) => formatNumber(row.original.totalOrders),
    },
    {
      accessorKey: "totalSpent",
      header: "Spent",
      meta: { className: "text-right" },
      cell: ({ row }) => formatCurrency(row.original.totalSpent),
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
    getRowId: (customer) => customer.id,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchInput placeholder="Search name or email" />
        <FilterSelect
          paramKey="status"
          label="Statuses"
          options={CUSTOMER_STATUSES}
        />
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
            icon={UserSearch}
            title="No customers found"
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
        title={detail?.name ?? ""}
        description={detail?.email}
      >
        {detail ? (
          <div className="space-y-5">
            <dl>
              <DetailRow label="Status">
                <StatusBadge status={detail.status} />
              </DetailRow>
              <DetailRow label="Total orders">
                {formatNumber(detail.totalOrders)}
              </DetailRow>
              <DetailRow label="Total spent">
                {formatCurrency(detail.totalSpent)}
              </DetailRow>
              <DetailRow label="Joined">{formatDate(detail.joinedAt)}</DetailRow>
            </dl>

            <div className="space-y-2">
              <p className="text-sm font-medium">Recent orders</p>
              {detail.recentOrders.length > 0 ? (
                <ul className="divide-y rounded-lg border">
                  {detail.recentOrders.map((order) => (
                    <li
                      key={order.id}
                      className="flex items-center justify-between gap-4 px-3 py-2 text-sm"
                    >
                      <div>
                        <p className="font-medium">{order.id}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(order.date)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={order.status} />
                        <span className="font-medium">
                          {formatCurrency(order.total)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No orders yet.</p>
              )}
            </div>
          </div>
        ) : null}
      </DetailModal>
    </div>
  );
}
