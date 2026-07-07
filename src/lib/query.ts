import type { ListResult } from "@/types";
import { PAGE_SIZE } from "./constants";

// shared list engine: search -> filter -> sort -> paginate

export type ListQuery = {
  search?: string;
  searchFields: string[];
  filters?: Record<string, string | undefined>;
  sort?: string;
  order?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

export function queryList<T extends Record<string, unknown>>(
  items: T[],
  {
    search,
    searchFields,
    filters,
    sort,
    order = "asc",
    page = 1,
    pageSize = PAGE_SIZE,
  }: ListQuery,
): ListResult<T> {
  let rows = items;

  // case-insensitive substring search
  if (search) {
    const q = search.toLowerCase();
    rows = rows.filter((item) =>
      searchFields.some((field) =>
        String(item[field] ?? "")
          .toLowerCase()
          .includes(q),
      ),
    );
  }

  // exact match per key, "all"/empty means no filter
  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      if (value && value !== "all") {
        rows = rows.filter((item) => String(item[key]) === value);
      }
    }
  }

  // numbers sort numerically, everything else as strings (ISO dates end up chronological)
  if (sort) {
    rows = [...rows].sort((a, b) => {
      const av = a[sort];
      const bv = b[sort];
      const cmp =
        typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv));
      return order === "asc" ? cmp : -cmp;
    });
  }

  // clamp so an out-of-range ?page= never shows an empty table
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    rows: rows.slice(start, start + pageSize),
    total,
    page: safePage,
    pageSize,
    totalPages,
  };
}

// page searchParams prop -> URLSearchParams
export function toURLSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    const single = Array.isArray(value) ? value[0] : value;
    if (single) params.set(key, single);
  }
  return params;
}

// URL params -> validated ListQuery
export function parseListQuery(
  searchParams: URLSearchParams,
  opts: {
    searchFields: string[];
    filterKeys: string[];
    defaultSort?: string;
    defaultOrder?: "asc" | "desc";
    pageSize?: number;
  },
): ListQuery {
  const filters: Record<string, string | undefined> = {};
  for (const key of opts.filterKeys) {
    const value = searchParams.get(key);
    if (value) filters[key] = value;
  }

  const page = Number(searchParams.get("page"));
  const order = searchParams.get("order");

  return {
    search: searchParams.get("search") ?? undefined,
    searchFields: opts.searchFields,
    filters,
    sort: searchParams.get("sort") ?? opts.defaultSort,
    order:
      order === "asc" || order === "desc"
        ? order
        : (opts.defaultOrder ?? "asc"),
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize: opts.pageSize,
  };
}
