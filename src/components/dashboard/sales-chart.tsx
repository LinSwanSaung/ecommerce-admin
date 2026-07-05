"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCurrency, formatNumber } from "@/lib/format";
import type { DailyStat } from "@/types";

export type ChartMetric = "revenue" | "orders";

// Fixed color + value formatting per metric.
const METRICS: Record<
  ChartMetric,
  { color: string; format: (v: number) => string; axis: (v: number) => string }
> = {
  revenue: {
    color: "var(--chart-1)",
    format: formatCurrency,
    axis: (v) => `$${formatNumber(v)}`,
  },
  orders: {
    color: "var(--chart-2)",
    format: formatNumber,
    axis: (v) => formatNumber(v),
  },
};

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });

// Custom tooltip so it follows the theme (recharts' default is white).
function ChartTooltip({
  active,
  payload,
  label,
  metric,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  metric: ChartMetric;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-medium">{label ? shortDate(label) : ""}</p>
      <p className="text-muted-foreground">{METRICS[metric].format(payload[0].value)}</p>
    </div>
  );
}

export function SalesChart({
  data,
  metric,
}: {
  data: DailyStat[];
  metric: ChartMetric;
}) {
  const { color, axis } = METRICS[metric];

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
        <defs>
          {/* keyed by metric so the gradient tracks the active color */}
          <linearGradient id={`fill-${metric}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={shortDate}
          tickLine={false}
          axisLine={false}
          minTickGap={24}
          fontSize={12}
          stroke="var(--muted-foreground)"
        />
        <YAxis
          tickFormatter={axis}
          tickLine={false}
          axisLine={false}
          width={52}
          fontSize={12}
          stroke="var(--muted-foreground)"
        />
        <Tooltip
          content={<ChartTooltip metric={metric} />}
          cursor={{ stroke: "var(--border)" }} // crosshair line on hover
        />
        <Area
          type="monotone"
          dataKey={metric}
          stroke={color}
          strokeWidth={2}
          fill={`url(#fill-${metric})`}
          activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--background)" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
