import type { ProductGame, ProductListingSource } from "@/types/product";

export type CartItem = {
  productId: string;
  game: ProductGame;
  cardCode: string;
  sku: string;
  name: string;
  displayName: string;
  image: string;
  price: number;
  quantity: number;
  lineTotal: number;
  rarity?: string;
  source: ProductListingSource;
};
