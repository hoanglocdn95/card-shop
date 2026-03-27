import { CartItem } from "./cart";

export type OrderStatus = "PENDING" | "CONFIRMED" | "FAILED";

export type CustomerInfo = {
  customerName: string;
  phone: string;
  address: string;
  note?: string;
};

export type OrderPayload = CustomerInfo & {
  items: CartItem[];
};

export type OrderResponse = {
  success: boolean;
  orderCode: string;
  createdAt: string;
  customerName: string;
  total: number;
  status: OrderStatus;
};
