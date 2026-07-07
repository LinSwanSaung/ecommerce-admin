"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useQueryParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // isPending is true while the server round trip is in flight
  const [isPending, startTransition] = useTransition();

  const get = (key: string, fallback = "") => searchParams.get(key) ?? fallback;

  // empty/null deletes the key. replace() so filters don't stack history entries
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
