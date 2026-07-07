"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProductFormDialog } from "@/components/products/product-form-dialog";
import type { Product } from "@/types";

export function ProductDetailActions({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Pencil />
        Edit product
      </Button>
      <ProductFormDialog open={open} onOpenChange={setOpen} product={product} />
    </>
  );
}
