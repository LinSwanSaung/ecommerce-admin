import type { Metadata } from "next";
import { Suspense } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { ProductsView } from "./products-view";

export const metadata: Metadata = { title: "Products" };

// The view reads the URL via useSearchParams, which Next requires to sit under a
// Suspense boundary. The view renders its own loading skeleton once mounted.
export default function ProductsPage() {
  return (
    <div>
      <PageHeader
        title="Products"
        description="View and manage your product catalog."
      />
      <Suspense>
        <ProductsView />
      </Suspense>
    </div>
  );
}
