import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { products } from "@/data/mock-data";
import { parseListQuery, queryList, toURLSearchParams } from "@/lib/query";
import { ProductsView } from "./products-view";

export const metadata: Metadata = { title: "Products" };

// Server component: reads the URL's search params (a Promise in Next 16),
// runs the query against the data layer directly — no HTTP hop — and passes
// the result down as props. Changing a filter updates the URL, which re-runs
// this on the server with the new params.
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = toURLSearchParams(await searchParams);
  const query = parseListQuery(params, {
    searchFields: ["name", "sku"],
    filterKeys: ["category", "status"],
    defaultSort: "createdAt",
    defaultOrder: "desc",
  });
  const data = queryList(products, query);

  return (
    <div>
      <PageHeader
        title="Products"
        description="View and manage your product catalog."
      />
      <ProductsView data={data} />
    </div>
  );
}
