import { z } from "zod";

// inputs hold strings, so the form schema and the typed input schema are separate

export const productFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim(),
  sku: z.string().trim().min(1, "SKU is required"),
  brand: z.string().min(1, "Brand is required"),
  category: z.string().min(1, "Category is required"),
  tags: z.string(), // comma separated in the form
  images: z.array(z.string()), // data URLs from the image picker
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
  description: z.string(),
  sku: z.string().min(1),
  brand: z.string().min(1),
  category: z.string().min(1),
  tags: z.array(z.string()),
  images: z.array(z.string()),
  price: z.number().gt(0),
  stock: z.number().int().min(0),
  status: z.enum(["active", "draft", "archived", "out_of_stock"]),
});

export type ProductInput = z.infer<typeof productInputSchema>;

// "a, b , c" -> ["a", "b", "c"]; blank entries dropped
const splitList = (value: string, separator: string | RegExp): string[] =>
  value
    .split(separator)
    .map((item) => item.trim())
    .filter(Boolean);

export const formValuesToInput = (values: ProductFormValues): ProductInput => ({
  name: values.name.trim(),
  description: values.description.trim(),
  sku: values.sku.trim(),
  brand: values.brand,
  category: values.category,
  tags: splitList(values.tags, ","),
  images: values.images,
  price: Number(values.price),
  stock: Number(values.stock),
  status: values.status as ProductInput["status"],
});
