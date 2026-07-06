"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// The one place that reads/writes URL search params (search, filters, sort, page).
export function useQueryParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // URL changes re-render the page on the server; isPending is true while that
  // round trip is in flight, so views can show a loading state.
  const [isPending, startTransition] = useTransition();

  const get = (key: string, fallback = "") => searchParams.get(key) ?? fallback;

  // Update one or more params while keeping the rest. Empty/null removes a param
  // so the URL stays clean. `replace` avoids stacking a history entry per filter.
  const setParams = (updates: Record<string, string | number | null | undefined>) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === undefined || value === "") next.delete(key);
      else next.set(key, String(value));
    }
    const queryString = next.toString();
    startTransition(() => {
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    });
  };

  return { get, setParams, isPending };
}
