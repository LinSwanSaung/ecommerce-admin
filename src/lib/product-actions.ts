"use server";

import { revalidatePath } from "next/cache";

import { products } from "@/data/mock-data";
import { getSessionUser } from "./auth";
import { productInputSchema } from "./product-schema";
import type { Product } from "@/types";

// Server Actions for product mutations. Each one: checks the session, validates
// the payload (never trust the client), mutates the mock store, then
// revalidatePath re-renders the affected pages with fresh data — that server
// round trip IS the UI update; no client cache to reconcile.

type ActionResult = { error: string } | { product: Product };

function refresh() {
  revalidatePath("/products");
  revalidatePath("/dashboard"); // totals include product count
}

export async function createProduct(input: unknown): Promise<ActionResult> {
  if (!(await getSessionUser())) return { error: "Unauthorized" };

  const parsed = productInputSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid product data" };

  const product: Product = {
    id: `PROD-${1000 + products.length}`,
    ...parsed.data,
    createdAt: new Date().toISOString(),
  };
  products.unshift(product);

  refresh();
  return { product };
}

export async function updateProduct(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  if (!(await getSessionUser())) return { error: "Unauthorized" };

  const index = products.findIndex((product) => product.id === id);
  if (index === -1) return { error: "Product not found" };

  // `.partial()` allows a full edit or a single-field change (archive).
  const parsed = productInputSchema.partial().safeParse(input);
  if (!parsed.success) return { error: "Invalid product data" };

  products[index] = { ...products[index], ...parsed.data };

  refresh();
  return { product: products[index] };
}

export async function archiveProduct(id: string): Promise<ActionResult> {
  return updateProduct(id, { status: "archived" });
}
