"use client";

import { ProductCard } from "@/components/product";
import { trpc } from "web/lib/trpc-client";
import { uuidTranslator } from "web/lib/utils";

export default function Page({ params: { id } }: { params: { id: string } }) {
  const { data: product } = trpc.product.get.useQuery({
    id: uuidTranslator.toUUID(id),
  });

  if (!product) {
    return <div>Loading...</div>;
  }

  return <ProductCard product={product} />;
}
