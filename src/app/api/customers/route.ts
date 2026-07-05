import { NextRequest, NextResponse } from "next/server";

import { customers } from "@/data/mock-data";
import { parseListQuery, queryList } from "@/lib/query";

// GET /api/customers?search=&status=&sort=&order=&page=
export async function GET(request: NextRequest) {
  const query = parseListQuery(request.nextUrl.searchParams, {
    searchFields: ["name", "email"],
    filterKeys: ["status"],
    defaultSort: "name",
    defaultOrder: "asc",
  });
  return NextResponse.json(queryList(customers, query));
}
