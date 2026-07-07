import { z } from "zod";

// inputs hold strings, so the form schema and the typed input schema are separate

export const productFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  sku: z.string().trim().min(1, "SKU is required"),
  category: z.string().min(1, "Category is required"),
  price: z
    .string()
    .min(1, "Price is required")
    .refine((v) => Number(v) > 0, "Price must be greater than 0"),
  stock: z
    .string()
    .min(1, "Stock is required")
    .refine((v) => Number.isInteger(Number(v)), "Stock must be a whole number")
    .refine((v) => Number(v) >= 0, "Stock cannot be negative"),
  status: z.string().min(1, "Status is required"),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

export const productInputSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  category: z.string().min(1),
  price: z.number().gt(0),
  stock: z.number().int().min(0),
  status: z.enum(["active", "draft", "archived", "out_of_stock"]),
});

export type ProductInput = z.infer<typeof productInputSchema>;

export const formValuesToInput = (values: ProductFormValues): ProductInput => ({
  name: values.name.trim(),
  sku: values.sku.trim(),
  category: values.category,
  price: Number(values.price),
  stock: Number(values.stock),
  status: values.status as ProductInput["status"],
});
