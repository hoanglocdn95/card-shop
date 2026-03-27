import Image from "next/image";

import { Button } from "@/components/common/button";
import { IMAGE_BLUR_DATA_URL } from "@/lib/image-placeholder";
import { isInStock } from "@/lib/product-meta";
import { formatCurrency } from "@/lib/utils";
import { Product } from "@/types/product";

type Props = {
  product: Product;
  onAdd: (product: Product) => void;
};

export function ProductCard({ product, onAdd }: Props) {
  const inStock = isInStock(product);
  return (
    <article className="group rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-3/4 w-full overflow-hidden rounded-md bg-gray-100">
        <div className="absolute top-2 left-2 z-10 rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-semibold text-white">
          {formatCurrency(product.price)}
        </div>
        <div
          className={`absolute top-2 right-2 z-10 rounded-full px-2 py-0.5 text-xs font-medium ${
            inStock ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
          }`}
        >
          {inStock ? "Con hang" : "Da chay hang"}
        </div>
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          placeholder="blur"
          blurDataURL={IMAGE_BLUR_DATA_URL}
          sizes="(min-width: 1024px) 25vw, 50vw"
        />
      </div>
      <div className="mt-3 space-y-2">
        <h3 className="line-clamp-2 text-sm font-semibold text-gray-900">
          {product.name}
        </h3>
        <p className="text-xs text-gray-500">SKU: {product.sku}</p>
        <Button
          className="w-full bg-indigo-600 hover:bg-indigo-700"
          onClick={() => onAdd(product)}
          disabled={!inStock}
        >
          Add to cart
        </Button>
      </div>
    </article>
  );
}
