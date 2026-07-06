"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { CATEGORIES, PRODUCT_STATUSES } from "@/lib/constants";
import {
  formValuesToInput,
  productFormSchema,
  type ProductFormValues,
} from "@/lib/product-schema";
import { createProduct, updateProduct } from "@/lib/product-actions";
import type { Product } from "@/types";

const EMPTY: ProductFormValues = {
  name: "",
  sku: "",
  category: "",
  price: "",
  stock: "",
  status: "",
};

const toFormValues = (product: Product): ProductFormValues => ({
  name: product.name,
  sku: product.sku,
  category: product.category,
  price: String(product.price),
  stock: String(product.stock),
  status: product.status,
});

// One form for both add (product = null) and edit (product set).
export function ProductFormDialog({
  open,
  onOpenChange,
  product,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}) {
  const isEdit = Boolean(product);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: EMPTY,
  });
  const isSaving = isSubmitting;

  // Seed the form when the dialog opens: the product for edit, blanks for add.
  useEffect(() => {
    if (open) reset(product ? toFormValues(product) : EMPTY);
  }, [open, product, reset]);

  // Calls the create/update Server Action; revalidatePath inside it refreshes
  // the products list in the same round trip.
  const onSubmit = handleSubmit(async (values) => {
    const input = formValuesToInput(values);
    const result = product
      ? await updateProduct(product.id, input)
      : await createProduct(input);

    if ("error" in result) {
      toast.error(result.error); // keep the dialog open for another attempt
      return;
    }
    toast.success(product ? "Product updated" : "Product created");
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit product" : "Add product"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the details and save your changes."
              : "Fill in the details to add a new product."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Field label="Name" htmlFor="name" error={errors.name?.message}>
            <Input
              id="name"
              {...register("name")}
              aria-invalid={!!errors.name}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="SKU" htmlFor="sku" error={errors.sku?.message}>
              <Input
                id="sku"
                {...register("sku")}
                aria-invalid={!!errors.sku}
              />
            </Field>

            <Field label="Category" error={errors.category?.message}>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      className="w-full"
                      aria-label="Category"
                      aria-invalid={!!errors.category}
                    >
                      <span className="truncate">
                        {field.value || "Select category"}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Price ($)"
              htmlFor="price"
              error={errors.price?.message}
            >
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                {...register("price")}
                aria-invalid={!!errors.price}
              />
            </Field>

            <Field label="Stock" htmlFor="stock" error={errors.stock?.message}>
              <Input
                id="stock"
                type="number"
                step="1"
                min="0"
                {...register("stock")}
                aria-invalid={!!errors.stock}
              />
            </Field>
          </div>

          <Field label="Status" error={errors.status?.message}>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    className="w-full"
                    aria-label="Status"
                    aria-invalid={!!errors.status}
                  >
                    <span className="truncate">
                      {PRODUCT_STATUSES.find((s) => s.value === field.value)
                        ?.label ?? "Select status"}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving…" : isEdit ? "Save changes" : "Add product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Label + control + error. htmlFor optional — Selects are labelled via aria-label.
function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
