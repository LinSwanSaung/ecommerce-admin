import { NextRequest, NextResponse } from "next/server";

import { orders } from "@/data/mock-data";
import { parseListQuery, queryList } from "@/lib/query";

// GET /api/orders?search=&status=&sort=&order=&page=
export async function GET(request: NextRequest) {
  const query = parseListQuery(request.nextUrl.searchParams, {
    searchFields: ["id", "customerName"],
    filterKeys: ["status"],
    defaultSort: "date",
    defaultOrder: "desc", // newest first
  });
  return NextResponse.json(queryList(orders, query));
}
