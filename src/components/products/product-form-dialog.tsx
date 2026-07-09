"use client";

import { useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { BRANDS, CATEGORIES, PRODUCT_STATUSES } from "@/lib/constants";
import {
  formValuesToInput,
  productFormSchema,
  type ProductFormValues,
} from "@/lib/product-schema";
import { createProduct, updateProduct } from "@/lib/product-actions";
import { ImagePicker } from "./image-picker";
import type { Product } from "@/types";

const EMPTY: ProductFormValues = {
  name: "",
  description: "",
  sku: "",
  brand: "",
  category: "",
  tags: "",
  images: [],
  variants: [],
  price: "",
  stock: "",
  status: "",
};

const toFormValues = (product: Product): ProductFormValues => ({
  name: product.name,
  description: product.description,
  sku: product.sku,
  brand: product.brand,
  category: product.category,
  tags: product.tags.join(", "),
  images: product.images,
  variants: product.variants.map((variant) => ({
    name: variant.name,
    sku: variant.sku,
    price: String(variant.price),
    stock: String(variant.stock),
  })),
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

  // repeatable variant rows (size/SKU/price/stock)
  const { fields, append, remove } = useFieldArray({ control, name: "variants" });

  // reset the fields whenever the dialog opens
  useEffect(() => {
    if (open) reset(product ? toFormValues(product) : EMPTY);
  }, [open, product, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const input = formValuesToInput(values);
    try {
      const result = product
        ? await updateProduct(product.id, input)
        : await createProduct(input);

      if ("error" in result) {
        toast.error(result.error); // keep the dialog open for another attempt
        return;
      }
      toast.success(product ? "Product updated" : "Product created");
      onOpenChange(false);
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
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

          <Field
            label="Description"
            htmlFor="description"
            error={errors.description?.message}
          >
            <Textarea
              id="description"
              rows={3}
              {...register("description")}
              aria-invalid={!!errors.description}
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

            <Field label="Brand" error={errors.brand?.message}>
              <Controller
                control={control}
                name="brand"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      className="w-full"
                      aria-label="Brand"
                      aria-invalid={!!errors.brand}
                    >
                      <span className="truncate">
                        {field.value || "Select brand"}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      {BRANDS.map((brand) => (
                        <SelectItem key={brand} value={brand}>
                          {brand}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
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

            <Field label="Tags" htmlFor="tags" error={errors.tags?.message}>
              <Input
                id="tags"
                placeholder="new, sale"
                {...register("tags")}
                aria-invalid={!!errors.tags}
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

          <Field label="Images" error={errors.images?.message}>
            <Controller
              control={control}
              name="images"
              render={({ field }) => (
                <ImagePicker value={field.value} onChange={field.onChange} />
              )}
            />
          </Field>

          <div className="space-y-2">
            <Label>Variants</Label>
            {fields.length > 0 ? (
              <div className="space-y-2">
                {fields.map((field, index) => {
                  const rowErrors = errors.variants?.[index];
                  return (
                    <div
                      key={field.id}
                      className="grid grid-cols-[1fr_1fr_auto] items-start gap-2 sm:grid-cols-[1.5fr_1.5fr_1fr_1fr_auto]"
                    >
                      <Input
                        placeholder="Name (e.g. Large)"
                        aria-label={`Variant ${index + 1} name`}
                        aria-invalid={!!rowErrors?.name}
                        {...register(`variants.${index}.name`)}
                      />
                      <Input
                        placeholder="SKU"
                        aria-label={`Variant ${index + 1} SKU`}
                        aria-invalid={!!rowErrors?.sku}
                        {...register(`variants.${index}.sku`)}
                      />
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Price"
                        aria-label={`Variant ${index + 1} price`}
                        aria-invalid={!!rowErrors?.price}
                        {...register(`variants.${index}.price`)}
                      />
                      <Input
                        type="number"
                        step="1"
                        min="0"
                        placeholder="Stock"
                        aria-label={`Variant ${index + 1} stock`}
                        aria-invalid={!!rowErrors?.stock}
                        {...register(`variants.${index}.stock`)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Remove variant ${index + 1}`}
                        onClick={() => remove(index)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No variants. Add one if the product comes in multiple options.
              </p>
            )}
            {errors.variants ? (
              <p className="text-sm text-destructive">
                Fill in every variant field.
              </p>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ name: "", sku: "", price: "", stock: "" })}
            >
              <Plus />
              Add variant
            </Button>
          </div>

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

// Selects are labelled via aria-label, so htmlFor is optional
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
