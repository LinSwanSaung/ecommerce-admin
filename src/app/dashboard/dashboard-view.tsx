"use client";

import { useState } from "react";
import {
  AlertTriangle,
  DollarSign,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";

import { StatCard } from "@/components/stat-card";
import { SalesChart, type ChartMetric } from "@/components/dashboard/sales-chart";
import { DataTable, type Column } from "@/components/tables/data-table";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard } from "@/hooks/use-dashboard";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import type { Order } from "@/types";

const recentOrderColumns: Column<Order>[] = [
  {
    key: "id",
    header: "Order",
    cell: (order) => <span className="font-medium">{order.id}</span>,
  },
  { key: "customerName", header: "Customer", cell: (order) => order.customerName },
  {
    key: "date",
    header: "Date",
    className: "hidden md:table-cell",
    cell: (order) => formatDate(order.date),
  },
  {
    key: "total",
    header: "Total",
    className: "text-right",
    cell: (order) => (
      <span className="font-medium">{formatCurrency(order.total)}</span>
    ),
  },
  {
    key: "status",
    header: "Status",
    cell: (order) => <StatusBadge status={order.status} />,
  },
];

export function DashboardView() {
  const { data, isLoading, isError, refetch } = useDashboard();
  const [metric, setMetric] = useState<ChartMetric>("revenue");

  if (isError) {
    return (
      <Card>
        <EmptyState
          icon={AlertTriangle}
          title="Couldn't load the dashboard"
          description="Something went wrong while fetching your data."
          action={{ label: "Try again", onClick: () => refetch() }}
        />
      </Card>
    );
  }

  const totals = data?.totals;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total revenue"
          value={totals ? formatCurrency(totals.revenue) : ""}
          icon={DollarSign}
          isLoading={isLoading}
        />
        <StatCard
          label="Total orders"
          value={totals ? formatNumber(totals.orders) : ""}
          icon={ShoppingCart}
          isLoading={isLoading}
        />
        <StatCard
          label="Total customers"
          value={totals ? formatNumber(totals.customers) : ""}
          icon={Users}
          isLoading={isLoading}
        />
        <StatCard
          label="Total products"
          value={totals ? formatNumber(totals.products) : ""}
          icon={Package}
          isLoading={isLoading}
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
          {isLoading || !data ? (
            <Skeleton className="h-65 w-full" />
          ) : (
            <SalesChart data={data.dailyStats} metric={metric} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent orders</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={recentOrderColumns}
            rows={data?.recentOrders ?? []}
            getRowId={(order) => order.id}
            isLoading={isLoading}
            skeletonRows={5}
            empty={<EmptyState title="No orders yet" />}
          />
        </CardContent>
      </Card>
    </div>
  );
}
