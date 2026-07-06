import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { getDashboardData } from "@/lib/dashboard-data";
import { DashboardView } from "./dashboard-view";

export const metadata: Metadata = { title: "Dashboard" };

// Server component: computes the dashboard data on the server; the page
// arrives fully populated and the client view only handles interactivity.
export default function DashboardPage() {
  const data = getDashboardData();

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Business overview at a glance."
      />
      <DashboardView data={data} />
    </div>
  );
}
