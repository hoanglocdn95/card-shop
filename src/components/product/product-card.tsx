"use client";

import Image from "next/image";

import { Button } from "@/components/common/button";
import { useI18n } from "@/components/providers/i18n-provider";
import { IMAGE_BLUR_DATA_URL } from "@/lib/image-placeholder";
import { isInStock, isTcgOrderProduct } from "@/lib/product-meta";
import { getRarityTagClassName } from "@/lib/rarity-tag";
import { formatCurrency } from "@/lib/utils";
import { Product } from "@/types/product";

type Props = {
  product: Product;
  onAdd: (product: Product) => void;
};

function getCardTextureClass(rarity?: string) {
  const normalized = (rarity ?? "").toLowerCase();
  if (
    normalized.includes("secret") ||
    normalized.includes("super") ||
    normalized.includes("alternate") ||
    normalized.includes("illustration")
  ) {
    return "texture-card-metal";
  }
  return "texture-card-paper";
}

export function ProductCard({ product, onAdd }: Props) {
  const { t } = useI18n();
  const inStock = isInStock(product);
  const tcgUrl = product.tcgPlayerUrl ?? "#";
  const subtypes = (product.subtypes ?? []).filter(Boolean);
  const rarityLine = product.rarity?.trim() || null;
  const addLabel = t("product.addToCart");
  const title = product.displayName || product.name;
  const textureClass = getCardTextureClass(product.rarity);
  const tcgOrder = isTcgOrderProduct(product);

  return (
    <article
      className={`group relative overflow-hidden rounded-xl border p-2.5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${textureClass} ${
        inStock ? "" : "opacity-60"
      }`}
    >
      <a
        href={tcgUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block aspect-[4/5] w-full overflow-hidden rounded-md bg-gray-100/80 outline-none focus-visible:ring-2 focus-visible:ring-(--accent-teal)"
        aria-label={t("product.viewOnTcg", { name: title })}
      >
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          <div className="rounded-full bg-(--primary) px-2 py-0.5 text-xs font-semibold text-white shadow-sm">
            {formatCurrency(product.price)}
          </div>
          {tcgOrder ? (
            <span className="rounded-full bg-(--accent-teal) px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
              {t("product.tcgOrderBadge")}
            </span>
          ) : null}
        </div>
        <Image
          src={product.image}
          alt={title}
          fill
          className="object-contain p-1 transition-transform duration-300 group-hover:scale-[1.02]"
          placeholder="blur"
          blurDataURL={IMAGE_BLUR_DATA_URL}
          sizes="(min-width: 1280px) 25vw, 50vw"
        />
      </a>
      <div className="relative mt-3 space-y-2">
        <h3 className="line-clamp-3 text-sm leading-snug font-semibold text-gray-900">
          {title}
        </h3>
        <p className="text-xs text-gray-500">{product.cardCode}</p>
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
          aria-label={addLabel}
          title={addLabel}
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
