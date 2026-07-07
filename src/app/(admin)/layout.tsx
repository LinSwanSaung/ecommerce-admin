import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { getSessionUser } from "@/lib/auth";

// proxy.ts already redirects unauthenticated users, this check is a safety net
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return <AppShell user={user}>{children}</AppShell>;
}
