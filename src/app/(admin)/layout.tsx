import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { getSessionUser } from "@/lib/auth";

// Layout for the admin route group: reads the session server-side and wraps
// every admin page in the shell. proxy.ts already guards these routes; the
// redirect here is defense in depth.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return <AppShell user={user}>{children}</AppShell>;
}
