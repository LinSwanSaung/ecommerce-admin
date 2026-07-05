"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

import type { ListResult } from "@/types";

async function fetchList<T>(url: string): Promise<ListResult<T>> {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to load data");
  return response.json();
}

// Shared list fetcher: mirrors the URL params into the API request; the params
// are part of the query key, so any filter/sort/page change refetches.
export function useList<T>(resource: string) {
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();

  return useQuery({
    queryKey: [resource, queryString],
    queryFn: () => fetchList<T>(`/api/${resource}?${queryString}`),
    placeholderData: keepPreviousData, // keep old rows on screen while refetching
  });
}
