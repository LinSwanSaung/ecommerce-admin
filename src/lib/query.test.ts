import { describe, expect, it } from "vitest";

import { parseListQuery, queryList } from "./query";

type Row = { name: string; sku: string; price: number; status: string };

const rows: Row[] = [
  { name: "Apple", sku: "A-1", price: 30, status: "active" },
  { name: "Banana", sku: "B-2", price: 10, status: "draft" },
  { name: "Cherry", sku: "C-3", price: 20, status: "active" },
  { name: "Date", sku: "D-4", price: 40, status: "archived" },
];

describe("queryList", () => {
  it("searches case-insensitively across the given fields", () => {
    const result = queryList(rows, { search: "an", searchFields: ["name"] });
    expect(result.rows.map((r) => r.name)).toEqual(["Banana"]);
    expect(result.total).toBe(1);
  });

  it("filters by exact match and ignores 'all'", () => {
    expect(
      queryList(rows, { searchFields: [], filters: { status: "active" } }).total,
    ).toBe(2);
    expect(
      queryList(rows, { searchFields: [], filters: { status: "all" } }).total,
    ).toBe(4);
  });

  it("sorts numbers and strings in both directions", () => {
    const asc = queryList(rows, { searchFields: [], sort: "price", order: "asc" });
    expect(asc.rows.map((r) => r.price)).toEqual([10, 20, 30, 40]);

    const desc = queryList(rows, { searchFields: [], sort: "name", order: "desc" });
    expect(desc.rows[0].name).toBe("Date");
  });

  it("paginates and reports totalPages", () => {
    const result = queryList(rows, { searchFields: [], page: 2, pageSize: 2 });
    expect(result.rows).toHaveLength(2);
    expect(result.totalPages).toBe(2);
    expect(result.page).toBe(2);
  });

  it("clamps an out-of-range page instead of returning nothing", () => {
    const result = queryList(rows, { searchFields: [], page: 99, pageSize: 2 });
    expect(result.page).toBe(2); // last valid page
    expect(result.rows).toHaveLength(2);
  });
});

describe("parseListQuery", () => {
  const opts = {
    searchFields: ["name"],
    filterKeys: ["status"],
    sortKeys: ["name", "price"],
    defaultSort: "name",
  };

  it("accepts an allow-listed sort field", () => {
    const q = parseListQuery(new URLSearchParams("sort=price&order=desc"), opts);
    expect(q.sort).toBe("price");
    expect(q.order).toBe("desc");
  });

  it("falls back to the default for sort fields not on the allow-list", () => {
    expect(parseListQuery(new URLSearchParams("sort=hacked"), opts).sort).toBe("name");
    expect(parseListQuery(new URLSearchParams("sort=__proto__"), opts).sort).toBe("name");
  });

  it("rejects junk page values", () => {
    expect(parseListQuery(new URLSearchParams("page=2.5"), opts).page).toBe(1);
    expect(parseListQuery(new URLSearchParams("page=-3"), opts).page).toBe(1);
    expect(parseListQuery(new URLSearchParams("page=abc"), opts).page).toBe(1);
  });

  it("only reads filters from the declared keys", () => {
    const q = parseListQuery(new URLSearchParams("status=active&role=admin"), opts);
    expect(q.filters).toEqual({ status: "active" });
  });
});
