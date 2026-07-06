import { products, orders, customers } from "@/data/mock-data";
import type { DashboardData } from "@/types";

const round = (n: number) => Math.round(n * 100) / 100;

// Computes the dashboard summary from the mock data. Shared by the API route
// (client refetches) and the dashboard server page (initial server render).
export function getDashboardData(): DashboardData {
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

  const days = 14;
  const today = new Date();
  const dailyStats = Array.from({ length: days }, (_, i) => {
    const day = new Date(today);
    day.setDate(today.getDate() - (days - 1 - i));
    const key = day.toISOString().slice(0, 10); // YYYY-MM-DD
    const dayOrders = orders.filter((order) => order.date.slice(0, 10) === key);
    const revenue = dayOrders.reduce((sum, order) => sum + order.total, 0);
    return { date: key, revenue: round(revenue), orders: dayOrders.length };
  });

  const recentOrders = [...orders]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6);

  return {
    totals: {
      revenue: round(totalRevenue),
      orders: orders.length,
      customers: customers.length,
      products: products.length,
    },
    recentOrders,
    dailyStats,
  };
}
