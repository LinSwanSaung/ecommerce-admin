import type { ProductStatus, OrderStatus, CustomerStatus } from "@/types";

export type Option<T extends string = string> = { value: T; label: string };

export const CATEGORIES = [
  "Electronics",
  "Apparel",
  "Home & Kitchen",
  "Beauty",
  "Sports",
  "Books",
  "Toys",
  "Grocery",
] as const;

export const BRANDS = [
  "Acme",
  "Northwind",
  "Globex",
  "Umbra",
  "Sunbeam",
  "Vertex",
  "Lumen",
  "Cobalt",
] as const;

export const PRODUCT_STATUSES: Option<ProductStatus>[] = [
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
  { value: "out_of_stock", label: "Out of Stock" },
];

export const ORDER_STATUSES: Option<OrderStatus>[] = [
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
];

export const CUSTOMER_STATUSES: Option<CustomerStatus>[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "blocked", label: "Blocked" },
];

export const STATUS_LABEL: Record<string, string> = Object.fromEntries(
  [...PRODUCT_STATUSES, ...ORDER_STATUSES, ...CUSTOMER_STATUSES].map((o) => [
    o.value,
    o.label,
  ]),
);

// full class strings on purpose, Tailwind only keeps classes it sees literally
export const STATUS_BADGE: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  draft: "bg-zinc-100 text-zinc-600 dark:bg-zinc-500/15 dark:text-zinc-300",
  archived: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  out_of_stock: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
  pending: "bg-zinc-100 text-zinc-600 dark:bg-zinc-500/15 dark:text-zinc-300",
  paid: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400",
  processing: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400",
  shipped: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400",
  delivered: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  cancelled: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
  refunded: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400",
  inactive: "bg-zinc-100 text-zinc-600 dark:bg-zinc-500/15 dark:text-zinc-300",
  blocked: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
};

export const PAGE_SIZE = 10;
