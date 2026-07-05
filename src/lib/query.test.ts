import { describe, expect, it } from "vitest";

import { queryList } from "./query";

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
