import { describe, expect, it } from "vitest";

import { formValuesToInput, productFormSchema } from "./product-schema";

const valid = {
  name: "Mug",
  sku: "SKU-1",
  category: "Home & Kitchen",
  price: "12.5",
  stock: "3",
  status: "active",
};

describe("productFormSchema", () => {
  it("accepts a valid product", () => {
    expect(productFormSchema.safeParse(valid).success).toBe(true);
  });

  // The required validation rules from the brief, one per field.
  it.each([
    ["name", "", "Name is required"],
    ["sku", "", "SKU is required"],
    ["category", "", "Category is required"],
    ["price", "0", "Price must be greater than 0"],
    ["stock", "-1", "Stock cannot be negative"],
    ["status", "", "Status is required"],
  ])("rejects invalid %s", (field, bad, message) => {
    const result = productFormSchema.safeParse({ ...valid, [field]: bad });
    if (result.success) throw new Error("expected validation to fail");
    expect(result.error.issues[0].message).toBe(message);
  });
});

describe("formValuesToInput", () => {
  it("converts form strings into the typed API payload", () => {
    expect(formValuesToInput(valid)).toEqual({
      name: "Mug",
      sku: "SKU-1",
      category: "Home & Kitchen",
      price: 12.5,
      stock: 3,
      status: "active",
    });
  });
});
