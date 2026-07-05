// Domain models shared across the app (UI, API routes, mock data).

export type ProductStatus = "active" | "draft" | "archived" | "out_of_stock";

export type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number; // US dollars
  stock: number;
  status: ProductStatus;
  createdAt: string; // ISO date
};

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type OrderItem = { name: string; quantity: number; price: number };

export type Order = {
  id: string; // e.g. ORD-2001
  customerId: string;
  customerName: string;
  customerEmail: string;
  date: string; // ISO date
  total: number;
  status: OrderStatus;
  items: OrderItem[];
};

export type CustomerStatus = "active" | "inactive" | "blocked";

export type CustomerOrderSummary = {
  id: string;
  date: string;
  total: number;
  status: OrderStatus;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  status: CustomerStatus;
  joinedAt: string; // ISO date
  recentOrders: CustomerOrderSummary[];
};

// Every list API route returns this shape.
export type ListResult<T> = {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type DailyStat = { date: string; revenue: number; orders: number };

export type DashboardData = {
  totals: { revenue: number; orders: number; customers: number; products: number };
  recentOrders: Order[];
  dailyStats: DailyStat[];
};
