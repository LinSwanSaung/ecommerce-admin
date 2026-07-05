import type { Metadata } from "next";
import { Suspense } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { OrdersView } from "./orders-view";

export const metadata: Metadata = { title: "Orders" };

export default function OrdersPage() {
  return (
    <div>
      <PageHeader
        title="Orders"
        description="Track and inspect customer orders."
      />
      <Suspense>
        <OrdersView />
      </Suspense>
    </div>
  );
}
