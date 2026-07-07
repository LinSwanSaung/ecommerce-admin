"use client";

import { useOptimistic, useState, useTransition } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Archive,
  MoreHorizontal,
  PackageSearch,
  Pencil,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/tables/data-table";
import { SearchInput } from "@/components/tables/search-input";
import { FilterSelect } from "@/components/tables/filter-select";
import { ColumnToggle } from "@/components/tables/column-toggle";
import { TablePagination } from "@/components/tables/table-pagination";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { DetailSheet, DetailRow } from "@/components/detail-sheet";
import { ProductFormDialog } from "@/components/products/product-form-dialog";
import { useDataTable } from "@/hooks/use-data-table";
import { useQueryParams } from "@/hooks/use-query-params";
import { archiveProduct } from "@/lib/product-actions";
import { formatCurrency, formatDate } from "@/lib/format";
import { CATEGORIES, PRODUCT_STATUSES } from "@/lib/constants";
import type { ListResult, Product } from "@/types";

const categoryOptions = CATEGORIES.map((c) => ({ value: c, label: c }));

export function ProductsView({ data }: { data: ListResult<Product> }) {
  const { isPending } = useQueryParams();
  const [, startTransition] = useTransition();

  const [detail, setDetail] = useState<Product | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  // flip the row to archived right away, reverts on its own if the action fails
  const [rows, applyArchive] = useOptimistic(
    data.rows,
    (current, archivedId: string) =>
      current.map((product) =>
        product.id === archivedId
          ? { ...product, status: "archived" as const }
          : product,
      ),
  );

  const archive = (id: string) =>
    startTransition(async () => {
      applyArchive(id);
      const result = await archiveProduct(id);
      if ("error" in result) toast.error(result.error);
      else toast.success("Product archived");
    });

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (product: Product) => {
    setEditing(product);
    setFormOpen(true);
  };

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "sku",
      header: "SKU",
      enableSorting: false,
      meta: { className: "text-muted-foreground" },
    },
    {
      accessorKey: "category",
      header: "Category",
      enableSorting: false,
      meta: { className: "hidden lg:table-cell" },
    },
    {
      accessorKey: "price",
      header: "Price",
      meta: { className: "text-right" },
      cell: ({ row }) => formatCurrency(row.original.price),
    },
    {
      accessorKey: "stock",
      header: "Stock",
      meta: { className: "text-right" },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      enableHiding: false,
      meta: { className: "w-10 text-right" },
      cell: ({ row }) => (
        // don't open the detail drawer when clicking the menu
        <div onClick={(event) => event.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon-sm" aria-label="Row actions" />
              }
            >
              <MoreHorizontal />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openEdit(row.original)}>
                <Pencil />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                disabled={row.original.status === "archived"}
                onClick={() => archive(row.original.id)}
              >
                <Archive />
                Archive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  const table = useDataTable({
    columns,
    rows,
    getRowId: (product) => product.id,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <SearchInput placeholder="Search name or SKU" />
          <div className="flex gap-2">
            <FilterSelect
              paramKey="category"
              label="Categories"
              options={categoryOptions}
            />
            <FilterSelect
              paramKey="status"
              label="Statuses"
              options={PRODUCT_STATUSES}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <ColumnToggle table={table} />
          <Button onClick={openAdd}>
            <Plus />
            Add product
          </Button>
        </div>
      </div>

      <DataTable
        table={table}
        isLoading={isPending}
        onRowClick={setDetail}
        empty={
          <EmptyState
            icon={PackageSearch}
            title="No products found"
            description="Try adjusting your search or filters."
          />
        }
      />

      <TablePagination
        page={data.page}
        totalPages={data.totalPages}
        total={data.total}
        isLoading={isPending}
      />

      {/* Detail drawer */}
      <DetailSheet
        open={Boolean(detail)}
        onOpenChange={(open) => !open && setDetail(null)}
        title={detail?.name ?? ""}
        description={detail?.sku}
      >
        {detail ? (
          <div className="space-y-4">
            <dl>
              <DetailRow label="Category">{detail.category}</DetailRow>
              <DetailRow label="Price">{formatCurrency(detail.price)}</DetailRow>
              <DetailRow label="Stock">{detail.stock}</DetailRow>
              <DetailRow label="Status">
                <StatusBadge status={detail.status} />
              </DetailRow>
              <DetailRow label="Created">{formatDate(detail.createdAt)}</DetailRow>
            </dl>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                const product = detail;
                setDetail(null);
                openEdit(product);
              }}
            >
              <Pencil />
              Edit product
            </Button>
          </div>
        ) : null}
      </DetailSheet>

      {/* Add / edit form */}
      <ProductFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editing}
      />
    </div>
  );
}
