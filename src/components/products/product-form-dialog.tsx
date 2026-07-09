"use client";

import { useEffect, useState } from "react";
import {
  Controller,
  useFieldArray,
  useForm,
  type Control,
} from "react-hook-form";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BRANDS, CATEGORIES, PRODUCT_STATUSES } from "@/lib/constants";
import {
  formValuesToInput,
  productFormSchema,
  type ProductFormValues,
} from "@/lib/product-schema";
import { createProduct, updateProduct } from "@/lib/product-actions";
import { ImagePicker } from "./image-picker";
import type { Product } from "@/types";

const BRAND_OPTIONS = BRANDS.map((brand) => ({ value: brand, label: brand }));
const CATEGORY_OPTIONS = CATEGORIES.map((category) => ({
  value: category,
  label: category,
}));

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
  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  const [tab, setTab] = useState("details");
  // reset to the first tab each time the dialog opens (adjust-state-on-prop-change)
  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (open) setTab("details");
  }

  // reset the fields whenever the dialog opens
  useEffect(() => {
    if (open) reset(product ? toFormValues(product) : EMPTY);
  }, [open, product, reset]);

  const onSubmit = handleSubmit(
    async (values) => {
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
    },
    // a hidden tab could hold the invalid field, so surface it (details first;
    // images and variants have their own tabs, every other field lives on details)
    (formErrors) => {
      const keys = Object.keys(formErrors);
      if (keys.some((key) => key !== "images" && key !== "variants"))
        setTab("details");
      else if (formErrors.images) setTab("images");
      else if (formErrors.variants) setTab("variants");
    },
  );

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
          <Tabs value={tab} onValueChange={setTab} className="w-full flex-col">
            <TabsList className="w-full">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="variants">
                Variants{fields.length > 0 ? ` (${fields.length})` : ""}
              </TabsTrigger>
            </TabsList>

            <div className="max-h-[55vh] overflow-y-auto px-0.5 pt-1">
              <TabsContent value="details" keepMounted className="space-y-4">
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

                  <SelectField
                    control={control}
                    name="brand"
                    label="Brand"
                    options={BRAND_OPTIONS}
                    error={errors.brand?.message}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <SelectField
                    control={control}
                    name="category"
                    label="Category"
                    options={CATEGORY_OPTIONS}
                    error={errors.category?.message}
                  />

                  <Field
                    label="Tags"
                    htmlFor="tags"
                    error={errors.tags?.message}
                  >
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

                  <Field
                    label="Stock"
                    htmlFor="stock"
                    error={errors.stock?.message}
                  >
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

                <SelectField
                  control={control}
                  name="status"
                  label="Status"
                  options={PRODUCT_STATUSES}
                  error={errors.status?.message}
                />
              </TabsContent>

              <TabsContent value="images" keepMounted className="space-y-4">
                <Field label="Images" error={errors.images?.message}>
                  <Controller
                    control={control}
                    name="images"
                    render={({ field }) => (
                      <ImagePicker
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </Field>
              </TabsContent>

              <TabsContent value="variants" keepMounted className="space-y-2">
                {fields.length > 0 ? (
                  <div className="space-y-2">
                    {fields.map((field, index) => {
                      const rowErrors = errors.variants?.[index];
                      return (
                        // mobile: 2x2 fields with the remove button in the corner;
                        // sm+: one row with everything inline
                        <div
                          key={field.id}
                          className="relative grid grid-cols-2 items-start gap-2 pr-9 sm:grid-cols-[1.5fr_1.5fr_1fr_1fr_auto] sm:pr-0"
                        >
                          <Input
                            placeholder="Name"
                            className="text-sm"
                            aria-label={`Variant ${index + 1} name`}
                            aria-invalid={!!rowErrors?.name}
                            {...register(`variants.${index}.name`)}
                          />
                          <Input
                            placeholder="SKU"
                            className="text-sm"
                            aria-label={`Variant ${index + 1} SKU`}
                            aria-invalid={!!rowErrors?.sku}
                            {...register(`variants.${index}.sku`)}
                          />
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="Price"
                            className="text-sm"
                            aria-label={`Variant ${index + 1} price`}
                            aria-invalid={!!rowErrors?.price}
                            {...register(`variants.${index}.price`)}
                          />
                          <Input
                            type="number"
                            step="1"
                            min="0"
                            placeholder="Stock"
                            className="text-sm"
                            aria-label={`Variant ${index + 1} stock`}
                            aria-invalid={!!rowErrors?.stock}
                            {...register(`variants.${index}.stock`)}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="absolute top-0.5 right-0 sm:static"
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
                    No variants. Add one if the product comes in multiple
                    options.
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
                  onClick={() =>
                    append({ name: "", sku: "", price: "", stock: "" })
                  }
                >
                  <Plus />
                  Add variant
                </Button>
              </TabsContent>
            </div>
          </Tabs>

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

// One Controller-wrapped Select for the fixed-option string fields.
function SelectField({
  control,
  name,
  label,
  options,
  error,
}: {
  control: Control<ProductFormValues>;
  name: "brand" | "category" | "status";
  label: string;
  options: readonly { value: string; label: string }[];
  error?: string;
}) {
  return (
    <Field label={label} error={error}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger
              className="w-full"
              aria-label={label}
              aria-invalid={!!error}
            >
              <span className="truncate">
                {options.find((option) => option.value === field.value)
                  ?.label ?? `Select ${label.toLowerCase()}`}
              </span>
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </Field>
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
