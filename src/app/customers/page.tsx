import type { Metadata } from "next";
import { Suspense } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { CustomersView } from "./customers-view";

export const metadata: Metadata = { title: "Customers" };

export default function CustomersPage() {
  return (
    <div>
      <PageHeader
        title="Customers"
        description="Review customer profiles and activity."
      />
      <Suspense>
        <CustomersView />
      </Suspense>
    </div>
  );
}
