import { NextRequest, NextResponse } from "next/server";

import { products } from "@/data/mock-data";
import { productInputSchema } from "@/lib/product-schema";

// PATCH /api/products/:id — edit a product, or archive it (status-only update).
// Next 16: the route's `params` is a Promise, so it must be awaited.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const index = products.findIndex((product) => product.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // `.partial()` so the same endpoint handles a full edit or a single-field
  // change (e.g. archive sends just { status }).
  const parsed = productInputSchema.partial().safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid product data" }, { status: 400 });
  }

  products[index] = { ...products[index], ...parsed.data };
  return NextResponse.json(products[index]);
}
