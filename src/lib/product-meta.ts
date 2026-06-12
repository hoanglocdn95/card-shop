import { Product } from "@/types/product";

const COLOR_OPTIONS = [
  "Black",
  "Red",
  "Purple",
  "Yellow",
  "Blue",
  "Green",
  "Gold",
] as const;

export type ProductColor = (typeof COLOR_OPTIONS)[number];

export function getProductColorOptions() {
  return [...COLOR_OPTIONS];
}

export function getProductColor(product: Product): ProductColor {
  const seed = product.id
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return COLOR_OPTIONS[seed % COLOR_OPTIONS.length];
}

export function isInStock(product: Product) {
  if (product.fulfillmentStatus === "tcg-order") return true;
  return (product.stock ?? 0) > 0;
}

export function isTcgOrderProduct(product: Product) {
  return product.fulfillmentStatus === "tcg-order";
}
