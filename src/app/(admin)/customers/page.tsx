import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { customers } from "@/data/mock-data";
import { parseListQuery, queryList, toURLSearchParams } from "@/lib/query";
import { CustomersView } from "./customers-view";

export const metadata: Metadata = { title: "Customers" };

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = toURLSearchParams(await searchParams);
  const query = parseListQuery(params, {
    searchFields: ["name", "email"],
    filterKeys: ["status"],
    defaultSort: "name",
    defaultOrder: "asc",
  });
  const data = queryList(customers, query);

  return (
    <div>
      <PageHeader
        title="Customers"
        description="Review customer profiles and activity."
      />
      <CustomersView data={data} />
    </div>
  );
}
