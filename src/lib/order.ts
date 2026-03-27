import dayjs from "dayjs";
import { nanoid } from "nanoid";

import { CartItem } from "@/types/cart";

export function calculateSubtotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function enrichCartItems(items: CartItem[]) {
  return items.map((item) => ({
    ...item,
    lineTotal: item.price * item.quantity,
  }));
}

export function calculateTotal(items: CartItem[]) {
  return calculateSubtotal(items);
}

export function generateOrderCode() {
  return `ORD-${dayjs().format("YYYYMMDD")}-${nanoid(6).toUpperCase()}`;
}
