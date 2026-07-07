"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { navItems } from "./nav-items";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col gap-4 py-4">
      <Link
        href="/dashboard"
        onClick={onNavigate}
        className="flex items-center gap-2 px-5 text-lg font-semibold tracking-tight"
      >
        <Package2 className="h-6 w-6" />
        Swan Supply
      </Link>

      <nav aria-label="Main" className="flex flex-col gap-1 px-3">
        {navItems.map((item) => {
          // also active on nested routes
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
