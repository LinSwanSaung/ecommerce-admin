"use client";

import { useState } from "react";
import { AlertTriangle, UserSearch } from "lucide-react";

import { DataTable, type Column } from "@/components/tables/data-table";
import { SearchInput } from "@/components/tables/search-input";
import { FilterSelect } from "@/components/tables/filter-select";
import { ColumnToggle } from "@/components/tables/column-toggle";
import { TablePagination } from "@/components/tables/table-pagination";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { DetailSheet, DetailRow } from "@/components/detail-sheet";
import { useList } from "@/hooks/use-list";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { CUSTOMER_STATUSES } from "@/lib/constants";
import type { Customer } from "@/types";

const columns: Column<Customer>[] = [
  {
    key: "name",
    header: "Name",
    sortable: true,
    cell: (customer) => <span className="font-medium">{customer.name}</span>,
  },
  {
    key: "email",
    header: "Email",
    className: "text-muted-foreground",
    cell: (customer) => customer.email,
  },
  {
    key: "totalOrders",
    header: "Orders",
    sortable: true,
    className: "text-right",
    cell: (customer) => formatNumber(customer.totalOrders),
  },
  {
    key: "totalSpent",
    header: "Spent",
    sortable: true,
    className: "text-right",
    cell: (customer) => formatCurrency(customer.totalSpent),
  },
  {
    key: "status",
    header: "Status",
    sortable: true,
    cell: (customer) => <StatusBadge status={customer.status} />,
  },
];

export function CustomersView() {
  const { data, isLoading, isError, refetch } = useList<Customer>("customers");
  const [detail, setDetail] = useState<Customer | null>(null);
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);

  const toggleColumn = (key: string) =>
    setHiddenColumns((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );

  const visibleColumns = columns.filter((col) => !hiddenColumns.includes(col.key));

  const emptyState = isError ? (
    <EmptyState
      icon={AlertTriangle}
      title="Couldn't load customers"
      description="Something went wrong while fetching the list."
      action={{ label: "Try again", onClick: () => refetch() }}
    />
  ) : (
    <EmptyState
      icon={UserSearch}
      title="No customers found"
      description="Try adjusting your search or filters."
    />
  );

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
        getRowId={(customer) => customer.id}
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
      </DetailSheet>
    </div>
  );
}
