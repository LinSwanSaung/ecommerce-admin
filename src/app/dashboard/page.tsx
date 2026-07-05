import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { DashboardView } from "./dashboard-view";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Business overview at a glance."
      />
      <DashboardView />
    </div>
  );
}
