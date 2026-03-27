import { OrderStatus } from "@/types/order";

export const ORDER_STATUS: Record<string, OrderStatus> = {
  pending: "PENDING",
  confirmed: "CONFIRMED",
  failed: "FAILED",
};

export const ORDERS_SHEET_NAME = "Orders";
export const ORDER_ITEMS_SHEET_NAME = "OrderItems";
