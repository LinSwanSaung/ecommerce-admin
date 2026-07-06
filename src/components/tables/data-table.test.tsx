import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ColumnDef } from "@tanstack/react-table";

import { useDataTable } from "@/hooks/use-data-table";
import { DataTable } from "./data-table";

// useDataTable's sort state reads/writes the URL; stub the hook so the
// component renders without a Next.js router.
vi.mock("@/hooks/use-query-params", () => ({
  useQueryParams: () => ({ get: () => "", setParams: vi.fn(), isPending: false }),
}));

type Row = { id: string; name: string; price: number };

const columns: ColumnDef<Row>[] = [
  { accessorKey: "name", header: "Name" },
  {
    accessorKey: "price",
    header: "Price",
    enableSorting: false,
    cell: ({ row }) => `$${row.original.price}`,
  },
];

const rows: Row[] = [
  { id: "1", name: "Blender", price: 40 },
  { id: "2", name: "Mug", price: 12 },
];

// Tests need a component boundary to call the hook in.
function TestTable(props: {
  rows: Row[];
  isLoading?: boolean;
  skeletonRows?: number;
  empty?: React.ReactNode;
}) {
  const table = useDataTable({
    columns,
    rows: props.rows,
    getRowId: (row) => row.id,
  });
  return <DataTable table={table} {...props} />;
}

describe("DataTable", () => {
  it("renders one row per item using the column cell renderers", () => {
    render(<TestTable rows={rows} />);
    expect(screen.getByText("Blender")).toBeInTheDocument();
    expect(screen.getByText("$12")).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(3); // header + 2 data rows
  });

  it("shows the empty slot when there are no rows", () => {
    render(<TestTable rows={[]} empty={<p>No results found</p>} />);
    expect(screen.getByText("No results found")).toBeInTheDocument();
  });

  it("shows skeleton rows while loading instead of data", () => {
    render(<TestTable rows={rows} isLoading skeletonRows={4} />);
    expect(screen.queryByText("Blender")).not.toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(5); // header + 4 skeletons
  });

  it("renders sortable headers as buttons", () => {
    render(<TestTable rows={rows} />);
    expect(screen.getByRole("button", { name: /name/i })).toBeInTheDocument();
    // price column opted out of sorting, so no button
    expect(
      screen.queryByRole("button", { name: /price/i }),
    ).not.toBeInTheDocument();
  });
});
