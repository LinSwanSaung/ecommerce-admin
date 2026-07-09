"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import type { SessionUser } from "@/lib/auth";

export function AppShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  // desktop-only: the header button collapses the sidebar to reclaim width
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen">
      <aside
        className={cn(
          "hidden shrink-0 overflow-hidden border-r bg-sidebar transition-[width] duration-200 md:block",
          sidebarOpen ? "w-64" : "w-0 border-r-0",
        )}
      >
        {/* fixed inner width so the content doesn't reflow while the aside animates */}
        <div className="sticky top-0 h-screen w-64 overflow-y-auto">
          <Sidebar />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          user={user}
          onToggleSidebar={() => setSidebarOpen((open) => !open)}
        />
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
