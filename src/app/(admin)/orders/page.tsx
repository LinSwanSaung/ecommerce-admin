import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { orders } from "@/data/mock-data";
import { parseListQuery, queryList, toURLSearchParams } from "@/lib/query";
import { OrdersView } from "./orders-view";

export const metadata: Metadata = { title: "Orders" };

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = toURLSearchParams(await searchParams);
  const query = parseListQuery(params, {
    searchFields: ["id", "customerName"],
    filterKeys: ["status"],
    sortKeys: ["id", "date", "total", "status"],
    defaultSort: "date",
    defaultOrder: "desc",
  });
  const data = queryList(orders, query);

  return (
    <div>
      <PageHeader
        title="Orders"
        description="Track and inspect customer orders."
      />
      <OrdersView data={data} />
    </div>
  );
}
