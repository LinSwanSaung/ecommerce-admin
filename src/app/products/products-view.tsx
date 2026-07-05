"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Archive,
  MoreHorizontal,
  PackageSearch,
  Pencil,
  Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable, type Column } from "@/components/tables/data-table";
import { SearchInput } from "@/components/tables/search-input";
import { FilterSelect } from "@/components/tables/filter-select";
import { ColumnToggle } from "@/components/tables/column-toggle";
import { TablePagination } from "@/components/tables/table-pagination";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { DetailSheet, DetailRow } from "@/components/detail-sheet";
import { ProductFormDialog } from "@/components/products/product-form-dialog";
import { useList } from "@/hooks/use-list";
import { useArchiveProduct } from "@/hooks/use-products";
import { formatCurrency, formatDate } from "@/lib/format";
import { CATEGORIES, PRODUCT_STATUSES } from "@/lib/constants";
import type { Product } from "@/types";

const categoryOptions = CATEGORIES.map((c) => ({ value: c, label: c }));

export function ProductsView() {
  const { data, isLoading, isError, refetch } = useList<Product>("products");
  const archiveProduct = useArchiveProduct();

  // Local UI state: which product's detail is open, and the add/edit dialog.
  const [detail, setDetail] = useState<Product | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);

  const toggleColumn = (key: string) =>
    setHiddenColumns((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (product: Product) => {
    setEditing(product);
    setFormOpen(true);
  };

  const columns: Column<Product>[] = [
    {
      key: "name",
      header: "Name",
      sortable: true,
      cell: (product) => <span className="font-medium">{product.name}</span>,
    },
    {
      key: "sku",
      header: "SKU",
      className: "text-muted-foreground",
      cell: (product) => product.sku,
    },
    {
      key: "category",
      header: "Category",
      className: "hidden lg:table-cell",
      cell: (product) => product.category,
    },
    {
      key: "price",
      header: "Price",
      sortable: true,
      className: "text-right",
      cell: (product) => formatCurrency(product.price),
    },
    {
      key: "stock",
      header: "Stock",
      sortable: true,
      className: "text-right",
      cell: (product) => product.stock,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      cell: (product) => <StatusBadge status={product.status} />,
    },
    {
      key: "actions",
      header: "",
      className: "w-10 text-right",
      cell: (product) => (
        // Stop propagation so using the menu doesn't also open the row's detail.
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
              <DropdownMenuItem onClick={() => openEdit(product)}>
                <Pencil />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                disabled={product.status === "archived"}
                onClick={() => archiveProduct.mutate(product.id)}
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

  // Only columns with a visible header can be hidden (keeps the actions column).
  const hideableColumns = columns.filter((col) => col.header);
  const visibleColumns = columns.filter((col) => !hiddenColumns.includes(col.key));

  const emptyState = isError ? (
    <EmptyState
      icon={AlertTriangle}
      title="Couldn't load products"
      description="Something went wrong while fetching the list."
      action={{ label: "Try again", onClick: () => refetch() }}
    />
  ) : (
    <EmptyState
      icon={PackageSearch}
      title="No products found"
      description="Try adjusting your search or filters."
    />
  );

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
          <ColumnToggle
            columns={hideableColumns}
            hidden={hiddenColumns}
            onToggle={toggleColumn}
          />
          <Button onClick={openAdd}>
            <Plus />
            Add product
          </Button>
        </div>
      </div>

      <DataTable
        columns={visibleColumns}
        rows={data?.rows ?? []}
        getRowId={(product) => product.id}
        isLoading={isLoading}
        onRowClick={setDetail}
        empty={emptyState}
      />

      <TablePagination
        page={data?.page ?? 1}
        totalPages={data?.totalPages ?? 1}
        total={data?.total ?? 0}
        isLoading={isLoading}
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
