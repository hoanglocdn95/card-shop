export type OrderStatus = "PENDING" | "CONFIRMED" | "FAILED";

export type CustomerInfo = {
  customerName: string;
  phone: string;
  address: string;
  note?: string;
};

export type OrderPayload = {
  facebookName: string;
  note?: string;
  discountCode?: string;
  items: Array<{
    productName: string;
    price: number;
    quantity: number;
    rarity?: string;
  }>;
};

export type OrderResponse = {
  success: boolean;
  orderCode: string;
  createdAt: string;
  facebookName: string;
  total: number;
};
