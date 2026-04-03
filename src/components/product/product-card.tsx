import Image from "next/image";

import { Button } from "@/components/common/button";
import { IMAGE_BLUR_DATA_URL } from "@/lib/image-placeholder";
import { isInStock } from "@/lib/product-meta";
import { getRarityTagClassName } from "@/lib/rarity-tag";
import { formatCurrency } from "@/lib/utils";
import { Product } from "@/types/product";

type Props = {
  product: Product;
  onAdd: (product: Product) => void;
};

export function ProductCard({ product, onAdd }: Props) {
  const inStock = isInStock(product);
  const tcgUrl = product.tcgPlayerUrl ?? "#";
  const subtypes = (product.subtypes ?? []).filter(Boolean);
  const rarityLine = product.rarity?.trim() || null;

  return (
    <article
      className={`group rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
        inStock ? "" : "opacity-60"
      }`}
    >
      <a
        href={tcgUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block aspect-3/4 w-full overflow-hidden rounded-md bg-gray-100 outline-none focus-visible:ring-2 focus-visible:ring-(--accent-teal)"
        aria-label={`View ${product.name} on TCGplayer`}
      >
        <div className="absolute top-2 left-2 z-10 rounded-full bg-(--primary) px-2 py-0.5 text-xs font-semibold text-white">
          {formatCurrency(product.price)}
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
      </a>
      <div className="mt-3 space-y-2">
        <h3 className="line-clamp-2 text-sm font-semibold text-gray-900">
          {product.name}
        </h3>
        {subtypes.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {subtypes.map((s) => (
              <span
                key={s}
                className="inline-flex items-center rounded-md border-2 border-(--accent-teal) bg-linear-to-br from-teal-50 to-cyan-50 px-2 py-0.5 text-[11px] font-bold tracking-tight text-teal-900 shadow-[0_1px_0_rgba(6,148,148,0.25)]"
              >
                #{s}
              </span>
            ))}
          </div>
        ) : null}
        {rarityLine ? (
          <span
            className={`inline-flex max-w-full items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${getRarityTagClassName(rarityLine)}`}
          >
            {rarityLine}
          </span>
        ) : null}
        <Button
          type="button"
          className="flex w-full items-center justify-center bg-(--primary) hover:bg-(--primary-hover)"
          onClick={() => onAdd(product)}
          disabled={!inStock}
          aria-label="Add to cart"
          title="Add to cart"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <circle cx="9" cy="20" r="1" />
            <circle cx="17" cy="20" r="1" />
            <path d="M2 3h2l2.4 11.2a2 2 0 0 0 2 1.6h8.7a2 2 0 0 0 2-1.5L21 7H6" />
            <path d="M12 9v4" />
            <path d="M10 11h4" />
          </svg>
        </Button>
      </div>
    </article>
  );
}
