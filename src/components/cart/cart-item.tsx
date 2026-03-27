import Image from "next/image";

import { Button } from "@/components/common/button";
import { Input } from "@/components/common/input";
import { IMAGE_BLUR_DATA_URL } from "@/lib/image-placeholder";
import { formatCurrency } from "@/lib/utils";
import { CartItem as CartItemType } from "@/types/cart";

type Props = {
  item: CartItemType;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
};

export function CartItem({ item, onUpdateQuantity, onRemove }: Props) {
  return (
    <div className="flex gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
      <div className="relative h-20 w-16 overflow-hidden rounded bg-gray-100">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover"
          placeholder="blur"
          blurDataURL={IMAGE_BLUR_DATA_URL}
          sizes="64px"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <p className="text-sm font-semibold text-gray-800">{item.name}</p>
        <p className="text-xs text-gray-500">SKU: {item.sku}</p>
        <p className="text-sm text-gray-700">{formatCurrency(item.price)} each</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="h-8 w-8 rounded-md border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            onClick={() => onUpdateQuantity(item.productId, Math.max(1, item.quantity - 1))}
            aria-label="Decrease quantity"
          >
            -
          </button>
          <Input
            type="number"
            min={1}
            value={item.quantity}
            onChange={(event) => {
              const value = Number(event.target.value);
              onUpdateQuantity(item.productId, Number.isNaN(value) ? 1 : value);
            }}
            className="h-8 w-16 text-center"
          />
          <button
            type="button"
            className="h-8 w-8 rounded-md border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
            aria-label="Increase quantity"
          >
            +
          </button>
          <Button
            className="h-8 bg-red-500 px-3 py-1 text-xs hover:bg-red-600"
            onClick={() => onRemove(item.productId)}
          >
            Remove
          </Button>
        </div>
      </div>
      <p className="text-sm font-semibold text-blue-700">
        {formatCurrency(item.lineTotal)}
      </p>
    </div>
  );
}
