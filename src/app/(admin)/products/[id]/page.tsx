import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Boxes, DollarSign, Tag } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { DetailRow } from "@/components/detail-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { products } from "@/data/mock-data";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { ProductDetailActions } from "./product-detail-actions";

// params is a Promise in Next 16, same as searchParams
type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = products.find((p) => p.id === id);
  return { title: product ? product.name : "Product not found" };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const product = products.find((p) => p.id === id);

  // the route is valid but the record doesn't exist -> 404
  if (!product) notFound();

  return (
    <div>
      <Link
        href="/products"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Products
      </Link>

      <PageHeader
        title={product.name}
        description={product.sku}
        actions={<ProductDetailActions product={product} />}
      />

      <div className="space-y-6">
        {product.images.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {product.images.map((src, index) => (
              <div
                key={src}
                className="relative aspect-square overflow-hidden rounded-lg border bg-muted"
              >
                <Image
                  src={src}
                  alt={`${product.name} image ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 50vw, 33vw"
                  // uploaded images are data URLs; skip the optimizer for those
                  unoptimized={src.startsWith("data:")}
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Price"
            value={formatCurrency(product.price)}
            icon={DollarSign}
          />
          <StatCard
            label="In stock"
            value={formatNumber(product.stock)}
            icon={Boxes}
          />
          <StatCard label="Category" value={product.category} icon={Tag} />
        </div>

        {product.description ? (
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {product.description}
              </p>
            </CardContent>
          </Card>
        ) : null}

        {product.variants.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Variants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Name</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {product.variants.map((variant) => (
                      <TableRow key={variant.sku} className="hover:bg-transparent">
                        <TableCell className="font-medium">{variant.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {variant.sku}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(variant.price)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatNumber(variant.stock)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl>
              <DetailRow label="Status">
                <StatusBadge status={product.status} />
              </DetailRow>
              <DetailRow label="Brand">{product.brand}</DetailRow>
              <DetailRow label="SKU">{product.sku}</DetailRow>
              <DetailRow label="Tags">
                {product.tags.length > 0 ? (
                  <span className="flex flex-wrap justify-end gap-1">
                    {product.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </span>
                ) : (
                  "—"
                )}
              </DetailRow>
              <DetailRow label="Product ID">{product.id}</DetailRow>
              <DetailRow label="Created">{formatDate(product.createdAt)}</DetailRow>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
