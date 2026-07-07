import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Boxes, DollarSign, Tag } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { DetailRow } from "@/components/detail-sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl>
              <DetailRow label="Status">
                <StatusBadge status={product.status} />
              </DetailRow>
              <DetailRow label="SKU">{product.sku}</DetailRow>
              <DetailRow label="Product ID">{product.id}</DetailRow>
              <DetailRow label="Created">{formatDate(product.createdAt)}</DetailRow>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
