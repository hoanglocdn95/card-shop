"use client";

import Image from "next/image";

import { Button } from "@/components/common/button";
import { Input } from "@/components/common/input";
import { useI18n } from "@/components/providers/i18n-provider";
import { IMAGE_BLUR_DATA_URL } from "@/lib/image-placeholder";
import { formatCurrency } from "@/lib/utils";
import { CartItem as CartItemType } from "@/types/cart";

type Props = {
  item: CartItemType;
  onUpdateQuantity: (
    productId: string,
    source: CartItemType["source"],
    quantity: number,
  ) => void;
  onRemove: (productId: string, source: CartItemType["source"]) => void;
};

export function CartItem({ item, onUpdateQuantity, onRemove }: Props) {
  const { t } = useI18n();
  const title = item.displayName || item.name;

  return (
    <div className="flex gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
      <div className="relative h-20 w-16 overflow-hidden rounded bg-gray-100">
        <Image
          src={item.image}
          alt={title}
          fill
          className="object-cover"
          placeholder="blur"
          blurDataURL={IMAGE_BLUR_DATA_URL}
          sizes="64px"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <p className="line-clamp-2 text-sm font-semibold text-gray-800">{title}</p>
        <p className="text-xs text-gray-500">
          {item.cardCode}
          {item.source === "tcg" ? (
            <span className="ml-1 font-semibold text-(--accent-teal)">
              · {t("product.sourceTcgShort")}
            </span>
          ) : null}
        </p>
        <p className="text-sm text-gray-700">
          {formatCurrency(item.price)} {t("cart.perCard")}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="h-8 w-8 rounded-md border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            onClick={() =>
              onUpdateQuantity(
                item.productId,
                item.source,
                Math.max(1, item.quantity - 1),
              )
            }
            aria-label={t("cart.decreaseQty")}
          >
            -
          </button>
          <Input
            type="number"
            min={1}
            value={item.quantity}
            onChange={(event) => {
              const value = Number(event.target.value);
              onUpdateQuantity(
                item.productId,
                item.source,
                Number.isNaN(value) ? 1 : value,
              );
            }}
            className="h-8 w-16 text-center"
          />
          <button
            type="button"
            className="h-8 w-8 rounded-md border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            onClick={() =>
              onUpdateQuantity(item.productId, item.source, item.quantity + 1)
            }
            aria-label={t("cart.increaseQty")}
          >
            +
          </button>
          <Button
            className="h-8 bg-[#FFC0CB] px-3 py-1 text-xs text-[#8a2d49] hover:bg-[#f5a8b8]"
            onClick={() => onRemove(item.productId, item.source)}
          >
            {t("cart.remove")}
          </Button>
        </div>
      </div>
      <p className="text-sm font-semibold text-(--accent-teal)">
        {formatCurrency(item.lineTotal)}
      </p>
    </div>
  );
}
