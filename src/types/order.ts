import type { ProductGame, ProductListingSource } from "@/types/product";

export type OrderStatus = "PENDING" | "CONFIRMED" | "FAILED";

export type OrderPayload = {
  facebookName: string;
  customerTier?: "guest" | "friend" | "vip";
  note?: string;
  discountCode?: string;
  items: Array<{
    productId: string;
    cardCode: string;
    game: ProductGame;
    quantity: number;
    rarity?: string;
    source: ProductListingSource;
  }>;
};

export type OrderResponse = {
  success: boolean;
  orderCode: string;
  createdAt: string;
  facebookName: string;
  total: number;
  subtotal?: number;
  shippingFee?: number;
};
