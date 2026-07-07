"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";

import { StatCard } from "@/components/stat-card";
import { SalesChart, type ChartMetric } from "@/components/dashboard/sales-chart";
import { DataTable } from "@/components/tables/data-table";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDataTable } from "@/hooks/use-data-table";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import type { DashboardData, Order } from "@/types";

const recentOrderColumns: ColumnDef<Order>[] = [
  {
    accessorKey: "id",
    header: "Order",
    enableSorting: false,
    cell: ({ row }) => <span className="font-medium">{row.original.id}</span>,
  },
  { accessorKey: "customerName", header: "Customer", enableSorting: false },
  {
    accessorKey: "date",
    header: "Date",
    enableSorting: false,
    meta: { className: "hidden md:table-cell" },
    cell: ({ row }) => formatDate(row.original.date),
  },
  {
    accessorKey: "total",
    header: "Total",
    enableSorting: false,
    meta: { className: "text-right" },
    cell: ({ row }) => (
      <span className="font-medium">{formatCurrency(row.original.total)}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    enableSorting: false,
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];

export function DashboardView({ data }: { data: DashboardData }) {
  const [metric, setMetric] = useState<ChartMetric>("revenue");

  const recentOrdersTable = useDataTable({
    columns: recentOrderColumns,
    rows: data.recentOrders,
    getRowId: (order) => order.id,
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total revenue"
          value={formatCurrency(data.totals.revenue)}
          icon={DollarSign}
        />
        <StatCard
          label="Total orders"
          value={formatNumber(data.totals.orders)}
          icon={ShoppingCart}
        />
        <StatCard
          label="Total customers"
          value={formatNumber(data.totals.customers)}
          icon={Users}
        />
        <StatCard
          label="Total products"
          value={formatNumber(data.totals.products)}
          icon={Package}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{metric === "revenue" ? "Revenue" : "Orders"}</CardTitle>
          <CardDescription>Last 14 days</CardDescription>
          <CardAction>
            <Tabs
              value={metric}
              onValueChange={(value) => setMetric(value as ChartMetric)}
            >
              <TabsList>
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardAction>
        </CardHeader>
        <CardContent>
          <SalesChart data={data.dailyStats} metric={metric} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent orders</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            table={recentOrdersTable}
            empty={<EmptyState title="No orders yet" />}
          />
        </CardContent>
      </Card>
    </div>
  );
}
