import { NextRequest, NextResponse } from "next/server";

import { products } from "@/data/mock-data";
import { parseListQuery, queryList } from "@/lib/query";
import { productInputSchema } from "@/lib/product-schema";
import type { Product } from "@/types";

// GET /api/products?search=&category=&status=&sort=&order=&page=
export async function GET(request: NextRequest) {
  const query = parseListQuery(request.nextUrl.searchParams, {
    searchFields: ["name", "sku"],
    filterKeys: ["category", "status"],
    defaultSort: "createdAt",
    defaultOrder: "desc", // newest first
  });
  return NextResponse.json(queryList(products, query));
}

// POST /api/products — create a product (validates the typed payload).
export async function POST(request: NextRequest) {
  const parsed = productInputSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid product data" }, { status: 400 });
  }

  const product: Product = {
    id: `PROD-${1000 + products.length}`,
    ...parsed.data,
    createdAt: new Date().toISOString(),
  };
  products.unshift(product);

  return NextResponse.json(product, { status: 201 });
}
